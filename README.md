# gatsby-plugin-wp-composer-converter

Consumes normalized composer data from `wp-composer-bridge` in Gatsby.

Generic package. No page-type presets bundled.

## Install

```bash
npm install gatsby-plugin-wp-composer-converter
```

## Minimal setup

### 1. Add plugin

```js
// gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-source-wordpress`,
    {
      resolve: `gatsby-plugin-wp-composer-converter`,
      options: {
        mode: `root`,
      },
    },
  ],
};
```

### 2. Query composer entries in `gatsby-node.js`

If WP plugin exposes root `composerEntries` directly:

```js
const path = require(`path`);
const {
  createComposerPageData,
  getComposerEntriesFromGraphql,
} = require(`gatsby-plugin-wp-composer-converter`);
const { HeroSection, FaqSection } = require(`./src/components/sections`);

const components = {
  hero: HeroSection,
  faq: FaqSection,
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const result = await graphql(`
    {
      composerEntries(postTypes: ["page"]) {
        databaseId
        title
        uri
        postType
        graphQLType
        composerTarget
        composerContract
        composerSections {
          id
          layout
          order
          meta
          wpFields
        }
      }
    }
  `);

  const entries = getComposerEntriesFromGraphql(result.data);

  entries.forEach((entry) => {
    const composer = createComposerPageData(entry, {
      components,
      warn: reporter.warn,
    });

    actions.createPage({
      path: entry.uri,
      component: path.resolve(`./src/templates/composer-page.js`),
      context: { composer },
    });
  });
};
```

If project nests entries under another query key, point helper at that key.

Example for `allWp.nodes[].composerEntries`:

```js
const entries = getComposerEntriesFromGraphql(result.data, {
  sourceQuery: `allWp`,
  postTypes: [`page`, `post`],
});
```

### 3. Render in template

```js
import React from "react";
import { HeroSection, FaqSection } from "../components/sections";

const components = {
  hero: HeroSection,
  faq: FaqSection,
};

export default function ComposerPageTemplate({ pageContext }) {
  const sections = pageContext?.composer?.sections || [];

  return sections.map((section) => {
    const Component = components[section.componentKey];
    if (!Component) return null;

    return <Component key={section.id} {...section.props} />;
  });
}
```

## Query shapes supported

### Direct root field

```graphql
{
  composerEntries {
    uri
    composerSections {
      layout
      wpFields
    }
  }
}
```

### Nested under another field

```graphql
{
  allWp {
    nodes {
      composerEntries {
        uri
        composerSections {
          layout
          wpFields
        }
      }
    }
  }
}
```

Set:
- direct root field: no extra option needed
- nested field: `sourceQuery: "allWp"`

## What plugin expects from WP data

Each entry should include:
- `databaseId`
- `postType`
- `graphQLType`
- `slug`
- `title`
- `uri`
- `composerTarget`
- `composerContract`
- `composerSections`

Each section should include:
- `layout`
- `id` optional
- `order` optional
- `meta` optional
- `wpFields` or `fields`

Example section:

```json
{
  "layout": "hero",
  "id": "hero",
  "order": 0,
  "wpFields": {
    "title": "Welcome",
    "content": "<p>Hello</p>"
  }
}
```

## Main helpers

```js
const {
  createComposerPageData,
  createMappedComposerSections,
  getComposerEntriesFromGraphql,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
} = require(`gatsby-plugin-wp-composer-converter`);
```

### `createComposerPageData(entry, { components })`

Returns page-safe data for `createPage` context:
- entry metadata
- `sections`
- `missingLayouts`
- `registeredLayouts`

Each returned section looks like:

```js
{
  id: `hero-0`,
  order: 0,
  layout: `hero`,
  type: `hero`,
  componentKey: `hero`,
  props: { ...fields },
  fields: { ...fields },
  meta: { ... },
  hasComponent: true,
}
```

### `createMappedComposerSections(entry, { components })`

Returns only mapped sections.

### `getComposerEntriesFromGraphql(data, options)`

Extracts and normalizes entries from GraphQL result.

Options:
- `sourceQuery`: where to find entries in result, default `composerEntries`
- `postTypes`: optional post type filter
- `composerField`: section field name, default `composerSections`

## Optional root mode

When plugin runs with:

```js
options: {
  mode: `root`,
}
```

it also creates local Gatsby nodes:
- `WpComposerEntry`

and root field:
- `composerEntries`

Useful if you want unified Gatsby-side access to normalized entries.

## Legacy definition mode

If project still needs Gatsby-side mapping from raw composer data, package also exposes low-level helpers:

```js
const {
  createField,
  createPageConfig,
  createSection,
  createSectionsPreset,
  FIELD_TYPES,
} = require(`gatsby-plugin-wp-composer-converter`);
```

Example:

```js
const preset = createSectionsPreset({
  id: `page-sections`,
  targetType: `WpPage`,
  composerPath: `pageComposer.composer`,
  sections: [
    {
      component: function HeroSection() {},
      layout: `WpPageComposerComposerHeroLayout`,
      props: {
        title: `header`,
        content: { source: `content`, type: FIELD_TYPES.wysiwyg },
      },
    },
  ],
});
```

Use legacy mode only when WP bridge contract is not available yet.

## Notes

- package is generic
- no bundled components
- no bundled page-type presets
- no raw ACF union fragments needed in root flow
- missing component layouts are skipped by default
