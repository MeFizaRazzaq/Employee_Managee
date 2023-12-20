//const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require ('electron');

contextBridge.exposeInMainWorld('versions', {
    node: ()=> process.versions.node,
    chrome: ()=> process.versions.chrome,
    electron: ()=> process.versions.electron,
});

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options)=> Toastify(options).showToast(),
});
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel,data)=> ipcRenderer.send(channel,data),
    on: (channel,func)=> ipcRenderer.on(channel,(event,...args)=>func(...args))
});

contextBridge.exposeInMainWorld('path', {
    join: (...args)=> path.join(...args)
});

// Expose an API to the renderer process
contextBridge.exposeInMainWorld('myAPI', {
    // Function to request data from the main process
    requestDataFromMain: () => {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('test', (event, data) => {
          resolve(data);
        });
        ipcRenderer.send('sql-showquery');
      });
    },
  });
//send record to main
contextBridge.exposeInMainWorld('sendAPI', {
  sendToMain: (id,book,author) => {
    ipcRenderer.send('send-to-main', {id,book,author});
  },
});
//send id to delete a record
contextBridge.exposeInMainWorld('sendID', {
  sendToMainDel: (id) => {
    ipcRenderer.send('send-to-main-del', {id});
  },
});
//send-to-main-edit
contextBridge.exposeInMainWorld('editData', {
  sendToMainEdit: (id,book,author) => {
    ipcRenderer.send('send-to-main-edit', {id,book,author});
  },
});

//send-to-main-validate
contextBridge.exposeInMainWorld('validate', {
  authenticateUser: (user,pass) => {
    //console.log("Preload: ",user,pass);
    ipcRenderer.send('send-to-val', {user,pass});
  },
});

// Expose an API to get data from main
contextBridge.exposeInMainWorld('EmployeeAPI', {
  // Function to request data from the main process
  numEmpFromMain: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('EmployeeNumber', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-employee');
    });
  },
});

// Expose an API to get data from main-Client table
contextBridge.exposeInMainWorld('ClientAPI', {
  // Function to request data from the main process
  numClientFromMain: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('ClientNumber', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-clients');
    });
  },
});

// Expose an API to get data from main-Project details table
// Expose an API to get data from main-Project table
contextBridge.exposeInMainWorld('PDetailsAPI', {
  // Function to request data from the main process
  totalEarn: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('Earning', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-Earning');
    });
  },
});

// Expose an API to get data from main-Project table
contextBridge.exposeInMainWorld('ProjectAPI', {
  // Function to request data from the main process
  numProjects: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('ProjectNumber', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-Projects');
    });
  },
});