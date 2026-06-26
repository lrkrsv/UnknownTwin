import { closeDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import { retrieve } from "@/lib/retrieve";

async function main() {
  runMigrations();

  const query = process.argv[2] ?? "What is the Business Model Canvas?";
  console.log(`Query: "${query}"\n`);

  const results = await retrieve(query, { k: 5 });

  if (results.length === 0) {
    console.log("No results. Run `npm run seed` first.");
    closeDb();
    process.exit(1);
  }

  results.forEach((r, i) => {
    console.log(`--- #${i + 1} (score: ${r.score.toFixed(4)}) ---`);
    console.log(`Title:  ${r.title}`);
    console.log(`Module: ${r.module ?? "(none)"}`);
    console.log(`Type:   ${r.source_type}`);
    console.log(`Content: ${r.content.slice(0, 200)}${r.content.length > 200 ? "…" : ""}`);
    console.log();
  });

  closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
