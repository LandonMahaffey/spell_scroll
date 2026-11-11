import { state } from "./state.js";
import { applyCharacterStats } from "./character.js";
import { renderAllSpells, showToast } from "./render.js";

const scrollNameInput = document.querySelector("#scroll_name");
const classInput = document.querySelector("#class");
const levelInput = document.querySelector("#level");
const bonusInput = document.querySelector("#spell-bonus");
const fileInput = document.querySelector(".loaded_file_input");
const fileInputSubmit = document.querySelector(".file_submit");

export function generateJSONSave() {
  const save = {
    homebrewData: { spells: state.homebrewSpells, subclasses: state.homebrewSubclasses },
    characterData: {
      current_class: state.currentClass,
      current_subclass: document.querySelector("#subclass-list").value,
      current_level: state.currentLevel,
      current_bonus: state.currentBonus,
      spells_known: state.spellsKnown
    }
  };
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = scrollNameInput.value.replace(/[\\/:*?"<>|.\x00-\x1F]/g, "").trimEnd() || "spell-scroll-save";
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function loadJSON(file, filename = file.name) {
  try {
    const data = JSON.parse(await file.text());
    if (!data.characterData || !data.homebrewData) throw new Error("Invalid save file");
    scrollNameInput.value = filename.replace(/\.[^.]+$/, "");
    state.homebrewSpells = data.homebrewData.spells || {};
    for (const [name, spell] of Object.entries(state.homebrewSpells)) state.spells[name] = spell;
    state.homebrewSubclasses = data.homebrewData.subclasses || {};
    for (const [className, classSubclasses] of Object.entries(state.homebrewSubclasses)) {
      state.subclasses[className] ||= {};
      Object.assign(state.subclasses[className], classSubclasses);
    }

    classInput.value = data.characterData.current_class;
    levelInput.value = data.characterData.current_level;
    bonusInput.value = data.characterData.current_bonus;
    applyCharacterStats();
    document.querySelector("#subclass-list").value = data.characterData.current_subclass;
    state.spellsKnown = Object.fromEntries(Array.from({ length: 10 }, (_, level) => [level, data.characterData.spells_known?.[level] || data.characterData.spells_known?.[String(level)] || []]));
    renderAllSpells();
    fileInput.classList.add("hidden");
    fileInputSubmit.classList.add("hidden");
    showToast("Spell scroll loaded");
  } catch (error) {
    window.alert(`${error.message}\nPlease load a Spell-Scroll save file.`);
  }
}
