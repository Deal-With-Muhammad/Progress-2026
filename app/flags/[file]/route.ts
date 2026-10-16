import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Country flags as static SVG files (/flags/MY.svg), generated at build time
 * from the country-flag-icons package, so the page loads only the flags it
 * shows instead of bundling all of them into its JavaScript.
 */
const FLAGS_DIR = path.join(
  process.cwd(),
  "node_modules/country-flag-icons/3x2",
);

export const dynamicParams = false;

export async function generateStaticParams() {
  const files = await readdir(FLAGS_DIR);

  return files
    .filter((file) => /^[A-Z]{2}\.svg$/.test(file))
    .map((file) => ({ file }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  if (!/^[A-Z]{2}\.svg$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const svg = await readFile(path.join(FLAGS_DIR, file), "utf8");

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
