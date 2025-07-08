const { app,
   BrowserWindow,
   ipcMain,
   screen,
   desktopCapturer,
   globalShortcut} = require("electron");
const { Tray, Menu } = require('electron');
const serve = require("electron-serve");
const path = require("path");
const AutoLaunch = require('auto-launch');
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

let tray=null;
let win=null;
let overlayWindow=null;
let selectionWindow = null;
let fullScreenshot = null;
let isOverlayVisible = false;
let isMainWindowVisible = false;
let overlayHideTimeout = null;
let overlayState = 'hidden'; // 'hidden', 'compact', 'expanded'
let overlayStateBeforeSelection = 'hidden'; // Store state before region selection
let wasOverlayVisibleBeforeSelection = false; // Store visibility before region selection

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showOverlay();
  });
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show:false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.on('show', () => {
    isMainWindowVisible = true;
  });

  win.on('hide', () => {
    isMainWindowVisible = false;
  });
  
  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
  
  win.on('close', (e) => {
    e.preventDefault();
    win.hide();
  });
}

// Reset the overlay hide timer
function resetOverlayHideTimer() {
  clearTimeout(overlayHideTimeout);
  overlayHideTimeout = setTimeout(() => {
    if (isOverlayVisible) {
      hideOverlay();
    }
  }, 15000); // Increased to 15 seconds
}

// Clear the overlay hide timer
function clearOverlayHideTimer() {
  clearTimeout(overlayHideTimeout);
  overlayHideTimeout = null;
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 550,
    height: 120, // Increased height to ensure content is visible
    show: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Add error handling for overlay window
  overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Overlay window failed to load:', errorCode, errorDescription);
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.reloadIgnoringCache();
      }
    }, 1000);
  });

  overlayWindow.webContents.on('did-finish-load', () => {
    // Send initial state to the overlay
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        // Always send 'compact' as initial state when overlay loads
        overlayWindow.webContents.send('overlay-state-changed', 'compact');
      }
    }, 100);
  });

  overlayWindow.on('show', () => {
    isOverlayVisible = true;
    resetOverlayHideTimer();
  });

  overlayWindow.on('hide', () => {
    // Only update state if not during region selection
    if (!selectionWindow || selectionWindow.isDestroyed() || !selectionWindow.isVisible()) {
      isOverlayVisible = false;
      clearOverlayHideTimer();
    } else {
      console.log('Overlay hidden during region selection - keeping state');
    }
  });

  overlayWindow.webContents.on('dom-ready', () => {
    // Don't reset timer here as it might interfere with initial load
  });

  // Handle mouse events to reset timer
  overlayWindow.webContents.on('before-input-event', (event, input) => {
    if (isOverlayVisible) {
      resetOverlayHideTimer();
    }
  });

  // Handle focus events more carefully
  overlayWindow.on('focus', () => {
    if (isOverlayVisible) {
      resetOverlayHideTimer();
    }
  });

  // Only hide on blur if user clicks completely outside the overlay area
  overlayWindow.on('blur', () => {
    // Overlay lost focus
  });

  // Handle window movements to reset timer
  overlayWindow.on('moved', () => {
    if (isOverlayVisible) {
      resetOverlayHideTimer();
    }
  });

  // Load the overlay URL
  if (app.isPackaged) {
    overlayWindow.loadURL(`app://-/overlay`);
  } else {
    overlayWindow.loadURL('http://localhost:3000/overlay');
  }
  // overlayWindow.webContents.openDevTools(); // Disabled - overlay working properly
}

function showOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlayWindow();
    
    overlayWindow.once('ready-to-show', () => {
      showOverlayInCompactMode();
    });
  } else {
    if(overlayState==="hidden"){
      showOverlayInCompactMode();
    }else{
      hideOverlay();
    }
  }
}

function showOverlayInCompactMode() {
  console.log('showOverlayInCompactMode called');
  
  if(overlayWindow && !overlayWindow.isDestroyed()){
    if(isMainWindowVisible){
      hideMainWindow();
    }

    const {width,height}= screen.getPrimaryDisplay().workAreaSize;
    const compactWidth = 500;
    const compactHeight = 120;
    const targetX = Math.round((width - compactWidth) / 2);
    const targetY = Math.round(height / 6);
    
    console.log('Setting overlay state to compact');
    overlayState = 'compact';
    overlayWindow.webContents.send('overlay-state-changed', 'compact');

    // Check if this is a transition from expanded mode
    const isTransitionFromExpanded = overlayWindow.isVisible();
    console.log('isTransitionFromExpanded:', isTransitionFromExpanded);
    
    if (isTransitionFromExpanded) {
      // Smooth transition from expanded to compact using utility
      console.log('Animating from expanded to compact');
      animateWindowTransition(overlayWindow, {
        x: targetX,
        y: targetY,
        width: compactWidth,
        height: compactHeight
      }, 350, 'ease-in-out-back');
    } else {
      // Initial show - set position immediately then fade in
      console.log('Initial show - setting position and fading in');
      overlayWindow.setSize(compactWidth, compactHeight);
      overlayWindow.setPosition(targetX, targetY);
      
      overlayWindow.show();
      overlayWindow.focus();

      // Enhanced fade-in animation with bounce effect
      overlayWindow.setOpacity(0);
      animateOpacity(overlayWindow, 0, 1, 400, 'ease-in-out');
    }

    isOverlayVisible = true;
    resetOverlayHideTimer();
    console.log('showOverlayInCompactMode completed, state:', overlayState);
  }
}

function expandOverlay(){
  console.log('expandOverlay called, current state:', overlayState, 'window exists:', !!overlayWindow, 'destroyed:', overlayWindow?.isDestroyed());
  
  if(overlayWindow && !overlayWindow.isDestroyed() && overlayState==='compact'){
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const expandedWidth = 550;
    const expandedHeight = 800;
    
    const targetX = Math.round((width - expandedWidth) / 2);
    const targetY = Math.round((height - expandedHeight) / 4);
    
    console.log('Expanding overlay to:', { targetX, targetY, expandedWidth, expandedHeight });
    
    overlayState = 'expanded';
    overlayWindow.webContents.send('overlay-state-changed', 'expanded');
    
    // Smooth expansion animation using utility
    try {
      animateWindowTransition(overlayWindow, {
        x: targetX,
        y: targetY,
        width: expandedWidth,
        height: expandedHeight
      }, 400, 'ease-in-out');
      console.log('Animation started successfully');
    } catch (error) {
      console.error('Error starting animation:', error);
      // Fallback to direct resize if animation fails
      overlayWindow.setBounds({
        x: targetX,
        y: targetY,
        width: expandedWidth,
        height: expandedHeight
      });
    }
    
    resetOverlayHideTimer();
  } else {
    console.log('expandOverlay conditions not met:', {
      windowExists: !!overlayWindow,
      windowDestroyed: overlayWindow?.isDestroyed(),
      currentState: overlayState,
      expectedState: 'compact'
    });
  }
}

function hideOverlay() {
  if (overlayWindow && isOverlayVisible && !overlayWindow.isDestroyed()) {
    clearOverlayHideTimer(); // Clear the timer when manually hiding
    
    // Enhanced fade-out animation with smooth easing
    animateOpacity(overlayWindow, 1, 0, 300, 'ease-in');
    
    // Hide after animation completes
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.hide();
        overlayState = 'hidden';
      }
    }, 300);
    
    isOverlayVisible = false;
  }
}

function showMainWindow() {
  if (!win || win.isDestroyed()) {
    createWindow();
  } 
  
  // Hide overlay first
  if (isOverlayVisible) {
    hideOverlay();
  }
  
  if (win) {
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
  }
}

function hideMainWindow() {
  if (win && isMainWindowVisible) {
    win.hide();
  }
}

function createTray() {
  try{
    tray = new Tray(path.join(__dirname, 'SnapInsight.png')); 
  }catch (error) {
    console.error('Error creating tray icon:', error);
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        win.show();
        win.focus();
      },
    },
    {
      label: 'Show Overlay',
      click: () => {
        showOverlay();
      },
    },
    {
      label: 'Hide Overlay',
      click: () => {
        hideOverlay();
      },
    },
    {
      label: 'Quit',
      click: () => {
        globalShortcut.unregisterAll();
        app.quit();
      },
    },
  ]);
  tray.setToolTip('SnapInsight');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    win.show();
    win.focus();
  });
}

app.whenReady().then(() => {
  const appLauncher = new AutoLaunch({
    name: 'SnapInsight',
    path: app.getPath('exe'),
  });

  appLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      appLauncher.enable().then(() => {
        console.log('Auto-launch enabled');
      }).catch(err => {
        console.error('Auto-launch enable failed:', err);
      });
    }
  }).catch(err => {
    console.error('Auto-launch check failed:', err);
  });

  const captureShortcut = globalShortcut.register('CommandOrControl+Shift+S', async () => {
    console.log('Shortcut triggered: capturing screen...');
    try {
      const screenshot = await captureScreen();
      if (screenshot) {
        const dataUrl = screenshot.toDataURL();
        if (win && !win.isDestroyed()) {
          win.webContents.send('screenshot-captured', dataUrl);
        }
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.webContents.send('screenshot-captured', dataUrl);
        }
      } else {
        console.error('Failed to capture screenshot');
        if (win && !win.isDestroyed()) {
          win.webContents.send('screenshot-captured', null);
        }
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.webContents.send('screenshot-captured', null);
        }
      }
    } catch (error) {
      console.error('Error in screenshot shortcut:', error);
    }
  });

  if (!captureShortcut) {
    console.log('Screenshot shortcut registration failed');
  } else {
    console.log('Screenshot shortcut registered successfully');
  }
  
  createTray();
  createWindow();
  createOverlayWindow()

  // Register the main window toggle shortcut
  const mainWindowShortcut = globalShortcut.register('CommandOrControl+Shift+I', () => {
    console.log('Main window toggle triggered');
    if (!isMainWindowVisible) {
      showMainWindow();
    } else {
      hideMainWindow();
    }
  });

  if (!mainWindowShortcut) {
    console.log('Failed to register main window toggle shortcut');
  } else {
    console.log('Main window toggle shortcut registered successfully');
  }

  // Overlay toggle shortcut
const overlayShortcut = globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (isOverlayVisible) {
      hideOverlay();
    } else {
      showOverlay();
    }
  });
  
  if (!overlayShortcut) {
    console.log('Failed to register overlay shortcut');
  } else {
    console.log('Overlay shortcut registered successfully');
  }
});

app.on("window-all-closed", (e) => {
  if(process.platform !== "darwin"){
    globalShortcut.unregisterAll()
    app.quit();
  }
  e.preventDefault();
});

async function captureScreen() {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const {width, height} = primaryDisplay.size;
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {width, height}
    });
    
    if (!sources || sources.length === 0) {
      console.error('No screen sources found');
      return null;
    }
    
    const primarySource = sources[0]; 
    return primarySource.thumbnail;

  } catch (error) {
    console.error('Error capturing screen:', error);
    return null;
  }
}

// Create selection overlay window
function createSelectionWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  console.log(`Creating selection window: ${width}x${height}`);

  selectionWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Add error handling for selection window
  selectionWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Selection window failed to load:', errorCode, errorDescription);
  });

  selectionWindow.webContents.on('did-finish-load', () => {
    console.log('Selection window loaded successfully');
  });

  // Load the selection overlay page
  const selectionUrl = app.isPackaged ? "app://-/selection" : "http://localhost:3000/selection";
  console.log(`Loading selection URL: ${selectionUrl}`);
  
  selectionWindow.loadURL(selectionUrl);

  selectionWindow.on('closed', () => {
    console.log('Selection window closed');
    selectionWindow = null;
  });

  return selectionWindow;
}

// Show region selection interface
async function startRegionSelection() {
  try {
    console.log('Starting region selection...');
    console.log('Current overlay state:', overlayState, 'isOverlayVisible:', isOverlayVisible);
    
    // Store current overlay state before hiding
    overlayStateBeforeSelection = overlayState;
    wasOverlayVisibleBeforeSelection = isOverlayVisible;
    
    console.log('Stored state before selection:', {
      overlayStateBeforeSelection,
      wasOverlayVisibleBeforeSelection
    });
    
    // First, capture the full screen
    fullScreenshot = await captureScreen();
    if (!fullScreenshot) {
      console.error('Failed to capture full screen for region selection');
      return;
    }
    
    console.log('Full screenshot captured successfully');

    // Hide overlay window temporarily (but keep state variables)
    if (overlayWindow && isOverlayVisible) {
      console.log('Hiding overlay window temporarily');
      // Temporarily disable the hide event listener to prevent state change
      overlayWindow.removeAllListeners('hide');
      overlayWindow.hide();
      
      // Re-add the hide listener after a delay
      setTimeout(() => {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.on('hide', () => {
            // Only update state if not during region selection
            if (!selectionWindow || selectionWindow.isDestroyed() || !selectionWindow.isVisible()) {
              isOverlayVisible = false;
              clearOverlayHideTimer();
            }
          });
        }
      }, 100);
    }

    // Create and show selection window
    if (!selectionWindow || selectionWindow.isDestroyed()) {
      console.log('Creating selection window...');
      createSelectionWindow();
    }

    // Show the window first, then wait for it to be ready
    selectionWindow.show();
    selectionWindow.focus();
    
    // Enhanced smooth fade-in for selection window using utility
    selectionWindow.setOpacity(0);
    animateOpacity(selectionWindow, 0, 1, 350, 'ease-out');
    
    // Wait for the window to be ready and then send the background image
    const sendBackgroundImage = () => {
      console.log('Sending background image to selection window');
      const dataUrl = fullScreenshot.toDataURL();
      selectionWindow.webContents.send('set-background-image', dataUrl);
    };

    // Try multiple ways to ensure the content is ready
    if (selectionWindow.webContents.isLoading()) {
      selectionWindow.webContents.once('did-finish-load', sendBackgroundImage);
    } else {
      // Content already loaded, send immediately
      setTimeout(sendBackgroundImage, 100);
    }

  } catch (error) {
    console.error('Error starting region selection:', error);
  }
}

// Handle region selection completion
function handleRegionSelected(bounds) {
  try {
    if (!fullScreenshot || !bounds) {
      console.error('No screenshot or bounds available');
      return;
    }

    console.log('Processing region selection:', bounds);
    console.log('Restoring to state:', {
      overlayStateBeforeSelection,
      wasOverlayVisibleBeforeSelection
    });

    // Get the native image from fullScreenshot
    const originalSize = fullScreenshot.getSize();
    const { width: originalWidth, height: originalHeight } = originalSize;
    
    // Calculate scale factors (in case display scaling is applied)
    const displayBounds = screen.getPrimaryDisplay().bounds;
    const scaleX = originalWidth / displayBounds.width;
    const scaleY = originalHeight / displayBounds.height;
    
    // Apply scaling to selection bounds
    const scaledBounds = {
      x: Math.round(bounds.x * scaleX),
      y: Math.round(bounds.y * scaleY),
      width: Math.round(bounds.width * scaleX),
      height: Math.round(bounds.height * scaleY)
    };

    console.log('Scaled bounds:', scaledBounds);

    // Crop the image using Electron's nativeImage
    const croppedImage = fullScreenshot.crop(scaledBounds);
    const croppedDataUrl = croppedImage.toDataURL();
    
    // Hide selection window first
    if (selectionWindow && !selectionWindow.isDestroyed()) {
      selectionWindow.hide();
    }
    
    // Small delay to ensure selection window is hidden before showing overlay
    setTimeout(() => {
      // Send to both windows
      if (win && !win.isDestroyed()) {
        win.webContents.send('screenshot-captured', croppedDataUrl);
      }
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('screenshot-captured', croppedDataUrl);
        
        // Restore overlay window and expand to show the captured screenshot
        if (wasOverlayVisibleBeforeSelection || overlayStateBeforeSelection !== 'hidden') {
          console.log('Restoring and expanding overlay window after region selection');
          
          // First restore to compact mode
          overlayState = 'compact';
          isOverlayVisible = true;
          showOverlayInCompactMode();
          
          // Then expand to show the screenshot after a short delay
          setTimeout(() => {
            expandOverlay();
          }, 200);
        }
      }
      
      // Reset the stored state
      overlayStateBeforeSelection = 'hidden';
      wasOverlayVisibleBeforeSelection = false;
      
    }, 200);
    
    console.log('Region screenshot captured successfully');
    
  } catch (error) {
    console.error('Error processing region selection:', error);
    
    // Restore overlay even if there was an error
    if (overlayWindow && !overlayWindow.isDestroyed() && (wasOverlayVisibleBeforeSelection || overlayStateBeforeSelection !== 'hidden')) {
      setTimeout(() => {
        overlayState = overlayStateBeforeSelection;
        isOverlayVisible = wasOverlayVisibleBeforeSelection;
        
        if (overlayStateBeforeSelection === 'compact') {
          showOverlayInCompactMode();
        } else if (overlayStateBeforeSelection === 'expanded') {
          expandOverlay();
        }
      }, 200);
    }
  }
}

// IPC handlers for overlay timer management
ipcMain.on('overlay-user-activity', () => {
  // console.log('User activity detected from renderer'); // Disabled debug logging
  if (isOverlayVisible) {
    resetOverlayHideTimer();
  }
});

ipcMain.on('overlay-keep-alive', () => {
  // console.log('Keep alive signal from renderer'); // Disabled debug logging
  if (isOverlayVisible) {
    resetOverlayHideTimer();
  }
});

ipcMain.on('show-overlay', showOverlay);
ipcMain.on('hide-overlay', hideOverlay);
ipcMain.on('show-main-window', showMainWindow);
ipcMain.on('hide-main-window', hideMainWindow);

// Test function to manually trigger expansion
ipcMain.on('test-expand', () => {
  console.log('TEST: Manual expand triggered');
  expandOverlay();
});

ipcMain.on('expand-overlay', () => {
  console.log('IPC: expand-overlay received');
  expandOverlay();
});

ipcMain.on('compact-overlay', () => {
  if (overlayState === 'expanded') {
    showOverlayInCompactMode();
  }
});


ipcMain.on('capture-screenshot', async (event) => {
  try {
    // Store current overlay visibility state
    const wasOverlayVisible = overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible();
    
    // Hide the overlay temporarily to capture clean screenshot
    if (wasOverlayVisible) {
      overlayWindow.hide();
      console.log('Overlay hidden for clean screenshot capture');
      
      // Wait a brief moment for the hide to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const screenshotInfo = await captureScreen();
    
    // Restore overlay visibility if it was visible before
    if (wasOverlayVisible && overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.show();
      console.log('Overlay restored after screenshot capture');
    }

    if (screenshotInfo) {
      const dataUrl = screenshotInfo.toDataURL();
      event.reply('screenshot-captured', dataUrl);
      
      console.log('Screenshot captured successfully'); 
      if (win && !win.isDestroyed() && event.sender !== win.webContents) {
        win.webContents.send('screenshot-captured', dataUrl);
      }
      if (overlayWindow && !overlayWindow.isDestroyed() && event.sender !== overlayWindow.webContents) {
        overlayWindow.webContents.send('screenshot-captured', dataUrl);
        
        // If screenshot was captured from compact overlay, expand to show it
        if (event.sender === overlayWindow.webContents && overlayState === 'compact') {
          setTimeout(() => {
            expandOverlay();
          }, 200);
        }
      }
    } else {
      console.error('Failed to capture screenshot');
      event.sender.send('screenshot-captured', null);
    }
  } catch (error) {
    console.error('Error in capture-screenshot handler:', error);
    
    // Ensure overlay is restored even if an error occurs
    if (overlayWindow && !overlayWindow.isDestroyed() && !overlayWindow.isVisible()) {
      overlayWindow.show();
      console.log('Overlay restored after error during screenshot capture');
    }
    
    event.sender.send('screenshot-captured', null);
  }
});

// Handle region screenshot capture
ipcMain.on('capture-region-screenshot', async (event) => {
  console.log('Region screenshot capture requested');
  startRegionSelection();
});

// Handle region selection completion
ipcMain.on('region-selected', (event, bounds) => {
  handleRegionSelected(bounds);
});

// Handle region selection cancellation
ipcMain.on('cancel-region-selection', () => {
  console.log('Region selection cancelled');
  
  if (selectionWindow && !selectionWindow.isDestroyed()) {
    selectionWindow.hide();
  }
  
  // Restore overlay window based on previous state
  if (overlayWindow && !overlayWindow.isDestroyed() && (wasOverlayVisibleBeforeSelection || overlayStateBeforeSelection !== 'hidden')) {
    setTimeout(() => {
      console.log('Restoring overlay after cancellation, state:', overlayStateBeforeSelection);
      
      // Restore overlay state and visibility
      overlayState = overlayStateBeforeSelection;
      isOverlayVisible = wasOverlayVisibleBeforeSelection;
      
      if (overlayStateBeforeSelection === 'compact') {
        showOverlayInCompactMode();
      } else if (overlayStateBeforeSelection === 'expanded') {
        expandOverlay();
      }
      
      // Reset the stored state
      overlayStateBeforeSelection = 'hidden';
      wasOverlayVisibleBeforeSelection = false;
      
    }, 100);
  }
});

// Handle auto-capture screenshot and query
ipcMain.on('auto-capture-and-query', async (event, queryText) => {
  try {
    console.log('Auto-capture and query requested for:', queryText);
    
    // Store current overlay visibility state
    const wasOverlayVisible = overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible();
    
    // Hide the overlay temporarily to capture clean screenshot
    if (wasOverlayVisible) {
      overlayWindow.hide();
      console.log('Overlay hidden for clean screenshot capture');
      
      // Wait a brief moment for the hide to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Capture screenshot with overlay hidden
    const screenshotInfo = await captureScreen();
    
    // Restore overlay visibility if it was visible before
    if (wasOverlayVisible && overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.show();
      console.log('Overlay restored after screenshot capture');
    }
    
    if (screenshotInfo) {
      const dataUrl = screenshotInfo.toDataURL();
      
      // Send both the query text and screenshot back to the overlay
      event.reply('auto-capture-ready', {
        queryText: queryText,
        screenshot: dataUrl
      });
      
      console.log('Auto-capture completed and data sent to renderer');
    } else {
      console.error('Failed to capture screenshot for auto-query');
      event.reply('auto-capture-ready', {
        queryText: queryText,
        screenshot: null,
        error: 'Failed to capture screenshot'
      });
    }
  } catch (error) {
    console.error('Error in auto-capture-and-query handler:', error);
    
    // Ensure overlay is restored even if an error occurs
    if (overlayWindow && !overlayWindow.isDestroyed() && !overlayWindow.isVisible()) {
      overlayWindow.show();
      console.log('Overlay restored after error during screenshot capture');
    }
    
    event.reply('auto-capture-ready', {
      queryText: queryText,
      screenshot: null,
      error: error.message
    });
  }
});

// Handle auto-capture screenshot and query with audio
ipcMain.on('auto-capture-and-query-audio', async (event, audioData) => {
  try {
    console.log('Auto-capture with audio requested');
    
    // Store current overlay visibility state
    const wasOverlayVisible = overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible();
    
    // Hide the overlay temporarily to capture clean screenshot
    if (wasOverlayVisible) {
      overlayWindow.hide();
      console.log('Overlay hidden for clean screenshot capture');
      
      // Wait a brief moment for the hide to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Capture screenshot with overlay hidden
    const screenshotInfo = await captureScreen();
    
    // Restore overlay visibility if it was visible before
    if (wasOverlayVisible && overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.show();
      console.log('Overlay restored after screenshot capture');
    }
    
    if (screenshotInfo) {
      const dataUrl = screenshotInfo.toDataURL();
      
      // Send audio data and screenshot back to the overlay
      event.reply('auto-capture-ready', {
        audioData: audioData,
        screenshot: dataUrl
      });
      
      console.log('Auto-capture with audio completed and data sent to renderer');
    } else {
      console.error('Failed to capture screenshot for audio query');
      event.reply('auto-capture-ready', {
        audioData: audioData,
        screenshot: null,
        error: 'Failed to capture screenshot'
      });
    }
  } catch (error) {
    console.error('Error in auto-capture-and-query-audio handler:', error);
    
    // Ensure overlay is restored even if an error occurs
    if (overlayWindow && !overlayWindow.isDestroyed() && !overlayWindow.isVisible()) {
      overlayWindow.show();
      console.log('Overlay restored after error during audio screenshot capture');
    }
    
    event.reply('auto-capture-ready', {
      audioData: audioData,
      screenshot: null,
      error: error.message
    });
  }
});

// Enhanced animation utility functions for smoother transitions
const easingFunctions = {
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in': (t) => t * t * t,
  'ease-in-out': (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  'ease-in-out-back': (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  'bounce-out': (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

// Animation tracking for cleanup
const activeAnimations = new Set();

function animateWindowTransition(window, targetBounds, duration = 300, easing = 'ease-out') {
  if (!window || window.isDestroyed()) return;
  
  const startBounds = window.getBounds();
  const startTime = Date.now();
  const easingFn = easingFunctions[easing] || easingFunctions['ease-out'];
  const frameTime = 16; // ~60fps
  const animationId = Symbol('windowTransition');
  
  activeAnimations.add(animationId);
  
  const animate = () => {
    // Check if animation was cancelled
    if (!activeAnimations.has(animationId) || !window || window.isDestroyed()) {
      activeAnimations.delete(animationId);
      return;
    }
    
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);
    
    const currentBounds = {
      x: Math.round(startBounds.x + (targetBounds.x - startBounds.x) * easedProgress),
      y: Math.round(startBounds.y + (targetBounds.y - startBounds.y) * easedProgress),
      width: Math.round(startBounds.width + (targetBounds.width - startBounds.width) * easedProgress),
      height: Math.round(startBounds.height + (targetBounds.height - startBounds.height) * easedProgress)
    };
    
    try {
      window.setBounds(currentBounds);
    } catch (error) {
      console.error('Error setting window bounds:', error);
      activeAnimations.delete(animationId);
      return;
    }
    
    if (progress < 1) {
      setTimeout(animate, frameTime);
    } else {
      // Ensure final position is exact
      try {
        window.setBounds(targetBounds);
      } catch (error) {
        console.error('Error setting final window bounds:', error);
      }
      activeAnimations.delete(animationId);
    }
  };
  
  animate();
  return animationId; // Return ID for potential cancellation
}

function animateOpacity(window, startOpacity, endOpacity, duration = 250, easing = 'ease-out') {
  if (!window || window.isDestroyed()) return;
  
  const startTime = Date.now();
  const easingFn = easingFunctions[easing] || easingFunctions['ease-out'];
  const frameTime = 16; // ~60fps
  const animationId = Symbol('opacityTransition');
  
  activeAnimations.add(animationId);
  
  const animate = () => {
    // Check if animation was cancelled
    if (!activeAnimations.has(animationId) || !window || window.isDestroyed()) {
      activeAnimations.delete(animationId);
      return;
    }
    
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);
    
    const currentOpacity = startOpacity + (endOpacity - startOpacity) * easedProgress;
    
    try {
      window.setOpacity(Math.max(0, Math.min(1, currentOpacity)));
    } catch (error) {
      console.error('Error setting window opacity:', error);
      activeAnimations.delete(animationId);
      return;
    }
    
    if (progress < 1) {
      setTimeout(animate, frameTime);
    } else {
      activeAnimations.delete(animationId);
    }
  };
  
  animate();
  return animationId; // Return ID for potential cancellation
}

// Cleanup function to stop all animations
function stopAllAnimations() {
  activeAnimations.clear();
}