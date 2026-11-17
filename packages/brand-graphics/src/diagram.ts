/**
 * A Mermaid theme for diagrams (DESIGN.md, Components, Diagram): ink on the
 * page ground, 2px strokes, square corners, cluster labels in the label
 * style, and one filled node for the output. Mark that node `:::output`.
 *
 * Keep each diagram to one line of steps with a single place where it fans
 * out; Mermaid's layout gets busy fast.
 */
import { FONTS, type Hex, type Theme } from "./compose.js";

/** The Mermaid options this theme sets. Spread it into `mermaid.initialize()`. */
export interface MermaidConfig {
  theme: "base";
  look: "classic";
  fontFamily: string;
  themeVariables: Record<string, string | boolean>;
  themeCSS: string;
  flowchart: {
    curve: "step";
    minNodeWidth: number;
    padding: number;
    nodeSpacing: number;
    rankSpacing: number;
    diagramPadding: number;
  };
}

export function mermaidTheme(hex: Hex, theme: Theme): MermaidConfig {
  const ground = hex("bg.canvas", theme);
  const ink = hex("fg.default", theme);
  const hairline = hex("border.emphasized", theme);
  return {
    theme: "base",
    look: "classic",
    fontFamily: FONTS.body,
    themeVariables: {
      darkMode: theme === "dark",
      background: ground,
      fontFamily: FONTS.body,
      fontSize: "14px",
      textColor: ink,
      lineColor: ink,
      mainBkg: ground,
      nodeBorder: ink,
      nodeTextColor: ink,
      primaryColor: ground,
      primaryBorderColor: ink,
      primaryTextColor: ink,
      secondaryColor: ground,
      secondaryBorderColor: ink,
      secondaryTextColor: ink,
      tertiaryColor: ground,
      tertiaryBorderColor: hairline,
      tertiaryTextColor: ink,
      clusterBkg: ground,
      clusterBorder: hairline,
      titleColor: ink,
      edgeLabelBackground: ground,
    },
    themeCSS: [
      ".node rect, .node polygon { rx: 0; ry: 0; stroke-width: 2px; }",
      ".flowchart-link, .edgePath .path { stroke-width: 2px; }",
      `.marker, marker path { fill: ${ink}; stroke: ${ink}; }`,
      ".cluster rect { rx: 0; ry: 0; stroke-width: 1px; }",
      `.cluster-label .nodeLabel, .cluster-label span, .cluster-label text { font-family: ${FONTS.body}; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }`,
      `.node.output rect, .node.output polygon { fill: ${ink}; }`,
      `.node.output .nodeLabel, .node.output span, .node.output text { color: ${ground}; fill: ${ground}; }`,
    ].join("\n"),
    // Tight spacing so a six-step diagram fits the prose measure near full size.
    flowchart: {
      curve: "step",
      // Boxes share one width unless a label is longer, as on a transit map.
      minNodeWidth: 72,
      padding: 12,
      nodeSpacing: 16,
      rankSpacing: 24,
      diagramPadding: 0,
    },
  };
}
