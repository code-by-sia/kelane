# Kelane Recipe Importer — Chrome Extension

A Chrome extension that detects structured recipe data on any cooking website and imports it into your [Kelane](https://github.com/code-by-sia/kelane) recipe manager with one click.

## Supported sites

Any site that publishes [schema.org/Recipe](https://schema.org/Recipe) structured data — which covers virtually all major recipe sites:

- AllRecipes, Food Network, Serious Eats, NYT Cooking
- BBC Good Food, Bon Appétit, Epicurious
- Simply Recipes, Taste of Home, King Arthur Baking
- … and thousands more

## Installation

### 1. Generate icons (one-time)

```bash
# From the Kelane project root:
node extension/icons/generate.mjs
```

### 2. Load in Chrome

1. Open **chrome://extensions**
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder

The Kelane chef hat icon will appear in your Chrome toolbar.

### 3. Configure the app URL

The extension defaults to **`https://chef.samalstudios.com`** — no configuration needed if you use the hosted app. If you run a local or self-hosted instance, click the extension icon → gear ⚙ → enter your URL. This only needs to be set once.

## Usage

1. Navigate to any recipe page
2. Click the **Kelane** toolbar icon
3. The popup shows a preview of the detected recipe
4. Click **Import to Kelane**
5. In the Kelane import page, edit the name and choose categories
6. Click **Save recipe**

## How it works

1. When you click the icon, the extension injects a script into the current page that searches for `application/ld+json` blocks containing `@type: "Recipe"` (JSON-LD) or `[itemtype="schema.org/Recipe"]` microdata.
2. The structured recipe is extracted and shown as a preview in the popup.
3. On import, the recipe is serialised and passed to Kelane's `/import` route as a URL parameter — no relay server, no cloud, fully local.

## Permissions

| Permission | Reason |
|---|---|
| `activeTab` | Read the current tab's URL and inject the extraction script |
| `scripting` | Inject the recipe-extraction function into the page |
| `storage` | Save your Kelane URL setting across sessions |
| `<all_urls>` host permission | Required so `scripting` can inject into any recipe site |

## Development

The extension is vanilla JS/HTML/CSS — no build step required. Just edit the files and reload the extension in `chrome://extensions`.

```
extension/
├── manifest.json          MV3 manifest
├── popup/
│   ├── popup.html         Extension popup UI
│   ├── popup.css          Dark-themed styles
│   └── popup.js           Recipe extraction + import logic
├── background/
│   └── service-worker.js  Opens the Kelane tab on import
└── icons/
    ├── icon.svg           Source vector icon
    ├── generate.mjs       Generates PNG icons from the SVG
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```
