const {
  createField,
  createSection,
  FIELD_TYPES,
} = require("../converter/sectionConverter");

const getImageSource = (image) => {
  const node = image && (image.node || image);
  return (
    (node && node.sourceUrl) ||
    (node && node.mediaItemUrl) ||
    (node && node.gatsbyImage && node.gatsbyImage.images && node.gatsbyImage.images.fallback && node.gatsbyImage.images.fallback.src) ||
    image ||
    ""
  );
};

const getLayoutToken = (source = {}) =>
  `${source.__typename || ""} ${source.fieldGroupName || ""}`;

const isLayout = (source = {}, layoutName = "") =>
  getLayoutToken(source).includes(layoutName);

const fieldContains = (source = {}, field = "", value = "") =>
  String(source[field] || "").toLowerCase().includes(String(value || "").toLowerCase());

const mapTextRepeater = (items = []) =>
  (items || []).map((item) => (typeof item === "string" ? item : item && item.text)).filter(Boolean);

const mapDetailsRepeater = (items = []) =>
  (items || []).map((item) => (typeof item === "string" ? item : item && (item.text || item.detail || item.result))).filter(Boolean);

const mapImageToProp = (name = "image", prop = name) =>
  createField(name, FIELD_TYPES.image, { prop, map: getImageSource });

const mapButtons = (items = []) => items || [];

const mapLogoGallery = (logos = {}) =>
  ((logos && logos.nodes) || logos || []).map(getImageSource).filter(Boolean);

const mapCaseStudyCards = (caseStudies = {}) =>
  ((caseStudies && caseStudies.nodes) || caseStudies || []).map((caseStudy) => ({
    title: caseStudy && caseStudy.title,
    featureImage: getImageSource(caseStudy && caseStudy.featuredImage),
    logo: getImageSource(caseStudy && caseStudy.caseStudies && caseStudy.caseStudies.logo),
    details: mapDetailsRepeater((caseStudy && caseStudy.caseStudies && caseStudy.caseStudies.snapshotResults) || []),
    services: (((caseStudy && caseStudy.serviceTags && caseStudy.serviceTags.nodes) || []).map((tag) => tag && tag.name).filter(Boolean)).join(", "),
    industry: (((caseStudy && caseStudy.industryTags && caseStudy.industryTags.nodes) || [])[0] || {}).name || "",
    link: caseStudy && caseStudy.slug ? `/digital-marketing-case-studies/${caseStudy.slug}/` : "#",
  }));

const mapGridCards = (cards = []) =>
  (cards || []).map((card) => ({
    title: card && card.title,
    name: card && card.title,
    desc: card && card.modal && card.modal.description,
    modalTitle: card && card.modal && card.modal.title,
    link: card && card.modal && card.modal.link,
    hideServiceType: true,
    modal: {
      ...(card && card.modal),
      image: getImageSource(card && card.modal && card.modal.image),
    },
  }));

const mapImageContentList = (items = []) =>
  (items || []).map((item) => ({
    title: (item && item.title) || (item && item.text),
    desc: (item && item.content) || (item && item.text),
    content: item && item.content,
    image: getImageSource(item && item.image),
  }));

const sectionDefinitions = [
  createSection({
    id: "servicesHero",
    type: "seoRedesignedHero",
    layoutName: "WpServicesComposerComposerHeroLayout",
    group: "intro",
    label: "Service Hero",
    fields: [
      mapImageToProp("image"),
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("subHeader", FIELD_TYPES.text, { prop: "subTitle" }),
      createField("description", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      createField("ctas", FIELD_TYPES.repeater, { prop: "buttons", map: mapButtons }),
    ],
  }),
  createSection({
    id: "servicesTrustedBrands",
    type: "seoRedesignedTrustedBrands",
    layoutName: "WpServicesComposerComposerDoubleMarqueeLayout",
    group: "intro",
    label: "Double Marquee",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "text" }),
      createField("logos", FIELD_TYPES.repeater, { map: mapLogoGallery }),
    ],
  }),
  createSection({
    id: "servicesSingleList",
    type: "seoRedesignedBusinessSuited",
    layoutName: "WpServicesComposerComposerSingleListLayout",
    group: "intro",
    label: "Single List",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("singlesList", FIELD_TYPES.repeater, { prop: "list", map: mapTextRepeater }),
      createField("cta", FIELD_TYPES.group),
    ],
  }),
  createSection({
    id: "servicesMediaFails",
    type: "seoRedesignedFails",
    layoutName: "WpServicesComposerComposerMediaWithTextLayout",
    group: "body",
    label: "Media with Text - Fails",
    match: (source) =>
      isLayout(source, "WpServicesComposerComposerMediaWithTextLayout") &&
      (source.mediaPlacement === "left" || fieldContains(source, "header", "fails")),
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("content", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      mapImageToProp("media", "image"),
      createField("ctas", FIELD_TYPES.repeater, { map: mapButtons }),
    ],
  }),
  createSection({
    id: "servicesMediaWork",
    type: "seoRedesignedWork",
    layoutName: "WpServicesComposerComposerMediaWithTextLayout",
    group: "body",
    label: "Media with Text - Work",
    match: (source) =>
      isLayout(source, "WpServicesComposerComposerMediaWithTextLayout") &&
      (source.mediaPlacement === "right" || fieldContains(source, "header", "work")),
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("content", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      mapImageToProp("media", "image"),
      createField("ctas", FIELD_TYPES.repeater, { prop: "buttons", map: mapButtons }),
    ],
  }),
  createSection({
    id: "servicesWorkButtonGroup",
    type: "seoRedesignedButtonGroup",
    layoutName: "WpServicesComposerComposerButtonGroupLayout",
    group: "body",
    label: "Button Group - Work",
    match: (source, { index, sources }) =>
      isLayout(source, "WpServicesComposerComposerButtonGroupLayout") &&
      isLayout((sources || [])[index - 1], "WpServicesComposerComposerMediaWithTextLayout"),
    fields: [
      createField("buttons", FIELD_TYPES.repeater, { map: mapButtons }),
      createField("paddings", FIELD_TYPES.group),
    ],
  }),
  createSection({
    id: "servicesSteps",
    type: "seoRedesignedPartnerSteps",
    layoutName: "WpServicesComposerComposerStepsCardsLayout",
    group: "body",
    label: "Steps Cards",
    fields: [
      createField("header", FIELD_TYPES.wysiwyg, { prop: "title" }),
      createField("steps", FIELD_TYPES.repeater),
    ],
  }),
  createSection({
    id: "servicesStepsButtonGroup",
    type: "seoRedesignedButtonGroup",
    layoutName: "WpServicesComposerComposerButtonGroupLayout",
    group: "body",
    label: "Button Group - Steps",
    match: (source, { index, sources }) =>
      isLayout(source, "WpServicesComposerComposerButtonGroupLayout") &&
      isLayout((sources || [])[index - 1], "WpServicesComposerComposerStepsCardsLayout"),
    fields: [
      createField("buttons", FIELD_TYPES.repeater, { map: mapButtons }),
      createField("paddings", FIELD_TYPES.group),
    ],
  }),
  createSection({
    id: "servicesCaseStudies",
    type: "seoRedesignedResults",
    layoutName: "WpServicesComposerComposerCaseStudyCardsLayout",
    group: "body",
    label: "Case Study Cards",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("intro", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      createField("caseStudies", FIELD_TYPES.repeater, { prop: "items", map: mapCaseStudyCards }),
    ],
  }),
  createSection({
    id: "servicesGridCards",
    type: "seoRedesignedServices",
    layoutName: "WpServicesComposerComposerGridCardsLayout",
    group: "body",
    label: "Grid Cards",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("intro", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      createField("cards", FIELD_TYPES.repeater, { prop: "services", map: mapGridCards }),
    ],
  }),
  createSection({
    id: "servicesVerticalMedia",
    type: "seoRedesignedFreeAudit",
    layoutName: "WpServicesComposerComposerVerticalMediaWithTextLayout",
    group: "body",
    label: "Vertical Media with Text",
    fields: [
      createField("header", FIELD_TYPES.wysiwyg, { prop: "title" }),
      createField("content", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      mapImageToProp("media", "image"),
      createField("ctas", FIELD_TYPES.repeater, { prop: "buttons", map: mapButtons }),
    ],
  }),
  createSection({
    id: "servicesImageContentList",
    type: "seoRedesignedDifferent",
    layoutName: "WpServicesComposerComposerImageContentListLayout",
    group: "body",
    label: "Image Content List",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("imageContentList", FIELD_TYPES.repeater, { prop: "lists", map: mapImageContentList }),
    ],
  }),
  createSection({
    id: "servicesCtaBanner",
    type: "seoRedesignedCta",
    layoutName: "WpServicesComposerComposerCtaBannerLayout",
    group: "body",
    label: "CTA Banner",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("content", FIELD_TYPES.wysiwyg, { prop: "desc" }),
      mapImageToProp("image"),
      createField("ctas", FIELD_TYPES.repeater, { map: mapButtons }),
    ],
  }),
  createSection({
    id: "servicesAccordion",
    type: "seoRedesignedFaq",
    layoutName: "WpServicesComposerComposerAccordionLayout",
    group: "faq",
    label: "Accordion",
    fields: [
      createField("header", FIELD_TYPES.text, { prop: "title" }),
      createField("items", FIELD_TYPES.repeater),
      createField("ctas", FIELD_TYPES.repeater, { map: mapButtons }),
    ],
  }),
];

module.exports = {
  sectionDefinitions,
  sectionsPreset: {
    id: "sections",
    targetType: "WpService",
    composerPath: "servicesComposer.composer",
    definitions: sectionDefinitions,
  },
};
