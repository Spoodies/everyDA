const { config } = require('@tamagui/config/v3')
const { createTamagui } = require('tamagui')

const themes = {
  ...config.themes,

  light: {
    ...config.themes.light,
    borderColor: '#000000',
    backgroundStrong: '#D3D3D3',
  },

  brand: {
    ...config.themes.light,
    background: '#f4efe6',
    backgroundStrong: '#e2d2bb',
    color: '#2f2416',
    borderColor: '#7a5a35',
  },

  ocean: {
    ...config.themes.dark,
    background: '#0b1f2a',
    backgroundStrong: '#14364a',
    color: '#e6f5ff',
    borderColor: '#2d6f8f',
  },

  brand_Button: {
    backgroundButton: '#e2d2bb',
    backgroundHover: '#d8c6aa',
    backgroundPress: '#ccb38f',
    color: '#2f2416',
    borderColor: '#7a5a35',
  },

  ocean_Button: {
    backgroundButton: '#14364a',
    backgroundHover: '#1a435c',
    backgroundPress: '#20516d',
    color: '#e6f5ff',
    borderColor: '#2d6f8f',
  },
}

const tamaguiConfig = createTamagui({
	...config,
	themes,
})

module.exports = tamaguiConfig
