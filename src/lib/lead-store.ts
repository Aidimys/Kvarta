import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import { Pool } from "pg";
import type { LeadInterest, LeadProduct } from "@/lib/lead";

const cooldownMilliseconds = 10 * 60 * 1000;
const globalForLeadStore = globalThis as typeof globalThis & {
  kvartaLeadDatabase?: DatabaseSync;
  kvartaLeadPool?: Pool;
  kvartaLeadSchema?: Promise<void>;
};

export interface NewLead {
  name: string;
  phone: string;
  interest: LeadInterest;
  product: LeadProduct | null;
  comment: string | null;
}

export type SaveLeadResult =
  | { saved: true }
  | { saved: false; retryAfterSeconds: number };

function getDatabase() {
  if (globalForLeadStore.kvartaLeadDatabase) {
    return globalForLeadStore.kvartaLeadDatabase;
  }

  const databasePath =
    process.env.LEADS_DB_PATH ?? join(process.cwd(), "data", "leads.sqlite");

  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      interest TEXT NOT NULL,
      product TEXT,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS lead_cooldowns (
      phone_ip_hash TEXT PRIMARY KEY,
      submitted_at INTEGER NOT NULL
    );
  `);

  const leadColumns = database.prepare("PRAGMA table_info(leads)").all();
  if (!leadColumns.some((column) => column.name === "product")) {
    database.exec("ALTER TABLE leads ADD COLUMN product TEXT");
  }

  globalForLeadStore.kvartaLeadDatabase = database;
  return database;
}

function getPostgresPool() {
  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL) {
      throw new Error(
        "DATABASE_URL is required on Vercel. Configure a persistent PostgreSQL database for leads.",
      );
    }

    return null;
  }

  if (!globalForLeadStore.kvartaLeadPool) {
    globalForLeadStore.kvartaLeadPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return globalForLeadStore.kvartaLeadPool;
}

async function ensurePostgresSchema(pool: Pool) {
  if (!globalForLeadStore.kvartaLeadSchema) {
    globalForLeadStore.kvartaLeadSchema = pool
      .query(`
        CREATE TABLE IF NOT EXISTS leads (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          interest TEXT NOT NULL,
          product TEXT,
          comment TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS lead_cooldowns (
          phone_ip_hash TEXT PRIMARY KEY,
          submitted_at BIGINT NOT NULL
        );
      `)
      .then(() => undefined)
      .catch((error: unknown) => {
        globalForLeadStore.kvartaLeadSchema = undefined;
        throw error;
      });
  }

  await globalForLeadStore.kvartaLeadSchema;
}

async function saveLeadToPostgres(
  pool: Pool,
  lead: NewLead,
  fingerprint: string,
  now: number,
): Promise<SaveLeadResult> {
  await ensurePostgresSchema(pool);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const cooldown = await client.query<{ submitted_at: string }>(
      `INSERT INTO lead_cooldowns (phone_ip_hash, submitted_at)
       VALUES ($1, $2)
       ON CONFLICT (phone_ip_hash) DO UPDATE
       SET submitted_at = EXCLUDED.submitted_at
       WHERE lead_cooldowns.submitted_at <= $2 - $3
       RETURNING submitted_at`,
      [fingerprint, now, cooldownMilliseconds],
    );

    if (cooldown.rowCount === 0) {
      const previous = await client.query<{ submitted_at: string }>(
        "SELECT submitted_at FROM lead_cooldowns WHERE phone_ip_hash = $1",
        [fingerprint],
      );
      await client.query("ROLLBACK");
      const submittedAt = Number(previous.rows[0]?.submitted_at ?? now);
      return {
        saved: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil(
            (submittedAt + cooldownMilliseconds - now) / 1000,
          ),
        ),
      };
    }

    await client.query(
      `INSERT INTO leads (name, phone, interest, product, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [lead.name, lead.phone, lead.interest, lead.product, lead.comment],
    );
    await client.query(
      "DELETE FROM lead_cooldowns WHERE submitted_at <= $1",
      [now - cooldownMilliseconds],
    );
    await client.query("COMMIT");
    return { saved: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function saveLead(
  lead: NewLead,
  clientIp: string,
  now = Date.now(),
): Promise<SaveLeadResult> {
  const fingerprint = createHash("sha256")
    .update(`${lead.phone}\0${clientIp}`)
    .digest("hex");

  const pool = getPostgresPool();
  if (pool) {
    return saveLeadToPostgres(pool, lead, fingerprint, now);
  }

  const database = getDatabase();
  database.exec("BEGIN IMMEDIATE");

  try {
    const previousSubmission = database
      .prepare("SELECT submitted_at FROM lead_cooldowns WHERE phone_ip_hash = ?")
      .get(fingerprint);
    const submittedAt = previousSubmission?.submitted_at;

    if (
      typeof submittedAt === "number" &&
      submittedAt + cooldownMilliseconds > now
    ) {
      database.exec("ROLLBACK");
      return {
        saved: false,
        retryAfterSeconds: Math.ceil(
          (submittedAt + cooldownMilliseconds - now) / 1000,
        ),
      };
    }

    database
      .prepare(
        "INSERT INTO leads (name, phone, interest, product, comment) VALUES (?, ?, ?, ?, ?)",
      )
      .run(
        lead.name,
        lead.phone,
        lead.interest,
        lead.product,
        lead.comment,
      );

    database
      .prepare(
        `INSERT INTO lead_cooldowns (phone_ip_hash, submitted_at)
         VALUES (?, ?)
         ON CONFLICT(phone_ip_hash) DO UPDATE SET submitted_at = excluded.submitted_at`,
      )
      .run(fingerprint, now);

    database
      .prepare("DELETE FROM lead_cooldowns WHERE submitted_at <= ?")
      .run(now - cooldownMilliseconds);

    database.exec("COMMIT");
    return { saved: true };
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
