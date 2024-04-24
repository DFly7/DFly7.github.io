import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient('https://jizmrczvocrrklokuhua.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem1yY3p2b2Nycmtsb2t1aHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NzYyOTYsImV4cCI6MjAyODQ1MjI5Nn0.1IDohWlAcuLG1KXTtAJNFmmFGivtdtbHBl2iL3cYq90')

// Fetch data from the table
async function fetchData2() {
   const { data, error } = await supabase.from('People').select();
   console.log(data);
 }
 // Call the fetchData function to retrieve data
//  fetchData2();


async function fetchData() {
   const { data, error } = await supabase
      .from('People')
      .select('PersonID')
      console.log('Fetched data:', data);
   
   if (error) {
     console.error('Error fetching data:', error.message);
     return null;
   }
   
   return data;
 }

// fetchData();


// peaople search
const name = document.getElementById('peopleName');
const num = document.getElementById('number');

const output = document.getElementById('output');

const erorrTag = document.getElementById('error');

const button = document.querySelector("#people");
button.addEventListener("click", decide);

function decide()
{
  output.innerHTML = "";
  erorrTag.innerHTML = "";

  if((name.value == "" && num.value == "") || (name.value != "" && num.value != ""))
  {
    erorrTag.innerHTML = "error";
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

  if (error || data === null) {
    console.log('error');
    console.error('Error fetching data:', error.message);
    erorrTag.innerHTML = "error no found";
    return;
  }

 
  console.log('btuh');

  const out = document.createElement("div");
  out.textContent = `${data[0]['Name']}, ${data[0]['Address']}, ${data[0]['DOB']}, ${data[0]['LicenseNumber']}, ${data[0]['ExpiryDate']}`;
  output.appendChild(out);
  console.log('Fetched data:', data);
  }



async function peopleSearchName(){

  const { data, error } = await supabase
    .from('People')
    .select()
    .ilike('Name', `%${name.value}%`)

  if (error || data === null) {
    console.log('error');
    console.error('Error fetching data:', error.message);
    erorrTag.innerHTML = "error no found";
    return;
  }

  if (data === null)
  {
    console.log('nulll');
  }
  console.log('btuh');

  for(let i=0; i<data.length; i++){
    const out = document.createElement("div");
    out.textContent = `${data[i]['Name']}, ${data[i]['Address']}, ${data[i]['DOB']}, ${data[i]['LicenseNumber']}, ${data[i]['ExpiryDate']}`;
    output.appendChild(out);
    console.log('Fetched data:', data);
  }
}

//

// // vehicle seacrh
// const plate = document.getElementById('plate');

// const outputV = document.getElementById('outputV');

// const erorrTagV = document.getElementById('errorV');

// const buttonV = document.getElementById("Vsearch");
// buttonV.addEventListener("click", Vsearch);


// async function Vsearch(){

//   console.log('hi');


//   const { data, error } = await supabase
//     .from('Vehicle')
//     .select()
//     .eq('VehicleID', plate.value)

//   if (error || data === null) {
//     console.log('error');
//     console.error('Error fetching data:', error.message);
//     erorrTagV.innerHTML = "error no found";
//     return;
//   }

//   const out = document.createElement("div");
//   out.textContent = `${data[0]['VehicleID']}, ${data[0]['Make']}, ${data[0]['Model']}, ${data[0]['Colour']}`;
//   outputV.appendChild(out);
//   console.log('Fetched data:', data);

// }
// //

// vehcile add

//