/**
 * Schema check for the Design System type's tokens.json (list shape), written from the type's
 * format.md: name regex and uniqueness, colour value forms, no var(), no named colours.
 */

type Json = any;

export const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FN_RE = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^()]*\)$/;
const ALIAS_RE = /^\{([^{}]+)\}$/;
const LENGTH_RE = /^-?\d*\.?\d+(?:px|rem|em|%)?$/;

export function checkTokensJson(t: Json): string[] {
  const errors: string[] = [];
  const names = new Set<string>();
  const claim = (name: unknown, where: string) => {
    if (typeof name !== "string" || !NAME_RE.test(name))
      errors.push(`${where}: invalid name ${JSON.stringify(name)}`);
    else if (names.has(name)) errors.push(`${where}: duplicate name ${name}`);
    else names.add(name);
  };

  const themes: string[] = (t.color?.themes ?? []).map((x: Json) => x.id);
  if (!themes.length) errors.push("color.themes: missing");
  if (!Array.isArray(t.color?.tokens))
    errors.push("color.tokens: must be a list");
  const colourNames = new Set<string>(
    (t.color?.tokens ?? []).map((x: Json) => x.name),
  );

  for (const tok of t.color?.tokens ?? []) {
    claim(tok.name, `color.${tok.name}`);
    const values: Record<string, string> =
      typeof tok.value === "string"
        ? { [themes[0] as string]: tok.value }
        : tok.value;
    if (!values?.[themes[0] as string])
      errors.push(`color.${tok.name}: no value for first theme`);
    for (const [theme, v] of Object.entries(values ?? {})) {
      const where = `color.${tok.name}[${theme}]`;
      if (typeof v !== "string")
        errors.push(`${where}: value must be a string`);
      else if (/var\(|color-mix\(/.test(v))
        errors.push(`${where}: var()/color-mix() not allowed`);
      else if (ALIAS_RE.test(v)) {
        const target = ALIAS_RE.exec(v)?.[1] as string;
        if (target === tok.name || !colourNames.has(target))
          errors.push(`${where}: bad alias ${v}`);
      } else if (!HEX_RE.test(v) && !FN_RE.test(v))
        errors.push(`${where}: unsupported colour ${v}`);
    }
    if (!tok.usage) errors.push(`color.${tok.name}: missing usage`);
  }

  for (const family of ["spacing", "radius", "shadow"]) {
    if (!t[family]) continue;
    if (!Array.isArray(t[family].tokens))
      errors.push(`${family}.tokens: must be a list`);
    for (const tok of t[family].tokens ?? []) {
      claim(tok.name, `${family}.${tok.name}`);
      if (tok.value === undefined || tok.value === "")
        errors.push(`${family}.${tok.name}: missing value`);
      if (family !== "shadow" && !LENGTH_RE.test(String(tok.value)))
        errors.push(`${family}.${tok.name}: bad length ${tok.value}`);
      if (!tok.usage) errors.push(`${family}.${tok.name}: missing usage`);
    }
  }

  const type = t.type;
  if (!type) errors.push("type: missing");
  else {
    for (const f of type.fonts ?? []) {
      if (!f.family || !f.file || !f.weight)
        errors.push(`type.fonts: incomplete entry ${JSON.stringify(f)}`);
    }
    const families = new Set(Object.keys(type.families ?? {}));
    for (const g of type.groups ?? []) {
      if (!families.has(g.family))
        errors.push(`type.groups.${g.name}: unknown family ${g.family}`);
      for (const s of g.styles ?? []) {
        if (!s.name || !s.fontSize)
          errors.push(
            `type.groups.${g.name}: incomplete style ${JSON.stringify(s)}`,
          );
        if (
          typeof s.fontWeight !== "number" &&
          !/^\d+(?: \d+)?$/.test(String(s.fontWeight))
        ) {
          errors.push(`type style ${s.name}: bad fontWeight ${s.fontWeight}`);
        }
      }
    }
  }
  return errors;
}
