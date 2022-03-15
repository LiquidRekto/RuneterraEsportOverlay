const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const settings = require('electron-settings');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const express = require('express');

const eApp = express();
const server = require('http').createServer(eApp);
var io = new Server(server);

var APP_PREFERENCES = JSON.parse(fs.readFileSync(path.join(__dirname, 'cfg/config.json')));
var DATA_SAVES = JSON.parse(fs.readFileSync(path.join(__dirname, 'cfg/datasaves.json')));




function UpdateSettings() {


  var json = JSON.stringify(APP_PREFERENCES, null, 4);
  console.log(json);
  
  fs.writeFileSync(path.join(__dirname, 'cfg/config.json'), json);

}

function UpdateData() {
  var json = JSON.stringify(DATA_SAVES, null, 4);
  console.log(json);
  
  fs.writeFileSync(path.join(__dirname, 'cfg/datasaves.json'), json);
}

// PRE-CONFIG
if(!settings.has('SAVEBOX_DontAskAgain')){
  settings.set('SAVEBOX_DontAskAgain', false);
}



//



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

var port = Number(process.env.PORT || 3000);

let WIN;

function SaveData(data) {
  if (APP_PREFERENCES["instance_save"]["activate"]) {
    UpdateData();
  }
}

const createWindow = () => {
  // Create the browser window.
  WIN = new BrowserWindow({
    width: 960,
    height: 800,
    icon: path.join(__dirname, 'assets/logos/app-logo.png'),
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: !app.isPackaged

    }
  });
  WIN.setResizable(false);
  WIN.setMenuBarVisibility(false);
  WIN.setTitle("Runeterra Tournament Overlay Editor (BETA)");
  // and load the index.html of the app.
  WIN.loadURL(`http://localhost:${port}`);

  WIN.once('ready-to-show', () => {
    WIN.show();
  });

  WIN.on('closed', () => {
    UpdateSettings();
    WIN = null;
  });

  WIN.on('close', function (e) {
    

    if (!APP_PREFERENCES["instance_save"]["dialog_dontshowonexit"]) {
      e.preventDefault();
      dialog.showMessageBox(WIN,{
        type: 'question',
        buttons: ['Yes','No','Cancel'],
        title: 'Save current instance?',
        message: 'Do you want to save all of your current instances?',
        frame: false,
        checkboxLabel: 'Don\'t ask me again.',
        checkboxChecked: false
      })
      .then (result => {
        switch(result.response) {
          case 0:
            APP_PREFERENCES["instance_save"]["activate"] = true;
            break;
          case 1:
            APP_PREFERENCES["instance_save"]["activate"] = false;
            break;
        } 
        APP_PREFERENCES["instance_save"]["dialog_dontshowonexit"] = result.checkboxChecked;
       
        SaveData();
        WIN.destroy();
      });

      
      
    } else {
      SaveData();
    }
    


    
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

eApp.use(express.static(__dirname));

eApp.get('/', function(req, res) {
  res.render('index');
});

io.on('connection', (socket) => {
  if (APP_PREFERENCES["instance_save"]["activate"]) {
    socket.emit('load-savedata', DATA_SAVES);
  }
  

  socket.on('export-overlay', (data) => {
    var imageData = data["data"].replace(/^data:image\/png;base64,/, "");
    require("fs").writeFile(data["location"], imageData, 'base64', function(err) {
      console.log(err);
    });

  });

  socket.on('open-dir-dialog', () => {
    var dir = dialog.showOpenDialogSync({title: "Choose the directory where you want to save the image", properties: ['openDirectory'] });
    if (dir != "" || dir != undefined) {
      socket.emit('send-dir',{directory: dir[0]});
    }
    
  });

  socket.on('open-pic-dialog', () => {
    var imageLoc = dialog.showOpenDialogSync({title: "Import the logo source", properties: ['openFile'], filters: [{name: "Image files", extensions: ["png","jpg","bmp","gif","apng","avif","webp","jpeg","jfif","pjpeg","pjp"]}] });
    if (imageLoc != "" || imageLoc != undefined) {
      socket.emit('send-logo-loc',{location: imageLoc[0]});
    }
    
  });


  socket.on('save-data', (data) => {
    DATA_SAVES = data;
    SaveData();
  });

  socket.on('trigger-exit', () => {
    var window = BrowserWindow.getFocusedWindow();
    window.close();
  });

  socket.on('trigger-minimize', () => {
    var window = BrowserWindow.getFocusedWindow();
    window.minimize();
  });


});


server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
