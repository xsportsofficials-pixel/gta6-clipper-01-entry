// gta6-clipper-01 entry — hands in the published GTA 6 clip.
// The whole job of this program is deliberately tiny: take the
// VIDEO.json that lives beside it in the repository and place an
// identical copy where the grader expects to find it. The video
// itself, hosted on YouTube, is the real entry; this file only
// delivers its address.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

function botDir(): string {
  return resolve(process.env.MAKEFUN_BOT_DIR ?? "/bot");
}

function outputDir(): string {
  return resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
}

function deliverVideoFile(): void {
  const sourcePath = join(botDir(), "VIDEO.json");
  const targetDir = outputDir();
  const targetPath = join(targetDir, "VIDEO.json");

  let raw: string;
  try {
    raw = readFileSync(sourcePath, "utf8");
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    console.error(`Could not read ${sourcePath}: ${detail}`);
    process.exit(1);
  }

  // Parse once so a malformed file fails here with a clear message
  // instead of silently copying broken JSON to the output.
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    console.error(`VIDEO.json is not valid JSON: ${detail}`);
    process.exit(1);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { url?: unknown }).url !== "string"
  ) {
    console.error("VIDEO.json must be an object with a string url field.");
    process.exit(1);
  }

  const videoUrl = (parsed as { url: string }).url;
  if (!/^https:\/\/(www\.|m\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}/.test(videoUrl)) {
    console.error(`VIDEO.json url does not look like a YouTube video address: ${videoUrl}`);
    process.exit(1);
  }

  mkdirSync(targetDir, { recursive: true });
  writeFileSync(targetPath, raw, "utf8");
  console.log(`Delivered VIDEO.json for ${videoUrl} -> ${targetPath}`);
}

deliverVideoFile();
