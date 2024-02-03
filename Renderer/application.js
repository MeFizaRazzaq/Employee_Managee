const tablebdy=document.getElementById('tbody');
const searchInput = document.getElementById('search');  // Get the input element
const dropValue = document.getElementById('dropSelect');    //dropdown value

//get all employee records
fetchAppScreen();

// Function to get new all emp screen from the main process
async function fetchAppScreen() {
    //console.log("app:");
    try {
        const data = await AppAPI.requestAppFromMain();
        const app=data;
        //console.log("app:",app);
        for (let i = 0; i < data.length; i++) {
            appendRecord(tablebdy,app[i]);
            console.log("app:",app[i]);
        }        
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//appending the table rows
function appendRecord(body,data){
    var status="Pending";
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
    categoryCell.textContent = 'firstName';

    const salesCell = document.createElement('td');
    salesCell.className = 'product-cell sales';
    salesCell.textContent = data.firstName;

    const stockCell = document.createElement('td');
    stockCell.className = 'product-cell stock';
    stockCell.textContent = data.Application_Type;

    const priceCell = document.createElement('td');
    priceCell.className = 'product-cell price';
    priceCell.textContent = data.Reason;

    //calcute no of days
    const days=calculateDays(data.To_Date,data.From_Date);
    
    const statusCell = document.createElement('td');
    statusCell.className = 'product-cell action-cell';
    statusCell.textContent = days;

    //accepted Cell
    const acceptCell = document.createElement('td');
    acceptCell.className = 'product-cell action-cell';
    const acpSpan = document.createElement('span');
    acpSpan.className = 'empbtn update';
    acpSpan.id= 'updbtn';
    acpSpan.textContent = 'Accepted';
    acceptCell.appendChild(acpSpan);
    //rejected cell
    const rejectCell = document.createElement('td');
    rejectCell.className = 'product-cell action-cell';
    const rejctSpan = document.createElement('span');
    rejctSpan.className = 'empbtn delete';
    rejctSpan.id= 'updbtn';
    rejctSpan.textContent = 'Rejected';
    rejectCell.appendChild(rejctSpan);
    //add edit and delete button
    const actionCell = document.createElement('td');
    actionCell.className = 'product-cell action-cell';
    const updSpan = document.createElement('span');
    updSpan.className = 'empbtn update';
    updSpan.id= 'updbtn';
    updSpan.textContent = 'Accept';
    actionCell.appendChild(updSpan);
    const delSpan = document.createElement('span');
    delSpan.className = 'empbtn delete';
    delSpan.id= 'delbtn';
    delSpan.textContent = 'Reject';
    actionCell.appendChild(delSpan);
    //add event listner to del btn
    delSpan.addEventListener('click',()=>{
        status="Rejected";
        changeStatus(data.Application_Id,status);
    });
    //add event listner to update
    updSpan.addEventListener('click',()=>{
        status="Approved";
        changeStatus(data.Application_Id,status);
    });
    console.log("Status:",data.Application_Status);
    if(data.Application_Status=="Pending"){
        productRow.appendChild(salesCell);
        productRow.appendChild(stockCell);
        productRow.appendChild(priceCell);
        productRow.appendChild(statusCell);
        productRow.appendChild(actionCell);
    }
    else if(data.Application_Status=='Approved'){
        productRow.appendChild(salesCell);
        productRow.appendChild(stockCell);
        productRow.appendChild(priceCell);
        productRow.appendChild(statusCell);
        productRow.appendChild(acceptCell);
    }
    else if(data.Application_Status=='Rejected'){
        productRow.appendChild(salesCell);
        productRow.appendChild(stockCell);
        productRow.appendChild(priceCell);
        productRow.appendChild(statusCell);
        productRow.appendChild(rejectCell);
    }

    // Append the row to the tbody
    body.appendChild(productRow);
}

//send employee data to main
function changeStatus(i,s){
    try {
        console.log("status to be changed: ",i,s);
        AppAPI.sendToMain(i,s);
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//calculateDays(t,f)
function calculateDays(t,f){
    // Convert the input values to Date objects
    let fromDate = new Date(f);
    let toDate = new Date(t);

    // Calculate the time difference in milliseconds
    let timeDifference = toDate.getTime() - fromDate.getTime();

    // Calculate the number of days
    let days = Math.floor(timeDifference / (1000 * 3600 * 24));

    return days;
}

document.getElementById('searchButton').addEventListener('click', function() {
    // Collect input values
    let applicationStatus = document.getElementById('dropSelect').value;
    let applicationType = document.getElementById('applicationType').value.trim();
    let employeeName = document.getElementById('employeeName').value.trim();
    
    // Create a data array
    let data = {
        Application_Status: applicationStatus,
        Application_Type: applicationType,
        firstName: employeeName
    };

    
    searchApp(data);

    // You can now use the 'data' array to fetch or process data as needed
    console.log(data);
});

//seraching the employee list
async function searchApp(val){
    try {
        const data = await AppAPI.search(val);
        const emp=data;
        clearDivContent('tbody');
        for (let i = 0; i < data.length; i++) {
            appendRecord(tablebdy,emp[i]);
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
/*

//addclient

//add employee screen
const addpop=document.getElementById('addClientPopup');
const addclient=document.getElementById('addclient');
const addbtn=document.getElementById('addbtncli');
const closePopup = document.getElementById('closePopup');
addclient.addEventListener('click',function(e) {
    e.preventDefault(); // Prevent the default link behavior
    addpop.style.display = 'grid';
    //form submittion
    addbtn.addEventListener('click',function(e){
        e.preventDefault();
        // Get all the form input elements
        const form = document.getElementById('clientForm');
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
});

// Close the popup when the close button is clicked
closePopup.addEventListener('click', function() {
    addClientPopup.style.display = 'none';
});

// Add an event listener to the input element
searchInput.addEventListener('input', function() {
    // Get the value entered into the input
    const inputValue = searchInput.value;
    var dropOpt=dropValue.value;
    if(dropOpt=="First Name"){
        dropOpt="firstName";
    }else if(dropOpt=="Last Name"){
        dropOpt="lastName";
    }else if(dropOpt=="Organization"){
        dropOpt="Organization";
    }
    searchClient(inputValue,dropOpt);
    // Log the value (or perform any other action)
    console.log(inputValue);
});





//generate ID for each employee
async function getID(){
    try {
        const data = await ClientAPI.requestClientFromMain();
        var lastID=0;
        console.log("getID is working!",data[data.length-1]);
        if(data.length==0){
            var lastID=1;
            return lastID;
        }else{
            lastID=data[data.length-1].Client_Id;
            //let numericPart = parseInt(lastID.substring(1), 10);
            lastID++;
            // Convert the incremented number back to string and pad with zeros
            return lastID;
        }        
        
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//function to update employee
async function UpdateClient(d){
    try {
        addpop.style.display = 'grid';
        populateFormFields(d);
        addbtn.innerHTML=`Update Employee`;
        
        addbtn.addEventListener('click',function(e){
            e.preventDefault();
            // Get all the form input elements
        const form = document.getElementById('clientForm');
        const formData = new FormData(form);

        // Convert FormData to a plain object
        const data = {};
        data.clientIdKey=d.Client_Id;
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        //console.log("in emp.js",data);
        ClientAPI.sendToUpd(data);
        });
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//delete the employee record
function delClient(i){
    try {
        ClientAPI.sendToDel(i);
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}


//to fill the fields in edit option
function populateFormFields(d) {
    for (let key in d) {
        if (d.hasOwnProperty(key)) {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                // Handle date input
                if (element.type === 'date') {
                    console.log(`Setting date for ${key}: ${d[key]}`);
                    //element.value = d[key];
                    const dateObj = d[key];

                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
                    const day = String(dateObj.getDate()).padStart(2, '0');

                    const formattedDate = `${year}-${month}-${day}`;
                    element.value=formattedDate;
                }
                // Handle radio buttons
                else if (element.type === 'radio') {
                    const radioGroup = document.querySelectorAll(`[name="${key}"]`);
                    for (let radio of radioGroup) {
                        if (radio.value === d[key]) {
                            radio.checked = true;
                            break;
                        }
                    }
                }
                // Handle other input types
                else {
                    element.value = d[key];
                }
            }
        }
    }
}

*/