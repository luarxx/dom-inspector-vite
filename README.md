# vite-plugin-dom-inspector

A Vite plugin that injects a visual DOM inspector in the bottom-right corner of the page during **development mode**.

> Works only with `vite dev` (does not affect production builds).

## Motivation

Many AI-powered extensions, IDEs, and GUIs lack a built-in DOM selector. This plugin fills that gap: instead of writing selectors manually, you visually inspect any element on the page and copy its CSS selector with a single click — streamlining the process of providing precise context to AI tools.

---

## Installation

```bash
npm install --save-dev vite-plugin-dom-inspector
```

## Setup

In your `vite.config.js` (or `vite.config.ts`):

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { meuDomInspectorPlugin } from 'vite-plugin-dom-inspector'

export default defineConfig({
  plugins: [
    react(),
    meuDomInspectorPlugin()
  ]
})
```

That's it! When you run `npm run dev`, an **Inspect** button will appear in the bottom-right corner of the page.

## How to use

1. Click the **Inspect** button (magnifying glass icon) to activate inspection mode (the button turns red).
2. Hover over page elements — a blue glow will highlight the element under the cursor.
3. A dark tooltip shows the element's **tag**, **ID**, and **CSS classes**.
4. **Click** any element to copy its selector and outer HTML to the clipboard.
5. Press **Escape** or click the **Close** button to deactivate.

| State | Button | Behavior |
|-------|--------|----------|
| Inactive | Inspect (blue) | Nothing happens on hover |
| Active | Close (red) | Blue highlight + tooltip on hover; click copies selector and HTML |
