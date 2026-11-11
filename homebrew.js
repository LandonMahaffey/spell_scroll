import { state } from "./state.js";
import { showToast } from "./render.js";

const homebrewPopup = document.querySelector(".homebrewPopUp");
const subclassForm = document.querySelector("#subclass-form");
const spellForm = document.querySelector("#spell-form");
const homebrewClass = document.querySelector("#homebrew-class");
const spellSelector = document.querySelector("#homebrew-subclass-spells");
const chosenSpells = document.querySelector(".homebrew-subclass-chosen-spells");
const castTrigger = spellForm.querySelector("[data-field='cast-trigger']");
const materialComponents = spellForm.querySelector("[data-field='m-components']");

export function populateSpellsHomebrew() {
  spellSelector.innerHTML = Object.values(state.spells)
    .filter(spell => spell.level <= 5)
    .map(spell => `<option value="${escapeAttribute(spell.name)}">${escapeHtml(spell.name)} {Lv-${spell.level}}</option>`)
    .join("");
}

export function resetHomebrewSpellList() {
  state.homebrewSpellList = ["ranger", "paladin"].includes(homebrewClass.value)
    ? { 3: [], 5: [], 9: [], 13: [], 17: [] }
    : { 3: [], 5: [], 7: [], 9: [] };
  renderHomebrewSpellList();
}

export function toggleHomebrewSpell(event) {
  event.preventDefault();
  const spell = state.spells[spellSelector.value];
  if (!spell) return;
  const halfCaster = Object.keys(state.homebrewSpellList).length === 5;
  const level = Math.max(3, halfCaster ? 4 * spell.level - 3 : 2 * spell.level - 1);
  const entries = state.homebrewSpellList[level];
  if (!entries) return;
  const index = entries.indexOf(spell.name);
  if (index < 0) entries.push(spell.name);
  else entries.splice(index, 1);
  renderHomebrewSpellList();
}

function renderHomebrewSpellList() {
  chosenSpells.innerHTML = Object.entries(state.homebrewSpellList)
    .map(([level, names]) => `<p>Lv ${level}: ${names.map(escapeHtml).join(", ")}</p>`)
    .join("");
}

export function submitHomebrewSubclass(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget.form).entries());
  const className = data["homebrew-class"];
  const subclassName = data["subclass-name"];
  const spellList = Object.fromEntries(Object.entries(state.homebrewSpellList).map(([level, names]) => [level, [...names]]));
  state.subclasses[className] ||= {};
  state.subclasses[className][subclassName] = spellList;
  state.homebrewSubclasses[className] ||= {};
  state.homebrewSubclasses[className][subclassName] = spellList;
  event.currentTarget.form.reset();
  resetHomebrewSpellList();
  homebrewPopup.classList.add("hidden");
  showToast(`Added ${subclassName}`);
}

export function submitHomebrewSpell(event) {
  event.preventDefault();
  const form = event.currentTarget.form;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const level = Number.parseInt(data["spell-lv"], 10);
  const spell = {
    name: data["spell-name"], level, school: data.school,
    classes: formData.getAll("classes[]"),
    castingTime: data["c-time"] === "bonus action2" ? "bonus action" : data["c-time"],
    concentration: data.conc === "true", ritual: data.rit === "true", range: data.range,
    components: formData.getAll("comp[]"), duration: data.duration,
    description: data["spell-description"]
  };
  if (["reaction", "bonus action2"].includes(data["c-time"])) spell.castingTrigger = data["cast-trigger"];
  if (spell.components.includes("m")) spell.material = data["m-components"];
  if (data["spell-upcast"]) spell[level ? "higherLevelSlot" : "cantripUpgrade"] = data["spell-upcast"];

  state.spells[spell.name] = spell;
  state.homebrewSpells[spell.name] = spell;
  form.reset();
  castTrigger.classList.add("hidden");
  materialComponents.classList.add("hidden");
  homebrewPopup.classList.add("hidden");
  showToast(`Added ${spell.name}`);
}

export function generateHomebrewForm(form) {
  if (form === state.currentForm) return;
  subclassForm.classList.toggle("hidden", form !== "subclass");
  spellForm.classList.toggle("hidden", form !== "spell");
  state.currentForm = form;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function escapeAttribute(value) { return escapeHtml(value); }
