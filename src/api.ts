import * as execa from "execa";
import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import { globby } from "globby";
import { validate } from "jsonschema";
import { homedir } from "os";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import which from "which";
import yaml from "yaml";
import { Lazy } from "./lazy.js";
import { renderAction, renderString } from "./template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class LazyApi {
  packages: Record<string, Lazy.Package> = {};
  roots: Lazy.Item[] = [];
  schema = JSON.parse(readFileSync(resolve(__dirname, "schema.json"), "utf-8"));

  async load(configDir: string): Promise<void> {
    const configs = await loadConfigs(configDir);

    for (const config of configs) {
      validate(config, this.schema);
    }

    this.packages = Object.fromEntries(configs.map((config) => [config.packageName, getPackage(config)]));

    this.roots = configs.flatMap((config) =>
      config.roots.map((ref) => {
        const packageName = ref.packageName || config.packageName;
        return {
          title: ref.title,
          subtitle: packageName,
          preview: `cat '${config.filepath}'`,
          icon: config.icon,
          actions: [{ ...ref, type: "ref", packageName }],
        } as Lazy.Item;
      })
    );
  }

  getStep(reference: Lazy.RefAction): Lazy.Step {
    const { target, params: refParams, packageName } = reference;

    const pkg = this.packages[packageName];
    if (!pkg) {
      throw Error(`Package \`${packageName}\` does not exist!`);
    }
    const step = pkg.steps[target];
    const prefs = pkg.prefs;
    if (!step) {
      throw Error(`Step \`${target}\` does not exist in package \`${packageName}\`!`);
    }

    return { ...step, prefs, params: { ...step.params, ...refParams } };
  }

  async runAction(command: Lazy.RunAction) {
    return this.exec(command.command, command.shell)
  }

  exec(command: string, shell = "/bin/bash"): Promise<execa.ExecaReturnValue> {
    return execa.execaCommand(command, { cwd: homedir(), shell }).catch((error) => {
      console.error(error.message);
      throw error;
    });
  }

  lineToItem(line: string, itemTemplate: Lazy.ItemTemplate, templateParams: Record<string, unknown>): Lazy.Item {
    const json = parseJson(line);
    const words = line.split(itemTemplate.delimiter || /\s+/);
    const lineParams = { line, json, words, ...templateParams };
    return {
      title: itemTemplate.title ? renderString(itemTemplate.title, lineParams) : line,
      subtitle: itemTemplate.subtitle ? renderString(itemTemplate.subtitle, lineParams) : "",
      icon: itemTemplate.icon ? renderString(itemTemplate.icon, lineParams) : undefined,
      preview: itemTemplate.preview ? renderString(itemTemplate.preview, lineParams) : undefined,
      actions: itemTemplate.actions?.map((action) => renderAction(action, lineParams)),
    } as Lazy.Item;
  }

  async getItems(step: Lazy.Step, templateParams: Record<string, unknown>): Promise<Lazy.Item[]> {
    const itemTemplate = step.items;
    const generator =
      typeof itemTemplate.generator == "string" ? { command: itemTemplate.generator } : itemTemplate.generator;

    const { stdout } = await this.exec(renderString(generator.command, templateParams), generator.shell).catch(() => {
      throw new Error(generator.errorMessage);
    });
    const lines = stdout.split("\n");

    return lines.map((line) => {
      return this.lineToItem(line, itemTemplate, templateParams);
    });
  }
}

export async function loadConfigs(configDir: string): Promise<Lazy.Config[]> {
  const globs = await globby(`**/**.yaml`, { cwd: configDir });
  const loadConfig = (filepath: string) => readFile(filepath, "utf-8").then((content) => ({...yaml.parse(content), filepath} as Lazy.Config));
  return Promise.all(globs.map((glob) => loadConfig(resolve(configDir, glob))));
}

export function getPackage(config: Lazy.Config): Lazy.Package {
  const pkg: Lazy.Package = { steps: {}, prefs: config.prefs || {} };
  for (const requirement of config.requirements || []) {
    which.sync(requirement);
  }

  pkg.prefs = config.prefs || {};
  for (const [step_id, step] of Object.entries(config.steps || {})) {
    pkg.steps[step_id] = {
      ...config.steps[step_id],
      items: {
        ...step.items,
        actions: step.items.actions?.map((action) =>
          action.type == "ref" ? { ...action, packageName: config.packageName } : action
        ),
      },
      params: { ...step.params },
    };
  }

  return pkg;
}

function parseJson(line: string) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}
