const assert = require("assert");
const { createPageConfig, FIELD_TYPES, createSectionsPreset } = require("../src");
const { sectionDefinitions } = require("../src/presets/sections");

const composer = [
  {
    __typename: "WpServicesComposerComposerHeroLayout",
    header: "SEO Services",
    subHeader: "Grow faster",
    description: "Rank better",
    image: { node: { sourceUrl: "https://example.com/hero.jpg" } },
    ctas: [{ text: "Talk to us", link: "/contact/" }],
  },
  {
    __typename: "WpServicesComposerComposerMediaWithTextLayout",
    header: "Why SEO fails",
    content: "Bad fit",
    mediaPlacement: "left",
    media: { node: { sourceUrl: "https://example.com/fails.jpg" } },
    ctas: [{ text: "Fix it", link: "/fix/" }],
  },
];

const config = createPageConfig(sectionDefinitions, composer);

assert.equal(config.sections.length, 2);
assert.equal(config.sections[0].type, "seoRedesignedHero");
assert.equal(config.sections[0].props.title, "SEO Services");
assert.equal(config.sections[0].props.image, "https://example.com/hero.jpg");
assert.equal(config.sections[1].type, "seoRedesignedFails");
assert.equal(config.sections[1].props.image, "https://example.com/fails.jpg");

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

console.log("converter test passed");
