let spells = [];

async function loadSpells() {
    const response = await fetch("srd-5.2-spells.json");
    spells = await response.json();
}

loadSpells();
const fullCasterSpellSlots = {1: [2, 0, 0, 0, 0, 0, 0, 0, 0], 2:  [3, 0, 0, 0, 0, 0, 0, 0, 0], 3:  [4, 2, 0, 0, 0, 0, 0, 0, 0], 4:  [4, 3, 0, 0, 0, 0, 0, 0, 0], 5:  [4, 3, 2, 0, 0, 0, 0, 0, 0], 6:  [4, 3, 3, 0, 0, 0, 0, 0, 0], 7:  [4, 3, 3, 1, 0, 0, 0, 0, 0], 8:  [4, 3, 3, 2, 0, 0, 0, 0, 0], 9:  [4, 3, 3, 3, 1, 0, 0, 0, 0], 10: [4, 3, 3, 3, 2, 0, 0, 0, 0], 11: [4, 3, 3, 3, 2, 1, 0, 0, 0], 12: [4, 3, 3, 3, 2, 1, 0, 0, 0], 13: [4, 3, 3, 3, 2, 1, 1, 0, 0], 14: [4, 3, 3, 3, 2, 1, 1, 0, 0], 15: [4, 3, 3, 3, 2, 1, 1, 1, 0], 16: [4, 3, 3, 3, 2, 1, 1, 1, 0], 17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1]};
const halfCasterSpellSlots = {1: [0, 0, 0, 0, 0], 2:[2, 0, 0, 0, 0], 3:[3, 0, 0, 0, 0], 4:[3, 0, 0, 0, 0], 5:[4, 2, 0, 0, 0], 6:[4, 2, 0, 0, 0], 7:[4, 3, 0, 0, 0], 8:[4, 3, 0, 0, 0], 9:[4, 3, 2, 0, 0], 10:[4, 3, 2, 0, 0], 11:[4, 3, 3, 0, 0], 12:[4, 3, 3, 0, 0], 13:[4, 3, 3, 1, 0], 14:[4, 3, 3, 1, 0], 15:[4, 3, 3, 2, 0], 16:[4, 3, 3, 2, 0], 17:[4, 3, 3, 3, 1], 18:[4, 3, 3, 3, 1], 19:[4, 3, 3, 3, 2], 20:[4, 3, 3, 3, 2]};
const warlockSpellSlots = {1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10:2, 11:3, 12:3, 13:3, 14:3, 15:3, 16:3, 17:4, 18:4, 19:4, 20:4};
let casterType = "";
let current_class = "";
let current_level = 0;
let max_spell_level = 1;
let current_bonus = 0;
let proficiency = 0;
let spells_known = {0:{}, 1:{}, 2:{}, 3:{}, 4:{}, 5:{}, 6:{}, 7:{}, 8:{}, 9:{}};

let how_to_popup = document.querySelector(".how-to-popup")
let how_to_close = document.querySelector("#close-how-to")
let how_to_use = document.querySelector("#how-to-use")

let class_input = document.querySelector("#class")
let level_input = document.querySelector("#level")
let bonus_input = document.querySelector("#spell-bonus")
let submit_stats = document.querySelector("#char-submit")

let class_spell_list = document.querySelector("#class-spell-list");
let toggle_spell_btn = document.querySelector("#toggleSpellBtn")

let spell_atk = document.querySelector("#spell-atk");
let attack_btn = document.querySelector(".attack-roll")
attack_btn.addEventListener("click", attack)
let spell_sv = document.querySelector("#spell-sv");
let long_rest = document.querySelector(".long-rest")
long_rest.addEventListener("click", renderAllSpells);

let spell_list = document.querySelector(".character-spell-list")
let spell_popup = document.querySelector(".spell-popup")

submit_stats.addEventListener("click", submitCharacteristics);

toggle_spell_btn.addEventListener("click", toggleSpell);

how_to_use.addEventListener("click", showHowTo);
how_to_close.addEventListener("click", showHowTo);

initialize()


async function initialize() {
    await loadSpells();
    renderAllSpells();
}

function showHowTo(){
	how_to_popup.classList.toggle("hidden")
}

function submitCharacteristics(){
	event.preventDefault();
	getStats();
	createAvailableSpells();
	renderAllSpells();
	spell_atk.textContent = `Spell Attack: +${proficiency+ current_bonus}`;
	spell_sv.textContent = `Spell Save: DC ${proficiency + current_bonus + 8}`;
}

function createAvailableSpells(){
	class_spell_list.innerHTML = "";
	spells_known = {0:{}, 1:{}, 2:{}, 3:{}, 4:{}, 5:{}, 6:{}, 7:{}, 8:{}, 9:{}};
	let options = "";

	for (i = 0; i < spells.length; i++){
		if (spells[i].classes.includes(current_class) && spells[i].level <= max_spell_level){
			options += `<option value=${i}>${spells[i].name}  {Lv-${spells[i].level}}</option>`
		}
	}
	class_spell_list.innerHTML = options;
}

function getStats(){
	current_class = class_input.value;
	current_level = parseInt(level_input.value, 10);
	current_bonus = parseInt(bonus_input.value, 10);
	proficiency = 1 + Math.ceil(current_level/4);
	if (["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"].includes(current_class)){
		max_spell_level = Math.floor((current_level + 1) / 2);
		if (max_spell_level > 9){
			max_spell_level = 9;
		}
		casterType = "full";
	}
	else if (["ranger", "paladin"].includes(current_class)){
		if (current_level == 1){
			max_spell_level = -1;
		}
		else
		{
			max_spell_level = Math.ceil(current_level/4);
		}
		casterType = "half";
	}
	if (current_class == "warlock"){
		casterType = "problemChild";
	}
}

function toggleSpell(){
	event.preventDefault();
	if (proficiency != 0){
		let spell = spells[class_spell_list.value]

		if (Object.hasOwn(spells_known[spell.level], spell.name)){
			delete spells_known[spell.level][spell.name];
		}
		else{
			spells_known[spell.level][spell.name] = spell;
		}
		renderAllSpells();	
	}
	else{
		window.alert('Please enter your stats first');
	}
	
}

function renderAllSpells(){
	let html = ""
	if (current_level == 1 && casterType == "half"){
		html = `<article class="spell-section">
            <h2>Half-Casters</h2>
            <section id= "$0-level" class="slots-and-names">
                <section class="spell-names">&lt;Half-casters get no spells at Lv 1&gt;</section>
				</section></article>`;
	}
	else{
		for (let i = 0; i <= max_spell_level; i++){
			let addition = spellLevelTemplate(i)
			if (addition != ""){
				html += addition;
			}
		}
	}
	spell_list.innerHTML = html;
}

function renderSpellsKnown(level){
	let section = document.querySelector(`#${level}-level`);
	section.innerHTML = "";
	
}

function spellLevelTemplate (level){
	let sL = `Level ${level}`;
	let slots = 0;
	if (level == 0){
		sL = "Cantrips"
		if (casterType == "half"){
			return "";
		}
	}
	else if (casterType == "full"){
		slots = fullCasterSpellSlots[current_level][level-1];
	}
	else if (casterType == "half"){
		slots = halfCasterSpellSlots[current_level][level-1];
		
	}
	else if (casterType == "problemChild"){
		let warlockLevelslot = max_spell_level;
		if (max_spell_level >= 5){
			warlockLevelslot = 5;
		}
		if (level == warlockLevelslot){
			slots = warlockSpellSlots[current_level]
		}
	}
	var template = `<article class="spell-section">
            <h2>${sL}</h2>
            <section id= "${level}-level" class="slots-and-names">
                <section class="slots">`
	if (level != 0){
    	template += `<p>Spell Slots: </p>`;
	}
    template += `<section class="spell-slots">`;
	for (let i = slots; i != 0; i--){
		template += `<input type="checkbox">`
	}              
	template += `</section>
                </section>
                <section class="spell-names">`;   
	if (Object.keys(spells_known[level]).length === 0){
		template += "<p>&lt;No Spells Added&gt;</p>"
	}
	else
    {
		for (const [key, value] of Object.entries(spells_known[level])){
			template += `<p class="clickable" onclick="renderSpellPopup('${key}', ${level})">${value.name}`
			if (value.ritual) {
				template += `  (r)`;
			}
				
			template += `</p>`;
		}
	}
    template += `</section>
            </section>
        </article>`;

	return template;
}

function renderSpellPopup(spell, level){
	spell_popup.innerHTML = "";
    spell_popup.innerHTML = spellPopupTemplate(spell, level);
	document.querySelector("#close-spell-popup").addEventListener("click", hideSpellPopup)
	if (spell_popup.classList.contains('hidden')){
    	spell_popup.classList.toggle('hidden');
	}
}

function hideSpellPopup(){
	spell_popup.classList.toggle('hidden');
}

function spellPopupTemplate (name, level){
	let levelsSpells = spells_known[level];
	let spell = levelsSpells[name];
    let upcast = "";
    let duration = "";
    var spell_level = "";
    if (Object.hasOwn(spell, "castingTrigger")){
        duration = `reaction, ${spell.castingTrigger}`;
    }
    else{
        duration = spell.actionType;
    }
    if (Object.hasOwn(spell, "higherLevelSlot")){
        upcast = spell.higherLevelSlot
    }

    if (spell.level == 0){
        var school = spell.school;
        var schoolUpper = school[0].toUpperCase() + school.slice(1);
        spell_level = `${schoolUpper} cantrip`;
    }
    else if (spell.level == 1){
        spell_level = `1st-level ${spell.school}`;
    }
    else if (spell.level == 2){
        spell_level = `2nd-level ${spell.school}`;
    }
    else if (spell.level == 3){
        spell_level = `3rd-level ${spell.school}`;
    }
    else{
        spell_level = `${spell.level}th-level ${spell.school}`;
    }

    if (spell.ritual){
        spell_level += ` (ritual)`
    }

    var template = `<section class="spell-popup-header">
            <h2>${spell.name}</h2>
            <h2 class="close" id="close-spell-popup">x</h2>
        </section>
        <p>${spell_level}</p>
        <p><b>Concentration: </b> ${spell.concentration}</p>
        <p><b>Casting Time: </b> ${duration}</p>
        <p><b>Range: </b> ${spell.range}</p>
        <p><b>Components: </b> ${spell.components}</p>
        <p><b>Duration: </b> ${spell.duration}</p>
        <p><b>Classes: </b> ${spell.classes}</p>
        <p><b>Description: </b></p>
        <p class = "description">${spell.description}</p>`

    
    if (upcast != ""){
        template += `<p><b>At Higher Levels:</b></p>
        <p class = "description">${upcast}</p>`
    }

    
    return template;
}

function attack(){
	let num = Math.floor(Math.random() * 20 + 1)
	if (proficiency != 0){
		window.alert(`You rolled a ${num} + ${current_bonus + proficiency} for a ${num + current_bonus + proficiency}`)
	}
	else{
		window.alert('Please enter your stats first');
	}
}

