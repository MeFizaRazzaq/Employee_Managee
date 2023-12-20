document.getElementById("employeeDropdown").addEventListener("click", function() {
    var dropdownContent = document.getElementById("employeeDropdownContent");
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
  

  fetchTotalEmployee().then((data)=>{
    const totalEmp=document.getElementById('employee');
    totalEmp.innerHTML = data;
  });
  

  // Function to get data(total number of employees) request from the main process
async function fetchTotalEmployee() {
    try {
        const data = await EmployeeAPI.numEmpFromMain();
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//customers
  // Function to get data(total number of employees) request from the main process
  async function fetchTotalClient() {
    try {
        const data = await EmployeeAPI.numEmpFromMain();
        console.log('Data received in the renderer process:', data);
        return data;
    } catch (error) {
        console.error('Error fetching no.of total Clients from main process:', error);
    }
}