export const state = {
  spells: {},
  subclasses: {},
  casterType: "",
  currentClass: "",
  currentSubclassSpells: new Set(),
  currentLevel: 0,
  maxSpellLevel: 1,
  currentBonus: 0,
  proficiency: 0,
  spellsKnown: Object.fromEntries(Array.from({ length: 10 }, (_, level) => [level, []])),
  homebrewSpells: {},
  homebrewSubclasses: { bard: {}, cleric: {}, druid: {}, paladin: {}, ranger: {}, sorcerer: {}, warlock: {}, wizard: {} },
  homebrewSpellList: { 3: [], 5: [], 7: [], 9: [] },
  currentForm: "subclass"
};
