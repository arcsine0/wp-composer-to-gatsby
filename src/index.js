const converter = require("./converter/sectionConverter");
const { createDefinitionsFromSections, createSectionsPreset } = require("./presets/createSectionsPreset");
const {
  collectComposerEntries,
  filterComposerEntries,
  getComposerEntriesFromGraphql,
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
  getComposerEntriesFromGraphql,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
  normalizeComposerEntry,
  normalizeSection,
};
