const { getComposerField, getPostTypes } = require("./options");

const toPostTypeSlug = (value = "") =>
  String(value || "")
    .replace(/^Wp/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/__/g, "_")
    .toLowerCase();

const normalizeSection = (section = {}, index = 0) => ({
  layout: section.layout || section.type || section.id || `section${index + 1}`,
  id: section.id || null,
  order: typeof section.order === "number" ? section.order : index,
  fields: section.fields || section.props || {},
  meta: section.meta || null,
});

const normalizeComposerEntry = (node = {}, pluginOptions = {}) => {
  if (node && node.internal && node.internal.type === "WpComposerEntry") return null;

  const composerField = getComposerField(pluginOptions);
  const sections = node && node[composerField];
  if (!Array.isArray(sections)) return null;

  const graphQLType = String((node.internal && node.internal.type) || "").replace(/^Wp/, "") || node.graphQLType || "";
  const rawPostType =
    (typeof node.postType === "string" && node.postType) ||
    (node.postType && node.postType.node && node.postType.node.name) ||
    (node.contentType && node.contentType.node && node.contentType.node.name) ||
    graphQLType;

  return {
    databaseId: node.databaseId || null,
    postType: toPostTypeSlug(rawPostType),
    graphQLType,
    slug: node.slug || null,
    title: node.title || null,
    uri: node.uri || null,
    composerTarget: node.composerTarget || null,
    composerContract: node.composerContract || null,
    composerSections: sections.map(normalizeSection),
    wpNodeType: (node.internal && node.internal.type) || null,
    wpNodeId: node.id || null,
  };
};

const filterComposerEntries = (entries = [], pluginOptions = {}) => {
  const postTypes = getPostTypes(pluginOptions);
  if (postTypes.length === 0) return entries;

  const allowed = new Set(postTypes.map((postType) => String(postType).toLowerCase()));
  return entries.filter((entry) => allowed.has(String(entry.postType || "").toLowerCase()));
};

const collectComposerEntries = (nodes = [], pluginOptions = {}) =>
  filterComposerEntries(
    (nodes || []).map((node) => normalizeComposerEntry(node, pluginOptions)).filter(Boolean),
    pluginOptions
  );

const groupComposerEntriesByPostType = (entries = []) =>
  (entries || []).reduce((groups, entry) => {
    const key = entry.postType || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
    return groups;
  }, {});

const getComposerEntryByUri = (entries = [], uri = "") =>
  (entries || []).find((entry) => entry.uri === uri) || null;

const mapSectionsToComponents = (sections = [], components = {}, options = {}) => {
  const warn = typeof options.warn === "function" ? options.warn : null;

  return (sections || []).reduce((mapped, section) => {
    if (!section || !section.layout) return mapped;

    const component = components[section.layout];
    if (!component) {
      if (warn) warn(section);
      return mapped;
    }

    mapped.push({
      ...section,
      component,
    });

    return mapped;
  }, []);
};

module.exports = {
  collectComposerEntries,
  filterComposerEntries,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
  normalizeComposerEntry,
  normalizeSection,
  toPostTypeSlug,
};
