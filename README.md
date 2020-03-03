# postcss-supported-variables

PostCSS Supported Variables supports your CSS variables with native CSS support API. It gives you a supported and unsupported scope for each variable you used.

## Example

```css
/* input.css */
:root {
  --bg: steelblue;
}

.button {
  display: inline-block;
  padding: 1rem;
  background-color: var(--bg);
}

/* output.css */
:root {
  --bg: steelblue;
}

.button {
  display: inline-block;
  padding: 1rem;
}

@support (--var: 0) {
  background-color: var(--bg);
}

@support not (--var: 0) {
  background-color: steelblue;
}
```

## Usage

Install [PostCSS Supported Variables](https://github.com/cooskun/postcss-supported-variables/tree/master) on your project.

```shell
# NPM
npm install postcss-supported-variables --save-dev

# Yarn
yarn add postcss-supported-variables --dev
```

Use it to process your css

```javascript
const inputCSS = require('./input.css')
const supportVariables = require('postcss-supported-variables');

supportVariables.process(inputCSS);
```

Or use it as a PostCSS plugin

```javascript
const input = require('./input.css');
const postcss = require('postcss');
const supportVariables = require('postcss-supported-variables');

postcss([
  supportVariables()
]).process(input);
```

Or with config file

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-supported-variables')
  ]
}
```
