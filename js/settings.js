document.addEventListener('DOMContentLoaded', () => {
  const classSelect = document.getElementById('classSelect');
  const spellsTableBody = document.getElementById('spellsTable').querySelector('tbody');
  const addSpellForm = document.getElementById('addSpellForm');
  const newSpellNameInput = document.getElementById('newSpellName');
  const newSpellDurationMinutesInput = document.getElementById('newSpellDurationMinutes');
  const newSpellDurationTurnsInput = document.getElementById('newSpellDurationTurns');

  let currentClass = ''; // Initialize current class

  // Load the saved class from localStorage, if available
  const savedClass = localStorage.getItem('selectedClass');
  if (savedClass) {
    classSelect.value = savedClass;
    currentClass = savedClass; // Set the current class from localStorage
    fetchSpells(currentClass); // Fetch spells for the saved class
  } else {
    classSelect.value = 'Select a class'; // Default value
  }

  // Fetch spells for the selected class from the backend
  function fetchSpells(className) {
    fetch(`/spells?class=${className}`)
      .then(response => response.json())
      .then(data => {
        renderSpells(data); // Render the fetched spells
      });
  }

  // Save the selected class to localStorage whenever it changes
  classSelect.addEventListener('change', (event) => {
    currentClass = event.target.value;
    localStorage.setItem('selectedClass', currentClass); // Save to localStorage
    if (currentClass !== 'Select a class') {
      fetchSpells(currentClass); // Fetch spells for the selected class
    } else {
      spellsTableBody.innerHTML = ''; // Clear the table if no class is selected
    }
  });

  // Add new spell for the selected class
  addSpellForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const spellName = newSpellNameInput.value;
    const spellDurationMinutes = parseInt(newSpellDurationMinutesInput.value) || 0;
    const spellDurationTurns = parseInt(newSpellDurationTurnsInput.value) || 0;

    const totalTurns = spellDurationTurns > 0 ? spellDurationTurns : spellDurationMinutes * 10;

    if (!currentClass || currentClass === 'Select a class') {
      alert('Please select a class first.');
      return;
    }

    fetch(`/addSpell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class: currentClass,
        name: spellName,
        duration: totalTurns
      })
    }).then(() => {
      fetchSpells(currentClass); // Reload spells after adding the new spell
    });

    addSpellForm.reset(); // Clear the form
  });

  // Remove a spell for the selected class
  function removeSpell(spellName) {
    fetch(`/removeSpell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class: currentClass, name: spellName })
    }).then(() => {
      fetchSpells(currentClass); // Reload spells after removing
    });
  }

  // Render spells in the table
  function renderSpells(spells) {
    const table = document.getElementById('spellsTable');
    const thead = table.querySelector('thead');
    spellsTableBody.innerHTML = ''; // Clear existing table rows

    if (spells.length > 0 && currentClass !== 'Select a class') {
      thead.style.display = ''; // Show the table headers
      spells.forEach(spell => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${spell.name}</td>
          <td>${spell.duration}</td>
          <td><button class="remove-btn" data-name="${spell.name}">Remove</button></td>
        `;
        spellsTableBody.appendChild(row);
      });

      // Attach remove event listeners
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeSpell(btn.dataset.name));
      });
    } else {
      thead.style.display = 'none'; // Hide the table headers if no spells or invalid class is selected
    }
  }
});
