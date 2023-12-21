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

  fetchTotalClient().then((data)=>{
    const totalClient= document.getElementById('customers');
    totalClient.innerHTML = data;
  })
  
  //Project
  fetchTotaProjects().then((data)=>{
    const total= document.getElementById('Project');
    total.innerHTML = data;
})

fetchTotalEarning().then((data)=>{
    const total= document.getElementById('earn');
    total.innerHTML = `$ ` +data;
})

//navigate to all employees
const allemp=document.getElementById('allemp');
allemp.addEventListener('click',async()=>{
    fetchEmpScreen().then(()=>{
        console.log("Screenn created!");
    })
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


  // Function to get data(total number of employees) request from the main process
  async function fetchTotalClient() {
    try {
        const data = await ClientAPI.numClientFromMain();
        //console.log('Data received in the renderer process:', data);
        return data;
    } catch (error) {
        console.error('Error fetching no.of total Clients from main process:', error);
    }
}

// Function to get data(total number of employees) request from the main process
async function fetchTotaProjects() {
    try {
        const data = await ProjectAPI.numProjects();
        //console.log('Data received in the renderer process:', data);
        return data;
    } catch (error) {
        console.error('Error fetching no.of total Clients from main process:', error);
    }
}

// Function to get data(total number of employees) request from the main process
async function fetchTotalEarning() {
    try {
        const data = await PDetailsAPI.totalEarn();
        //console.log('Data received in the renderer process:', data);
        return data;
    } catch (error) {
        console.error('Error fetching no.of total Clients from main process:', error);
    }
}

// Function to get new all emp screen from the main process
async function fetchEmpScreen() {
    try {
        const data = await EmployeeAPI.empScreen();
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}