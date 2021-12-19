#!/usr/bin/env node

import { readFileSync } from "fs";
import { homedir } from "os";
import { resolve } from "path/posix";
import { parse } from "yaml";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { LazyApi } from "./api";
import { Lazy } from "./lazy";

const DEFAULT_CONFIG_DIR = resolve(homedir(), ".config", "lazy");
const DEFAULT_SCRIPT_DIR = resolve(DEFAULT_CONFIG_DIR, "scripts");
const DEFAULT_SECRETS_PATH = resolve(DEFAULT_CONFIG_DIR, ".secrets.env");

yargs(hideBin(process.argv))
  .command("ls", "List the available commands", {}, async (argv) => {
    const lazyApi = new LazyApi(argv.scriptsDir as string, argv.secretsPath as string);
    const res = await lazyApi.load();
    for (const filepath of res.invalid) {
      console.error(`Skipping invalid script: ${filepath}`);
    }
    console.log(lazyApi.rootActions.map((root) => JSON.stringify(root)).join("\n"));
  })
  .command(
    "get",
    "Get the available items",
    () => null,
    async (argv) => {
      const lazyApi = new LazyApi(argv.scriptsDir as string, argv.secretsPath as string);
      await lazyApi.load();
      const input = readFileSync(0, "utf-8");
      const ref: Lazy.PushAction = JSON.parse(input);
      const step = lazyApi.getStep(ref);

      const items = await lazyApi.getItems(step);

      console.log(items.map((item) => JSON.stringify(item)).join("\n"));
    }
  )
  .command("run", "Run a Command", {}, async (argv) => {
    const lazyApi = new LazyApi(argv.scriptsDir as string, argv.secretsPath as string);
    await lazyApi.load();
    const input = readFileSync(0, "utf-8");
    const action: Lazy.RunAction | Lazy.CopyAction | Lazy.OpenAction = JSON.parse(input);

    switch (action.type) {
      case "open":
        lazyApi.openAction(action);
        break;
      case "copy":
        lazyApi.CopyAction(action);
        break;
      default: {
        const stdout = await lazyApi.runAction(action);
        process.stdout.write(stdout);
        break;
      }
    }
  })
  .command(
    "validate <script-path>",
    "Validate a script",
    (yargs) => yargs.positional("script-path", { demandOption: "true" }),
    async (argv) => {
      const script = readFileSync(argv.scriptPath as string, "utf-8");
      await LazyApi.validate(parse(script));
      console.log("Script is valid!");
    }
  )
  .showHelpOnFail(false)
  .option("scripts-dir", { default: DEFAULT_SCRIPT_DIR, description: "The directory to store the config files" })
  .option("secrets-path", { default: DEFAULT_SECRETS_PATH, description: "The path to the secrets file" })
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .parse();
