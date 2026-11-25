/**
 * Builds the dials from `brand list`, previews the SVG the CLI writes, and
 * downloads SVG or PNG. Everything else is the CLI's job.
 */
import "@civilian-dev/design-tokens/css";
import "@civilian-dev/brand-fonts/fonts.css";

interface Choice {
  id: string | number;
  label?: string;
}

const SIZES: Record<string, [number, number]> = {
  "Banner 1280 × 288": [1280, 288],
  "Open Graph 1200 × 630": [1200, 630],
  "Profile banner 1500 × 500": [1500, 500],
  "Footer strip 1440 × 72": [1440, 72],
  Custom: [0, 0],
};

const form = document.querySelector("#dials") as HTMLFormElement;
const preview = document.querySelector("#preview") as HTMLImageElement;
const caption = document.querySelector("#caption") as HTMLElement;
const error = document.querySelector("#error") as HTMLElement;
const field = (name: string) =>
  form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;

function select(name: string, label: string, items: Choice[], value: unknown) {
  const el = document.createElement("label");
  el.textContent = label;
  const s = document.createElement("select");
  s.name = name;
  for (const c of items)
    s.add(new Option(c.label ?? String(c.id), String(c.id)));
  s.value = String(value);
  el.append(s);
  form.append(el);
}

async function call(params: Record<string, string>) {
  const res = await fetch(`/api/pattern?${new URLSearchParams(params)}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body as { url: string; name: string };
}

function dials(): Record<string, string> {
  const p: Record<string, string> = {};
  for (const el of form.elements as Iterable<HTMLInputElement>) {
    if (el.name && el.name !== "preset") p[el.name] = el.value;
  }
  return p;
}

async function render() {
  error.textContent = "";
  try {
    const { url, name } = await call(dials());
    preview.src = url;
    preview.alt = name;
    caption.textContent = name;
  } catch (e) {
    error.textContent = (e as Error).message;
  }
}

async function download(format: string, density = "1") {
  error.textContent = "";
  try {
    const { url, name } = await call({ ...dials(), format, density });
    const a = document.createElement("a");
    a.href = url;
    a.download = density === "1" ? name : name.replace(/\.png$/, "@2x.png");
    a.click();
  } catch (e) {
    error.textContent = (e as Error).message;
  }
}

const c = await (await fetch("/api/choices")).json();
const preset = field("preset") as HTMLSelectElement;
for (const name of Object.keys(SIZES)) preset.add(new Option(name));
preset.addEventListener("change", () => {
  const [w, h] = SIZES[preset.value] ?? [0, 0];
  if (w) {
    field("width").value = String(w);
    field("height").value = String(h);
  }
});
for (const n of ["width", "height"]) {
  field(n).addEventListener("input", () => {
    preset.value = "Custom";
  });
}
select("tile", "Pattern", c.tiles, "grain");
select("surface", "Surface", c.surfaces, "paper");
select("pair", "Colours", c.pairs, c.defaults.pair);
select("scale", "Scale", c.scales, c.defaults.scale);
select(
  "turn",
  "Turn",
  c.turns.map((id: number) => ({ id, label: `${id}°` })),
  c.defaults.turn,
);
select(
  "dir",
  "Gradient",
  c.directions.map((id: string) => ({ id })),
  c.defaults.dir,
);
select(
  "noise",
  "Noise",
  c.noises.map((id: string) => ({ id })),
  c.defaults.noise,
);
const seed = document.createElement("label");
seed.innerHTML =
  'Seed<input name="seed" type="number" min="1" step="1" value="1" />';
form.append(seed);

form.addEventListener("change", render);
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-format]")) {
  b.addEventListener("click", () =>
    download(b.dataset.format as string, b.dataset.density),
  );
}
render();
