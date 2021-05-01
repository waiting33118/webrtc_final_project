module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridAutoRows: {
        auto: 'minmax(350px,350px)'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
