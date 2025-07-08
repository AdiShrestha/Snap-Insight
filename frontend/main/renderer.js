async function captureScreenshot() {
  
  window.screenshot.showOverlay();
  window.screenshot.showMainWindow();
  window.screenshot?.captureScreenshot();
  window.screenshot.screenshotCaptured((dataUrl) => {
    if (dataUrl) {
      document.getElementById('screenshot-image').src = dataUrl;
    } else {
      console.error('Failed to capture screenshot');
    }
  });
  
  window.screenshot.hideOverlay();
  window.screenshot.hideMainWindow();
}
  
document.querySelector("#screenshot-capture").addEventListener('click', captureScreenshot);