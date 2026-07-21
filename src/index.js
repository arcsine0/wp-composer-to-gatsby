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
const {
  createComposerTemplate,
  createComposerTemplateManifest,
} = require("./templates/createComposerTemplate");
const {
  importComposerTemplate,
  toBasicAuthHeader,
} = require("./templates/importComposerTemplate");

module.exports = {
  ...converter,
  collectComposerEntries,
  createComposerPageData,
  createComposerTemplate,
  createComposerTemplateManifest,
  createDefinitionsFromSections,
  importComposerTemplate,
  createMappedComposerSections,
  createSectionsPreset,
  filterComposerEntries,
  getComposerEntriesFromGraphql,
  getComposerEntryByUri,
  groupComposerEntriesByPostType,
  mapSectionsToComponents,
  normalizeComposerEntry,
  normalizeSection,
  toBasicAuthHeader,
};
