import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

const databasePath =
  process.env.LEADS_DB_PATH ?? join(process.cwd(), "data", "leads.sqlite");

const interestLabels = {
  subscription: "Подписка",
  order: "Разовый заказ",
  question: "Совет / вопрос",
};

const productLabels = {
  ethiopia: "Эфиопия Иргачеффе",
  colombia: "Колумбия Уила",
  brazil: "Бразилия Серрадо",
  drip: "Дрип-пакеты, ассорти",
  subscription: "Подписка на кофе",
};

if (!existsSync(databasePath)) {
  console.error(
    `База заявок не найдена: ${databasePath}\nСначала примите заявку или задайте верный LEADS_DB_PATH.`,
  );
  process.exitCode = 1;
} else {
  const database = new DatabaseSync(databasePath, { readOnly: true });

  try {
    const columns = database.prepare("PRAGMA table_info(leads)").all();
    const hasProduct = columns.some((column) => column.name === "product");
    const productColumn = hasProduct ? "product" : "NULL AS product";
    const leads = database
      .prepare(
        `SELECT id, created_at, name, phone, interest, ${productColumn}, comment
         FROM leads
         ORDER BY id DESC
         LIMIT 100`,
      )
      .all();

    if (leads.length === 0) {
      console.log("Заявок пока нет.");
    } else {
      console.table(
        leads.map((lead) => ({
          ...lead,
          interest: interestLabels[lead.interest] ?? lead.interest,
          product: lead.product
            ? productLabels[lead.product] ?? lead.product
            : "—",
        })),
      );
      console.log(`Показаны последние ${leads.length} заявок из ${databasePath}`);
    }
  } catch (error) {
    console.error("Не удалось прочитать базу заявок:", error);
    process.exitCode = 1;
  } finally {
    database.close();
  }
}
