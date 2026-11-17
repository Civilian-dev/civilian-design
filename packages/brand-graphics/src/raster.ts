/**
 * PNG output for composed artefacts, for places that cannot take SVG:
 * Open Graph and social cards, PDFs, slides. Text is set with the brand
 * fonts from @civilian-dev/brand-fonts; system fonts are never used, so the
 * result is the same on every machine.
 *
 * A separate entry point (`@civilian-dev/brand-graphics/raster`), so the
 * native renderer only loads when it is used.
 */
import { fontPath, fonts } from "@civilian-dev/brand-fonts";
import { Resvg } from "@resvg/resvg-js";

export interface PngOptions {
  /**
   * Output width in px. Defaults to the SVG's own width. Use twice the
   * width for sharp images on high-density screens.
   */
  width?: number;
}

const FONT_FILES = fonts.map((face) => fontPath(face.opentype));

/** Render an SVG string from this package to PNG bytes. */
export function toPng(svg: string, options: PngOptions = {}): Uint8Array {
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: "Instrument Sans",
    },
    fitTo: options.width
      ? { mode: "width", value: options.width }
      : { mode: "original" },
  });
  return resvg.render().asPng();
}
