import React, { useState, useEffect } from 'react';
import CompactOverlay from '../components/CompactOverlay';
import OverlayAssistant from '../components/OverlayAssistant';

export default function OverlayPage() {
  const [overlayState, setOverlayState] = useState('compact'); // Start with compact
  const [isReady, setIsReady] = useState(false);

  // Remove all Next.js/global styles and make the page completely transparent
  useEffect(() => {
    // Override all body/html styles to make it transparent
    document.body.style.cssText = `
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    `;
    document.documentElement.style.cssText = `
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      overflow: hidden !important;
    `;
    
    // Remove any Ant Design or other framework styles
    const rootDiv = document.getElementById('__next');
    if (rootDiv) {
      rootDiv.style.cssText = `
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 100vh !important;
        width: 100vw !important;
      `;
    }
  }, []);

  // Wait for the window.screenshot API to be available
  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds max
    
    const checkAPI = () => {
      checkCount++;
      if (window.screenshot) {
        setIsReady(true);
        
        // Set up the overlay state listener
        if (window.screenshot.onOverlayStateChanged) {
          window.screenshot.onOverlayStateChanged((state) => {
            setOverlayState(state);
          });
        }
      } else if (checkCount < maxChecks) {
        setTimeout(checkAPI, 100);
      } else {
        setIsReady(true); // Proceed anyway
      }
    };

    checkAPI();

    return () => {
      if (window.screenshot?.removeOverlayStateListener) {
        window.screenshot.removeOverlayStateListener();
      }
    };
  }, []);

  // Handle expansion
  const handleExpand = () => {
    setOverlayState('expanded');
    if (window.screenshot?.expandOverlay) {
      window.screenshot.expandOverlay();
    }
  };

  // Handle closing
  const handleClose = () => {
    if (window.screenshot?.hideOverlay) {
      window.screenshot.hideOverlay();
    }
  };

  // Show a simple loading state if the API is not ready
  if (!isReady) {
    console.log('Showing loading state...');
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: 'system-ui',
        zIndex: 9999
      }}>
        Loading SnapInsight overlay...
      </div>
    );
  }
  
  // Render the appropriate component based on the state
  const overlayContent = overlayState === 'compact' ? (
    <CompactOverlay onExpand={handleExpand} onClose={handleClose} />
  ) : (
    <OverlayAssistant />
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'transparent',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {overlayContent}
    </div>
  );
}