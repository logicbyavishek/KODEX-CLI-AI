#!/usr/bin/env node

import dotenv from "dotenv";

import chalk from "chalk";
import figlet from "figlet";

import { Command } from "commander";

import { login, logout, whoami } from "./commands/auth/login.js";
// import { wakeUp } from "./commands/ai/wakeUp.js";

dotenv.config();

async function main() {
  // Display banner
  console.log(
    chalk.cyan(
      figlet.textSync("KodeX CLI", {
        font: "Standard",
        horizontalLayout: "default",
      })
    )
  );
  console.log(chalk.red("A Cli based AI tool \n"));

  const program = new Command("kodex");

  program.version("0.0.1")
  .description("kodex CLI - Device Flow Authentication")
  .addCommand(login)
  .addCommand(logout)
  .addCommand(whoami)

    // Default action shows help
  program.action(() => {
    program.help();
  });

  program.parse();
}

main().catch((error) => {
  console.error(chalk.red("Error running kodex CLI:"), error);
  process.exit(1);
});