import { supabase } from './config.js';
import { calculateEloChange } from './config.js';

// DOM elements
const historyBody = document.getElementById('history-body');
const messageElement = document.getElementById('message');

// Load match history when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Show loading animation
  showLoadingAnimation();
  
  // Load the match history
  loadMatchHistory();
});

/**
 * Show a loading animation in the match history table
 */
function showLoadingAnimation() {
  historyBody.innerHTML = '';
  
  // Create 7 cells with loading animations (updated for new columns)
  for (let i = 0; i < 5; i++) {
    const row = document.createElement('tr');
    row.className = 'loading-row';
    
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');
      const width = j === 0 ? '60%' : j === 1 || j === 2 ? '80%' : '50%';
      cell.innerHTML = `<div class="loading-placeholder" style="width: ${width}"></div>`;
      row.appendChild(cell);
    }
    
    // Add the row to the table
    historyBody.appendChild(row);
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
 * Format a date in a user-friendly way, optimized for mobile
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  
  // Check if we're on a small screen
  const isMobile = window.innerWidth <= 480;
  
  if (isMobile) {
    // Compact format for mobile: MM/DD/YY, HH:MM
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().substr(-2);
    
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    
    return `${month}/${day}/${year}, ${displayHours}:${minutes}${ampm}`;
  } else {
    // Full format for larger screens
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }
}

/**
 * Format ELO change value with color and sign
 * @param {number} change - The ELO change value
 * @returns {string} - HTML string with formatted ELO change
 */
function formatEloChange(change) {
  const sign = change > 0 ? '+' : '';
  const className = change > 0 ? 'elo-change-positive' : 'elo-change-negative';
  return `<span class="${className}">${sign}${change}</span>`;
}

/**
 * Load and display match history
 */
async function loadMatchHistory() {
  try {
    // Show loading message
    showMessage('Loading match history...', 'info');
    console.log('Loading matches from "Matches" table and players from "Player" table');
    
    // Fetch matches with player information
    const { data: matches, error: matchesError } = await supabase
      .from('Matches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (matchesError) {
      throw matchesError;
    }
    
    // Fetch all players to get names
    const { data: players, error: playersError } = await supabase
      .from('Player')
      .select('id, name');
    
    if (playersError) {
      throw playersError;
    }
    
    // Create a map of player IDs to names for easy lookup
    const playerMap = {};
    players.forEach(player => {
      playerMap[player.id] = player.name;
    });
    
    // Clear any existing content
    historyBody.innerHTML = '';
    
    // Display matches in the history table
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        const row = document.createElement('tr');
        
        // Add date
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(match.created_at);
        row.appendChild(dateCell);
        
        // Add winners
        const winnersCell = document.createElement('td');
        winnersCell.innerHTML = `
          <span class="winner-name">${playerMap[match.winner1]}</span> & 
          <span class="winner-name">${playerMap[match.winner2]}</span>
        `;
        row.appendChild(winnersCell);
        
        // Add losers
        const losersCell = document.createElement('td');
        losersCell.innerHTML = `
          <span class="loser-name">${playerMap[match.loser1]}</span> & 
          <span class="loser-name">${playerMap[match.loser2]}</span>
        `;
        row.appendChild(losersCell);
        
        // Add winner team average ELO
        const winnerEloCell = document.createElement('td');
        winnerEloCell.textContent = match.winner_team_avg_elo;
        winnerEloCell.className = 'elo-cell';
        row.appendChild(winnerEloCell);
        
        // Calculate and add winner ELO change using the same function from config.js
        const winnerChangeCell = document.createElement('td');
        const eloChanges = calculateEloChange(match.winner_team_avg_elo, match.loser_team_avg_elo);
        winnerChangeCell.innerHTML = formatEloChange(eloChanges.winnerChange);
        row.appendChild(winnerChangeCell);
        
        // Add loser team average ELO
        const loserEloCell = document.createElement('td');
        loserEloCell.textContent = match.loser_team_avg_elo;
        loserEloCell.className = 'elo-cell';
        row.appendChild(loserEloCell);
        
        // Calculate and add loser ELO change using the same function from config.js
        const loserChangeCell = document.createElement('td');
        loserChangeCell.innerHTML = formatEloChange(eloChanges.loserChange);
        row.appendChild(loserChangeCell);
        
        // Add the row to the table
        historyBody.appendChild(row);
      });
      
      // Clear loading message
      messageElement.textContent = '';
      messageElement.className = '';
    } else {
      // No matches found
      showMessage('No matches found. Record matches on the Match Entry page.', 'info');
    }
  } catch (error) {
    console.error('Error loading match history:', error.message);
    showMessage(`Error loading match history: ${error.message}`, 'error');
  }
} 