const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..')));
app.use(bodyParser.json());

const SPELLS_FILE = path.join(__dirname, '..', 'spells.json');

// Utility function to read the spells file
function readSpellsFile() {
  if (!fs.existsSync(SPELLS_FILE)) {
    return {};
  }
  const data = fs.readFileSync(SPELLS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Utility function to write to the spells file
function writeSpellsFile(spells) {
  fs.writeFileSync(SPELLS_FILE, JSON.stringify(spells, null, 2));
}

// Endpoint to get spells for a specific class
app.get('/spells', (req, res) => {
  const spells = readSpellsFile();
  const className = req.query.class;
  res.json(spells[className] || []);
});

// Endpoint to add a spell to a class
app.post('/addSpell', (req, res) => {
  const { class: className, name, duration } = req.body;
  const spells = readSpellsFile();

  if (!spells[className]) {
    spells[className] = [];
  }

  spells[className].push({ name, duration });
  writeSpellsFile(spells);

  res.status(200).json({ message: 'Spell added successfully' });
});

// Endpoint to remove a spell from a class
app.post('/removeSpell', (req, res) => {
  const { class: className, name } = req.body;
  const spells = readSpellsFile();

  if (spells[className]) {
    spells[className] = spells[className].filter(spell => spell.name !== name);
    writeSpellsFile(spells);
  }

  res.status(200).json({ message: 'Spell removed successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
