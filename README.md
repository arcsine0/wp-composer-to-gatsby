# gatsby-plugin-wp-composer-converter

Consumes normalized composer data from `wp-composer-bridge` and makes it easier to use in Gatsby.

Supports two paths:
- `root` mode: centralized `composerEntries`
- `node` mode: existing per-node `composerSections`

Legacy definitions/presets still work.

## Install

```bash
npm install gatsby-plugin-wp-composer-converter
```

## What changed

Old setup assumed Gatsby had to understand raw ACF composer layouts.

New setup assumes WordPress plugin already exposes normalized fields:
- `composerSections`
- `composerTarget`
- `composerContract`
- root `composerEntries`

So Gatsby side mostly just registers components by normalized layout key.

## Root mode

Recommended.

```js
const {
  HeroBannerSection,
  FaqSection,
  CtaBannerSection,
} = require(`./src/components/sections`);

module.exports = {
  plugins: [
    `gatsby-source-wordpress`,
    {
      resolve: `gatsby-plugin-wp-composer-converter`,
      options: {
        mode: `root`,
        components: {
          heroBanner: HeroBannerSection,
          faq: FaqSection,
          ctaBanner: CtaBannerSection,
        },
      },
    },
  ],
};
```

Defaults in root mode:
- `sourceQuery: composerEntries`
- `composerField: composerSections`

### Gatsby query in root mode

Plugin creates local Gatsby nodes of type `WpComposerEntry` and adds root field `composerEntries`.

```graphql
query ComposerEntriesPage {
  composerEntries(postTypes: ["page", "case_study"]) {
    databaseId
    postType
    graphQLType
    slug
    title
    uri
    composerTarget
    composerContract
    composerSections
  }
}
```

Also available through Gatsby node queries:

```graphql
query ComposerEntriesNodes {
  allWpComposerEntry {
    nodes {
      databaseId
      postType
      uri
      composerSections
    }
  }
}
```

### `composerEntries`

`composerEntries` is centralized list of normalized composer-backed entries.

Each entry preserves:
- `databaseId`
- `postType`
- `graphQLType`
- `slug`
- `title`
- `uri`
- `composerTarget`
- `composerContract`
- `composerSections`

Each section is expected to already look like:

```json
{
  "layout": "heroBanner",
  "id": "hero",
  "order": 0,
  "fields": {
    "header": "SEO Services"
  },
  "meta": {
    "rawLayoutName": "hero_banner",
    "targetKey": "page",
    "index": 0
  }
}
```

Component matching should use only:
- `composerSections[].layout`

Never raw ACF typename strings.

## Root mode filtering

Filter by WP post type slug:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-wp-composer-converter`,
      options: {
        mode: `root`,
        postTypes: [`page`, `case_study`],
        components: {
          heroBanner: HeroBannerSection,
          faq: FaqSection,
        },
      },
    },
  ],
};
```

This filters generated `WpComposerEntry` nodes and root `composerEntries` results.

## Node mode

Backwards-compatible path when app still queries WP nodes directly.

```js
module.exports = {
  plugins: [
    `gatsby-source-wordpress`,
    {
      resolve: `gatsby-plugin-wp-composer-converter`,
      options: {
        mode: `node`,
        targetType: `WpPage`,
        composerField: `composerSections`,
        components: {
          heroBanner: HeroBannerSection,
        },
      },
    },
  ],
};
```

Then query node field already exposed by WordPress plugin:

```graphql
query PageBySlug($id: String!) {
  wpPage(id: { eq: $id }) {
    title
    composerSections
    composerTarget
    composerContract
  }
}
```

## Migration: node mode to root mode

Before:
- query composer data per WP node type
- keep page/post/CPT plumbing separate

After:
- query one centralized composer list
- filter by `postTypes` when needed
- use `layout` key to pick components

Typical move:

```js
// before
options: {
  targetType: `WpPage`,
  composerField: `composerSections`,
}

// after
options: {
  mode: `root`,
  postTypes: [`page`],
}
```

## Gatsby `createPages` helper

If you want mapping in project `gatsby-node.js` instead of plugin config, use exported helper.

```js
const path = require(`path`);
const { createComposerPageData } = require(`gatsby-plugin-wp-composer-converter`);
const {
  HeroBannerSection,
  FaqSection,
} = require(`./src/components/sections`);

const components = {
  heroBanner: HeroBannerSection,
  faq: FaqSection,
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
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
        composerSections
      }
    }
  `);

  result.data.composerEntries.forEach((entry) => {
    const composer = createComposerPageData(entry, {
      components,
      warn: reporter.warn,
    });

    createPage({
      path: entry.uri,
      component: path.resolve(`./src/templates/composer-page.js`),
      context: {
        databaseId: entry.databaseId,
        composer,
      },
    });
  });
};
```

Returned `composer` object includes:
- entry metadata
- `sections`
- `missingLayouts`
- `registeredLayouts`

Each generated section looks like:

```js
{
  id: `hero-0`,
  order: 0,
  layout: `heroBanner`,
  type: `heroBanner`,
  componentKey: `heroBanner`,
  props: { ...fields },
  fields: { ...fields },
  meta: { ... },
  hasComponent: true,
}
```

Functions are not serialized into page context. `componentKey` is. Template can render with local component map.

## Helpers

Package exports small helpers for root-mode consumers.

```js
const {
  collectComposerEntries,
  createComposerPageData,
  createMappedComposerSections,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
} = require(`gatsby-plugin-wp-composer-converter`);
```

### `mapSectionsToComponents`

```js
const renderable = mapSectionsToComponents(entry.composerSections, {
  heroBanner: HeroBannerSection,
  faq: FaqSection,
});
```

### `createMappedComposerSections`

```js
const sections = createMappedComposerSections(entry, {
  components: {
    heroBanner: HeroBannerSection,
    faq: FaqSection,
  },
});
```

Missing layouts are skipped by default.

## Legacy preset / definition mode

Still supported when Gatsby must derive sections itself from raw composer data.

```js
const { createSectionsPreset, FIELD_TYPES } = require(`gatsby-plugin-wp-composer-converter`);
```

Use this only when not fully on `wp-composer-bridge` contract yet.

## Notes

- root mode creates local Gatsby nodes: `WpComposerEntry`
- root field added by plugin: `composerEntries`
- plugin does not bundle renderer
- plugin does not depend on raw ACF union layout fragments anymore in root mode
- legacy preset/definition mode remains available for odd migrations
