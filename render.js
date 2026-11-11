import { state } from "./state.js";
import { fullCasterSpellSlots, halfCasterSpellSlots, warlockSpellSlots } from "./data/spell-slots.js";

const spellList = document.querySelector(".character-spell-list");
const spellPopup = document.querySelector(".spell-popup");

export function renderAllSpells() {
  let html = "";
  if (state.currentLevel === 1 && state.casterType === "half") {
    html = `<article class="spell-section"><h2>Half-Casters</h2><section id="0-level" class="slots-and-names"><section class="spell-names">&lt;Half-casters get no spells at Lv 1&gt;</section></section></article>`;
  } else {
    for (let level = 0; level <= state.maxSpellLevel; level += 1) html += spellLevelTemplate(level);
  }
  spellList.innerHTML = html;
}

function spellLevelTemplate(level) {
  let title = level === 0 ? "Cantrips" : `Level ${level}`;
  let slots = 0;
  if (level === 0 && state.casterType === "half") return "";
  if (level > 0 && state.casterType === "full") slots = fullCasterSpellSlots[state.currentLevel]?.[level - 1] ?? 0;
  if (level > 0 && state.casterType === "half") slots = halfCasterSpellSlots[state.currentLevel]?.[level - 1] ?? 0;
  if (level > 0 && state.casterType === "problemChild") {
    const slotLevel = Math.min(state.maxSpellLevel, 5);
    if (level === slotLevel) slots = warlockSpellSlots[state.currentLevel] ?? 0;
  }

  const names = state.spellsKnown[level] ?? [];
  const namesHtml = names.length
    ? names.map(name => `<p class="clickable" data-spell-name="${escapeAttribute(name)}">${escapeHtml(name)}${state.spells[name]?.ritual ? " (r)" : ""}</p>`).join("")
    : "<p>&lt;No Spells Added&gt;</p>";
  const slotHtml = Array.from({ length: slots }, () => "<input type=\"checkbox\">").join("");
  return `<article class="spell-section"><h2>${title}</h2><section id="${level}-level" class="slots-and-names"><section class="slots">${level ? "<p>Spell Slots: </p>" : ""}<section class="spell-slots">${slotHtml}</section></section><section class="spell-names">${namesHtml}</section></section></article>`;
}

export function renderSpellPopup(name) {
  if (!state.spells[name]) return;
  spellPopup.innerHTML = spellPopupTemplate(name);
  spellPopup.classList.remove("hidden");
  spellPopup.querySelector("#close-spell-popup").addEventListener("click", hideSpellPopup);
}

export function hideSpellPopup() { spellPopup.classList.add("hidden"); }

function spellPopupTemplate(name) {
  const spell = state.spells[name];
  const duration = spell.castingTrigger ? `${spell.castingTime}, ${spell.castingTrigger}` : spell.castingTime;
  const upgrade = spell.higherLevelSlot || spell.cantripUpgrade || "";
  const levelText = spell.level === 0
    ? `${spell.school[0].toUpperCase()}${spell.school.slice(1)} cantrip`
    : `${spell.level}${spell.level === 1 ? "st" : spell.level === 2 ? "nd" : spell.level === 3 ? "rd" : "th"}-level ${spell.school}`;
  const ritual = spell.ritual ? " (ritual)" : "";
  return `<section class="spell-popup-header"><h2>${escapeHtml(spell.name)}</h2><h2 class="close" id="close-spell-popup">x</h2></section><p>${levelText}${ritual}</p><p><b>Concentration: </b> ${spell.concentration}</p><p><b>Casting Time: </b> ${escapeHtml(duration)}</p><p><b>Range: </b> ${escapeHtml(spell.range)}</p><p><b>Components: </b> ${escapeHtml(Array.isArray(spell.components) ? spell.components.join(", ") : spell.components)}</p><p><b>Duration: </b> ${escapeHtml(spell.duration)}</p><p><b>Classes: </b> ${escapeHtml(Array.isArray(spell.classes) ? spell.classes.join(", ") : spell.classes)}</p><p><b>Description: </b></p><p class="description">${escapeHtml(spell.description)}</p>${upgrade ? `<p><b>At Higher Levels:</b></p><p class="description">${escapeHtml(upgrade)}</p>` : ""}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function escapeAttribute(value) { return escapeHtml(value); }

export function showToast(message, duration = 3000) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, duration);
}
