import readline from "readline";
import fs from "fs";
import chalk from "chalk";
import { initDb } from "./db.js";
import { graph, buildInitialMessages } from "./graph.js";
import { setCurrentTopic } from "./tools.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  await initDb();

  const topic = (await ask("Enter a research topic: ")).trim();
  rl.close();
  if (!topic) {
    console.log(chalk.red("Please enter a topic."));
    return;
  }

  setCurrentTopic(topic);
  console.log(chalk.blue(`\nResearching: ${topic}\n`));

  const result = await graph.invoke(
    { messages: buildInitialMessages(topic) },
    { recursionLimit: 20 }
  );

  const report = result.messages[result.messages.length - 1].content;

  console.log("\n" + "=".repeat(60));
  console.log(report);

  const filename = "report_" + topic.toLowerCase().split(/\s+/).slice(0, 4).join("_") + ".md";
  fs.writeFileSync(filename, `# Research Report: ${topic}\n\n${report}`, "utf-8");
  console.log(chalk.green(`\nSaved to ${filename}`));

  process.exit(0);
}

main().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});