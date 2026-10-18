import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import type { LeadInterest, LeadProduct } from "@/lib/lead";

const cooldownMilliseconds = 10 * 60 * 1000;
const globalForLeadStore = globalThis as typeof globalThis & {
  kvartaLeadDatabase?: DatabaseSync;
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

export function saveLead(
  lead: NewLead,
  clientIp: string,
  now = Date.now(),
): SaveLeadResult {
  const database = getDatabase();
  const fingerprint = createHash("sha256")
    .update(`${lead.phone}\0${clientIp}`)
    .digest("hex");

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
