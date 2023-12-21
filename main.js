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
        console.log("Succesfully loged In");
        //close current window
        win.close();
        //new main window
        Dashboard();
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
      const result = await sql.query`SELECT firstName, lastName, password
      FROM Employees
      WHERE firstName = 'Fahad' AND password = 'admin@123';      
      `;
      //console.log('Validate Query result:',result);
      if(result.recordset!=""){
        const time = await sql.query`
        UPDATE Employees
        SET logIn_Time = GETDATE()
        WHERE password = 'admin@123'; 
        `;
      }
      return result.recordset;
    }
    catch(err)
    {
      console.error('Error executing Validate query:', err);
    }
  }

  //create dashboard form window
  function Dashboard(){
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
    /*
      //response to ipce senddata
      ipcMain.on('sql-showquery', (event,args) => {
        console.log("IN Main");
        executeQuery()
        .then(result => {
        Data=result;
        console.log('Returned Author:');
        event.reply('test', Data);
        })
        .catch(error => {
        console.error('Error:', error);
        });
      });

         // Get data from index
    ipcMain.on('send-to-main', (event, data) => {
      // Handle the data as needed
      insertQuery(data.id,data.book,data.author);
    });

    // Get dataid to be deleted from index
    ipcMain.on('send-to-main-del', (event, data) => {
      console.log('DEleted');
      // Handle the data as needed
      deleteQuery(data.id);
    });
    
    //edit data
    ipcMain.on('send-to-main-edit', (event, data) => {
      console.log('Edit');
      // Handle the data as needed
      editQuery(data.id,data.book,data.author);
    });
    */
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
  //create main form window
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
    
    //
    
    /*

    ipcMain.on('searched-employee', (event, data) => {
      // Handle the data as needed
      //console.log("ON main-user: ",data);
      validateUser(data.user,data.pass)
      .then(result => {
        if(result==""){
          console.log("Undefined User or Password");
          //alertError("Incorrect User or Password")
        }
        else{
          console.log("Succesfully loged In");
          }
            })
      .catch(error => {
        console.error('Error:', error);
      });
    });
      //response to ipce senddata
      ipcMain.on('sql-showquery', (event,args) => {
        console.log("IN Main");
        executeQuery()
        .then(result => {
        Data=result;
        console.log('Returned Author:');
        event.reply('test', Data);
        })
        .catch(error => {
        console.error('Error:', error);
        });
      });

         // Get data from index
    ipcMain.on('send-to-main', (event, data) => {
      // Handle the data as needed
      insertQuery(data.id,data.book,data.author);
    });

    // Get dataid to be deleted from index
    ipcMain.on('send-to-main-del', (event, data) => {
      console.log('DEleted');
      // Handle the data as needed
      deleteQuery(data.id);
    });
    
    //edit data
    ipcMain.on('send-to-main-edit', (event, data) => {
      console.log('Edit');
      // Handle the data as needed
      editQuery(data.id,data.book,data.author);
    });
    
    */
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