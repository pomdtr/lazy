/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require("child_process");
const fs = require("fs");
const { resolve } = require("path/posix");

function sanitizeFilename(filename) {
  const sanitized = filename.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
  return `${sanitized}`;
}

const res = spawnSync("lazy", ["ls"], { encoding: "utf8" }).stdout.trim();
const lines = res.split("\n");
const roots = lines.map((line) => JSON.parse(line));

const commandDir = resolve(__dirname, "src");
for (const filename of fs.readdirSync(commandDir)) {
  const filePath = resolve(commandDir, filename);
  if (fs.lstatSync(filePath).isSymbolicLink()) fs.rmSync(filePath);
}

for (const root of roots) {
  fs.symlinkSync(resolve(commandDir, "entrypoint.tsx"), resolve(commandDir, `${sanitizeFilename(root.title)}.tsx`));
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
