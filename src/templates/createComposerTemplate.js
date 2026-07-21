const { createSection, toPascalCase } = require("../converter/sectionConverter");
const { createDefinitionsFromSections } = require("../presets/createSectionsPreset");

const toCamelCase = (value = "") => {
  const pascal = toPascalCase(value);
  return pascal ? `${pascal.slice(0, 1).toLowerCase()}${pascal.slice(1)}` : "";
};

const normalizeTemplateField = (field = {}) => ({
  name: field.prop || field.name,
  source: field.name,
  type: field.type || "text",
  required: Boolean(field.required),
  multiple: field.type === "repeater" || Boolean(field.multiple),
  description: field.description || null,
  defaultValue: field.defaultValue,
});

const normalizeTemplateSection = (definition = {}, index = 0) => {
  const normalized = createSection(definition);

  return {
    id: normalized.id || `section${index + 1}`,
    layout: normalized.layout || normalized.type || normalized.id || `section${index + 1}`,
    type: normalized.type || normalized.id || `section${index + 1}`,
    label: normalized.label || normalized.id || `Section ${index + 1}`,
    group: normalized.group || null,
    layoutName: normalized.layoutName || null,
    fields: (normalized.fields || []).map(normalizeTemplateField),
  };
};

const createComposerTemplate = (options = {}) => {
  const definitions = Array.isArray(options.definitions)
    ? options.definitions.map(createSection)
    : createDefinitionsFromSections(options.sections || []);

  const id = options.id || toCamelCase(options.label || options.name || "template") || "template";

  return {
    id,
    key: options.key || id,
    label: options.label || options.name || id,
    description: options.description || null,
    postType: options.postType || null,
    graphQLType: options.graphQLType || null,
    target: {
      key: options.targetKey || options.key || id,
      nodeType: options.nodeType || options.targetType || null,
      graphQLSingleName: options.graphQLSingleName || options.graphQLType || null,
      graphQLPluralName: options.graphQLPluralName || null,
      composerField: options.composerField || null,
      label: options.targetLabel || options.label || options.name || id,
    },
    sections: definitions.map(normalizeTemplateSection),
  };
};

const createComposerTemplateManifest = (input = {}) => {
  const templates = Array.isArray(input)
    ? input
    : Array.isArray(input.templates)
      ? input.templates
      : [input];

  return {
    version: 1,
    templates: templates.filter(Boolean).map(createComposerTemplate),
  };
};

module.exports = {
  createComposerTemplate,
  createComposerTemplateManifest,
};
