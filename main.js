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
      const result = await sql.query`SELECT * FROM Book`;
      console.log('Query result:');
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
      console.log('Validate Query result:',result);
      return result.recordset;
    }
    catch(err)
    {
      console.error('Error executing Validate query:', err);
    }
  }

  //create main form window
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

    //response to ipce senddata
    ipcMain.on('show-employee', (event,args) => {
      console.log("IN Main");
      TotalEmployee()
      .then(result => {
        Data=result[0].total_employees;
      console.log('Returned Author:',Data);
      event.reply('EmployeeNumber', Data);
      })
      .catch(error => {
      console.error('Error:', error);
      });
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
      console.log('Query result:',result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
    }
  }