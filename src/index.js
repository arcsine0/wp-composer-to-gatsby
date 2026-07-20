const converter = require("./converter/sectionConverter");
const { sectionDefinitions, sectionsPreset } = require("./presets/sections");
const { createDefinitionsFromSections, createSectionsPreset } = require("./presets/createSectionsPreset");

module.exports = {
  ...converter,
  createDefinitionsFromSections,
  createSectionsPreset,
  sectionDefinitions,
  sectionsPreset,
};
