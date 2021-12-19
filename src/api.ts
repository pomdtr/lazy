import { execSync } from "child_process";
import dotenv from "dotenv";
import { existsSync, readdirSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import { validate } from "jsonschema";
import { homedir } from "os";
import { dirname, resolve } from "path";
import yaml from "yaml";
import { Lazy } from "./lazy";
import { renderAction, renderObj, renderString } from "./template";

export class LazyApi {
  packages: Record<string, Lazy.Package> = {};
  rootActions: Lazy.Item[] = [];
  static schema = JSON.parse(readFileSync(resolve(dirname(__dirname), "lib", "schema.json"), "utf-8"));
  secrets: Record<string, string>;
  configDir: string;

  constructor(configDir: string, secretsPath: string) {
    this.configDir = configDir;
    this.secrets = existsSync(secretsPath) ? dotenv.parse(readFileSync(secretsPath, "utf-8")) : {};
  }

  static async validate(config: unknown) {
    const res = validate(config, LazyApi.schema);
    if (res.errors.length) {
      throw new Error("Invalid config:\n" + res.errors.map((e) => `\t${e.stack}`).join("\n"));
    }
  }

  async load() {
    const configMap = await loadConfigs(this.configDir);

    const validConfigs: Record<string, Lazy.Script> = {};
    const invalidConfigs: Record<string, Lazy.Script> = {};
    for (const [filepath, config] of Object.entries(configMap)) {
      try {
        LazyApi.validate(config);
        validConfigs[filepath] = config;
      } catch {
        invalidConfigs.push
      }
    }

    this.packages = Object.fromEntries(
      Object.values(validConfigs).map((config) => [config.packageName, getPackage(config)])
    );

    this.rootActions = Object.entries(validConfigs).flatMap(([filepath, config]) =>
      config.rootActions.map((root) => {
        const packageName = root.type == "push" ? root.packageName || config.packageName : config.packageName;
        const action: Lazy.Action = root.type == "push" ? { ...root, packageName } : root;
        return {
          title: action.title,
          subtitle: packageName,
          preview: { command: `cat ${filepath}` },
          actions: [
            { ...renderAction(action, { preferences: config.preferences, secrets: this.secrets }) },
            { type: "run", command: `open ${filepath}`, title: "Open Config File" },
          ],
        } as Lazy.Item;
      })
    );

    return {
      loaded: Object.values(validConfigs).length,
      invalid: Object.keys(invalidConfigs),
    };
  }

  getStep(reference: Lazy.PushAction): Lazy.Step {
    const { target, params: refParams, packageName } = reference;

    const pkg = this.packages[packageName];
    if (!pkg) {
      throw Error(`Package \`${packageName}\` does not exist!`);
    }
    const step = pkg.steps[target];
    if (!step) {
      throw Error(`Step \`${target}\` does not exist in package \`${packageName}\`!`);
    }

    return { ...step, packageName, params: { ...step.params, ...refParams } };
  }

  async openAction(action: Lazy.OpenAction) {
    return this.run(`open '${action.target}'`);
  }

  async CopyAction(action: Lazy.CopyAction) {
    return this.run("pbcopy", undefined, action.content);
  }

  async runAction(command: Lazy.RunAction) {
    return this.run(command.command, command.shell);
  }

  run(command: string, shell = "/bin/bash", input?: string): string {
    return execSync(command, { cwd: homedir(), shell, input, encoding: "utf-8", maxBuffer: 1024 * 1024 * 10 }).trim();
  }

  lineToItem(
    line: string,
    packageName: string,
    itemTemplate: Lazy.ItemTemplate,
    templateParams: Record<string, unknown>
  ): Lazy.Item {
    if (!line) return { title: "No result" };
    const json = parseJson(line);
    const preview = typeof itemTemplate.preview == "string" ? { command: itemTemplate.preview } : "";
    const lineParams = { ...templateParams, line: { text: line, json } };
    const actions =
      itemTemplate.actions
        ?.map((action) => renderAction(action, lineParams))
        .filter((action) => !action.condition || action.condition == "true")
        .map((action) => (action.type == "push" ? { ...action, packageName } : action)) || [];

    return {
      title: itemTemplate.title ? renderString(itemTemplate.title, lineParams) : line,
      subtitle: itemTemplate.subtitle ? renderString(itemTemplate.subtitle, lineParams) : "",
      preview: preview ? renderObj(preview, lineParams) : undefined,
      actions,
    } as Lazy.Item;
  }

  async fetchLines(generator: Lazy.Command, templateParams: Record<string, unknown>): Promise<string[]> {
    const stdout = await this.run(renderString(generator.command, templateParams), generator.shell);
    return stdout.split("\n");
  }

  async getList(step: Lazy.Step): Promise<Lazy.List> {
    const itemTemplate = step.items;
    const packageName = step.packageName;
    const templateParams = {
      secrets: this.secrets,
      preferences: this.packages[packageName].preferences,
      params: step.params,
    };
    const generator = typeof step.generator == "string" ? { command: step.generator } : step.generator;

    const lines = await this.fetchLines(generator, templateParams);

    return {
      items: lines.map((line) => {
        return itemTemplate ? this.lineToItem(line, packageName, itemTemplate, templateParams) : { title: line };
      }),
    };
  }
}

export async function loadConfigs(configDir: string): Promise<Record<string, Lazy.Script>> {
  const configPaths = readdirSync(configDir)
    .filter((filepath) => filepath.endsWith(".yaml") || filepath.endsWith(".yml"))
    .map((file) => resolve(configDir, file));
  const loadConfig = (filepath: string) =>
    readFile(filepath, "utf-8").then((content) => yaml.parse(content) as Lazy.Script);
  const entries = await Promise.all(configPaths.map(async (filepath) => [filepath, await loadConfig(filepath)]));
  return Object.fromEntries(entries);
}

export function getPackage(config: Lazy.Script): Lazy.Package {
  const pkg: Lazy.Package = { steps: {}, preferences: config.preferences || {} };

  pkg.preferences = config.preferences || {};
  for (const [step_id, step] of Object.entries(config.steps || {})) {
    const actions =
      step.items?.actions?.map((action) =>
        action.type == "push" ? { ...action, packageName: action.packageName || config.packageName } : action
      ) || [];
    pkg.steps[step_id] = {
      ...config.steps[step_id],
      items: {
        ...step.items,
        actions,
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
