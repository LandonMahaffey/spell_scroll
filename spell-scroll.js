import { state } from "./state.js";
import { loadSpells, loadSubclasses } from "./data/spell-data.js";
import { attack, submitCharacteristics, toggleSpell, toggleSubclassSpells, createAvailableSpells } from "./character.js";
import { renderAllSpells, renderSpellPopup, showToast} from "./render.js";
import { generateHomebrewForm, populateSpellsHomebrew, resetHomebrewSpellList, submitHomebrewSpell, submitHomebrewSubclass, toggleHomebrewSpell } from "./homebrew.js";
import { generateJSONSave, loadJSON } from "./save-load.js";

async function initialize() {
  state.spells = await loadSpells();
  state.subclasses = await loadSubclasses();
  createAvailableSpells();
  renderAllSpells();
}

document.querySelector(".attack-roll").addEventListener("click", attack);
document.querySelector(".long-rest").addEventListener("click", () => {renderAllSpells; showToast("Spell slots restored!")});

const homebrewPopup = document.querySelector(".homebrewPopUp");
document.querySelector(".homebrewPopUpBtn").addEventListener("click", () => {
  populateSpellsHomebrew();
  homebrewPopup.classList.toggle("hidden");
});
document.querySelector("#close-homebrew").addEventListener("click", () => homebrewPopup.classList.add("hidden"));
document.querySelector("#subclass-form-screen").addEventListener("click", () => generateHomebrewForm("subclass"));
document.querySelector("#spell-form-screen").addEventListener("click", () => generateHomebrewForm("spell"));
document.querySelector("#homebrew-class").addEventListener("change", resetHomebrewSpellList);
document.querySelector("#add-spell-subclass").addEventListener("click", toggleHomebrewSpell);
document.querySelector("#subclass-submit").addEventListener("click", submitHomebrewSubclass);
document.querySelector("#spell-submit").addEventListener("click", submitHomebrewSpell);

const spellForm = document.querySelector("#spell-form");
const castTime = spellForm.querySelector("[data-field='c-time']");
const castTrigger = spellForm.querySelector("[data-field='cast-trigger']");
castTime.addEventListener("change", () => castTrigger.classList.toggle("hidden", !["reaction", "bonus action2"].includes(castTime.value)));
const material = spellForm.querySelector("[data-field='material']");
const materialComponents = spellForm.querySelector("[data-field='m-components']");
material.addEventListener("change", () => materialComponents.classList.toggle("hidden", !material.checked));

document.querySelector("#char-submit").addEventListener("click", submitCharacteristics);
document.querySelector("#toggleSpellBtn").addEventListener("click", event => toggleSpell(state.spells[document.querySelector("#class-spell-list").value], event));
document.querySelector("#toggleSubclassBtn").addEventListener("click", toggleSubclassSpells);
document.querySelector(".character-spell-list").addEventListener("click", event => {
  const spellElement = event.target.closest("[data-spell-name]");
  if (spellElement) renderSpellPopup(spellElement.dataset.spellName);
});
document.querySelector("#how-to-use").addEventListener("click", () => document.querySelector(".how-to-popup").classList.toggle("hidden"));
document.querySelector("#close-how-to").addEventListener("click", () => document.querySelector(".how-to-popup").classList.add("hidden"));

const fileInput = document.querySelector(".loaded_file_input");
const fileInputSubmit = document.querySelector(".file_submit");
document.querySelector("#load").addEventListener("click", () => {
  fileInput.classList.toggle("hidden");
  fileInputSubmit.classList.toggle("hidden");
});
document.querySelector("#save").addEventListener("click", generateJSONSave);
document.querySelector("#load_submit").addEventListener("click", () => {
  const file = document.querySelector("#json_upload").files[0];
  if (file) loadJSON(file);
});

initialize().catch(error => {
  console.error("Unable to initialize Spell-Scroll:", error);
  window.alert("Spell data could not be loaded. Please refresh the page and try again.");
});
