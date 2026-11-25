/**
 * The demo runs only in `vite` dev: two endpoints call the brand CLI and
 * the files it writes land in out/ (ignored by git), served as /out/.
 *
 *   GET /api/choices           `brand list`
 *   GET /api/pattern?<dials>   `brand pattern ...`, returns { url }
 */
import { execFile } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { defineConfig, type Plugin } from "vite";

const run = promisify(execFile);
const bin = fileURLToPath(
  new URL("node_modules/@civilian-dev/brand-cli/src/cli.ts", import.meta.url),
);
const out = fileURLToPath(new URL("out/", import.meta.url));
const FLAGS = [
  "pair",
  "scale",
  "turn",
  "dir",
  "noise",
  "seed",
  "format",
  "density",
];

async function brand(args: string[]): Promise<string> {
  const { stdout } = await run(process.execPath, [bin, ...args]);
  return stdout.trim();
}

const api: Plugin = {
  name: "brand-cli",
  configureServer(server) {
    server.middlewares.use("/api", async (req, res) => {
      const url = new URL(req.url ?? "/", "http://local");
      const q = url.searchParams;
      res.setHeader("content-type", "application/json");
      try {
        if (url.pathname === "/choices") {
          res.end(await brand(["list"]));
          return;
        }
        if (url.pathname !== "/pattern") throw new Error("Not found");
        const tile = q.get("tile") ?? "";
        const surface = q.get("surface") ?? "";
        const size = `${q.get("width")}x${q.get("height")}`;
        const flags = FLAGS.flatMap((f) =>
          q.get(f) ? [`--${f}`, q.get(f) as string] : [],
        );
        const dials = FLAGS.filter((f) => q.get(f) && f !== "format")
          .map((f) => q.get(f))
          .join("-");
        const name =
          `${tile}-${surface}-${size}${dials ? `-${dials}` : ""}.${q.get("format") ?? "svg"}`.replace(
            /[^\w.-]/g,
            "",
          );
        mkdirSync(out, { recursive: true });
        await brand([
          "pattern",
          tile,
          surface,
          size,
          ...flags,
          "--out",
          out + name,
        ]);
        res.end(JSON.stringify({ url: `/out/${name}`, name }));
      } catch (e) {
        res.statusCode = 400;
        const err = e as { stderr?: string; message: string };
        res.end(JSON.stringify({ error: (err.stderr || err.message).trim() }));
      }
    });
  },
};

export default defineConfig({ plugins: [api] });
