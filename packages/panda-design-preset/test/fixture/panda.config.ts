import { defineConfig } from "@pandacss/dev";
import { civilianPreset } from "../../src/preset";

export default defineConfig({
  presets: ["@pandacss/preset-base", civilianPreset],
  include: ["./src/**/*.ts"],
  outdir: "styled-system",
  jsxFramework: undefined,
});
