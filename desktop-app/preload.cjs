const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('networkAPI', {
    sendPacket: (buffer) => ipcRenderer.send('send-packet', buffer),
    onPacket: (callback) => ipcRenderer.on('packet-received', (event, data) => callback(data))
});
