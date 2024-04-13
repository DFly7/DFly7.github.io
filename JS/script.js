
// Import the Supabase client
import {createClient} from
   'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://jizmrczvocrrklokuhua.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchData() {
   const { data, error } = await supabase.from('People').select('*');
   
   if (error) {
     console.error('Error fetching data:', error.message);
     return null;
   }
   
   return data;
 }

 window.onload = async function() {
   const data = await fetchData();
   if (data) {
     // Output the fetched data
     console.log('Data fetched successfully:', data);
   } else {
     console.error('Failed to fetch data');
   }
 };
// const button = document.querySelector("button");
// button.addEventListener("click", updateName);
// function updateName() {
//   const name = prompt("Enter a new name");
//   button.textContent = `Player 1: ${name}`;
// }