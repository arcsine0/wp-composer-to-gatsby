# gatsby-plugin-wp-composer-converter

Turns WordPress ACF composer layouts into stable Gatsby section data.

Current shape: schema/data plugin first, rendering plugin later.

## What it does

- adds computed fields to WP nodes in Gatsby schema
- ports converter logic from manual `seekmarketing` setup
- ships built-in preset for composer-driven sections
- can generate preset/definitions from small `sections` config
- keeps setup in `gatsby-config.js`

## Install

```bash
npm install gatsby-plugin-wp-composer-converter
```

## Fastest setup

```js
// gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-source-wordpress`,
    {
      resolve: `gatsby-plugin-wp-composer-converter`,
      options: {
        presets: [`sections`],
      },
    },
  ],
};
```

Default preset targets:

- Gatsby type: `WpService`
- composer path: `servicesComposer.composer`

Override both for any composer-backed WP node.

That adds these computed fields to `WpService`:

- `wpComposerLayouts`
- `wpComposerSections`
- `wpComposerFields`
- `wpComposerConfig`

## Query example

```graphql
query ComposerNodeById($id: String!) {
  wpService(id: { eq: $id }) {
    title
    wpComposerSections
    wpComposerConfig
  }
}
```

`wpComposerSections` is usually enough for rendering plugin work later.

## Minimal custom target

```js
const { createSectionsPreset, FIELD_TYPES } = require(`gatsby-plugin-wp-composer-converter`);
const HeroSection = require(`./src/components/sections/HeroSection`);
const FaqSection = require(`./src/components/sections/FaqSection`);

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-wp-composer-converter`,
      options: {
        presets: [
          createSectionsPreset({
            id: `page-sections`,
            targetType: `WpPage`,
            composerPath: `pageComposer.composer`,
            sections: [
              {
                component: HeroSection,
                layout: `WpPageComposerComposerHeroLayout`,
                props: {
                  title: `header`,
                  desc: { source: `content`, type: FIELD_TYPES.wysiwyg },
                  image: { source: `image`, type: FIELD_TYPES.image },
                },
              },
              {
                component: FaqSection,
                layout: `WpPageComposerComposerAccordionLayout`,
                props: {
                  title: `header`,
                  items: { source: `items`, type: FIELD_TYPES.repeater },
                },
              },
            ],
          }),
        ],
      },
    },
  ],
};
```

`component`, `id`, `type`, `label` can be omitted. Package derives them. Only keep custom values when needed.

## Manual mode

If generator is too small for odd layouts, drop to raw definitions:

```js
const { createField, createSection, FIELD_TYPES } = require(`gatsby-plugin-wp-composer-converter`);
```

## Built-in preset

```js
const { sectionsPreset } = require(`gatsby-plugin-wp-composer-converter`);
```

Built-in preset currently mirrors existing converted composer flow:

- hero
- trusted brands
- single list
- media with text: fails/work
- button groups
- steps cards
- case studies
- grid cards
- vertical media
- image content list
- CTA banner
- accordion

## What generator removes

You no longer hand-write most of this per page type:

- repetitive `createSection(...)` blocks
- repetitive `createField(...)` blocks
- `id` / `type` / `label` boilerplate
- manual preset assembly

User still defines section-to-WP field mapping. Custom WP plugin can consume same field contract from `wpComposerFields` or `wpComposerConfig`.

## Notes

- No renderer bundled yet. Package only normalizes data.
- No local `gatsby-node.js` wiring needed for conversion.
- Future renderer plugin can consume `wpComposerSections` directly.
- Strange layouts can still use `match`, `mapDataToProps`, or raw `definitions`.
