const { createPageConfig } = require("./converter/sectionConverter");
const { sectionsPreset } = require("./presets/sections");
const { createSectionsPreset } = require("./presets/createSectionsPreset");
const { get } = require("./utils/path");

const builtInPresets = {
  [sectionsPreset.id]: sectionsPreset,
  sections: sectionsPreset,
};

const normalizePreset = (entry) => {
  if (!entry) return null;

  if (typeof entry === "string") {
    return builtInPresets[entry] || null;
  }

  if (entry.preset) {
    const preset = normalizePreset(entry.preset);
    const merged = preset ? { ...preset, ...entry } : { ...entry };
    return Array.isArray(merged.definitions) || Array.isArray(merged.sections)
      ? createSectionsPreset(merged)
      : merged;
  }

  if (Array.isArray(entry.definitions) || Array.isArray(entry.sections)) {
    return createSectionsPreset(entry);
  }

  return { ...entry };
};

const normalizeTargets = (pluginOptions = {}) => {
  const fromContentTypes = Array.isArray(pluginOptions.contentTypes) ? pluginOptions.contentTypes : [];
  const fromPresets = Array.isArray(pluginOptions.presets) ? pluginOptions.presets : [];
  const merged = [...fromPresets, ...fromContentTypes]
    .map(normalizePreset)
    .filter(Boolean)
    .filter((entry) => entry.targetType && entry.composerPath && Array.isArray(entry.definitions));

  if (merged.length > 0) return merged;

  return [sectionsPreset];
};

const createResolvers = ({ createResolvers }, pluginOptions = {}) => {
  const fieldPrefix = pluginOptions.fieldPrefix || "wpComposer";
  const targets = normalizeTargets(pluginOptions);

  const resolverMap = targets.reduce((acc, target) => {
    const sectionsField = `${fieldPrefix}Sections`;
    const configField = `${fieldPrefix}Config`;
    const layoutsField = `${fieldPrefix}Layouts`;
    const fieldsField = `${fieldPrefix}Fields`;

    acc[target.targetType] = {
      [layoutsField]: {
        type: "[JSON]",
        resolve: (source) => {
          const composerLayouts = get(source, target.composerPath);
          return Array.isArray(composerLayouts) ? composerLayouts : [];
        },
      },
      [sectionsField]: {
        type: "[JSON]",
        resolve: (source) => {
          const composerLayouts = get(source, target.composerPath);
          const config = createPageConfig(target.definitions, Array.isArray(composerLayouts) ? composerLayouts : []);
          return config.sections;
        },
      },
      [fieldsField]: {
        type: "[JSON]",
        resolve: () => createPageConfig(target.definitions, []).acfFields,
      },
      [configField]: {
        type: "JSON",
        resolve: (source) => {
          const composerLayouts = get(source, target.composerPath);
          return createPageConfig(target.definitions, Array.isArray(composerLayouts) ? composerLayouts : []);
        },
      },
    };

    return acc;
  }, {});

  createResolvers(resolverMap);
};

module.exports = {
  createResolvers,
};
