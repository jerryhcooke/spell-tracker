document.addEventListener('DOMContentLoaded', () => {
  const spellForm = document.getElementById('spellForm');
  const nextTurnButton = document.getElementById('nextTurnButton');
  const spellList = document.getElementById('spellList');
  const spellNameInput = document.getElementById('spellName');
  const spellDurationMinutesInput = document.getElementById('spellDurationMinutes');
  const spellDurationTurnsInput = document.getElementById('spellDurationTurns');
  const classSelect = document.getElementById('classSelect');

  let classSpells = []; // Spells for the selected class
  let spellTracker = []; // Track the active spells for the countdown
  let selectedSpell = null; // Track the currently selected spell for adding

  // Load the saved class from localStorage, if available
  const savedClass = localStorage.getItem('selectedClass');
  if (savedClass) {
    classSelect.value = savedClass;
    fetchSpellsForClass(savedClass); // Fetch spells if a class is already selected
  }

  // Fetch spells for the selected class
  function fetchSpellsForClass(className) {
    fetch(`/spells?class=${className}`)
      .then(response => response.json())
      .then(data => {
        classSpells = data; // Store the class spells
        setupAutocomplete(classSpells); // Set up autocomplete for the current class spells
      });
  }

  // Save the selected class to localStorage whenever it changes
  classSelect.addEventListener('change', (event) => {
    const selectedClass = event.target.value;
    localStorage.setItem('selectedClass', selectedClass); // Save to localStorage
    fetchSpellsForClass(selectedClass); // Fetch spells for the selected class
  });

  // Set up autocomplete suggestions based on the current class spells
  function setupAutocomplete(spells) {
    spellNameInput.addEventListener('input', () => {
      const inputValue = spellNameInput.value.toLowerCase();
      const currentSuggestions = spells.filter(spell => spell.name.toLowerCase().startsWith(inputValue));

      if (currentSuggestions.length > 0) {
        fillInputWithSuggestion(currentSuggestions[0].name, inputValue);
        selectedSpell = currentSuggestions[0]; // Track the first suggestion as selected
        populateSpellData(selectedSpell); // Populate minutes/turns based on selected spell
      } else {
        selectedSpell = null; // Reset if no suggestions match
        clearSpellData(); // Clear the minutes/turns fields if no match
      }
    });
  }

  // Fill the input box with the suggestion inline
  function fillInputWithSuggestion(suggestion, inputValue) {
    const remainingText = suggestion.substring(inputValue.length);
    spellNameInput.value = inputValue + remainingText;
    spellNameInput.setSelectionRange(inputValue.length, suggestion.length);
  }

  // Populate minutes/turns based on the selected spell
  function populateSpellData(spell) {
    if (spell.duration % 10 === 0) {
      spellDurationMinutesInput.value = spell.duration / 10;
      spellDurationTurnsInput.value = '';
    } else {
      spellDurationTurnsInput.value = spell.duration;
      spellDurationMinutesInput.value = '';
    }
  }

  // Clear the minutes/turns fields if no suggestion matches
  function clearSpellData() {
    spellDurationMinutesInput.value = '';
    spellDurationTurnsInput.value = '';
  }

  // Handle autocomplete selection via Enter key
  spellNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && selectedSpell) {
      event.preventDefault(); // Prevent form submission on Enter
      spellNameInput.value = selectedSpell.name; // Set the input value to the selected spell
      addSpellToList(selectedSpell.name, selectedSpell.duration); // Add the selected spell to the list
    }
  });

  // Handle adding a spell when the form is submitted (manual or autocomplete)
  spellForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Check if a spell from autocomplete is selected or if it's a manual entry
    const spellName = spellNameInput.value;
    const spellDurationMinutes = parseInt(spellDurationMinutesInput.value) || 0;
    const spellDurationTurns = parseInt(spellDurationTurnsInput.value) || 0;

    // Convert minutes to turns if no turns were provided
    const totalTurns = spellDurationTurns > 0 ? spellDurationTurns : spellDurationMinutes * 10;

    addSpellToList(spellName, totalTurns); // Add the spell (manual or autocomplete)
    spellForm.reset(); // Clear the form
    selectedSpell = null; // Reset the selected spell
  });

  // Add a spell to the list (manual or from autocomplete)
  function addSpellToList(spellName, totalTurns) {
    const spellToAdd = {
      name: spellName,
      duration: totalTurns,
      originalDuration: totalTurns,
      hasEnded: false
    };

    spellTracker.push(spellToAdd); // Add the spell to the active tracker
    renderSpellList(); // Re-render the spell list
  }

  // Handle "Next Turn" button click (no form submission)
  nextTurnButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form validation

    spellTracker.forEach(spell => {
      if (spell.duration > 0) {
        spell.duration--;
      } else if (spell.duration === 0 && !spell.hasEnded) {
        spell.hasEnded = true;
      }
    });

    // Filter out spells that have ended
    spellTracker = spellTracker.filter(spell => !(spell.duration === 0 && spell.hasEnded));

    renderSpellList(); // Re-render the updated spell list
  });

  // Render the spell list in the UI
  function renderSpellList() {
    spellList.innerHTML = ''; // Clear the current list

    spellTracker.forEach((spell, index) => {
      const spellDiv = document.createElement('div');
      spellDiv.classList.add('spell');

      // Set background color based on remaining turns
      setSpellColor(spellDiv, spell.duration);

      const spellContent = document.createElement('div');
      spellContent.classList.add('spell-content');
      spellContent.innerText = `${spell.name}: ${spell.duration} turns left`;

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      const resetButton = document.createElement('button');
      resetButton.innerText = 'Reset';
      resetButton.classList.add('spell-actions');
      resetButton.addEventListener('click', () => resetSpell(index));

      const removeButton = document.createElement('button');
      removeButton.innerText = 'Remove';
      removeButton.classList.add('spell-actions');
      removeButton.addEventListener('click', () => removeSpell(index));

      buttonContainer.appendChild(resetButton);
      buttonContainer.appendChild(removeButton);

      spellDiv.appendChild(spellContent);
      spellDiv.appendChild(buttonContainer);
      spellList.appendChild(spellDiv);
    });
  }

  // Set the background color based on remaining turns
  function setSpellColor(spellDiv, turns) {
    spellDiv.classList.remove('green', 'yellow', 'orange', 'red', 'black'); // Clear existing colors
    if (turns > 3) {
      spellDiv.classList.add('green');
    } else if (turns === 3) {
      spellDiv.classList.add('yellow');
    } else if (turns === 2) {
      spellDiv.classList.add('orange');
    } else if (turns === 1) {
      spellDiv.classList.add('red');
    } else if (turns === 0) {
      spellDiv.classList.add('black');
    }
  }

  // Reset the spell's duration
  function resetSpell(index) {
    spellTracker[index].duration = spellTracker[index].originalDuration;
    renderSpellList();
  }

  // Remove the spell from the list
  function removeSpell(index) {
    spellTracker.splice(index, 1); // Remove the spell from the tracker
    renderSpellList();
  }

  // Handle class dropdown change
  classSelect.addEventListener('change', (event) => {
    const selectedClass = event.target.value;
    if (selectedClass) {
      fetchSpellsForClass(selectedClass); // Fetch spells for the selected class
    } else {
      spellList.innerHTML = ''; // Clear the spell list if no class is selected
    }
  });
});
