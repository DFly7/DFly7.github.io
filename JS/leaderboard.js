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
 * Load and display the leaderboard
 */
async function loadLeaderboard() {
  try {
    // Show loading message
    showMessage('Loading leaderboard...', 'info');
    console.log('Loading players from "Player" table');
    
    // Fetch players sorted by ELO in descending order
    const { data: players, error } = await supabase
      .from('Player')
      .select('*')
      .order('elo', { ascending: false });
    
    if (error) {
      throw error;
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
        
        // Add special styling for top 3 ranks
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
        
        // Add the row to the table
        leaderboardBody.appendChild(row);
      });
      
      // Clear loading message
      messageElement.textContent = '';
      messageElement.className = '';
    } else {
      // No players found
      showMessage('No players found. Add players on the Match Entry page.', 'info');
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error.message);
    showMessage(`Error loading leaderboard: ${error.message}`, 'error');
  }
} 