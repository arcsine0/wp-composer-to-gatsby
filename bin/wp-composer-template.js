#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { createComposerTemplateManifest } = require("../src/templates/createComposerTemplate");
const { importComposerTemplate } = require("../src/templates/importComposerTemplate");

const args = process.argv.slice(2);

const getArgValue = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const hasArg = (name) => args.includes(name);

const configPath = getArgValue("--config");
const outPath = getArgValue("--out");
const pushUrl = getArgValue("--push-url");
const username = getArgValue("--username");
const appPassword = getArgValue("--app-password");

if (hasArg("--help") || !configPath) {
  process.stdout.write(
    [
      "Usage: wp-composer-template --config <file> [--out <file>] [--push-url <url> --username <user> --app-password <password>]",
      "",
      "Config should export a template, array of templates, manifest, or function returning one.",
      "When --out is omitted, JSON is printed to stdout.",
      "When --push-url is provided, manifest is POSTed to WordPress REST import endpoint.",
    ].join("\n") + "\n"
  );
  process.exit(hasArg("--help") ? 0 : 1);
}

const resolvedConfigPath = path.resolve(process.cwd(), configPath);
const loaded = require(resolvedConfigPath);
const configValue = typeof loaded === "function" ? loaded() : loaded;
const manifest = createComposerTemplateManifest(
  Array.isArray(configValue) || configValue.templates ? configValue : [configValue]
);
const json = `${JSON.stringify(manifest, null, 2)}\n`;

const run = async () => {
  if (outPath) {
    const resolvedOutPath = path.resolve(process.cwd(), outPath);
    fs.mkdirSync(path.dirname(resolvedOutPath), { recursive: true });
    fs.writeFileSync(resolvedOutPath, json);
    process.stdout.write(`Template JSON written to ${resolvedOutPath}\n`);
  }

  if (pushUrl) {
    const result = await importComposerTemplate(manifest, {
      url: pushUrl,
      username,
      appPassword,
    });
    process.stdout.write(`Template manifest imported via REST (${result.status}).\n`);
    if (result.data) {
      process.stdout.write(`${JSON.stringify(result.data, null, 2)}\n`);
    }
    return;
  }

  if (!outPath) {
    process.stdout.write(json);
  }
};

run().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  if (error.response) {
    process.stderr.write(`${JSON.stringify(error.response, null, 2)}\n`);
  }
  process.exit(1);
});
