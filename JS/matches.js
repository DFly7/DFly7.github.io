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
 * @returns {boolean} - Whether the selections are valid
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
  
  // Find duplicate players for specific error message
  const duplicatePlayerIds = [];
  const playerCounts = {};
  
  selectedValues.forEach(playerId => {
    playerCounts[playerId] = (playerCounts[playerId] || 0) + 1;
    if (playerCounts[playerId] > 1 && !duplicatePlayerIds.includes(playerId)) {
      duplicatePlayerIds.push(playerId);
    }
  });
  
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
  
  // Show warning if duplicates with specific player names
  if (hasDuplicates && selectedValues.length > 1) {
    // Get the names of duplicated players for better error message
    const getPlayerName = (selectElement) => {
      const option = selectElement.options[selectElement.selectedIndex];
      return option ? option.text : 'Unknown player';
    };
    
    const duplicateNames = duplicatePlayerIds.map(playerId => {
      const select = [winner1Select, winner2Select, loser1Select, loser2Select].find(s => s.value === playerId);
      return getPlayerName(select);
    });
    
    showMessage(`Duplicate player selected: ${duplicateNames.join(', ')}. Each player can only be selected once.`, 'error');
  } else if (messageElement.textContent.includes('Duplicate player selected')) {
    messageElement.textContent = '';
    messageElement.className = '';
  }
  
  return !hasDuplicates;
}

/**
 * Load players from the database and populate select dropdowns
 */
async function loadPlayers() {
  try {
    // Show loading message
    showMessage('Loading players...', 'info');
    console.log('Loading players from "Player" table');
    
    // Get the no players hint element
    const noPlayersHint = document.getElementById('no-players-hint');
    
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
      
      // Hide the no players hint
      if (noPlayersHint) {
        noPlayersHint.style.display = 'none';
      }
      
      // Enable the form
      matchForm.style.display = 'block';
    } else {
      // No players found
      showMessage('No players found. Please add players on the Add Player page.', 'info');
      
      // Show the no players hint
      if (noPlayersHint) {
        noPlayersHint.style.display = 'block';
      }
      
      // Disable the form
      matchForm.style.display = 'none';
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
  
  // Validate for empty selections
  if (!winner1Select.value || !winner2Select.value || !loser1Select.value || !loser2Select.value) {
    showMessage('Please select all players for the match.', 'error');
    return;
  }
  
  // Perform duplicate validation once more
  if (!validatePlayerSelections()) {
    // Message already shown by validatePlayerSelections
    return;
  }
  
  // Validate team members aren't the same (winner1 = winner2 or loser1 = loser2)
  if (winner1Select.value === winner2Select.value) {
    showMessage('The winning team cannot have the same player twice.', 'error');
    winner1Select.classList.add('duplicate-selection');
    winner2Select.classList.add('duplicate-selection');
    return;
  }
  
  if (loser1Select.value === loser2Select.value) {
    showMessage('The losing team cannot have the same player twice.', 'error');
    loser1Select.classList.add('duplicate-selection');
    loser2Select.classList.add('duplicate-selection');
    return;
  }
  
  try {
    // Set button to loading state
    setButtonLoading(submitMatchButton, true, 'Submitting...');
    
    showMessage('Submitting match...', 'info');
    console.log('Using table names: "Player" and "Matches"');
    
    // Fetch player data to get current ELO ratings
    const { data: players, error: playersError } = await supabase
      .from('Player')
      .select('*')
      .in('id', [winner1Select.value, winner2Select.value, loser1Select.value, loser2Select.value]);
    
    if (playersError) {
      throw playersError;
    }
    
    // Find players by ID
    const winner1 = players.find(p => p.id === winner1Select.value);
    const winner2 = players.find(p => p.id === winner2Select.value);
    const loser1 = players.find(p => p.id === loser1Select.value);
    const loser2 = players.find(p => p.id === loser2Select.value);
    
    // Calculate average ELO for each team
    const winnerTeamAvgElo = Math.round((winner1.elo + winner2.elo) / 2);
    const loserTeamAvgElo = Math.round((loser1.elo + loser2.elo) / 2);
    
    // Calculate ELO changes
    const { winnerChange, loserChange } = calculateEloChange(winnerTeamAvgElo, loserTeamAvgElo);
    
    // Start a transaction to update player ELOs and add the match
    const { error: matchError } = await supabase
      .from('Matches')
      .insert([{
        winner1: winner1.id,
        winner2: winner2.id,
        loser1: loser1.id,
        loser2: loser2.id,
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
      .eq('id', winner1.id);
    
    if (winner1Error) {
      throw winner1Error;
    }
    
    const { error: winner2Error } = await supabase
      .from('Player')
      .update({ elo: winner2.elo + winnerChange, updated_at: new Date() })
      .eq('id', winner2.id);
    
    if (winner2Error) {
      throw winner2Error;
    }
    
    // Update loser ELOs
    const { error: loser1Error } = await supabase
      .from('Player')
      .update({ elo: loser1.elo + loserChange, updated_at: new Date() })
      .eq('id', loser1.id);
    
    if (loser1Error) {
      throw loser1Error;
    }
    
    const { error: loser2Error } = await supabase
      .from('Player')
      .update({ elo: loser2.elo + loserChange, updated_at: new Date() })
      .eq('id', loser2.id);
    
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