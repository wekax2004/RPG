const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPacket: (buffer) => {
        console.log(`[Preload] Sending packet via IPC: ${buffer.length} bytes`);
        ipcRenderer.send('send-packet', buffer);
    },
    onPacket: (callback) => ipcRenderer.on('packet-received', (event, data) => callback(data))
});
