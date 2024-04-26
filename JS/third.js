import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient('https://jizmrczvocrrklokuhua.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem1yY3p2b2Nycmtsb2t1aHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NzYyOTYsImV4cCI6MjAyODQ1MjI5Nn0.1IDohWlAcuLG1KXTtAJNFmmFGivtdtbHBl2iL3cYq90')

// vehicle add
const plateNum = document.getElementById('rego');

const make = document.getElementById('make');

const model = document.getElementById('model');

const colour = document.getElementById('colour');

const owenername = document.getElementById('owner');

const outputV = document.getElementById('message');

const buttonV = document.getElementById("VADD");
buttonV.addEventListener("click", checkplate);


let VehicleDetail = [];
let ChildNodesAdd = [];


//create el
const button = document.createElement("button");
const ExpiryDate = document.createElement("label");
const LicenseNumber = document.createElement("label");
const DOB = document.createElement("label");
const Address = document.createElement("label");
const Name = document.createElement("label");
const id = document.createElement("label");

const Iin = document.createElement('input');
const Nin = document.createElement('input');
const Ain = document.createElement('input');
const Ein = document.createElement('input');
const Din = document.createElement('input');
const Lin = document.createElement('input');

const form = document.getElementById('form');


async function Vadd(id){
    for(let i=0; i<VehicleDetail.length; i++)
    {
        console.log("V detaols array", VehicleDetail[i]);
    }

    const { error } = await supabase
    .from('Vehicles')
    .insert({ VehicleID: VehicleDetail[0], Make: VehicleDetail[1],  Model: VehicleDetail[2], Colour: VehicleDetail[3], OwnerID: id})


    if(error)
    {
        console.error('Error inserting data:', error.message);
        return;
    }


    outputV.innerHTML = 'Vehicle added successfully';

    Iin.value = '';
    Nin.value = '';
    Ain.value = '';
    Ein.value = '';
    Din.value = '';
    Lin.value = '';

    plateNum.value = '';
    make.value = '';
    model.value = '';
    colour.value = '';
    owenername.value = '';
    
    for(let i=0; i<ChildNodesAdd.length; i++)
    {
        console.log(ChildNodesAdd[i]);
        form.removeChild(ChildNodesAdd[i]);
    }
    VehicleDetail = [];
    ChildNodesAdd = [];
}

async function checkplate()
{
    outputV.innerHTML = '';

    console.log('hello');
    const { data, error } = await supabase
    .from('Vehicles')
    .select()
    .eq('VehicleID', plateNum.value);

    console.log(data);

    if(data.length != 0)
    {
        outputV.innerHTML = 'Error';
        return;
    }

    checkOwner();

    return;

}

async function checkOwner(){
    outputV.innerHTML = '';

    if(plateNum.Num == '' || make.value == '' || model.value == 0 || colour.value == '' || owenername.value == '')
    {
        outputV.innerHTML = 'Error';
        return;
    }

    VehicleDetail.push(plateNum.value);
    VehicleDetail.push(make.value);
    VehicleDetail.push(model.value);
    VehicleDetail.push(colour.value);
    VehicleDetail.push(owenername.value);

    const { data, error } = await supabase
    .from('People')
    .select('PersonID')
    .eq('Name', owenername.value);

    if(error)
    {
        console.error('Error fetching data:', error.message);
        return;
    }

    if(data.length == 0)
    {
        addperson();
        return;
    }

    let id = data[0]['PersonID'];

    Vadd(id);
}

function addperson(){
    // const form = document.getElementById('form');
    // let form = formO;

    id.textContent = 'ID Num';
    Iin.id = 'personid';
    id.appendChild(Iin);

    Name.textContent = 'Name';
    Nin.id = 'name';
    Name.appendChild(Nin);

    Address.textContent = 'Address';
    Ain.id='address';
    Address.appendChild(Ain);

    DOB.textContent = 'DOB';
    Din.id='dob'
    DOB.appendChild(Din);

    LicenseNumber.textContent = 'LicenseNumber';
    Lin.id='license';
    LicenseNumber.appendChild(Lin);

    ExpiryDate.textContent = 'ExpiryDate';
    Ein.id='expire';
    ExpiryDate.appendChild(Ein);

    button.id="submitP";
    button.type='button';
    button.textContent="Add owner";

    const Cid = form.appendChild(id);
    const CNa = form.appendChild(Name);
    const CAd = form.appendChild(Address);
    const Cdo = form.appendChild(DOB);
    const CLi = form.appendChild(LicenseNumber);
    const Cex = form.appendChild(ExpiryDate);
    const Cbu = form.appendChild(button);

    ChildNodesAdd.push(Cid);
    ChildNodesAdd.push(CNa);
    ChildNodesAdd.push(CAd);
    ChildNodesAdd.push(Cdo);
    ChildNodesAdd.push(CLi);
    ChildNodesAdd.push(Cex);
    ChildNodesAdd.push(Cbu);

    button.addEventListener("click", addPersonToDB);
}

async function addPersonToDB(){
    outputV.innerHTML = '';

    let id = document.getElementById('personid');
    let Pname = document.getElementById('name');
    let Add = document.getElementById('address');
    let lics = document.getElementById('license');
    let ex = document.getElementById('expire');
    let dob = document.getElementById('dob');

    if(id.value=='' || Pname.value=='' || Add.value=='' || dob.value == '' || lics.value == '' || ex.value == '')
    {
        outputV.innerHTML = 'Error';
        return;
    }

    const { error } = await supabase
    .from('People')
    .insert({ PersonID: id.value, Name: Pname.value,  Address: Add.value, DOB: dob.value, LicenseNumber: lics.value, ExpiryDate: ex.value})

    if(error)
    {
        console.error('Error insert data:', error);
        return;
    }

    Vadd(id.value);
}



