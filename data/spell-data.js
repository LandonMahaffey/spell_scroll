export async function loadSpells() {
    const response = await fetch("srd-5.2-spells.json");
    let temp = await response.json();
	return temp[0];
}

export async function loadSubclasses() {
    const response = await fetch("subclass-spells.json");
    let temp = await response.json();
	return temp[0]
}