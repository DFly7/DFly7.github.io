import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

// Supabase configuration
// In a production environment, these would be loaded from environment variables
// For client-side JavaScript, we need to include them directly
// IMPORTANT: For a production application, use a more secure approach
const supabaseUrl = 'https://bmqwgtwnqwgjqfjorvkw.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcXdndHducXdnanFmam9ydmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjcwMTIsImV4cCI6MjA1NzIwMzAxMn0.D7SIm3vs2mzbL9Sj3Jm6dGQmD8epcD7GAuPpQlAyO2w"

// Note: In a real-world application with a server component, you would:
// 1. Store these values in environment variables on the server
// 2. Create API endpoints that make the Supabase calls
// 3. Call those endpoints from your client-side code
// This would prevent exposing your Supabase key in client-side code

console.log('Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey)

// Verify Supabase connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connection successful');
  }
}).catch(err => {
  console.error('Failed to verify Supabase connection:', err);
});

// ELO calculation constants
const K_FACTOR = 32; // Standard K-factor for ELO calculations

/**
 * Calculate new ELO ratings based on match results
 * @param {number} winnerElo - Average ELO of winning team
 * @param {number} loserElo - Average ELO of losing team
 * @returns {Object} - Object containing ELO changes
 */
function calculateEloChange(winnerElo, loserElo) {
  // Calculate expected outcome
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));
  
  // Calculate ELO change
  const winnerChange = Math.round(K_FACTOR * (1 - expectedWinner));
  const loserChange = Math.round(K_FACTOR * (0 - expectedLoser));
  
  return {
    winnerChange,
    loserChange
  };
}

export { supabase, calculateEloChange }; 