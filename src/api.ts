import dotenv from "dotenv";
import * as execa from "execa";
import { existsSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import { globby } from "globby";
import { validate } from "jsonschema";
import { homedir } from "os";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import which from "which";
import yaml from "yaml";
import { Lazy } from "./lazy.js";
import { renderAction, renderObj, renderString } from "./template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LazyApi {
  packages: Record<string, Lazy.Package> = {};
  roots: Lazy.Item[] = [];
  schema = JSON.parse(readFileSync(resolve(dirname(__dirname), "schema.json"), "utf-8"));
  secrets: Record<string, string>;
  configDir: string;

  constructor( configDir: string, secretsPath: string,) {
    this.configDir = configDir;
    this.secrets = existsSync(secretsPath) ? dotenv.parse(readFileSync(secretsPath, "utf-8")) : {};
  }

  async load(): Promise<void> {
    const configs = await loadConfigs(this.configDir);

    for (const config of configs) {
      const res = validate(config, this.schema);
      if (res.errors.length) {
        throw Error(`Invalid config: ${res.errors[0].message}`);
      }
    }

    this.packages = Object.fromEntries(configs.map((config) => [config.packageName, getPackage(config)]));

    this.roots = configs.flatMap((config) =>
      config.roots.map((root) => {
        const packageName = root.type == "ref" ? root.packageName || config.packageName : config.packageName;
        const action: Lazy.Action = root.type == "ref" ? { ...root, packageName } : root;
        return {
          title: action.title,
          subtitle: packageName,
          preview: { command: `cat ${config.filepath}` },
          actions: [
            { ...renderAction(action, { preferences: config.preferences, secrets: this.secrets }) },
            { type: "run", command: `open ${config.filepath}`, title: "Open Config File" },
          ],
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
    if (!step) {
      throw Error(`Step \`${target}\` does not exist in package \`${packageName}\`!`);
    }

    return { ...step, packageName, params: { ...step.params, ...refParams } };
  }

  async runAction(command: Lazy.RunAction) {
    return this.exec(command.command, command.shell);
  }

  exec(command: string, shell = "/bin/bash"): Promise<execa.ExecaReturnValue> {
    return execa.execaCommand(command, { cwd: homedir(), shell }).catch((error) => {
      console.error(error.message);
      throw error;
    });
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
    const columns = line.split(itemTemplate.delimiter || /\s+/);
    const lineParams = { ...templateParams, line: { text: line, json, columns } };
    const actions =
      itemTemplate.actions
        ?.map((action) => renderAction(action, lineParams))
        .filter((action) => !action.condition || action.condition == "true")
        .map((action) => (action.type == "ref" ? { ...action, packageName } : action)) || [];

    return {
      title: itemTemplate.title ? renderString(itemTemplate.title, lineParams) : line,
      subtitle: itemTemplate.subtitle ? renderString(itemTemplate.subtitle, lineParams) : "",
      preview: preview ? renderObj(preview, lineParams) : undefined,
      actions,
    } as Lazy.Item;
  }

  async fetchLines(generator: Lazy.Command, templateParams: Record<string, unknown>): Promise<string[]> {
    const { stdout } = await this.exec(renderString(generator.command, templateParams), generator.shell).catch(() => {
      throw new Error(generator.errorMessage);
    });

    return stdout.split("\n");
  }

  async getList(step: Lazy.Step, query = ""): Promise<Lazy.List> {
    const itemTemplate = step.items;
    const packageName = step.packageName;
    const templateParams = {
      secrets: this.secrets,
      preferences: this.packages[packageName].preferences,
      params: step.params,
      query,
    };
    const generator = typeof step.generator == "string" ? { command: step.generator } : step.generator;

    const lines = await this.fetchLines(generator, templateParams);

    return {
      type: step.type,
      items: lines.map((line) => {
        return itemTemplate ? this.lineToItem(line, packageName, itemTemplate, templateParams) : { title: line };
      }),
    };
  }
}

export async function loadConfigs(configDir: string): Promise<Lazy.Config[]> {
  const globs = await globby(`**/**.yaml`, { cwd: configDir });
  const loadConfig = (filepath: string) =>
    readFile(filepath, "utf-8").then((content) => ({ ...yaml.parse(content), filepath } as Lazy.Config));
  return Promise.all(globs.map((glob) => loadConfig(resolve(configDir, glob))));
}

export function getPackage(config: Lazy.Config): Lazy.Package {
  const pkg: Lazy.Package = { steps: {}, preferences: config.preferences || {} };
  for (const requirement of config.requirements || []) {
    which.sync(requirement);
  }

  pkg.preferences = config.preferences || {};
  for (const [step_id, step] of Object.entries(config.steps || {})) {
    const actions =
      step.items?.actions?.map((action) =>
        action.type == "ref" ? { ...action, packageName: action.packageName || config.packageName } : action
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
