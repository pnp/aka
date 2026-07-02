import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "content");
const outputDir = path.join(repoRoot, ".generated-content");
const redirectPagesDir = path.join(outputDir, "redirect-pages");

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

  const endMatch = markdown.match(/\r?\n---(?:\r?\n|$)/);

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

function getSlugParts(relativeParts) {
  const sourceFileName = relativeParts[relativeParts.length - 1];
  const sourceBaseName = path.basename(sourceFileName, path.extname(sourceFileName));

  if (sourceBaseName.toLowerCase() === "index") {
    return relativeParts.slice(0, -1);
  }

  return [
    ...relativeParts.slice(0, -1),
    sourceBaseName
  ];
}

function getGeneratedFileName(slug) {
  return `${Buffer.from(slug, "utf8").toString("base64url")}.md`;
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(redirectPagesDir, { recursive: true });

const sourceFiles = await findMarkdownFiles(sourceDir);
const slugs = new Set();

for (const sourceFile of sourceFiles) {
  const relativePath = path.relative(sourceDir, sourceFile);
  const relativeParts = relativePath.split(path.sep);
  const sourceFileName = relativeParts[relativeParts.length - 1];

  if (sourceFileName.startsWith("_")) {
    continue;
  }

  const slugParts = getSlugParts(relativeParts);
  const slug = slugParts.join("/");
  const slugKey = slug.toLowerCase();

  if (slugs.has(slugKey)) {
    throw new Error(`Duplicate redirect slug '${slug}'. Markdown file paths must be unique.`);
  }

  slugs.add(slugKey);

  const markdown = await readFile(sourceFile, "utf8");
  const frontMatter = getFrontMatter(markdown, sourceFile);
  const url = readUrl(frontMatter, sourceFile);
  const generatedMarkdown = [
    "---",
    `title: ${JSON.stringify(slug)}`,
    `url: ${JSON.stringify(`/${slug}/`)}`,
    `redirect_url: ${JSON.stringify(url)}`,
    `source_slug: ${JSON.stringify(slug)}`,
    "---",
    ""
  ].join("\n");

  const outputFile = path.join(redirectPagesDir, getGeneratedFileName(slug));
  await writeFile(outputFile, generatedMarkdown, "utf8");
}

console.log(`Prepared ${slugs.size} redirect page${slugs.size === 1 ? "" : "s"}.`);
