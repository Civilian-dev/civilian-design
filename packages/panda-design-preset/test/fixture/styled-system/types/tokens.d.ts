import type { Registered } from './register';

export type BreakpointToken = Registered<"BreakpointToken", "2xl" | "lg" | "md" | "sm" | "xl">

export type ColorToken = Registered<"ColorToken", "accent.contrast" | "accent.fg" | "accent.hover" | "accent.solid" | "accent.subtle" | "alpha.black.20" | "alpha.black.40" | "alpha.black.60" | "alpha.ink.10" | "alpha.ink.25" | "alpha.ink.40" | "alpha.ink.5" | "base.black" | "base.paper" | "base.white" | "bg.canvas" | "bg.default" | "bg.emphasized" | "bg.inverse" | "bg.muted" | "bg.subtle" | "border.default" | "border.emphasized" | "border.focus" | "border.subtle" | "brand.contrast" | "brand.fg" | "brand.hover" | "brand.muted" | "brand.solid" | "brand.subtle" | "colorPalette.10" | "colorPalette.100" | "colorPalette.20" | "colorPalette.200" | "colorPalette.25" | "colorPalette.300" | "colorPalette.40" | "colorPalette.400" | "colorPalette.5" | "colorPalette.50" | "colorPalette.500" | "colorPalette.60" | "colorPalette.700" | "colorPalette.800" | "colorPalette.900" | "colorPalette.950" | "colorPalette.black" | "colorPalette.black.20" | "colorPalette.black.40" | "colorPalette.black.60" | "colorPalette.canvas" | "colorPalette.contrast" | "colorPalette.default" | "colorPalette.disabled" | "colorPalette.emphasized" | "colorPalette.faint" | "colorPalette.fg" | "colorPalette.focus" | "colorPalette.hover" | "colorPalette.ink.10" | "colorPalette.ink.25" | "colorPalette.ink.40" | "colorPalette.ink.5" | "colorPalette.inverse" | "colorPalette.muted" | "colorPalette.paper" | "colorPalette.scrim" | "colorPalette.solid" | "colorPalette.strong" | "colorPalette.subtle" | "colorPalette.white" | "danger.contrast" | "danger.fg" | "danger.solid" | "danger.subtle" | "fg.default" | "fg.disabled" | "fg.inverse" | "fg.muted" | "fg.subtle" | "gold.100" | "gold.300" | "gold.50" | "gold.500" | "gold.700" | "gold.900" | "green.100" | "green.300" | "green.50" | "green.500" | "green.700" | "green.900" | "highlight.contrast" | "highlight.fg" | "highlight.solid" | "highlight.subtle" | "info.contrast" | "info.fg" | "info.solid" | "info.subtle" | "neutral.100" | "neutral.200" | "neutral.400" | "neutral.50" | "neutral.700" | "neutral.800" | "neutral.900" | "neutral.950" | "overlay.scrim" | "red.100" | "red.300" | "red.50" | "red.500" | "red.700" | "red.900" | "salmon.100" | "salmon.300" | "salmon.50" | "salmon.500" | "salmon.700" | "salmon.900" | "secondary.contrast" | "secondary.fg" | "secondary.hover" | "secondary.solid" | "secondary.subtle" | "shadow.default" | "shadow.faint" | "shadow.strong" | "success.contrast" | "success.fg" | "success.solid" | "success.subtle" | "teal.100" | "teal.300" | "teal.50" | "teal.500" | "teal.700" | "teal.900" | "violet.100" | "violet.300" | "violet.50" | "violet.500" | "violet.700" | "violet.900" | "warning.contrast" | "warning.fg" | "warning.solid" | "warning.subtle">

export type DurationToken = Registered<"DurationToken", "fast" | "normal" | "slow">

export type EasingToken = Registered<"EasingToken", "default" | "in" | "inOut" | "linear" | "out">

export type FontSizeToken = Registered<"FontSizeToken", "display" | "lg" | "md" | "sm" | "xl" | "xs">

export type FontWeightToken = Registered<"FontWeightToken", "bold" | "medium" | "normal" | "semibold">

export type FontToken = Registered<"FontToken", "body" | "heading" | "mono">

export type LetterSpacingToken = Registered<"LetterSpacingToken", "normal" | "tight" | "wide" | "widest">

export type LineHeightToken = Registered<"LineHeightToken", "normal" | "relaxed" | "snug" | "tight">

export type RadiusToken = Registered<"RadiusToken", "full" | "lg" | "md" | "none" | "sm" | "xl">

export type ShadowToken = Registered<"ShadowToken", "lg" | "md" | "sm" | "xl">

export type SizeToken = Registered<"SizeToken", "2xl" | "2xs" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "breakpoint-2xl" | "breakpoint-lg" | "breakpoint-md" | "breakpoint-sm" | "breakpoint-xl" | "lg" | "md" | "prose" | "sm" | "xl" | "xs">

export type SpacingToken = Registered<"SpacingToken", "-1" | "-12" | "-16" | "-2" | "-24" | "-3" | "-32" | "-4" | "-48" | "-6" | "-8" | "0" | "1" | "12" | "16" | "2" | "24" | "3" | "32" | "4" | "48" | "6" | "8">

export type ZIndexToken = Registered<"ZIndexToken", "banner" | "base" | "docked" | "dropdown" | "hide" | "modal" | "overlay" | "popover" | "skipLink" | "sticky" | "toast" | "tooltip">

interface LocalTokens {
  breakpoints: BreakpointToken
  colors: ColorToken
  durations: DurationToken
  easings: EasingToken
  fontSizes: FontSizeToken
  fontWeights: FontWeightToken
  fonts: FontToken
  letterSpacings: LetterSpacingToken
  lineHeights: LineHeightToken
  radii: RadiusToken
  shadows: ShadowToken
  sizes: SizeToken
  spacing: SpacingToken
  zIndex: ZIndexToken
}

export interface Tokens extends Registered<"Tokens", LocalTokens> {}

export type Token = Registered<"Token", `breakpoints.${BreakpointToken}` | `colors.${ColorToken}` | `durations.${DurationToken}` | `easings.${EasingToken}` | `fontSizes.${FontSizeToken}` | `fontWeights.${FontWeightToken}` | `fonts.${FontToken}` | `letterSpacings.${LetterSpacingToken}` | `lineHeights.${LineHeightToken}` | `radii.${RadiusToken}` | `shadows.${ShadowToken}` | `sizes.${SizeToken}` | `spacing.${SpacingToken}` | `zIndex.${ZIndexToken}`>

export type ColorOpacityModifier = Registered<"ColorOpacityModifier", `${number}`>

export type ColorOpacityToken = Registered<"ColorOpacityToken", `colors.${ColorToken}/${ColorOpacityModifier}`>

export type TokenPath = Token | ColorOpacityToken

export type ColorPalette = Registered<"ColorPalette", "accent" | "alpha" | "alpha.black" | "alpha.ink" | "base" | "bg" | "border" | "brand" | "danger" | "fg" | "gold" | "green" | "highlight" | "info" | "neutral" | "overlay" | "red" | "salmon" | "secondary" | "shadow" | "success" | "teal" | "violet" | "warning">

export type TokenValue<T extends string> = T extends keyof Tokens ? Tokens[T] : never