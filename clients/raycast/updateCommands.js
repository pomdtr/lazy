/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require("child_process");
const fs = require("fs");
const { resolve } = require("path/posix");

function sanitizeFilename(filename) {
  return filename.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
}

const res = spawnSync("lazy", ["ls"], { encoding: "utf8" }).stdout.trim();
const lines = res.split("\n");
const roots = lines.map((line) => JSON.parse(line));

const commandDir = resolve(__dirname, "src");
for (const commandFileName of fs.readdirSync(commandDir)) {
  fs.rmSync(resolve(commandDir, commandFileName));
}

for (const root of roots) {
  const template = `
import { Step } from "../lib/components";

export default function Command() {
    const ref = ${JSON.stringify(root.actions[0])};
    return <Step reference={ref}/>
}
`.trimStart();
  fs.writeFileSync(resolve(commandDir, `${sanitizeFilename(root.title)}.tsx`), template);
}

const manifestString = fs.readFileSync("package.json", { encoding: "utf8" });
const manifest = JSON.parse(manifestString);
manifest.commands = roots.map((root) => ({
  name: sanitizeFilename(root.title),
  title: root.title,
  keywords: [root.subtitle],
  subtitle: root.subtitle,
  description: "Auto-generated command by Lazy",
  mode: root.actions[0].type == "push" ? "view" : "no-view",
}));

fs.writeFileSync("package.json", JSON.stringify(manifest, null, 2));
