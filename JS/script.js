import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bmqwgtwnqwgjqfjorvkw.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcXdndHducXdnanFmam9ydmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjcwMTIsImV4cCI6MjA1NzIwMzAxMn0.D7SIm3vs2mzbL9Sj3Jm6dGQmD8epcD7GAuPpQlAyO2w"
const supabase = createClient(supabaseUrl, supabaseKey)

// peaople search
const name = document.getElementById('name');
const num = document.getElementById('license');

const output = document.getElementById('results');

const erorrTag = document.getElementById('message');

const button = document.querySelector("#people");
button.addEventListener("click", decide);

function decide()
{
  output.innerHTML = "";
  erorrTag.innerHTML = "";

  if((name.value == "" && num.value == "") || (name.value != "" && num.value != ""))
  {
    erorrTag.innerHTML = "Error";
    return;
  }

  if(name.value != "")
  {
    peopleSearchName();
  }

  if(num.value != "")
  {
    peopleSearchNum();
  }
}

async function peopleSearchNum(){

  const { data, error } = await supabase
    .from('People')
    .select()
    .eq('LicenseNumber', num.value)

  if (error) {
    console.log('error');
    console.error('Error fetching data:', error.message);
    erorrTag.innerHTML = "error fetching data found";
    return;
  }

  if(data.length == 0)
  {
    erorrTag.innerHTML = "No result found";
    num.value = '';
    return;
  }


  erorrTag.innerHTML = "Search succesful";

  const out = document.createElement("div");
  out.textContent = `${data[0]['Name']}, ${data[0]['Address']}, ${data[0]['DOB']}, ${data[0]['LicenseNumber']}, ${data[0]['ExpiryDate']}`;
  output.appendChild(out);
  console.log('Fetched data:', data);

  num.value = '';
  }



async function peopleSearchName(){

  const { data, error } = await supabase
    .from('People')
    .select()
    .ilike('Name', `%${name.value}%`)

  if (error) {
    console.log('error');
    console.error('Error fetching data:', error.message);
    erorrTag.innerHTML = "error fetching";
    return;
  }

  if (data.length == 0)
  {
    erorrTag.innerHTML = "No result found";
  }

  erorrTag.innerHTML = "Search successful";

  for(let i=0; i<data.length; i++){
    const out = document.createElement("div");
    out.textContent = `${data[i]['Name']}, ${data[i]['Address']}, ${data[i]['DOB']}, ${data[i]['LicenseNumber']}, ${data[i]['ExpiryDate']}`;
    output.appendChild(out);
    console.log('Fetched data:', data);
  }

  name.value = '';

}


async function addPlayer(name, elo) {
  const { data, error } = await supabase
    .from('players')
    .insert([{ name, elo }]);

  if (error) {
    console.error('Error adding player:', error.message);
    return;
  }

  console.log('Player added:', data);
}

// Example usage
addPlayer('John Doe', 1600);