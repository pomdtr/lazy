/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require("child_process");
const fs = require("fs");
const { resolve } = require("path/posix");

function sanitizeFilename(filename) {
  const sanitized = filename.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
  return `script_${sanitized}`;
}

const res = spawnSync("lazy", ["ls"], { encoding: "utf8" }).stdout.trim();
const lines = res.split("\n");
const roots = lines.map((line) => JSON.parse(line));

const commandDir = resolve(__dirname, "src");
for (const commandFileName of fs.readdirSync(commandDir).filter((filename) => filename.startsWith("script_"))) {
  fs.rmSync(resolve(commandDir, commandFileName));
}

for (const root of roots) {
  const template = `import { getPreferenceValues } from "@raycast/api";
import { Step } from "../lib/components";

export default function Command() {
  const { payload } = getPreferenceValues();
  const ref = JSON.parse(payload);
  return <Step reference={ref} />;
}
`;
  fs.writeFileSync(resolve(commandDir, `${sanitizeFilename(root.title)}.tsx`), template);
}

const manifestPath = resolve(__dirname, "package.json");
const manifestString = fs.readFileSync(manifestPath, { encoding: "utf8" });
const manifest = JSON.parse(manifestString);
manifest.commands = [
  {
    name: "entrypoint",
    title: "List Commands",
    keywords: ["lazy"],
    subtitle: "Lazy",
    description: "Auto-generated command by Lazy",
    mode: "view",
  },
].concat(
  roots.map((root) => ({
    name: sanitizeFilename(root.title),
    title: root.title,
    keywords: [root.subtitle],
    subtitle: root.subtitle,
    description: "Auto-generated command by Lazy",
    mode: root.actions[0].type == "push" ? "view" : "no-view",
    preferences: [
      {
        name: "payload",
        type: "textfield",
        required: false,
        title: "Payload. Do not change this unless you know what you're doing.",
        description: "",
        default: JSON.stringify(root.actions[0]),
      },
    ],
  }))
);

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
