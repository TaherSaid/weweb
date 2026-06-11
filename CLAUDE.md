# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run serve        # Serve locally for development (add --port=PORT to specify port)
npm run build -- --name=gantt --type=wwobject   # Build and check for errors
```

No lint or test scripts are configured.

## Architecture

This is a **WeWeb custom element** — a single Vue component packaged for use in the [WeWeb](https://www.weweb.io/) no-code editor.

Two files define the element:

- **`ww-config.js`** — Declares the element's metadata and its editable properties (name, type, default values). This is what the WeWeb editor reads to render the properties panel.
- **`src/wwElement.vue`** — The Vue component that renders the element. It receives a single `content` prop (an Object) whose keys match the property names declared in `ww-config.js`.

**Data flow:** WeWeb injects `content` into the component at runtime. Each key in `content` corresponds to a property defined in `ww-config.js`. Adding a new configurable property requires declaring it in both `ww-config.js` (so it appears in the editor) and consuming it from `this.content` in `wwElement.vue`.

## Development workflow

1. Run `npm run serve --port=<PORT>`
2. In the WeWeb editor, open the developer popup and register the local URL as a custom element
3. The element hot-reloads as you edit `wwElement.vue` or `ww-config.js`
