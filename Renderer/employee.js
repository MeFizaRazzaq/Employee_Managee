const tablebdy=document.getElementById('tbody');
const searchInput = document.getElementById('search');  // Get the input element
const dropValue = document.getElementById('dropSelect');    //dropdown value
//get all employee records
fetchEmpScreen();


// Add an event listener to the input element
searchInput.addEventListener('input', function() {
    // Get the value entered into the input
    const inputValue = searchInput.value;
    var dropOpt=dropValue.value;
    if(dropOpt=="First Name"){
        dropOpt="firstName";
    }else if(dropOpt=="Last Name"){
        dropOpt="lastName";
    }else if(dropOpt=="DOB"){
        dropOpt="DOB";
    }else if(dropOpt=="City"){
        dropOpt="City";
    }
    searchEmployee(inputValue,dropOpt);
    // Log the value (or perform any other action)
    console.log(inputValue);
});


//add employee screen
const addpop=document.getElementById('addEmployeePopup');
const addemp=document.getElementById('addemp');
const closePopup = document.getElementById('closePopup');
addemp.addEventListener('click',function(e) {
    e.preventDefault(); // Prevent the default link behavior
    addpop.style.display = 'grid';
});

// Close the popup when the close button is clicked
closePopup.addEventListener('click', function() {
    addEmployeePopup.style.display = 'none';
});

//form submittion
const addbtn=document.getElementById('addbtn');
addbtn.addEventListener('click',function(e){
    e.preventDefault();
    // Get all the form input elements
    const form = document.getElementById('employeeForm');
    const formData = new FormData(form);

    // Convert FormData to a plain object
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    console.log("d in js:",data);
    getID().then((d)=>{
        console.log("id in js:",d);
        addEmp(d,data);
    }).catch((error) => {
        console.error("Error fetching ID:", error);
    });

});



//adding a const to update emloyee
/*const UpdateEmp=document.getElementById('updemp');
UpdateEmp.addEventListener('click',async()=>{
    //addpop.style.display = 'grid';
    //addbtn.innerHTML=`Update`;
    //UpdateEmp(id).then(()=>{
        //console.log("Screenn created!");
    //})
});
*/


// Function to get new all emp screen from the main process
async function fetchEmpScreen() {
    try {
        const data = await EmployeeAPI.requestEmpFromMain();
        const emp=data;
        for (let i = 0; i < data.length; i++) {
            appendRecord(tablebdy,emp[i].Employee_Id,emp[i].firstName,emp[i].lastName,emp[i].PhoneNumber,emp[i].Gender);
        }        
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}
//appending the table rows
function appendRecord(body,i,fn,ln,p,g){

    // Create a row element for the product
    const productRow = document.createElement('tr');
    productRow.className = 'products-row';

    // Create individual cells for the product
    const imageCell = document.createElement('td');
    imageCell.className = 'product-cell image';
    const image = document.createElement('img');
    image.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';
    image.alt = 'product';
    imageCell.appendChild(image);

    const categoryCell = document.createElement('td');
    categoryCell.className = 'product-cell category';
    categoryCell.textContent = fn;

    const salesCell = document.createElement('td');
    salesCell.className = 'product-cell sales';
    salesCell.textContent = ln;

    const stockCell = document.createElement('td');
    stockCell.className = 'product-cell stock';
    stockCell.textContent = g;

    const priceCell = document.createElement('td');
    priceCell.className = 'product-cell price';
    priceCell.textContent = p;

    
    const statusCell = document.createElement('td');
    statusCell.className = 'product-cell action-cell';
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status active';
    statusSpan.textContent = 'Active';
    statusCell.appendChild(statusSpan);

    //add edit and delete button
    const actionCell = document.createElement('td');
    actionCell.className = 'product-cell action-cell';
    const updSpan = document.createElement('span');
    updSpan.className = 'empbtn update';
    updSpan.id= 'updbtn';
    updSpan.textContent = 'Update';
    actionCell.appendChild(updSpan);
    const delSpan = document.createElement('span');
    delSpan.className = 'empbtn delete';
    delSpan.id= 'delbtn';
    delSpan.textContent = 'Delete';
    actionCell.appendChild(delSpan);
    //add event listner to del btn
    delSpan.addEventListener('click',()=>{
        delEmpl(i);
    })
    // Append cells to the row
    productRow.appendChild(imageCell);
    productRow.appendChild(categoryCell);
    productRow.appendChild(salesCell);
    productRow.appendChild(stockCell);
    productRow.appendChild(priceCell);
    productRow.appendChild(statusCell);
    productRow.appendChild(actionCell);

    // Append the row to the tbody
    body.appendChild(productRow);
}
//seraching the employee list
async function searchEmployee(fn,op){
    try {
        const data = await EmployeeAPI.search(fn,op);
        const emp=data;
        clearDivContent('tbody');
        for (let i = 0; i < data.length; i++) {
            appendRecord(tablebdy,emp[i].firstName,emp[i].lastName,emp[i].PhoneNumber,emp[i].Gender);
        }        
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

function clearDivContent(divId) {
    // Get the reference to the div
    const div = document.getElementById(divId);

    // Remove all child elements of the div
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}


//send employee data to main
function addEmp(i,d){
    try {
        EmployeeAPI.sendToMain(i,d);
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//function to update employee
async function UpdateEmployee(d){
    
}

//generate ID for each employee
async function getID(){
    try {
        const data = await EmployeeAPI.requestEmpFromMain();
        var lastID="";
        console.log("getID is working!",data[data.length-1]);
        if(data.length==0){
            var lastID="E0001";
            return lastID;
        }else{
            lastID=data[data.length-1].Employee_Id;
            let numericPart = parseInt(lastID.substring(1), 10);
            numericPart++;
            // Convert the incremented number back to string and pad with zeros
            return 'E' + String(numericPart).padStart(3, '0');
        }        
        
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//delete the employee record
function delEmpl(i){
    try {
        EmployeeAPI.sendToDel(i);
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}