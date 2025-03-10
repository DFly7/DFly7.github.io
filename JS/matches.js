import { supabase, calculateEloChange } from './config.js';

// DOM elements
const matchForm = document.getElementById('match-form');
const addPlayerForm = document.getElementById('add-player-form');
const winner1Select = document.getElementById('winner1');
const winner2Select = document.getElementById('winner2');
const loser1Select = document.getElementById('loser1');
const loser2Select = document.getElementById('loser2');
const newPlayerNameInput = document.getElementById('new-player-name');
const messageElement = document.getElementById('message');
const submitMatchButton = document.getElementById('submit-match');
const addPlayerButton = document.getElementById('add-player');

// Load players when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load the players
  loadPlayers();
});

// Add event listeners
matchForm.addEventListener('submit', handleMatchSubmit);
addPlayerForm.addEventListener('submit', handleAddPlayer);

// Add change event listeners to detect duplicate selections
[winner1Select, winner2Select, loser1Select, loser2Select].forEach(select => {
  select.addEventListener('change', validatePlayerSelections);
});

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
 * Validate player selections to prevent duplicates
 */
function validatePlayerSelections() {
  // Get all selected values
  const selectedValues = [
    winner1Select.value,
    winner2Select.value,
    loser1Select.value,
    loser2Select.value
  ].filter(value => value !== ''); // Filter out empty selections
  
  // Check for duplicates
  const uniqueValues = new Set(selectedValues);
  const hasDuplicates = selectedValues.length !== uniqueValues.size;
  
  // Highlight duplicates
  [winner1Select, winner2Select, loser1Select, loser2Select].forEach(select => {
    if (select.value && selectedValues.filter(v => v === select.value).length > 1) {
      select.classList.add('duplicate-selection');
    } else {
      select.classList.remove('duplicate-selection');
    }
  });
  
  // Update submit button state
  submitMatchButton.disabled = hasDuplicates && selectedValues.length > 1;
  
  // Show warning if duplicates
  if (hasDuplicates && selectedValues.length > 1) {
    showMessage('Each player can only be selected once.', 'error');
  } else if (messageElement.textContent === 'Each player can only be selected once.') {
    messageElement.textContent = '';
    messageElement.className = '';
  }
}

/**
 * Load players from the database and populate select dropdowns
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
    
    // Clear existing options (except the default)
    [winner1Select, winner2Select, loser1Select, loser2Select].forEach(select => {
      select.innerHTML = '<option value="">Select Player</option>';
    });
    
    // Add players to select dropdowns
    if (players && players.length > 0) {
      players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.name} (ELO: ${player.elo})`;
        
        // Clone the option for each select
        winner1Select.appendChild(option.cloneNode(true));
        winner2Select.appendChild(option.cloneNode(true));
        loser1Select.appendChild(option.cloneNode(true));
        loser2Select.appendChild(option.cloneNode(true));
      });
      
      // Clear loading message
      messageElement.textContent = '';
      messageElement.className = '';
    } else {
      // No players found
      showMessage('No players found. Please add players below.', 'info');
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
  
  if (!playerName) {
    showMessage('Please enter a player name.', 'error');
    console.log('Error: Empty player name');
    return;
  }
  
  try {
    // Set button to loading state
    setButtonLoading(addPlayerButton, true, 'Adding Player...');
    
    showMessage('Adding player...', 'info');
    console.log('Attempting to add player:', playerName);
    console.log('Using table name: "Player"');
    
    // Add player to the database - use the correct table name "Player"
    const { data, error } = await supabase
      .from('Player')
      .insert([{ name: playerName }])
      .select();
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      throw error;
    }
    
    // Clear the input
    newPlayerNameInput.value = '';
    
    // Show success message
    showMessage(`Player "${playerName}" added successfully!`, 'success');
    console.log('Player added successfully:', data);
    
    // Reload players to update the dropdowns
    await loadPlayers();
  } catch (error) {
    console.error('Error adding player:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // More detailed error message
    let errorMessage = 'Unknown error';
    if (error.message) {
      errorMessage = error.message;
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

/**
 * Handle match submission
 * @param {Event} event - Form submit event
 */
async function handleMatchSubmit(event) {
  event.preventDefault();
  
  // Get selected player IDs
  const winner1Id = winner1Select.value;
  const winner2Id = winner2Select.value;
  const loser1Id = loser1Select.value;
  const loser2Id = loser2Select.value;
  
  // Validate selections
  if (!winner1Id || !winner2Id || !loser1Id || !loser2Id) {
    showMessage('Please select all players.', 'error');
    return;
  }
  
  // Check for duplicate selections
  const playerIds = [winner1Id, winner2Id, loser1Id, loser2Id];
  if (new Set(playerIds).size !== 4) {
    showMessage('Each player can only be selected once.', 'error');
    return;
  }
  
  try {
    // Set button to loading state
    setButtonLoading(submitMatchButton, true, 'Submitting Match...');
    
    showMessage('Submitting match...', 'info');
    console.log('Using table names: "Player" and "Matches"');
    
    // Fetch player data to get current ELO ratings
    const { data: players, error: playersError } = await supabase
      .from('Player')
      .select('*')
      .in('id', playerIds);
    
    if (playersError) {
      throw playersError;
    }
    
    // Find players by ID
    const winner1 = players.find(p => p.id === winner1Id);
    const winner2 = players.find(p => p.id === winner2Id);
    const loser1 = players.find(p => p.id === loser1Id);
    const loser2 = players.find(p => p.id === loser2Id);
    
    // Calculate average ELO for each team
    const winnerTeamAvgElo = Math.round((winner1.elo + winner2.elo) / 2);
    const loserTeamAvgElo = Math.round((loser1.elo + loser2.elo) / 2);
    
    // Calculate ELO changes
    const { winnerChange, loserChange } = calculateEloChange(winnerTeamAvgElo, loserTeamAvgElo);
    
    // Start a transaction to update player ELOs and add the match
    const { error: matchError } = await supabase
      .from('Matches')
      .insert([{
        winner1: winner1Id,
        winner2: winner2Id,
        loser1: loser1Id,
        loser2: loser2Id,
        winner_team_avg_elo: winnerTeamAvgElo,
        loser_team_avg_elo: loserTeamAvgElo
      }]);
    
    if (matchError) {
      throw matchError;
    }
    
    // Update winner ELOs
    const { error: winner1Error } = await supabase
      .from('Player')
      .update({ elo: winner1.elo + winnerChange, updated_at: new Date() })
      .eq('id', winner1Id);
    
    if (winner1Error) {
      throw winner1Error;
    }
    
    const { error: winner2Error } = await supabase
      .from('Player')
      .update({ elo: winner2.elo + winnerChange, updated_at: new Date() })
      .eq('id', winner2Id);
    
    if (winner2Error) {
      throw winner2Error;
    }
    
    // Update loser ELOs
    const { error: loser1Error } = await supabase
      .from('Player')
      .update({ elo: loser1.elo + loserChange, updated_at: new Date() })
      .eq('id', loser1Id);
    
    if (loser1Error) {
      throw loser1Error;
    }
    
    const { error: loser2Error } = await supabase
      .from('Player')
      .update({ elo: loser2.elo + loserChange, updated_at: new Date() })
      .eq('id', loser2Id);
    
    if (loser2Error) {
      throw loser2Error;
    }
    
    // Show success message with details
    const successMessage = `
      Match recorded successfully!
      ${winner1.name} & ${winner2.name} (Winners): +${winnerChange} ELO
      ${loser1.name} & ${loser2.name} (Losers): ${loserChange} ELO
    `;
    
    showMessage(successMessage.trim(), 'success');
    
    // Reset form
    matchForm.reset();
    
    // Reload players to update the ELO ratings in the dropdowns
    await loadPlayers();
  } catch (error) {
    console.error('Error submitting match:', error);
    showMessage(`Error submitting match: ${error.message || 'Unknown error'}`, 'error');
  } finally {
    // Reset button state
    setButtonLoading(submitMatchButton, false, null, 'Submit Match');
  }
} 