import { state } from "./state.js";
import { renderAllSpells, showToast } from "./render.js";

const classInput = document.querySelector("#class");
const levelInput = document.querySelector("#level");
const bonusInput = document.querySelector("#spell-bonus");
const classSpellList = document.querySelector("#class-spell-list");
const subclassSection = document.querySelector("#subclass-select");
const subclassList = document.querySelector("#subclass-list");

export function submitCharacteristics(event) {
  event.preventDefault();
  applyCharacterStats();
  state.currentSubclassSpells.clear();
  state.spellsKnown = Object.fromEntries(Array.from({ length: 10 }, (_, level) => [level, []]));
  createAvailableSpells();
  renderAllSpells();
  showToast("Stats submitted!")
}

export function applyCharacterStats() {
  state.currentClass = classInput.value;
  state.currentLevel = Number.parseInt(levelInput.value, 10);
  state.currentBonus = Number.parseInt(bonusInput.value, 10) || 0;
  state.proficiency = 1 + Math.ceil(state.currentLevel / 4);

  if (["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"].includes(state.currentClass)) {
    state.maxSpellLevel = Math.min(9, Math.floor((state.currentLevel + 1) / 2));
    state.casterType = state.currentClass === "warlock" ? "problemChild" : "full";
  } else if (["ranger", "paladin"].includes(state.currentClass)) {
    state.maxSpellLevel = state.currentLevel === 1 ? -1 : Math.ceil(state.currentLevel / 4);
    state.casterType = "half";
  }
  populateSubclass();
  document.querySelector("#spell-atk").textContent = `Spell Attack: +${state.proficiency + state.currentBonus}`;
  document.querySelector("#spell-sv").textContent = `Spell Save: DC ${state.proficiency + state.currentBonus + 8}`;
}

export function createAvailableSpells() {
  const options = Object.values(state.spells)
    .filter(spell => spell.classes?.includes(state.currentClass) && spell.level <= state.maxSpellLevel)
    .map(spell => `<option value="${escapeAttribute(spell.name)}">${escapeHtml(spell.name)} {Lv-${spell.level}}</option>`)
    .join("");
  classSpellList.innerHTML = options;
}

function populateSubclass() {
  const choices = state.currentLevel >= 3 ? Object.keys(state.subclasses[state.currentClass] || {}) : [];
  subclassSection.classList.toggle("hidden", choices.length === 0);
  subclassList.innerHTML = `${choices.map(name => `<option value="${escapeAttribute(name)}">${escapeHtml(name)}</option>`).join("")}<option value="0">No Subclass Spells</option>`;
}

export function toggleSpell(spell, event, fromSubclass = false) {
  event?.preventDefault();
  if (!state.proficiency) {
    window.alert("Please enter your stats first");
    return;
  }
  if (!spell) return;
  const known = state.spellsKnown[spell.level];
  if (!fromSubclass && known.includes(spell.name)) {
    known.splice(known.indexOf(spell.name), 1);
    showToast(`Removed ${spell.name}`)
  } else if (!known.includes(spell.name)) {
    known.push(spell.name);
    showToast(`Added ${spell.name}`)
  }
  renderAllSpells();
}

export function toggleSubclassSpells(event) {
  event?.preventDefault();
  for (const spell of state.currentSubclassSpells) {
    const known = state.spellsKnown[spell.level];
    const index = known.indexOf(spell.name);
    if (index !== -1) known.splice(index, 1);
  }
  state.currentSubclassSpells.clear();

  const selected = state.subclasses[state.currentClass]?.[subclassList.value];
  if (subclassList.value !== "0" && selected) {
    for (const [level, names] of Object.entries(selected)) {
      if (Number(level) > state.currentLevel) continue;
      for (const name of names) {
        const spell = state.spells[name];
        if (spell && !state.spellsKnown[spell.level].includes(name)) {
          state.spellsKnown[spell.level].push(name);
          state.currentSubclassSpells.add(spell);
        }
      }
    }
    showToast(`Added ${document.querySelector("#subclass-list").value} spells`)
  }
  renderAllSpells();
}

export function attack() {
  if (!state.proficiency) return showToast("Please enter your stats first");
  const roll = Math.floor(Math.random() * 20) + 1;
  const bonus = state.currentBonus + state.proficiency;
  showToast(`You rolled a ${roll} + ${bonus} for a ${roll + bonus}`);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function escapeAttribute(value) { return escapeHtml(value); }
