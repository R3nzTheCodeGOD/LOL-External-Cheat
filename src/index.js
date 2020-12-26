const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) {
  app.quit();
}
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 650,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: false,
    },
    frame: false,
    icon: __dirname + "/images/icon.ico",
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

app.on("ready", createWindow);
app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+R", () => {
    return;
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
