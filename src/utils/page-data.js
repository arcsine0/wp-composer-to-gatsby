const { mapSectionsToComponents } = require("./entries");

const createComposerPageData = (entry = {}, options = {}) => {
  const components = options.components || {};
  const includeUnmapped = Boolean(options.includeUnmapped);
  const warn = typeof options.warn === "function" ? options.warn : null;
  const sections = Array.isArray(entry.composerSections) ? entry.composerSections : [];
  const missingLayouts = [];

  const mappedSections = sections.reduce((items, section, index) => {
    if (!section || !section.layout) return items;

    const componentExists = Boolean(components[section.layout]);
    if (!componentExists) {
      missingLayouts.push(section.layout);
      if (warn) {
        warn(
          `[gatsby-plugin-wp-composer-converter] Missing component for layout "${section.layout}" on ${entry.uri || entry.slug || entry.databaseId || "entry"}.`
        );
      }
    }

    if (!componentExists && !includeUnmapped) return items;

    items.push({
      id: section.id || `${section.layout}-${typeof section.order === "number" ? section.order : index}`,
      order: typeof section.order === "number" ? section.order : index,
      layout: section.layout,
      type: section.layout,
      componentKey: section.layout,
      props: section.fields || {},
      fields: section.fields || {},
      meta: section.meta || null,
      hasComponent: componentExists,
    });

    return items;
  }, []);

  return {
    databaseId: entry.databaseId || null,
    postType: entry.postType || null,
    graphQLType: entry.graphQLType || null,
    slug: entry.slug || null,
    title: entry.title || null,
    uri: entry.uri || null,
    composerTarget: entry.composerTarget || null,
    composerContract: entry.composerContract || null,
    sections: mappedSections,
    missingLayouts: Array.from(new Set(missingLayouts)),
    registeredLayouts: Object.keys(components),
  };
};

const createMappedComposerSections = (entryOrSections = {}, options = {}) => {
  const sections = Array.isArray(entryOrSections)
    ? entryOrSections
    : Array.isArray(entryOrSections.composerSections)
      ? entryOrSections.composerSections
      : [];

  return createComposerPageData({ composerSections: sections }, options).sections;
};

module.exports = {
  createComposerPageData,
  createMappedComposerSections,
};
