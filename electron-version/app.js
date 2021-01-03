const path = require('path');
const electron = require('electron'),
    { app, BrowserWindow, Menu, shell, Tray, ipcMain } = electron;

let tray;
let minWin;
let appMenu = [];

app.on('ready', () => {
    shell.beep();

    // create mean window
    minWin = new BrowserWindow({
        minWidth: 800,
        minHeight: 700,
        resizable: false,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    // show minwin when it's ready
    minWin.once('ready-to-show', () => {
        minWin.show()
    })

    // tray
    tray = new Tray(path.join(__dirname, 'favicon.png'));
    tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Exit', role: 'quit' },
    { label: 'Show', click() { minWin.show() } }
    ]));
    tray.setToolTip('Projects Controller');

    //  create Menu bar
    if (process.platform === "darwin") appMinu.unshift({});
    Menu.setApplicationMenu(Menu.buildFromTemplate(appMenu));

    // load index.html file
    minWin.loadFile('./index.html');

    // resize the window to the screen size
    ipcMain.on('window-load', (e, data) => {
        minWin.setBounds({
            x: 50,
            y: 50,
            width: (data.width - 100),
            height: (data.height - 100)
        })
    });

    // close and minimize apps
    ipcMain.on('minimize-app', (event) => {
        event.preventDefault();
        minWin.minimize();
    });

    ipcMain.on('close-app', () => {
        app.quit()
    });
});

