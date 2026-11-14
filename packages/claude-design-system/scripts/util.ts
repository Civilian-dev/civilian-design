import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Read a canonical output file from @civilian-dev/design-tokens/dist. */
export const readJsonFile = (f: string) =>
  JSON.parse(
    readFileSync(
      resolve(
        dirname(
          fileURLToPath(
            import.meta.resolve("@civilian-dev/design-tokens/json"),
          ),
        ),
        f,
      ),
      "utf8",
    ),
  );
