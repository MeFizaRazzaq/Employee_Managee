//const { ftruncateSync } = require("node:original-fs");  
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

  // Function to get data(total number of employees) request from the main process
async function fetchTotalEmployee() {
    try {
        const data = await EmployeeAPI.numEmpFromMain();
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//navigate to all employees
const allemp=document.getElementById('allemp');
allemp.addEventListener('click',async()=>{
    fetchEmpScreen().then(()=>{
        console.log("Screenn created!");
    })
});

//navigate to Client Screen
const client=document.getElementById('allClient');
client.addEventListener('click',async()=>{
    fetchclientScreen().then(()=>{
        console.log("Screenn created!");
    })
});

//navigate to application screen
const application=document.getElementById("app");
application.addEventListener('click',async()=>{
    fetchAppScreen().then(()=>{
        console.log("Application Screenn created!");
    })
});

//navigate to attendence screen
//navigate to reports screen

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

//clientScreen
async function fetchclientScreen() {
    try {
        const data = await ClientAPI.clientScreen();
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

//fetch application managemnet screen
async function fetchAppScreen() {
    try {
        const data = await AppAPI.AppScreen();
        return data;
    } catch (error) {
        console.error('Error fetching data from main process:', error);
    }
}

async function logout(){
    //validate.authenticateUser()
    try {
        const data = await validate.authenticateUser();
        console.log('Data received after login:', data);
        return data;
    } catch (error) {
        console.error('Error fetching no.of total Clients from main process:', error);
    }
}

//access logout button
const logoutbtn=document.getElementById("logOut");
logoutbtn.addEventListener('click',async()=>{
    //validate.authenticateUser()
    try {
        //const data = await validate.authenticateUser();
        //console.log('Data received after login:', data);
        //return data;
        validate.logOut();
    } catch (error) {
        console.error('Error fetching no.of total Clients from main process:', error);
    }
})