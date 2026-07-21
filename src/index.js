const converter = require("./converter/sectionConverter");
const { sectionDefinitions, sectionsPreset } = require("./presets/sections");
const { createDefinitionsFromSections, createSectionsPreset } = require("./presets/createSectionsPreset");
const {
  collectComposerEntries,
  filterComposerEntries,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
  normalizeComposerEntry,
  normalizeSection,
} = require("./utils/entries");
const {
  createComposerPageData,
  createMappedComposerSections,
} = require("./utils/page-data");

module.exports = {
  ...converter,
  collectComposerEntries,
  createComposerPageData,
  createDefinitionsFromSections,
  createMappedComposerSections,
  createSectionsPreset,
  filterComposerEntries,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
  normalizeComposerEntry,
  normalizeSection,
  sectionDefinitions,
  sectionsPreset,
};
