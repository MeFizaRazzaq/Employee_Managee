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
  logOut: () => {
    return new Promise((resolve, reject) => {
    ipcRenderer.once('val', (event, data) => {
      resolve(data);
    });
    //console.log("Preload: ",user);
    ipcRenderer.send('send-to-out');
});
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
  empScreen: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('EmployeeScreen', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-employee-screen');
    });
  },
  requestEmpFromMain: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('AllEmp', (event, data) => {
        
    console.log("EMp1: ",data);
        resolve(data);
      });
      ipcRenderer.send('Emp-showquery');
    });
  },
  search: (val,opt) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('SearchedEmp', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('searched-employee', {val,opt});
    });
  },
  sendToMain: (id,data) => {
    console.log("EMp2: ",id,data);
    ipcRenderer.send('send-emp-main', {id,data});
  },
  sendToDel: (id) => {
    ipcRenderer.send('send-delemp-main', {id});
  },
  sendToUpd: (data) => {
    console.log("to update:",data[0]);
    ipcRenderer.send('send-updemp-main', {data});
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
  clientScreen: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('ClientScreen', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-client-screen');
    });
  },
  requestClientFromMain: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('AllClient', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('Client-showquery');
    });
  },
  search: (val,opt) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('Searchedclient', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('searched-client', {val,opt});
    });
  },
  sendToMain: (id,data) => {
    //console.log("Client in Preload: ",id,data);
    ipcRenderer.send('send-client-main', {id,data});
  },
  sendToDel: (id) => {
    console.log("Client to del: ",id);
    ipcRenderer.send('send-delcli-main', {id});
  },
  sendToUpd: (data) => {
    console.log("to update:",data);
    ipcRenderer.send('send-updcli-main', {data});
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


//send caommand to create new all employee screen
contextBridge.exposeInMainWorld('EmployeeeScreen', {
  // Function to request data from the main process
  numProjects: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('ProjectNumber', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-Projects');
    });
  },
  userinfo:() => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('user-info', (event, data) => {
        //console.log("user info in preload",data);
        resolve(data);
      });
      ipcRenderer.send('show-user');
    });
  },
  notice:(g) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('notice-info', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('send-notice',{g});
    });
  },
  getNotices:() => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('all-notice', (event, data) => {
        console.log("in preload: ",data);
        resolve(data);
      });
      ipcRenderer.send('notice');
    });
  },
});

// Expose an API to get data from Application Management table
contextBridge.exposeInMainWorld('AppAPI', {
  AppScreen: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('ApplicationScreen', (event, data) => {
        resolve(data);
      });
      ipcRenderer.send('show-application-screen');
    });
  },
  requestAppFromMain: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('AllApp', (event, data) => {
        //console.log("APp in rendered:",data);
        resolve(data);
      });
      ipcRenderer.send('App-showquery');
    });
  },
  sendToMain: (id,status) => {
    ipcRenderer.send('send-app-main', {id,status});
  },
  search: (data) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('SearchedApp', (event, d) => {
        resolve(d);
      });
      ipcRenderer.send('searched-app', {data});
    });
  },
});

// Expose an API to get data from Application Management table
contextBridge.exposeInMainWorld('AttAPI', {
  AttScreen: () => {
    ipcRenderer.send('show-attendance-screen');
  },
  search: (data) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('SearchedAtt', (event, d) => {
        resolve(d);
      });
      ipcRenderer.send('searched-att', {data});
    });
  },
  requestAttFromMain: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('AllAtt', (event, data) => {
        //console.log("APp in rendered:",data);
        resolve(data);
      });
      ipcRenderer.send('Att-showquery');
    });
  },
});