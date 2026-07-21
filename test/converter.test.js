const assert = require("assert");
const {
  collectComposerEntries,
  createComposerPageData,
  createMappedComposerSections,
  createPageConfig,
  createSectionsPreset,
  FIELD_TYPES,
  getComposerEntriesFromGraphql,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
} = require("../src");

const genericPreset = createSectionsPreset({
  id: "page-sections",
  targetType: "WpPage",
  composerPath: "pageComposer.composer",
  sections: [
    {
      component: function HeroSection() {},
      layout: "WpPageComposerComposerHeroLayout",
      props: {
        title: "header",
        desc: { source: "content", type: FIELD_TYPES.wysiwyg },
      },
    },
    {
      component: function FeatureListSection() {},
      layout: "WpPageComposerComposerFeatureListLayout",
      props: {
        title: "header",
        items: { source: "items", type: FIELD_TYPES.repeater },
      },
    },
  ],
});

const composer = [
  {
    __typename: "WpPageComposerComposerHeroLayout",
    header: "Welcome",
    content: "Hello world",
  },
  {
    __typename: "WpPageComposerComposerFeatureListLayout",
    header: "Features",
    items: [{ text: "Fast" }],
  },
];

const config = createPageConfig(genericPreset.definitions, composer);

assert.equal(config.sections.length, 2);
assert.equal(config.sections[0].type, "heroSection");
assert.equal(config.sections[0].props.title, "Welcome");
assert.equal(config.sections[0].props.desc, "Hello world");
assert.equal(config.sections[1].type, "featureListSection");
assert.equal(config.sections[1].props.title, "Features");

const generatedPreset = createSectionsPreset({
  id: "page-sections",
  targetType: "WpPage",
  composerPath: "pageComposer.composer",
  sections: [
    {
      component: function HeroSection() {},
      layout: "WpPageComposerComposerHeroLayout",
      props: {
        title: "header",
        desc: { source: "content", type: FIELD_TYPES.wysiwyg },
      },
    },
  ],
});

const generatedConfig = createPageConfig(generatedPreset.definitions, [
  {
    __typename: "WpPageComposerComposerHeroLayout",
    header: "Hello",
    content: "World",
  },
]);

assert.equal(generatedPreset.definitions[0].id, "heroSection");
assert.equal(generatedPreset.definitions[0].type, "heroSection");
assert.equal(generatedConfig.sections[0].props.title, "Hello");
assert.equal(generatedConfig.sections[0].props.desc, "World");

const rootEntries = collectComposerEntries(
  [
    {
      id: "wp-page-1",
      databaseId: 1,
      slug: "home",
      title: "Home",
      uri: "/",
      postType: "page",
      composerSections: [
        {
          layout: "heroBanner",
          id: "hero",
          fields: { header: "SEO Services" },
        },
        {
          layout: "faq",
          id: "faq",
          order: 3,
          fields: { title: "Questions" },
        },
      ],
      internal: { type: "WpPage" },
    },
    {
      id: "wp-case-study-2",
      databaseId: 2,
      slug: "case-study",
      title: "Case Study",
      uri: "/case-study/",
      postType: "case_study",
      composerSections: [
        {
          layout: "ctaBanner",
          fields: { title: "Ready" },
        },
      ],
      internal: { type: "WpCaseStudy" },
    },
    {
      id: "wp-post-3",
      databaseId: 3,
      slug: "plain-post",
      title: "Plain Post",
      uri: "/plain-post/",
      internal: { type: "WpPost" },
    },
  ],
  { postTypes: ["page", "case_study"] }
);

assert.equal(rootEntries.length, 2);
assert.equal(rootEntries[0].graphQLType, "Page");
assert.equal(rootEntries[0].composerSections[0].layout, "heroBanner");
assert.equal(rootEntries[0].composerSections[0].order, 0);
assert.equal(rootEntries[1].postType, "case_study");

const grouped = groupComposerEntriesByPostType(rootEntries);
assert.equal(grouped.page.length, 1);
assert.equal(grouped.case_study.length, 1);
assert.equal(getComposerEntryByUri(rootEntries, "/case-study/").databaseId, 2);

const mapped = mapSectionsToComponents(rootEntries[0].composerSections, {
  heroBanner: "HeroComponent",
});
assert.equal(mapped.length, 1);
assert.equal(mapped[0].component, "HeroComponent");

const nestedEntries = getComposerEntriesFromGraphql(
  {
    allWp: {
      nodes: [
        {
          composerEntries: [
            {
              databaseId: 10,
              postType: "page",
              graphQLType: "Page",
              slug: "about",
              title: "About",
              uri: "/about/",
              composerSections: [
                {
                  layout: "heroBanner",
                  wpFields: { header: "About us" },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  { sourceQuery: "allWp" }
);
assert.equal(nestedEntries.length, 1);
assert.equal(nestedEntries[0].composerSections[0].fields.header, "About us");

const pageData = createComposerPageData(rootEntries[0], {
  components: {
    heroBanner: "HeroComponent",
  },
});
assert.equal(pageData.sections.length, 1);
assert.equal(pageData.sections[0].componentKey, "heroBanner");
assert.equal(pageData.sections[0].props.header, "SEO Services");
assert.equal(pageData.missingLayouts[0], "faq");

const mappedSections = createMappedComposerSections(rootEntries[0], {
  components: {
    heroBanner: "HeroComponent",
  },
});
assert.equal(mappedSections.length, 1);
assert.equal(mappedSections[0].type, "heroBanner");

console.log("converter test passed");
