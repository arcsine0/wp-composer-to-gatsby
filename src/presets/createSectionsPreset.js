const {
  FIELD_TYPES,
  createField,
  createSection,
  toPascalCase,
} = require("../converter/sectionConverter");

const toCamelCase = (value = "") => {
  const pascal = toPascalCase(value);
  return pascal ? `${pascal.slice(0, 1).toLowerCase()}${pascal.slice(1)}` : "";
};

const getSectionName = (section = {}, index = 0) => {
  const component = section.component;
  const componentName =
    section.name ||
    (component && (component.displayName || component.name)) ||
    section.type ||
    section.id ||
    section.label ||
    section.layoutName ||
    section.layout;

  return componentName || `Section${index + 1}`;
};

const normalizePropField = ([prop, spec]) => {
  if (typeof spec === "string") {
    return createField(spec, FIELD_TYPES.text, { prop });
  }

  if (!spec || typeof spec !== "object") {
    return createField(prop, FIELD_TYPES.text);
  }

  const sourceName = spec.name || spec.field || spec.source || prop;
  const type = spec.type || FIELD_TYPES.text;
  const options = { ...spec, prop, name: undefined, field: undefined, source: undefined, type: undefined };

  delete options.name;
  delete options.field;
  delete options.source;
  delete options.type;

  return createField(sourceName, type, options);
};

const createDefinitionsFromSections = (sections = []) =>
  (sections || []).map((section, index) => {
    const sectionName = getSectionName(section, index);
    const id = section.id || toCamelCase(sectionName) || `section${index + 1}`;

    return createSection({
      id,
      type: section.type || id,
      layoutName: section.layoutName || section.layout || toPascalCase(sectionName),
      label: section.label || sectionName,
      component: section.component,
      group: section.group,
      defaults: section.defaults,
      match: section.match,
      mapDataToProps: section.mapDataToProps,
      fields: Array.isArray(section.fields)
        ? section.fields
        : Object.entries(section.props || {}).map(normalizePropField),
    });
  });

const createSectionsPreset = (options = {}) => ({
  id: options.id || "sections",
  targetType: options.targetType || "WpService",
  composerPath: options.composerPath || "servicesComposer.composer",
  definitions: Array.isArray(options.definitions)
    ? options.definitions.map(createSection)
    : createDefinitionsFromSections(options.sections),
});

module.exports = {
  createDefinitionsFromSections,
  createSectionsPreset,
};
