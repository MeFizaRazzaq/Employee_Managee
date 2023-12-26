const { BrowserWindow, app, Menu, ipcMain, screen} = require('electron');
const path = require('path');
const url = require('url');
const sql = require('mssql');
const { start } = require('repl');
const electronReload = require('electron-reload');

//app.allowRendererProcessReuse = false; // Add this line

//electronReload(__dirname + '/main.js');

process.env.NODE_ENV = 'development';
// Import electron-reload only in development

if (process.env.NODE_ENV === 'development') {
  const electronReload = require('electron-reload');

  // Use electronReload with the appropriate settings
  electronReload(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
  });
}

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';

console.log("Hello World in main.js");
console.log(process.versions.node);

let win;
let Data;
//Function to create window
function createWindow() {
    win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
      preload: path.join(__dirname, 'Preload', 'preload.js'),
    }
  });
  //open devtool if in dev env
  if(isDev){
    win.webContents.openDevTools();
  }

  win.loadFile(path.join(__dirname, './Renderer/login.html'));

  // validation query
  ipcMain.on('send-to-val', (event, data) => {
    // Handle the data as needed
    //console.log("ON main-user: ",data);
    validateUser(data.user,data.pass)
    .then(result => {
      if(result==""){
        console.log("Undefined User or Password");
        //alertError("Incorrect User or Password")
      }
      else{
        console.log("Succesfully loged In",result);
        event.reply('val', result);
        //close current window
        win.close();
        if(result=="admin"){
          //new main window
          Dashboard(result);
        }else{
          EmployeeDash(result);
        }
        
        //end of else  
        }
          })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  // Connect to MS SQL Server
  const config = {
    user: 'fiza-Razzaq',
    password: 'Me_DB@1',
    server: 'DESKTOP-5KF684A',
    database: 'Employee_Management',
    port: 1433,
    options: {
      //encrypt: true, // Use this if you're on Windows Azure
      trustServerCertificate: true, // Ignore self-signed certificate
    },
  };

  sql.connect(config, (err) => {
    if (err) {
      console.error('Error connecting to MS SQL Server:', err);
    } else {
      console.log('Connected to MS SQL Server');
      // You can perform database operations here
    }
  });

  win.on('closed', () => {
    // Close the database connection when the app is closed
    //sql.close();
    win = null;
  });
}


//creat about window
function createAboutWindow(){
  const aboutWindow= new BrowserWindow({
    title: 'About Fav Book',
    width: 300,
    height: 300,
  });
  aboutWindow.loadFile(path.join(__dirname, './Renderer/about.html'));
}

//Display Template
const menuTemp=[
  {
    label: 'file',
    submenu:[
      {
        label: 'Quit',
        click:()=>app.quit(),
        accelerator: 'CmdOrCtrl+W'
      }
    ]
  },
  {
    label: app.name,
    submenu:[
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  },
];

//when app is ready
app.whenReady().then(()=>{
  createWindow();

  //Implement the display window
  const mainMenu =Menu.buildFromTemplate(menuTemp);
  Menu.setApplicationMenu(mainMenu);

  //if app is activated but we dont have window then create main window
  app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  }); 

  //check if your are on mac and darwin is you get when you r on mac
  app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
});

});

//execute query
async function executeQuery() {
    try {
      const result = await sql.query`SELECT * FROM Employees`;
      //console.log('Query result:',result);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  //insert data into sql
async function insertQuery(i,b,a){
  try{
    const result = await sql.query`insert into Book (ID,Author,Title)
    values (${i},${a},${b});`;
    return result;
  }
  catch(err)
  {
    console.error('Error executing Insert query:', err);
  }
}

  //delete data into sql
  async function deleteQuery(id){
    try{
      console.log('TO be Deleted', id);
      const result = await sql.query`delete from Book
      where id=${id}`;
      return result;
    }
    catch(err)
    {
      console.error('Error executing Insert query:', err);
    }
  }

  //edit query in sql
  async function editQuery(num,b,a){
    try{
      const result = await sql.query`UPDATE Book
      SET Author = ${a}, Title = ${b}
      WHERE ID=${num}`;
      return result;
    }
    catch(err)
    {
      console.error('Error executing Insert query:', err);
    }
  }

  //validation code
  async function validateUser(u,p){
    try{
      const result = await sql.query`SELECT e.Employee_Id, e.firstName, e.password, p.position_Name
      FROM Employees e
      RIGHT JOIN Positions p ON e.Employee_Id = p.Employee_Id
      WHERE e.firstName = ${u} AND e.password = ${p};      
      `;
      //console.log('Validate Query result:',result);
      if(result.recordset!=""){
        const person=result.recordset[0];
        console.log("Login Id: ",person.Employee_Id);
        const time = await sql.query`
        INSERT INTO EmployeeAttendance (Employee_Id, Date, Login_Time)
        VALUES (${person.Employee_Id}, CAST(GETDATE() AS DATE), CAST(GETDATE() AS TIME));
        `;
        return person.position_Name;
      }else if(result.recordset==""){
        console.error("INvalid Credential");
        return result.recordset;
      }
      
    }
    catch(err)
    {
      console.error('Error executing Validate query:', err);
    }
  }

  //create dashboard form window
  function Dashboard(r){
    // Create a new window for main dashboard

    // to create full size window
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    //creating a window
    const dashwin = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
        preload: path.join(__dirname, 'Preload', 'preload.js'),
      },
    });
  
    // Construct the path to form.html using __dirname
    dashwin.loadFile(path.join(__dirname, '/Renderer/dashboard.html'));
  
    // Open the DevTools in development
    if (process.env.NODE_ENV === 'development') {
      dashwin.webContents.openDevTools();
    }

    //response to ipc Total no. of Employees
    ipcMain.on('show-employee', (event,args) => {
      //console.log("IN Main");
      TotalEmployee()
      .then(result => {
        Data=result[0].total_employees;
      //console.log('Returned Author:',Data);
        event.reply('EmployeeNumber', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //response to ipc Total no. of Clients
    ipcMain.on('show-clients', (event,args) => {
      //console.log("IN Main");
      TotalClient()
      .then(result => {
        Data=result[0].total_clients;
        //console.log('Data in main:',Data);
        event.reply('ClientNumber', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //response to ipc Total no. of Projects
    ipcMain.on('show-Projects', (event,args) => {
      //console.log("IN Main");
      TotalProjects()
      .then(result => {
        Data=result[0].total_project;
        //console.log('Data in main:',Data);
        event.reply('ProjectNumber', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //response to ipc Total no. of Earning
    ipcMain.on('show-Earning', (event,args) => {
      //console.log("IN Main");
      TotalEarning()
      .then(result => {
        Data=result[0].total_earning;
        //console.log('Data in main:',Data);
        event.reply('Earning', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    ipcMain.on('show-employee-screen', (event,args) => {
      //console.log("IN Main");
      try {
        //Dashboard.close();
        AllEmployees();
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });
    //ClientScreen
    ipcMain.on('show-client-screen', (event,args) => {
      //console.log("IN Main");
      try {
        //Dashboard.close();
        ClientScreen();
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });
    //show-attendance-screen
    ipcMain.on('show-attendance-screen', (event,args) => {
      //console.log("IN Main");
      try {
        //Dashboard.close();
        AttendanceScreen();
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });
    //to set logout time
    ipcMain.on('send-to-out', (event,args) => {
      //console.log("IN Main");
      try {
        //Dashboard.close();
        setLogOut(r).then(()=>{
          dashwin.close();
        });
        
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });

    //ApplicationScreen
    ipcMain.on('show-application-screen', (event,args) => {
      //console.log("IN Main");
      try {
        //Dashboard.close();
        ApplicationScreen();
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });
  }

  async function TotalEmployee(){
    try {
      const result = await sql.query`SELECT COUNT(*) AS total_employees
      FROM Employees;`;
     //console.log('Query result:',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  async function TotalClient(){
    try {
      const result = await sql.query`SELECT COUNT(*) AS total_clients
      FROM Clients;`;
      //console.log('Query result:',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  async function TotalProjects(){
    try {
      const result = await sql.query`SELECT COUNT(*) AS total_project
      FROM Projects;`;
      //console.log('Query result:',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }
  //TotalEarning
  async function TotalEarning(){
    try {
      const result = await sql.query`SELECT SUM(Cost) as total_earning 
      FROM Project_Details;`;
      //console.log('Query result:',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }


  //creating Employees window
  function AllEmployees(){
    // Create a new window for main dashboard

    // to create full size window
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    //creating a window
    const dashwin = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
        preload: path.join(__dirname, 'Preload', 'preload.js'),
      },
    });
  
    // Construct the path to form.html using __dirname
    dashwin.loadFile(path.join(__dirname, '/Renderer/allEmployee.html'));
  
    // Open the DevTools in development
    if (process.env.NODE_ENV === 'development') {
      dashwin.webContents.openDevTools();
    }

    
    //response to ipc Total no. of Earning
    ipcMain.on('show-Earning', (event,args) => {
      //console.log("IN Main");
      TotalEarning()
      .then(result => {
        Data=result[0].total_earning;
        //console.log('Data in main:',Data);
        event.reply('Earning', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //response to all employee senddata
    ipcMain.on('Emp-showquery', (event,args) => {
      console.log("All Employee");
      executeQuery()
      .then(result => {
      Data=result;
      //console.log('Employee:',Data);
      event.reply('AllEmp', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //serach employee in the parameters passed on searched screen
    ipcMain.on('searched-employee', (event,data) => {
      console.log("Search Employee",data);
      SearchQuery(data.val,data.opt).then(result => {
        // Handle or use the result here if needed
        event.reply('SearchedEmp', result);
        console.log(result);
    }).catch(err => {
        console.error('Error from SearchQuery:', err);
    });
    });

    //to insert data
    ipcMain.on('send-emp-main', (event,data) => {
      //console.log("IN Main");
      try {
        insertEmployee(data);
        dashwin.reload();
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });

    // Get dataid to be deleted from index
    ipcMain.on('send-delemp-main', (event, data) => {
      DelRecord(data.id);
      dashwin.reload();
    });

    //getid to be update and calling update function
    ipcMain.on('send-updemp-main', (event, data) => {
      UpdRecord(data);
      dashwin.reload();
    });

  }

  async function SearchQuery(v,o){
    try {
      console.log('in query',v,o);
      const str=`
      SELECT * FROM Employees WHERE ${o} LIKE '${v}%';`;
      console.log("queryString,",str);
      const result = await sql.query(str);
      console.log('Query result:',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  async function insertEmployee(d){
    //send-emp-main
    try {
      const info=d.data;
      console.log('in query',info);
      const result = await sql.query`INSERT INTO Employees (Employee_Id, firstName, Adress_Strt, City, lastName, Adress_State, ZIP, Cnic, DOB, PhoneNumber, Gender, Email, Bank_Id, logIn_Time, logOut_Time, OfficeTime_Start, OfficeTime_End, Bonus, password) 
      VALUES (
        ${d.id},
        ${info.firstName},
        ${info.lastName},
        ${info.Adress_Strt},
        ${info.City},
        ${info.Adress_State},
        ${info.ZIP},
        ${info.Cnic},
        ${info.DOB},
        ${info.PhoneNumber},
        ${info.Gender},
        ${info.Email},
        ${info.Bank_Id},
        '09:00:00',
        '18:00:00',
        '17:00:00',
        '03:00:00',
        NULL,
        ${info.password}
    );`;
    return result;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  async function DelRecord(i){
    table="Employees";
    try {
      const result = await sql.query`DELETE FROM Employees
      WHERE Employee_Id = ${i};
      ;`;
    return result;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  async function UpdRecord(emp){
    //table="Employees";
    const data=emp.data;
    try {
      const result = await sql.query`UPDATE Employees
      SET 
      firstName  = ${data.firstName},
      lastName  = ${data.lastName},
      Adress_Strt  = ${data.Adress_Strt},
      City  = ${data.City},
      Adress_State  = ${data.Adress_State},
      ZIP  = ${data.ZIP},
      Cnic  = ${data.Cnic},
      DOB  = ${data.DOB},
      PhoneNumber  = ${data.PhoneNumber},
      Gender  = ${data.Gender},
      Email  = ${data.Email},
      Bank_Id  = ${data.Bank_Id},
      logIn_Time  = '09:00:00',
      logOut_Time  = '18:00:00',
      OfficeTime_Start  = '17:00:00',
      OfficeTime_End  = '03:00:00',
      Bonus  = NULL,
      password  = ${data.password}
      WHERE Employee_Id = ${data.empIdKey};`;
      console.log("Updated!!",data);
      return result;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }
  
    //creating Employees window
    function ClientScreen(){
      // Create a new window for main dashboard
  
      // to create full size window
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      //creating a window
      const clientwin = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
          preload: path.join(__dirname, 'Preload', 'preload.js'),
        },
      });
    
      // Construct the path to form.html using __dirname
      clientwin.loadFile(path.join(__dirname, '/Renderer/Client.html'));
    
      // Open the DevTools in development
      if (process.env.NODE_ENV === 'development') {
        clientwin.webContents.openDevTools();
      }

      //response to all employee senddata
    ipcMain.on('Client-showquery', (event,args) => { 
      //console.log("All Clients!");
      ClientQuery()
      .then(result => {
      Data=result;
      //console.log('Client:',Data);
      event.reply('AllClient', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //searched-employee
    //serach employee in the parameters passed on searched screen
    ipcMain.on('searched-client', (event,data) => {
      //console.log("Search Employee",data);
      SearchClient(data.val,data.opt).then(result => {
        // Handle or use the result here if needed
        event.reply('Searchedclient', result);
        console.log(result);
    }).catch(err => {
        console.error('Error from SearchQuery:', err);
    });
    });

    //to add aclient send-client-main
    ipcMain.on('send-client-main', (event, data) => {
      insertClient(data);
      console.log("CLient to insert: ",data);
      clientwin.reload();
    });

    //send-delcli-main
    ipcMain.on('send-delcli-main', (event, data) => {
      console.log("In Main to Del:",data.id);
      DelClient(data.id);
      clientwin.reload();
    });

    //update
    ipcMain.on('send-updcli-main', (event, data) => {
      UpdClient(data);
      console.log("CLient to insert: ",data);
      clientwin.reload();
    });

    }

    async function ClientQuery(){
      try {
        const result = await sql.query`SELECT * FROM Clients`;
        //console.log('Query result:',result);
        return result.recordset;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    }

    //search client
    async function SearchClient(v,o){
      try {
        console.log('in query',v,o);
        const str=`
        SELECT * FROM Clients WHERE ${o} LIKE '${v}%';`;
        console.log("queryString,",str);
        const result = await sql.query(str);
        console.log('Query result:',result.recordset);
        return result.recordset;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    }

    //insert client
    async function insertClient(d){
      //send-emp-main
      try {
        const info=d.data;
        console.log('in query',info);
        const result = await sql.query`INSERT INTO Clients (Client_Id,firstName,lastName,Adress_Strt,City,Adress_State,ZIP,CNIC,DOB,PhoneNumber,Email,Organization,No_Individuals
      ) 
        VALUES (
          ${d.id},
          ${info.firstName},
          ${info.lastName},
          ${info.Adress_Strt},
          ${info.City},
          ${info.Adress_State},
          ${info.ZIP},
          ${info.CNIC},
          ${info.DOB},
          ${info.PhoneNumber},
          ${info.Email},
          ${info.Organization},
          ${info.No_Individuals}
      );`;
      return result;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    }

    async function DelClient(i){
      //table="Employees";
      try {
        const result = await sql.query`DELETE FROM Clients
        WHERE Client_Id = ${i};`;
      return result;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    }
  
    async function UpdClient(d){
      //table="Employees";
      const info=d.data;
      try {
        const result = await sql.query`UPDATE Clients
        SET 
        firstName  = ${info.firstName},
        lastName  = ${info.lastName},
        Adress_Strt  = ${info.Adress_Strt},
        City  = ${info.City},
        Adress_State  = ${info.Adress_State},
        ZIP  = ${info.ZIP},
        CNIC  = ${info.CNIC},
        DOB  = ${info.DOB},
        PhoneNumber  = ${info.PhoneNumber},
        Email  = ${info.Email},
        Organization  = ${info.Organization},
        No_Individuals  = ${info.No_Individuals}
        WHERE Client_Id = ${info.clientIdKey};`;
        console.log("Updated!!",info);
        return result;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    }

    async function setLogOut(a){
      try {
        const result = await sql.query`
        UPDATE EmployeeAttendance
        SET Logout_Time = GETDATE()
        WHERE Employee_Id = ${a};`;
      return result;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    }

    //creating Employees window
  function ApplicationScreen(){
    // Create a new window for main dashboard

    // to create full size window
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    //creating a window
    const appwin = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
        preload: path.join(__dirname, 'Preload', 'preload.js'),
      },
    });
  
    // Construct the path to form.html using __dirname
    appwin.loadFile(path.join(__dirname, '/Renderer/application.html'));
  
    // Open the DevTools in development
    if (process.env.NODE_ENV === 'development') {
      appwin.webContents.openDevTools();
    }

    //response to all employee senddata
    ipcMain.on('App-showquery', (event,args) => {
      console.log("All Applications");
      Appshow()
      .then(result => {
      Data=result;
      //console.log('Employee:',Data);
      event.reply('AllApp', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //send-app-main
    ipcMain.on('send-app-main', (event, data) => {
      UpdStatus(data);
      appwin.reload();
    });
    //searched-app
    //serach employee in the parameters passed on searched screen
    ipcMain.on('searched-app', (event,data) => {
      //console.log("Search Employee",data);
      SearchApp(data).then(result => {
        // Handle or use the result here if needed
        event.reply('SearchedApp', result);
        console.log(result);
    }).catch(err => {
        console.error('Error from SearchQuery:', err);
    });
    });

    //to insert data
    ipcMain.on('send-emp-main', (event,data) => {
      //console.log("IN Main");
      try {
        insertEmployee(data);
        dashwin.reload();
      } catch (error) {
        console.error('Error fetching data from main process:', error);
      }
    });

    // Get dataid to be deleted from index
    ipcMain.on('send-delemp-main', (event, data) => {
      DelRecord(data.id);
      dashwin.reload();
    });

    //getid to be update and calling update function
    ipcMain.on('send-updemp-main', (event, data) => {
      UpdRecord(data);
      dashwin.reload();
    });

  }

  //Appshow
  async function Appshow(){
    try {
      const result = await sql.query`
      SELECT 
    e.firstName,
    a.Application_Id,
    a.Application_Type,
    a.Reason,
    a.Note,
    a.Apply_Date,
    a.From_Date,
    a.To_Date,
    a.No_Application,
    a.Application_Status,
    a.Employee_Id
FROM 
    Application_Form a
LEFT JOIN 
    Employees e ON a.Employee_Id = e.Employee_Id;
`;
      //console.log('Query result in Appshow(main):',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  //UpdStatus
  async function UpdStatus(d){
    try {
      const result = await sql.query`
      UPDATE Application_Form
      SET Application_Status = ${d.status}
      WHERE Application_Id = ${d.id};`;
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }
  //search query to generate report SearchApp
  //search client
  async function SearchApp(v){
    try {
      console.log('in query',v);
      const data=v.data;
      let sqlQuery = `SELECT e.firstName, a.*
      FROM Application_Form a
      LEFT JOIN Employees e ON a.Employee_Id = e.Employee_Id
      WHERE `;

    let conditions = [];

    // Check each field and add it to the conditions array if it's provided
    if (data.Application_Status!="All") {
        conditions.push(`a.Application_Status LIKE '${data.Application_Status}%'`);
    }
    if (data.Application_Type) {
        conditions.push(`a.Application_Type LIKE '${data.Application_Type}%'`);
    }
    if (data.firstName) {
        // Assuming you have a JOIN with the Employees table to get the first_name
        conditions.push(`e.firstName LIKE '${data.firstName}%'`);
    }

    // Join the conditions using 'AND' to form the WHERE clause
    sqlQuery += conditions.join(' AND ');

    // Execute the SQL query or pass it to your database layer
    console.log(sqlQuery); // For demonstration, logging the query to console
      const result = await sql.query(sqlQuery);
      console.log('Query result:',result.recordset);
      return result.recordset;
      
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

      //creating Employees window
  function AttendanceScreen(){
    // Create a new window for main dashboard

    // to create full size window
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    //creating a window
    const attwin = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
        preload: path.join(__dirname, 'Preload', 'preload.js'),
      },
    });
  
    // Construct the path to form.html using __dirname
    attwin.loadFile(path.join(__dirname, '/Renderer/attendance.html'));
  
    // Open the DevTools in development
    if (process.env.NODE_ENV === 'development') {
      attwin.webContents.openDevTools();
    }

    //response to all employee senddata
    ipcMain.on('Att-showquery', (event,args) => {
      console.log("All Applications");
      Attshow()
      .then(result => {
      Data=result;
      //console.log('Employee:',Data);
      event.reply('AllAtt', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    });

    //serach employee in the parameters passed on searched screen
    ipcMain.on('searched-att', (event,data) => {
      //console.log("Search Employee",data);
      SearchAtt(data).then(result => {
        // Handle or use the result here if needed
        event.reply('SearchedAtt', result);
        console.log(result);
    }).catch(err => {
        console.error('Error from SearchQuery:', err);
    });
    });
  }

  //Appshow
  async function Attshow(){
    try {
      const result = await sql.query`
      EXEC GetAttendanceReport;
      `;
      //console.log('Query result in Appshow(main):',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  //SearchAtt(data)
  async function SearchAtt(v){
    try {
      
      const date = new Date();
      const data=v.data;
      const month = date.getMonth() + 1;
      let result = `EXEC GetAttendanceReport @firstNamePattern = '${data}%',@month=${month};  `
      const query=`EXEC GetAttendanceReport @firstNamePattern = '${data}%',@month=${month};`;
      console.log('in query',data,month);
      console.log('query',query);
      console.log('Query result:',result.recordset);
      return result.recordset;
      
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }

  ///EmployeeDash
      //creating Employees window
      function EmployeeDash(v){
        // Create a new window for main dashboard
    
        // to create full size window
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        //creating a window
        const empwin = new BrowserWindow({
          width: width,
          height: height,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
            preload: path.join(__dirname, 'Preload', 'preload.js'),
          },
        });
      
        // Construct the path to form.html using __dirname
        empwin.loadFile(path.join(__dirname, '/Renderer/EmployeeDash.html'));
      
        // Open the DevTools in development
        if (process.env.NODE_ENV === 'development') {
          empwin.webContents.openDevTools();
        }
    
        //response to all employee senddata
        ipcMain.on('Att-showquery', (event,args) => {
          console.log("All Applications");
          Attshow()
          .then(result => {
          Data=result;
          //console.log('Employee:',Data);
          event.reply('AllAtt', Data);
          })
          .catch(error => {
          console.error('Error:', error);
          });
        });
    
        //serach employee in the parameters passed on searched screen
        ipcMain.on('searched-att', (event,data) => {
          //console.log("Search Employee",data);
          SearchAtt(data).then(result => {
            // Handle or use the result here if needed
            event.reply('SearchedAtt', result);
            console.log(result);
        }).catch(err => {
            console.error('Error from SearchQuery:', err);
        });
        });
      }