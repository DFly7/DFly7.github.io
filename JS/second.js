import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient('https://jizmrczvocrrklokuhua.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem1yY3p2b2Nycmtsb2t1aHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NzYyOTYsImV4cCI6MjAyODQ1MjI5Nn0.1IDohWlAcuLG1KXTtAJNFmmFGivtdtbHBl2iL3cYq90')

// vehicle seacrh
const plate = document.getElementById('rego');

const outputV = document.getElementById('results');

const erorrTagV = document.getElementById('message');

const buttonV = document.getElementById("Vsearch");
buttonV.addEventListener("click", Vsearch);


async function Vsearch(){

  outputV.innerHTML='';
  erorrTagV.innerHTML='';

  if(plate.value == '')
  {
    erorrTagV.innerHTML='Error';
    return;
  }

  const { data, error } = await supabase
    .from('Vehicles')
    .select()
    .eq('VehicleID', plate.value)

  if (error) {
    console.log('error');
    console.error('Error fetching data:', error.message);
    erorrTagV.innerHTML = "error fetching data";
    return;
  }

  if(data.length == 0)
  {
    erorrTagV.innerHTML = "No result found";
    return;
  }

  erorrTagV.innerHTML = "Search successful";


  const out = document.createElement("div");
  out.textContent = `${data[0]['VehicleID']}, ${data[0]['Make']}, ${data[0]['Model']}, ${data[0]['Colour']}`;
  outputV.appendChild(out);
  console.log('Fetched data:', data);

  OwnerSearch(data);
}


async function OwnerSearch(data2){
  plate.value = '';

    const { data, error } = await supabase
    .from('People')
    .select()
    .eq('PersonID', data2[0]['OwnerID']);

    if (error) {
    console.log('error');
    console.error('Error fetching data:', error.message);
    return;
    }

    console.log('OwnerData:', data);

    const out = document.createElement("div");
    out.textContent = `${data[0]['Name']}, ${data[0]['LicenseNumber']}`;
    outputV.appendChild(out);

}
//
