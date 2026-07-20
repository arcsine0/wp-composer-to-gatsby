const FIELD_TYPES = {
  text: "text",
  wysiwyg: "wysiwyg",
  image: "image",
  link: "link",
  repeater: "repeater",
  group: "group",
  boolean: "boolean",
  select: "select",
};

const toPascalCase = (value = "") =>
  String(value || "")
    .replace(/(^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (_, __, char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");

const normalizeField = (field) => {
  if (typeof field === "string") {
    return { name: field, prop: field, type: FIELD_TYPES.text };
  }

  return {
    prop: field && (field.prop || field.name),
    type: FIELD_TYPES.text,
    ...field,
  };
};

const mapFieldsToProps = (fields = [], source = {}) =>
  fields.reduce((props, rawField) => {
    const field = normalizeField(rawField);
    if (!field || !field.name || !field.prop) return props;

    const rawValue = source ? source[field.name] : undefined;
    const value = rawValue === undefined ? field.defaultValue : rawValue;
    if (value === undefined) return props;

    props[field.prop] = typeof field.map === "function" ? field.map(value, source) : value;
    return props;
  }, {});

const sourceMatchesDefinition = (source = {}, definition = {}, context = {}) => {
  const layoutName = definition.layoutName || toPascalCase(definition.id || definition.type);

  if (typeof definition.match === "function") {
    return definition.match(source, { ...context, layoutName });
  }

  return (
    source.id === definition.id ||
    source.type === definition.type ||
    source.layoutName === layoutName ||
    String(source.__typename || "").includes(layoutName) ||
    String(source.fieldGroupName || "").includes(layoutName)
  );
};

const resolveSectionSource = (dataBySectionId = {}, definition = {}) => {
  if (Array.isArray(dataBySectionId)) {
    return (
      dataBySectionId.find((section, index) =>
        sourceMatchesDefinition(section, definition, { index, sources: dataBySectionId })
      ) || {}
    );
  }

  return (dataBySectionId && dataBySectionId[definition.id]) || {};
};

const createAcfFieldConfig = (definitions = []) =>
  definitions.map((definition) => ({
    id: definition.id,
    type: definition.type,
    layoutName: definition.layoutName || toPascalCase(definition.id || definition.type),
    label: definition.label || definition.id,
    group: definition.group,
    fields: (definition.fields || []).map(normalizeField),
  }));

const createPresets = (definitions = []) =>
  definitions.reduce((presets, definition) => {
    if (!definition.id || !definition.type) return presets;

    presets[definition.id] = {
      type: definition.type,
      props: {
        ...(definition.defaults || {}),
      },
    };

    return presets;
  }, {});

const createRendererSection = (definition, source = {}) => {
  const resolvedSource = Object.keys(source || {}).length > 0 ? source : definition.data || {};
  const mappedProps =
    typeof definition.mapDataToProps === "function"
      ? definition.mapDataToProps(resolvedSource, definition)
      : mapFieldsToProps(definition.fields || [], resolvedSource);

  return {
    id: definition.id,
    group: definition.group,
    type: definition.type,
    preset: definition.preset,
    props: {
      ...(definition.defaults || {}),
      ...(mappedProps || {}),
    },
    source: resolvedSource,
  };
};

const mapComposerSections = (definitions = [], composerLayouts = {}) => {
  if (Array.isArray(composerLayouts)) {
    return composerLayouts
      .map((source, index) => {
        const definition = definitions.find((candidate) =>
          sourceMatchesDefinition(source, candidate, { index, sources: composerLayouts })
        );

        return definition ? createRendererSection(definition, source) : null;
      })
      .filter(Boolean);
  }

  return definitions.map((definition) => createRendererSection(definition, resolveSectionSource(composerLayouts, definition) || definition.data || {}));
};

const createField = (name, type = FIELD_TYPES.text, options = {}) => ({
  name,
  type,
  prop: options.prop || name,
  ...options,
});

const createSection = (definition = {}) => ({
  fields: [],
  defaults: {},
  ...definition,
});

const createPageConfig = (definitions = [], composerLayouts = {}) => {
  const normalizedDefinitions = definitions.map(createSection);

  return {
    sections: mapComposerSections(normalizedDefinitions, composerLayouts),
    presets: createPresets(normalizedDefinitions),
    acfFields: createAcfFieldConfig(normalizedDefinitions),
  };
};

module.exports = {
  FIELD_TYPES,
  createAcfFieldConfig,
  createField,
  createPageConfig,
  createPresets,
  createSection,
  mapComposerSections,
  mapFieldsToProps,
  toPascalCase,
};
