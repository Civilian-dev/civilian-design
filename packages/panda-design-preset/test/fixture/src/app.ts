import { css } from "../styled-system/css";

export const card = css({
  bg: "bg.canvas",
  color: "fg.default",
  borderColor: "border.default",
  padding: "4",
  boxShadow: "md",
  _dark: { bg: "bg.subtle" },
});
export const title = css({ textStyle: "heading.display" });
