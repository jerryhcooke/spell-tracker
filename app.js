document.addEventListener('DOMContentLoaded', () => {
    const spellForm = document.getElementById('spellForm');
    const nextTurnButton = document.getElementById('nextTurnButton');
    const spellList = document.getElementById('spellList');
    const spellNameInput = document.getElementById('spellName');
    const spellDurationMinutesInput = document.getElementById('spellDurationMinutes');
    const spellDurationTurnsInput = document.getElementById('spellDurationTurns');

    let spells = JSON.parse(localStorage.getItem('spells')) || [];

    // Load Wizard and Cleric spells from localStorage for auto-complete
    const wizardSpells = JSON.parse(localStorage.getItem('wizardSpells')) || [];
    const clericSpells = JSON.parse(localStorage.getItem('clericSpells')) || [];
    const allSpells = [...wizardSpells, ...clericSpells]; // Merge saved Wizard and Cleric spells

    // Load spells from localStorage when the page loads
    updateSpellList();

    let currentSuggestionIndex = -1; // Keep track of the current suggestion for tabbing

    spellForm.addEventListener('submit', (event) => {
        event.preventDefault();
        removeSuggestions(); // Ensure suggestions are cleared when the form is submitted
        handleAddSpell();
    });

    nextTurnButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleNextTurn();
    });

    // Function to handle tab-based auto-completion
    spellNameInput.addEventListener('keydown', (event) => {
        const suggestions = document.querySelectorAll('.suggestions li');

        if (event.key === 'Tab' && suggestions.length > 0) {
            event.preventDefault();
            // Cycle through the suggestions with Tab
            currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
            const selectedSuggestion = suggestions[currentSuggestionIndex];
            spellNameInput.value = selectedSuggestion.innerText; // Autocomplete with the current suggestion
            populateSpellData(selectedSuggestion.innerText); // Populate minutes/turns based on the selected spell
            removeSuggestions(); // Clear suggestions after selection
        }
    });

    // Handle input event for showing suggestions
    spellNameInput.addEventListener('input', () => {
        currentSuggestionIndex = -1; // Reset the suggestion index when typing

        const inputValue = spellNameInput.value.toLowerCase();
        const matchingSpells = allSpells.filter(spell => spell.name.toLowerCase().startsWith(inputValue));

        if (matchingSpells.length > 0) {
            const suggestionBox = document.createElement('ul');
            suggestionBox.classList.add('suggestions');
            suggestionBox.innerHTML = '';

            matchingSpells.forEach(spell => {
                const li = document.createElement('li');
                li.innerText = spell.name;
                suggestionBox.appendChild(li);
            });

            // Remove existing suggestion box and append the new one
            removeSuggestions();
            spellForm.appendChild(suggestionBox);
        } else {
            removeSuggestions(); // Remove suggestions if no match is found
        }
    });

    // Function to populate spell data (minutes/turns) based on the selected suggestion
    function populateSpellData(spellName) {
        const matchingSpell = allSpells.find(spell => spell.name === spellName);

        if (matchingSpell) {
            if (matchingSpell.originalDuration % 10 === 0) {
                spellDurationMinutesInput.value = matchingSpell.originalDuration / 10;
                spellDurationTurnsInput.value = '';
            } else {
                spellDurationTurnsInput.value = matchingSpell.originalDuration;
                spellDurationMinutesInput.value = '';
            }
        }
    }

    // Function to remove suggestions from the DOM
    function removeSuggestions() {
        const existingBox = document.querySelector('.suggestions');
        if (existingBox) existingBox.remove();
    }

    // Function to handle adding a spell
    function handleAddSpell() {
        const spellName = document.getElementById('spellName').value;
        const spellDurationMinutes = parseInt(spellDurationMinutesInput.value) || 0;
        const spellDurationTurns = parseInt(spellDurationTurnsInput.value) || 0;

        // Convert minutes to turns if no turns were provided
        let totalTurns = spellDurationTurns > 0 ? spellDurationTurns : spellDurationMinutes * 10;

        // Add new spell to the spells array
        spells.push({
            name: spellName,
            duration: totalTurns,
            originalDuration: totalTurns,
            hasEnded: false
        });

        updateSpellList();
        spellForm.reset(); // Clear form inputs

        // Save spells array to localStorage
        localStorage.setItem('spells', JSON.stringify(spells));
    }

    // Function to handle "Next Turn"
    function handleNextTurn() {
        spells.forEach(spell => {
            if (spell.duration > 0) {
                spell.duration--;
            } else if (spell.duration === 0 && !spell.hasEnded) {
                spell.hasEnded = true; // Mark spell for removal on next turn
            }
        });

        // Filter out spells that have finished (after one black turn)
        spells = spells.filter(spell => !(spell.duration === 0 && spell.hasEnded));

        updateSpellList();

        // Save updated spells to localStorage
        localStorage.setItem('spells', JSON.stringify(spells));
    }

    // Function to update the spell list in the UI
    function updateSpellList() {
        spellList.innerHTML = ''; // Clear the current list

        spells.forEach((spell, index) => {
            const spellDiv = document.createElement('div');
            spellDiv.classList.add('spell');

            // Set color based on remaining turns
            if (spell.duration > 3) {
                spellDiv.classList.add('green');
            } else if (spell.duration === 3) {
                spellDiv.classList.add('yellow');
            } else if (spell.duration === 2) {
                spellDiv.classList.add('orange');
            } else if (spell.duration === 1) {
                spellDiv.classList.add('red');
            } else if (spell.duration === 0 && !spell.hasEnded) {
                spellDiv.classList.add('black'); // Turn black when spell ends
            }

            // Spell content: name and remaining turns
            const spellContent = document.createElement('div');
            spellContent.classList.add('spell-content');
            spellContent.innerText = `${spell.name}: ${spell.duration} turns left`;

            // Button container for Reset and Remove buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            // Reset button
            const resetButton = document.createElement('button');
            resetButton.innerText = 'Reset';
            resetButton.classList.add('spell-actions');
            resetButton.addEventListener('click', () => resetSpell(index));

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.innerText = 'Remove';
            removeButton.classList.add('spell-actions');
            removeButton.addEventListener('click', () => removeSpell(index));

            // Append buttons to the container
            buttonContainer.appendChild(resetButton);
            buttonContainer.appendChild(removeButton);

            // Append content and buttons to the spell div
            spellDiv.appendChild(spellContent);
            spellDiv.appendChild(buttonContainer);

            // Append the spell div to the spell list
            spellList.appendChild(spellDiv);
        });
    }

    // Function to reset a spell's duration
    function resetSpell(index) {
        spells[index].duration = spells[index].originalDuration;
        spells[index].hasEnded = false; // Reset hasEnded status
        updateSpellList();
        localStorage.setItem('spells', JSON.stringify(spells));
    }

    // Function to remove a spell
    function removeSpell(index) {
        spells.splice(index, 1); // Remove the spell from the array
        updateSpellList();
        localStorage.setItem('spells', JSON.stringify(spells));
    }
});
