
const wordsByTileCount = {
    1: [{ word: "A", positions: [0] }, { word: "B", positions: [1] }],
    2: [{ word: "AB", positions: [0, 1] }],
    3: [{ word: "ABC", positions: [0, 1, 2] }],
    4: [{ word: "ABCD", positions: [0, 1, 2, 3] }]
};


document.addEventListener('keydown', e =>  {
    if (e.key === 'Enter'){
        solve();
    } 
});

function isNotFull() {
    for (var i = 0; i < 20; i++) {
        if(document.getElementById(`t${i}`).value == '') {
            alert("Please fill in all the tiles");
            return true;
        }
    }
    return false;
}

function clearHighlights() {
    document.querySelectorAll('.grid-input').forEach(input => {
        input.classList.remove('glow');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const inputsContainer = document.getElementById('inputs');
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
            const input = document.createElement('input');
            input.classList = "grid-input";
            input.type = 'text';
            input.id = `t${4 * i + j}`;
            input.setAttribute('data-position', 4 * i + j);
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'none');
            
            // Add an event listener to hide the solutions and clear highlights on change
            input.addEventListener('input', () => {
                document.getElementById("solutions").style.display = 'none';
                clearHighlights(); // Clear any existing highlights
            });

            inputsContainer.appendChild(input);
        }
    }
    document.getElementById('solve').addEventListener('click', solve);
});

//{ word: "A", positions: [0] }, { word: "B", positions: [1] }
var  wordSet;
async function solve() {
    if (isNotFull()) {
        return;
    }
    
    const words = await fetch('words.txt');
    wordSet = new Set((await words.text()).toLowerCase().split(/\r?\n/));

    // Get tile values and their positions
    const tiles = [...Array(20)].map((_, i) =>
        document.getElementById(`t${i}`).value.trim().toLowerCase()).filter(Boolean);

    const tilesCount = tiles.map((str, position) => ({ str, position }));
    
    // Initialize valid words storage by tile count
    let validWords = {
        1: [],
        2: [],
        3: [],
        4: []
    };

    // Find all valid words starting from each tile
    tilesCount.forEach((tile, i) => {
        addTile(validWords, [tile.str], tilesCount.slice(0, i).concat(tilesCount.slice(i + 1)), 1, [tile.position]);
    });
    
    displaySolutions(validWords);

    document.getElementById("solutions").style.display = 'block';
}

function addTile(valid, curr, left, count, positions) {
    const word = curr.join('');
    
    // Only add the word if it's in the dictionary and is not a duplicate in the current tile count
    if (wordSet.has(word) && !valid[count].some(w => w.word === word)) {
        valid[count].push({ word, positions: [...positions] });
    }

    // Stop recursion if the limit of 4 tiles is reached
    if (count === 4 || left.length === 0) return;

    left.forEach((tile, i) => {
        addTile(
            valid,
            [...curr, tile.str],                         // Build the word by adding the current tile's string
            [...left.slice(0, i), ...left.slice(i + 1)], // Remove the used tile from remaining tiles
            count + 1,
            [...positions, tile.position]                // Track positions by adding the current tile's position
        );
    });
}

function displaySolutions(wordsByTileCount) {
    for (let tileCount = 1; tileCount <= 4; tileCount++) {
        const wordList = document.getElementById(`tile${tileCount}-words`);
        wordList.innerHTML = ''; // Clear previous results

        wordsByTileCount[tileCount].forEach(wordObj => {
            const listItem = document.createElement('li');
            listItem.textContent = wordObj.word;
            listItem.onclick = () => highlightTiles(wordObj.positions); // Add onclick event
            wordList.appendChild(listItem);
        });
    }
}


function highlightTiles(positions) {
    // Clear previous highlights
    document.querySelectorAll('.grid-input').forEach(input => {
        input.classList.remove('glow');
    });

    // Highlight selected tiles
    positions.forEach(position => {
        const tile = document.querySelector(`input[data-position="${position}"]`);
        if (tile) {
            tile.classList.add('glow');
        }
    });
}

function toggleVisibility(id) {
    const element = document.getElementById(id);
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}
