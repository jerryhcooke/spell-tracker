document.addEventListener('DOMContentLoaded', () => {
    const preEnterForm = document.getElementById('preEnterForm');
    const spellList = document.getElementById('spellList');

    // Load pre-entered spells from localStorage for the specific class (e.g., Wizard or Cleric)
    const classSpellsKey = location.pathname.includes('wizard') ? 'wizardSpells' : 'clericSpells';
    let classSpells = JSON.parse(localStorage.getItem(classSpellsKey)) || [];

    // Display saved spells on page load
    updateSpellList();

    preEnterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSaveSpell();
    });

    function handleSaveSpell() {
        const spellName = document.getElementById('spellName').value;
        const spellDurationMinutes = parseInt(document.getElementById('spellDurationMinutes').value) || 0;
        const spellDurationTurns = parseInt(document.getElementById('spellDurationTurns').value) || 0;

        let totalTurns = spellDurationTurns > 0 ? spellDurationTurns : spellDurationMinutes * 10;

        classSpells.push({
            name: spellName,
            duration: totalTurns,
            originalDuration: totalTurns
        });

        // Save the updated spells array to localStorage
        localStorage.setItem(classSpellsKey, JSON.stringify(classSpells));

        // Update spell list display
        updateSpellList();
        preEnterForm.reset();
    }

    function updateSpellList() {
        spellList.innerHTML = '';

        classSpells.forEach((spell) => {
            const spellDiv = document.createElement('div');
            spellDiv.classList.add('spell');
            spellDiv.innerText = `${spell.name} - ${spell.duration} turns`;

            spellList.appendChild(spellDiv);
        });
    }
});
