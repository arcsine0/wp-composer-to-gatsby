const getMode = (pluginOptions = {}) => {
  if (pluginOptions.mode) return pluginOptions.mode;
  if (pluginOptions.sourceQuery) return "root";
  return "node";
};

const getComposerField = (pluginOptions = {}) => pluginOptions.composerField || "composerSections";

const getSourceQuery = (pluginOptions = {}) => pluginOptions.sourceQuery || "composerEntries";

const getPostTypes = (pluginOptions = {}) =>
  Array.isArray(pluginOptions.postTypes) ? pluginOptions.postTypes.filter(Boolean) : [];

const isLegacyDefinitionsMode = (pluginOptions = {}) =>
  Array.isArray(pluginOptions.presets) ||
  Array.isArray(pluginOptions.contentTypes);

module.exports = {
  getComposerField,
  getMode,
  getPostTypes,
  getSourceQuery,
  isLegacyDefinitionsMode,
};
