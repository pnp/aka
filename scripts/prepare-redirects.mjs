import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "content");
const outputDir = path.join(repoRoot, ".generated-content");

async function findMarkdownFiles(dir) {
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(fullPath));
    } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function getFrontMatter(markdown, filePath) {
  if (!markdown.startsWith("---")) {
    throw new Error(`${filePath} must start with YAML front matter.`);
  }

  const endMatch = markdown.match(/\r?\n---\r?\n/);

  if (!endMatch || endMatch.index === undefined) {
    throw new Error(`${filePath} must include closing YAML front matter.`);
  }

  return markdown.slice(3, endMatch.index);
}

function readUrl(frontMatter, filePath) {
  const urlMatch = frontMatter.match(/^url:\s*(?<url>.+?)\s*$/m);
  const url = urlMatch?.groups?.url
    ?.replace(/^['"]|['"]$/g, "")
    ?.trim();

  if (!url) {
    throw new Error(`${filePath} must include a non-empty 'url' front matter value.`);
  }

  return url;
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const sourceFiles = await findMarkdownFiles(sourceDir);
const slugs = new Set();

for (const sourceFile of sourceFiles) {
  const slug = path.basename(sourceFile, path.extname(sourceFile));

  if (slug.startsWith("_")) {
    continue;
  }

  if (slugs.has(slug)) {
    throw new Error(`Duplicate redirect slug '${slug}'. Markdown file names must be unique.`);
  }

  slugs.add(slug);

  const markdown = await readFile(sourceFile, "utf8");
  const frontMatter = getFrontMatter(markdown, sourceFile);
  const url = readUrl(frontMatter, sourceFile);
  const generatedMarkdown = [
    "---",
    `title: ${JSON.stringify(slug)}`,
    `redirect_url: ${JSON.stringify(url)}`,
    `source_slug: ${JSON.stringify(slug)}`,
    "---",
    ""
  ].join("\n");

  await writeFile(path.join(outputDir, `${slug}.md`), generatedMarkdown, "utf8");
}

console.log(`Prepared ${slugs.size} redirect page${slugs.size === 1 ? "" : "s"}.`);
