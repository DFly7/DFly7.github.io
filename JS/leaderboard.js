import { supabase } from './config.js';

// DOM elements
const leaderboardBody = document.getElementById('leaderboard-body');
const messageElement = document.getElementById('message');

// Load leaderboard data when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Show loading animation
  showLoadingAnimation();
  
  // Load the leaderboard data
  loadLeaderboard();
});

/**
 * Show a loading animation in the leaderboard
 */
function showLoadingAnimation() {
  leaderboardBody.innerHTML = '';
  
  // Create 5 loading placeholder rows
  for (let i = 0; i < 5; i++) {
    const row = document.createElement('tr');
    row.className = 'loading-row';
    
    // Add rank cell with loading animation
    const rankCell = document.createElement('td');
    rankCell.innerHTML = '<div class="loading-placeholder"></div>';
    row.appendChild(rankCell);
    
    // Add name cell with loading animation
    const nameCell = document.createElement('td');
    nameCell.innerHTML = '<div class="loading-placeholder" style="width: 80%"></div>';
    row.appendChild(nameCell);
    
    // Add ELO cell with loading animation
    const eloCell = document.createElement('td');
    eloCell.innerHTML = '<div class="loading-placeholder" style="width: 50%"></div>';
    row.appendChild(eloCell);
    
    // Add W/L cell with loading animation
    const wlCell = document.createElement('td');
    wlCell.innerHTML = '<div class="loading-placeholder" style="width: 40%"></div>';
    row.appendChild(wlCell);
    
    // Add the row to the table
    leaderboardBody.appendChild(row);
  }
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
 * Count wins for a player
 * @param {string} playerId - The player's ID
 * @param {Array} matches - Array of matches
 * @returns {number} - Number of wins
 */
function countPlayerWins(playerId, matches) {
  return matches.filter(match => 
    match.winner1 === playerId || 
    match.winner2 === playerId
  ).length;
}

/**
 * Count losses for a player
 * @param {string} playerId - The player's ID
 * @param {Array} matches - Array of matches
 * @returns {number} - Number of losses
 */
function countPlayerLosses(playerId, matches) {
  return matches.filter(match => 
    match.loser1 === playerId || 
    match.loser2 === playerId
  ).length;
}

/**
 * Load and display the leaderboard
 */
async function loadLeaderboard() {
  try {
    // Show loading message
    showMessage('Loading leaderboard...', 'info');
    console.log('Loading players from "Player" table and matches from "Matches" table');
    
    // Fetch players sorted by ELO in descending order
    const { data: players, error: playerError } = await supabase
      .from('Player')
      .select('*')
      .order('elo', { ascending: false });
    
    if (playerError) {
      throw playerError;
    }
    
    // Fetch all matches to calculate wins and losses
    const { data: matches, error: matchError } = await supabase
      .from('Matches')
      .select('*');
    
    if (matchError) {
      throw matchError;
    }
    
    // Clear any existing content
    leaderboardBody.innerHTML = '';
    
    // Display players in the leaderboard
    if (players && players.length > 0) {
      players.forEach((player, index) => {
        const row = document.createElement('tr');
        
        // Add rank (position)
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        rankCell.className = 'rank-cell';
        
        // Add special class for top 3 players
        if (index < 3) {
          rankCell.classList.add(`rank-${index + 1}`);
        }
        
        row.appendChild(rankCell);
        
        // Add player name
        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        row.appendChild(nameCell);
        
        // Add ELO rating
        const eloCell = document.createElement('td');
        eloCell.textContent = player.elo;
        eloCell.className = 'elo-cell';
        row.appendChild(eloCell);
        
        // Add W/L record
        const wlCell = document.createElement('td');
        const wins = countPlayerWins(player.id, matches);
        const losses = countPlayerLosses(player.id, matches);
        wlCell.innerHTML = `<span class="wins">${wins}</span>-<span class="losses">${losses}</span>`;
        wlCell.className = 'wl-cell';
        row.appendChild(wlCell);
        
        // Add the row to the table
        leaderboardBody.appendChild(row);
      });
      
      // Clear loading message
      messageElement.textContent = '';
      messageElement.className = '';
    } else {
      // No players found
      showMessage('No players found. Add players on the Add Player page.', 'info');
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error.message);
    showMessage(`Error loading leaderboard: ${error.message}`, 'error');
  }
} 