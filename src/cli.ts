#!/usr/bin/env node

import { readFileSync } from "fs";
import { homedir } from "os";
import { resolve } from "path/posix";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { LazyApi } from "./api.js";
import { Lazy } from "./lazy.js";

const lazyApi = new LazyApi();
const configDir = resolve(homedir(), ".config", "lazy");
yargs(hideBin(process.argv))
  .command("list-commands", "List the available commands", {}, async (argv) => {
    await lazyApi.load(argv.configDir as string);
    process.stdout.write(lazyApi.roots.map((root) => JSON.stringify(root)).join("\n"));
  })
  .command("list-items", "Get the available items", {}, async (argv) => {
    await lazyApi.load(argv.configDir as string);
    const input = readFileSync(0, "utf-8");
    const ref: Lazy.RefAction = JSON.parse(input);
    const step = lazyApi.getStep(ref);
    const items = await lazyApi.getItems(step, { prefs: step.prefs, params: { ...step.params, ...ref.params } });
    process.stdout.write(items.map((item) => JSON.stringify(item)).join("\n"));
  })
  .command("run-action", "Run a Command", {}, async (argv) => {
    await lazyApi.load(argv.configDir as string);
    const input = readFileSync(0, "utf-8");
    const action: Lazy.RunAction = JSON.parse(input);
    await lazyApi.runAction(action);
  })
  .option("config-dir", { default: configDir })
  .strict()
  .parse();
