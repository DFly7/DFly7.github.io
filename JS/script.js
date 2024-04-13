
// Import the Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jizmrczvocrrklokuhua.supabase.co';
const supabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem1yY3p2b2Nycmtsb2t1aHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NzYyOTYsImV4cCI6MjAyODQ1MjI5Nn0.1IDohWlAcuLG1KXTtAJNFmmFGivtdtbHBl2iL3cYq90');



let { data: People, error } = await supabase
  .from('People')
  .select('PersonID')
  console.log('Fetched data:', data);



// Fetch data from the table
async function fetchData2() {
   const { data, error } = await supabase
   .from('People')
   .select('Name');
   console.log('Fetched data:', data);
 }
 // Call the fetchData function to retrieve data
 fetchData2();


async function fetchData() {
   const { data: People, error } = await supabase
      .from('People')
      .select('PersonID')
      console.log('Fetched data:', data, People);
   
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