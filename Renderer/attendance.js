const tablebdy=document.getElementById('tbody');
const searchInput = document.getElementById('employeeName');  // Get the input element
const dropValue = document.getElementById('dropSelect');    //dropdown value


//get all attendance records
fetchAttScreen();

// Function to get new all emp screen from the main process
async function fetchAttScreen() {
    try {
        const data = await AttAPI.requestAttFromMain();
        const att=data;
        for (let i = 0; i < data.length; i++) {
            appendRecord(tablebdy,att[i]);
            console.log("attendace:",att[i]);
        }        
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

// Add an event listener to the input element
searchInput.addEventListener('input', function() {
    // Get the value entered into the input
    const inputValue = searchInput.value;
    searchClient(inputValue);
    // Log the value (or perform any other action)
    console.log(inputValue);
});

//appending the table rows
function appendRecord(body,data){
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
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
    categoryCell.textContent = data.firstName;

    const salesCell = document.createElement('td');
    salesCell.className = 'product-cell sales';
    salesCell.textContent = data.lastName;

    const stockCell = document.createElement('td');
    stockCell.className = 'product-cell stock';
    stockCell.textContent = data.DaysAbsent;

    const priceCell = document.createElement('td');
    priceCell.className = 'product-cell price';
    priceCell.textContent = data.DaysPresent;

    const per = (data.DaysPresent / 30) * 100;
    const formattedPer = per.toFixed(2);  // This will round and format to 2 decimal places

    const statusCell = document.createElement('td');
    statusCell.className = 'product-cell action-cell';
    statusCell.textContent = formattedPer + '%';

    const date = new Date();
    const monthIndex = date.getMonth() + 1;
    const actionCell = document.createElement('td');
    actionCell.className = 'product-cell action-cell';
    actionCell.textContent = months[monthIndex-1];
    //add edit and delete button
    // Append cells to the row
    //productRow.appendChild( imageCell);
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
async function searchClient(val){
    try {
        const data = await AttAPI.search(val);
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

/*


//addclient

//add client screen
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





//send employee data to main
function addEmp(i,d){
    try {
        console.log("Client passed to addEmp: ",i,d);
        ClientAPI.sendToMain(i,d);
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

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


function clearDivContent(divId) {
    // Get the reference to the div
    const div = document.getElementById(divId);

    // Remove all child elements of the div
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}
