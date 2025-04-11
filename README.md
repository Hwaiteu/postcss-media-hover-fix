# postcss-media-hover-fix

A PostCSS plugin that fixes hover media queries for better touch device support.

## Description

This plugin automatically wraps CSS hover selectors in a media query that checks for both hover capability and fine pointer input. This ensures that hover effects only apply on devices that actually support hover, preventing unwanted hover effects on touch devices.

## Installation

```bash
npm install postcss-media-hover-fix --save-dev
```

## Usage

Add the plugin to your PostCSS configuration:

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-media-hover-fix')
  ]
}
```

## Example

Input:
```css
.button:hover {
  background-color: blue;
}
```

Output:
```css
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background-color: blue;
  }
}
```

## Credits

- Original plugin author: Saul Hardman <hello@iamsaul.co.uk>
- Modified by: Hwaiteu (github.com/Hwaiteu)

## License

MIT 