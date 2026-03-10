const { config } = require('@tamagui/config/v3')
const { createTamagui } = require('tamagui')

const themes = {
  ...config.themes,

  // ─── Light (clean white) ─────────────────────────────────────────────────
  light: {
    ...config.themes.light,
    background:             '#ffffff',
    backgroundHover:        '#f5f5f5',
    backgroundPress:        '#ebebeb',
    backgroundStrong:       '#e0e0e0',   // subtle grey panels / cards
    backgroundTransparent:  'rgba(255,255,255,0)',
    color:                  '#111111',   // primary text
    colorHover:             '#333333',
    colorPress:             '#555555',
    placeholderColor:       '#aaaaaa',
    borderColor:            '#000000',
    borderColorHover:       '#333333',
    borderColorFocus:       '#555555',
    shadowColor:            'rgba(0,0,0,0.10)',
  },

  // ─── Dark (near-black) ───────────────────────────────────────────────────
  dark: {
    ...config.themes.dark,
    background:             '#111111',
    backgroundHover:        '#1c1c1c',
    backgroundPress:        '#222222',
    backgroundStrong:       '#2a2a2a',   // elevated panels / cards
    backgroundTransparent:  'rgba(0,0,0,0)',
    color:                  '#eeeeee',   // primary text
    colorHover:             '#cccccc',
    colorPress:             '#aaaaaa',
    placeholderColor:       '#666666',
    borderColor:            '#444444',
    borderColorHover:       '#666666',
    borderColorFocus:       '#888888',
    shadowColor:            'rgba(0,0,0,0.40)',
  },

  // ─── Brand (warm parchment) ──────────────────────────────────────────────
  brand: {
    ...config.themes.light,
    background:             '#f4efe6',
    backgroundHover:        '#ede6d9',
    backgroundPress:        '#e5dccb',
    backgroundStrong:       '#e2d2bb',   // slightly darker parchment for panels
    backgroundTransparent:  'rgba(244,239,230,0)',
    color:                  '#2f2416',   // dark brown text
    colorHover:             '#4a3a24',
    colorPress:             '#6b552f',
    placeholderColor:       '#aa9070',
    borderColor:            '#7a5a35',
    borderColorHover:       '#9a7045',
    borderColorFocus:       '#5a4025',
    shadowColor:            'rgba(47,36,22,0.15)',
  },

  // ─── Ocean (deep blue) ───────────────────────────────────────────────────
  ocean: {
    ...config.themes.dark,
    background:             '#0b1f2a',
    backgroundHover:        '#0f2838',
    backgroundPress:        '#132e40',
    backgroundStrong:       '#14364a',   // slightly lighter blue for panels
    backgroundTransparent:  'rgba(11,31,42,0)',
    color:                  '#e6f5ff',   // light blue-white text
    colorHover:             '#c8e8ff',
    colorPress:             '#a0d4f5',
    placeholderColor:       '#4a8099',
    borderColor:            '#2d6f8f',
    borderColorHover:       '#3d8faf',
    borderColorFocus:       '#1d4f6f',
    shadowColor:            'rgba(0,20,40,0.40)',
  },

  // ─── Button sub-themes ───────────────────────────────────────────────────
  light_Button: {
    backgroundButton:  '#f0f0f0',
    backgroundHover:   '#e5e5e5',
    backgroundPress:   '#d8d8d8',
    color:             '#111111',
    borderColor:       '#000000',
  },

  dark_Button: {
    backgroundButton:  '#2a2a2a',
    backgroundHover:   '#333333',
    backgroundPress:   '#3d3d3d',
    color:             '#eeeeee',
    borderColor:       '#444444',
  },

  brand_Button: {
    backgroundButton:  '#e2d2bb',
    backgroundHover:   '#d8c6aa',
    backgroundPress:   '#ccb38f',
    color:             '#2f2416',
    borderColor:       '#7a5a35',
  },

  ocean_Button: {
    backgroundButton:  '#14364a',
    backgroundHover:   '#1a435c',
    backgroundPress:   '#20516d',
    color:             '#e6f5ff',
    borderColor:       '#2d6f8f',
  },
}

const tamaguiConfig = createTamagui({
	...config,
	themes,
})

module.exports = tamaguiConfig
