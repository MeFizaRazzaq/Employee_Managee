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



// Function to get new all emp screen from the main process
async function fetchEmpScreen() {
    try {
        const data = await EmployeeAPI.requestEmpFromMain();
        const emp=data;
        for (let i = 0; i < data.length; i++) {
            appendRecord(tablebdy,emp[i].firstName,emp[i].lastName,emp[i].PhoneNumber,emp[i].Gender);
        }        
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}
//appending the table rows
function appendRecord(body,fn,ln,p,g){

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
    statusCell.className = 'product-cell status-cell';
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status active';
    statusSpan.textContent = 'Active';
    statusCell.appendChild(statusSpan);

    // Append cells to the row
    productRow.appendChild(imageCell);
    productRow.appendChild(categoryCell);
    productRow.appendChild(salesCell);
    productRow.appendChild(stockCell);
    productRow.appendChild(priceCell);
    
    productRow.appendChild(statusCell);

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


/*

<table class="products-area-wrapper tableView">
            <tbody>
                <tr class="products-row">
                    <td class="product-cell image">
                        <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" alt="product">
                    </td>
                    <td class="product-cell category">Fiza</td>
                    <td class="product-cell sales">11</td>
                    <td class="product-cell status-cell">
                        <span class="status active">Active</span>
                    </td>
                    <td class="product-cell stock">36</td>
                    <td class="product-cell price">$560</td>
                </tr>
                <!-- You can add more rows as needed -->
            </tbody>
        </table>

*/