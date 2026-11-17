/**
 * The checks, run inside the page with `page.evaluate`. Each one tests a
 * fixed part of the theme contract (DESIGN.md, Theme contract and Rules)
 * against computed styles, so it judges what the browser shows, not what a
 * stylesheet says. This function must stay self-contained: it is
 * serialised and sent to the browser.
 */

export interface Finding {
  /** The check that failed. */
  check: string;
  /** Where, and what was found. */
  detail: string;
}

export interface CheckOptions {
  /**
   * A specimen sheet shows many cards or patterns side by side, so the
   * page-level checks (one card, one feature, grounds) are skipped.
   */
  sheet: boolean;
}

export function inspect(options: CheckOptions): Finding[] {
  const findings: Finding[] = [];
  const style = (el: Element) => getComputedStyle(el);
  const px = (value: string) => Number.parseFloat(value) || 0;

  const describe = (el: Element) => {
    const tag = el.tagName.toLowerCase();
    const cls = [...el.classList].slice(0, 2).join(".");
    const text = (el.textContent ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 32);
    return `<${tag}${cls ? `.${cls}` : ""}>${text ? ` "${text}"` : ""}`;
  };
  const add = (check: string, el: Element, detail: string) => {
    findings.push({ check, detail: `${describe(el)}: ${detail}` });
  };

  const visible = (el: Element) => {
    const s = style(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const elements = [...document.body.querySelectorAll("*")].filter(visible);
  const ownText = (el: Element) =>
    [...el.childNodes].some(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        /[A-Za-z]/.test(node.textContent ?? ""),
    );
  const family = (s: CSSStyleDeclaration) =>
    (s.fontFamily.split(",")[0] ?? "").replace(/["']/g, "").trim();
  const clear = (colour: string) =>
    colour === "transparent" || /rgba\([^)]*,\s*0\)$/.test(colour);

  // Labels are the only uppercase text, in the label style (rule 10).
  for (const el of elements) {
    const s = style(el);
    if (s.textTransform !== "uppercase" || !ownText(el)) continue;
    if (family(s) !== "Instrument Sans") {
      add("label-style", el, `uppercase text set in ${family(s)}`);
    } else if (Number(s.fontWeight) < 600) {
      add("label-style", el, `label weight ${s.fontWeight}, not 600`);
    } else if (px(s.letterSpacing) / px(s.fontSize) < 0.08) {
      add("label-style", el, `label tracking ${s.letterSpacing}, not 0.1em`);
    }
  }

  // Headings are Poppins 600.
  for (const el of document.querySelectorAll("h1, h2, h3")) {
    if (!visible(el)) continue;
    const s = style(el);
    if (family(s) !== "Poppins") add("heading", el, `set in ${family(s)}`);
    else if (s.fontWeight !== "600") {
      add("heading", el, `weight ${s.fontWeight}, not 600`);
    }
  }

  // Rules and borders are 1, 2 or 4px.
  const sides = ["Top", "Right", "Bottom", "Left"] as const;
  for (const el of elements) {
    const s = style(el) as unknown as Record<string, string>;
    for (const side of sides) {
      const width = px(s[`border${side}Width`] ?? "0");
      if (s[`border${side}Style`] === "none" || width === 0) continue;
      if (![1, 2, 4].includes(Math.round(width))) {
        add("rule-width", el, `${side.toLowerCase()} border ${width}px`);
      }
    }
  }

  // In the body, things are separated by space: a border on only the top
  // or bottom is a rule, and rules belong to the card frame and tables.
  for (const el of elements) {
    if (el.closest("table, .cv-card")) continue;
    const s = style(el);
    const on = (side: (typeof sides)[number]) =>
      px(
        (s as unknown as Record<string, string>)[`border${side}Width`] ?? "0",
      ) > 0 &&
      (s as unknown as Record<string, string>)[`border${side}Style`] !== "none";
    if ((on("Top") || on("Bottom")) && !on("Left") && !on("Right")) {
      add(
        "body-rule",
        el,
        `${on("Top") ? "top" : "bottom"} rule outside the card and tables`,
      );
    }
  }

  // Artwork and page containers are square.
  const square =
    ".cv-card, .cv-frame, .cv-cell, .cv-callout, .cv-code, svg.cv-pattern, pre, blockquote, table, figure, aside, [class*='callout'], .custom-block";
  for (const el of document.querySelectorAll(square)) {
    if (!visible(el)) continue;
    const radius =
      px(style(el).borderTopLeftRadius) + px(style(el).borderBottomRightRadius);
    if (radius > 0)
      add("square", el, `border-radius ${style(el).borderRadius}`);
  }

  // Tables have rules, not fills.
  for (const el of document.querySelectorAll("table tr, table td, table th")) {
    if (!visible(el)) continue;
    const bg = style(el).backgroundColor;
    if (!clear(bg)) add("table-fill", el, `background ${bg}`);
  }

  if (options.sheet) return findings;

  // One card, at the top (rule 3).
  const cards = [...document.querySelectorAll(".cv-card")].filter(visible);
  if (cards.length !== 1) {
    findings.push({
      check: "one-card",
      detail: `page has ${cards.length} cards (.cv-card), not one`,
    });
  } else if (
    (cards[0] as Element).getBoundingClientRect().top > window.innerHeight
  ) {
    add("one-card", cards[0] as Element, "the card is below the first screen");
  }

  // One feature per view: patterns in the first screen, callout art aside.
  const features = [...document.querySelectorAll("svg")].filter(
    (svg) =>
      visible(svg) &&
      svg.querySelector("feTurbulence") &&
      !svg.closest("aside, .cv-callout, [class*='callout'], .custom-block") &&
      svg.getBoundingClientRect().top < window.innerHeight,
  );
  if (features.length > 1) {
    findings.push({
      check: "one-feature",
      detail: `${features.length} patterns in the first screen, not one`,
    });
  }

  // Grounds: the window sits on the page ground; the card sits apart.
  const page = clear(style(document.body).backgroundColor)
    ? style(document.documentElement).backgroundColor
    : style(document.body).backgroundColor;
  const header = document.querySelector("header");
  if (header && visible(header)) {
    const bg = style(header).backgroundColor;
    if (!clear(bg) && bg !== page) {
      add("grounds", header, `window header on ${bg}, page on ${page}`);
    }
  }
  const card = cards[0];
  if (card && style(card).backgroundColor === page) {
    add(
      "grounds",
      card,
      "card ground is the same as the page, so it does not sit apart",
    );
  }

  return findings;
}
