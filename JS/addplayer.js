import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

// Supabase configuration
const supabaseUrl = 'https://bmqwgtwnqwgjqfjorvkw.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcXdndHducXdnanFmam9ydmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjcwMTIsImV4cCI6MjA1NzIwMzAxMn0.D7SIm3vs2mzbL9Sj3Jm6dGQmD8epcD7GAuPpQlAyO2w"
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM elements
const addPlayerForm = document.getElementById('add-player-form');
const newPlayerNameInput = document.getElementById('new-player-name');
const playersBody = document.getElementById('players-body');
const messageElement = document.getElementById('message');
const addPlayerButton = document.getElementById('add-player');

// Load players when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up event listeners');
  
  // Load the players
  loadPlayers();
});

// Add event listeners
if (addPlayerForm) {
  addPlayerForm.addEventListener('submit', handleAddPlayer);
  console.log('Add player form submit listener added');
} else {
  console.error('Add player form not found');
}

/**
 * Display a message to the user
 * @param {string} text - Message text
 * @param {string} type - Message type (success, error, or info)
 */
function showMessage(text, type = 'info') {
  messageElement.textContent = text;
  messageElement.className = type === 'success' 
    ? 'success-message' 
    : type === 'error' 
      ? 'error-message' 
      : '';
  
  // Automatically clear info messages after 5 seconds
  if (type === 'info') {
    setTimeout(() => {
      if (messageElement.textContent === text) {
        messageElement.textContent = '';
        messageElement.className = '';
      }
    }, 5000);
  }
}

/**
 * Set loading state for a button
 * @param {HTMLButtonElement} button - The button element
 * @param {boolean} isLoading - Whether the button is in loading state
 * @param {string} loadingText - Text to display when loading
 * @param {string} defaultText - Default button text
 */
function setButtonLoading(button, isLoading, loadingText = 'Processing...', defaultText) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.textContent = defaultText || button.dataset.originalText;
    button.classList.remove('loading');
  }
}

/**
 * Load players from the database and display them
 */
async function loadPlayers() {
  try {
    // Show loading message
    showMessage('Loading players...', 'info');
    console.log('Loading players from "Player" table');
    
    // Fetch players sorted by name
    const { data: players, error } = await supabase
      .from('Player')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    // Clear existing content
    playersBody.innerHTML = '';
    
    // Add players to the table
    if (players && players.length > 0) {
      players.forEach(player => {
        const row = document.createElement('tr');
        
        // Add player name
        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        row.appendChild(nameCell);
        
        // Add ELO rating
        const eloCell = document.createElement('td');
        eloCell.textContent = player.elo;
        eloCell.className = 'elo-cell';
        row.appendChild(eloCell);
        
        // Add the row to the table
        playersBody.appendChild(row);
      });
      
      // Clear loading message
      messageElement.textContent = '';
      messageElement.className = '';
    } else {
      // No players found
      showMessage('No players found. Add your first player above.', 'info');
    }
  } catch (error) {
    console.error('Error loading players:', error.message);
    showMessage(`Error loading players: ${error.message}`, 'error');
  }
}

/**
 * Handle adding a new player
 * @param {Event} event - Form submit event
 */
async function handleAddPlayer(event) {
  event.preventDefault();
  console.log('Add player form submitted');
  
  const playerName = newPlayerNameInput.value.trim();
  // Always use default ELO of 1500 for new players
  const playerElo = 1500;
  
  if (!playerName) {
    showMessage('Please enter a player name.', 'error');
    console.log('Error: Empty player name');
    return;
  }
  
  try {
    // Set button to loading state
    setButtonLoading(addPlayerButton, true, 'Adding Player...');
    
    showMessage('Adding player...', 'info');
    console.log('Attempting to add player:', playerName, 'with ELO:', playerElo);
    console.log('Using table name: "Player"');
    
    // Add player to the database - use the correct table name "Player"
    const { data, error } = await supabase
      .from('Player')
      .insert([{ 
        name: playerName,
        elo: playerElo
      }])
      .select();
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      throw error;
    }
    
    // Clear the input
    newPlayerNameInput.value = '';
    
    // Show success message
    showMessage(`Player "${playerName}" added successfully with ELO ${playerElo}!`, 'success');
    console.log('Player added successfully:', data);
    
    // Reload players to update the table
    await loadPlayers();
  } catch (error) {
    console.error('Error adding player:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // More detailed error message
    let errorMessage = 'Unknown error';
    if (error.message) {
      errorMessage = error.message;
      
      // Check for duplicate name error
      if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = `A player with the name "${playerName}" already exists.`;
      }
    } else if (error.code) {
      errorMessage = `Error code: ${error.code}`;
    } else if (error.details) {
      errorMessage = error.details;
    }
    
    showMessage(`Error adding player: ${errorMessage}. Check console for details.`, 'error');
  } finally {
    // Reset button state
    setButtonLoading(addPlayerButton, false, null, 'Add Player');
  }
} 