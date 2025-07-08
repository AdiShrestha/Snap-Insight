const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("screenshot", {

  expandOverlay: () => ipcRenderer.send('expand-overlay'),
  compactOverlay: () => ipcRenderer.send('compact-overlay'),

  onOverlayStateChanged: (callback) => {
    ipcRenderer.on('overlay-state-changed', (event, state) => callback(state));
  },
  
  removeOverlayStateListener: () => {
    ipcRenderer.removeAllListeners('overlay-state-changed');
  },
  
  captureScreenshot: () => {
    console.log("Preload: captureScreenshot called");
    ipcRenderer.send('capture-screenshot');
  },

  // Region screenshot capture
  captureRegionScreenshot: () => {
    console.log("Preload: captureRegionScreenshot called");
    ipcRenderer.send('capture-region-screenshot');
  },

  // Region selection methods for selection overlay
  onSetBackgroundImage: (callback) => {
    ipcRenderer.on('set-background-image', (event, dataUrl) => callback(dataUrl));
  },

  regionSelected: (bounds) => {
    console.log("Preload: regionSelected called", bounds);
    ipcRenderer.send('region-selected', bounds);
  },

  cancelRegionSelection: () => {
    console.log("Preload: cancelRegionSelection called");
    ipcRenderer.send('cancel-region-selection');
  },
  
  // Screenshot event listeners
  screenshotCaptured: (callback) => {
    console.log("Preload: Setting up screenshot listener");
    // Remove any existing listeners to prevent duplicates
    ipcRenderer.removeAllListeners('screenshot-captured');
    
    ipcRenderer.on('screenshot-captured', (event, screenshotUrl) => {
      console.log("Preload: Screenshot event received", screenshotUrl ? "with data" : "without data");
      callback(screenshotUrl);
    });
  },
  
  
  onScreenshotTaken: (callback) => {
    console.log("Preload: Setting up onScreenshotTaken listener");
    ipcRenderer.removeAllListeners('screenshot-captured');
    ipcRenderer.on('screenshot-captured', (event, screenshotUrl) => {
      callback(screenshotUrl);
    });
  },
  
  // Remove listeners
  removeScreenshotTaken: (callback) => {
    console.log("Preload: Removing screenshot listener");
    ipcRenderer.removeAllListeners('screenshot-captured');
  },
  
  // Window management
  showOverlay: () => {
    console.log("Preload: showOverlay called");
    ipcRenderer.send('show-overlay');
  },
  
  hideOverlay: () => {
    console.log("Preload: hideOverlay called");
    ipcRenderer.send('hide-overlay');
  },
  
  showMainWindow: () => {
    console.log("Preload: showMainWindow called");
    ipcRenderer.send('show-main-window');
  },
  
  hideMainWindow: () => {
    console.log("Preload: hideMainWindow called");
    ipcRenderer.send('hide-main-window');
  },
  
  // New methods for overlay activity tracking
  notifyUserActivity: () => {
    console.log("Preload: Notifying user activity");
    ipcRenderer.send('overlay-user-activity');
  },
  
  keepOverlayAlive: () => {
    console.log("Preload: Sending keep alive signal");
    ipcRenderer.send('overlay-keep-alive');
  },
  
  // New auto-capture and query method
  autoCaptureAndQuery: (queryText) => {
    console.log("Preload: Auto-capture and query called with:", queryText);
    ipcRenderer.send('auto-capture-and-query', queryText);
  },

  // New auto-capture with audio method
  autoCaptureAndQueryWithAudio: (audioBlob) => {
    console.log("Preload: Auto-capture with audio called");
    // Convert blob to array buffer for transmission
    audioBlob.arrayBuffer().then(arrayBuffer => {
      const audioData = Array.from(new Uint8Array(arrayBuffer));
      ipcRenderer.send('auto-capture-and-query-audio', audioData);
    });
  },

  // Listen for auto-capture responses
  onAutoCaptureReady: (callback) => {
    ipcRenderer.on('auto-capture-ready', (event, data) => {
      console.log("Preload: Auto-capture response received", data);
      callback(data);
    });
  },

  removeAutoCaptureListener: () => {
    ipcRenderer.removeAllListeners('auto-capture-ready');
  },

  // Utility methods
  isAvailable: () => true,
  
});