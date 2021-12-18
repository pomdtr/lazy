#!/usr/bin/env node

import { readFileSync } from "fs";
import { homedir } from "os";
import { resolve } from "path/posix";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { LazyApi } from "./api";
import { Lazy } from "./lazy";

const DEFAULT_CONFIG_DIR = resolve(homedir(), ".config", "lazy");
const DEFAULT_SECRETS_PATH = resolve(DEFAULT_CONFIG_DIR, ".secrets.env");

yargs(hideBin(process.argv))
  .command("ls", "List the available commands", {}, async (argv) => {
    const lazyApi = new LazyApi(argv.configDir as string, argv.secretsPath as string);
    await lazyApi.load();
    console.log(lazyApi.rootActions.map((root) => JSON.stringify(root)).join("\n"));
  })

  .command(
    "get",
    "Get the available items",
    () => null,
    async (argv) => {
      const lazyApi = new LazyApi(argv.configDir as string, argv.secretsPath as string);
      await lazyApi.load();
      const input = readFileSync(0, "utf-8");
      const ref: Lazy.PushAction = JSON.parse(input);
      const step = lazyApi.getStep(ref);

      const list = await lazyApi.getList(step);

      console.log(JSON.stringify(list));
    }
  )
  .command("run", "Run a Command", {}, async (argv) => {
    const lazyApi = new LazyApi(argv.configDir as string, argv.secretsPath as string);
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
  .option("config-dir", { default: DEFAULT_CONFIG_DIR, description: "The directory to store the config files" })
  .option("secrets-path", { default: DEFAULT_SECRETS_PATH, description: "The path to the secrets file" })
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .parse();
