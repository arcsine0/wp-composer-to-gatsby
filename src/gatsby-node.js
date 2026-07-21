const { createPageConfig } = require("./converter/sectionConverter");
const { sectionsPreset } = require("./presets/sections");
const { createSectionsPreset } = require("./presets/createSectionsPreset");
const { collectComposerEntries, filterComposerEntries } = require("./utils/entries");
const { getComposerField, getMode, isLegacyDefinitionsMode } = require("./utils/options");
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

const createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type WpComposerEntry implements Node @dontInfer {
      databaseId: Int
      postType: String!
      graphQLType: String!
      slug: String
      title: String
      uri: String
      composerTarget: JSON
      composerContract: JSON
      composerSections: [JSON!]!
      wpNodeType: String
      wpNodeId: String
    }
  `);
};

const sourceNodes = (
  { actions, createContentDigest, createNodeId, getNodes, reporter },
  pluginOptions = {}
) => {
  if (getMode(pluginOptions) !== "root") return;

  const entries = collectComposerEntries(getNodes(), pluginOptions);

  entries.forEach((entry) => {
    actions.createNode({
      ...entry,
      id: createNodeId(`wp-composer-entry-${entry.wpNodeType || "wp"}-${entry.databaseId || entry.uri || entry.slug || "entry"}`),
      parent: null,
      children: [],
      internal: {
        type: "WpComposerEntry",
        contentDigest: createContentDigest(entry),
      },
    });
  });

  if (reporter && entries.length === 0 && process.env.NODE_ENV !== "production") {
    reporter.info(
      `[gatsby-plugin-wp-composer-converter] No composer entries found for root mode using field \"${getComposerField(pluginOptions)}\".`
    );
  }
};

const createResolvers = ({ createResolvers, reporter }, pluginOptions = {}) => {
  const fieldPrefix = pluginOptions.fieldPrefix || "wpComposer";
  const resolverMap = {
    Query: {
      composerEntries: {
        type: "[WpComposerEntry!]!",
        args: {
          postTypes: "[String!]",
          uri: "String",
        },
        resolve: (_source, args, context) => {
          const allEntries = Array.from(context.nodeModel.getAllNodes({ type: "WpComposerEntry" }) || []);
          const filteredEntries = filterComposerEntries(allEntries, { postTypes: args.postTypes });

          if (args.uri) {
            return filteredEntries.filter((entry) => entry.uri === args.uri);
          }

          return filteredEntries;
        },
      },
    },
  };

  if (isLegacyDefinitionsMode(pluginOptions)) {
    const targets = normalizeTargets(pluginOptions);

    targets.forEach((target) => {
      const sectionsField = `${fieldPrefix}Sections`;
      const configField = `${fieldPrefix}Config`;
      const layoutsField = `${fieldPrefix}Layouts`;
      const fieldsField = `${fieldPrefix}Fields`;

      resolverMap[target.targetType] = {
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
    });
  }

  createResolvers(resolverMap);

  if (reporter && getMode(pluginOptions) === "node" && process.env.NODE_ENV !== "production") {
    reporter.info("[gatsby-plugin-wp-composer-converter] Node mode active.");
  }
};

module.exports = {
  createResolvers,
  createSchemaCustomization,
  sourceNodes,
};
