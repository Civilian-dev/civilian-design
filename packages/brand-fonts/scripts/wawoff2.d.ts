declare module "wawoff2" {
  /** Decode a woff2 font to its TrueType or OpenType bytes. */
  export function decompress(woff2: Uint8Array): Promise<Uint8Array>;
}
