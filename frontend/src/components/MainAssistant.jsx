'use client';
import { useEffect, useState, useCallback} from 'react';
import { Button } from 'antd';

export const MainAssistant=()=> {
  
  
  const [dataUrl, setDataUrl] = useState(null);
  const handleScreenshotCaptured = useCallback((dataUrl) => {
    console.log("Screenshot received:", dataUrl ? "data received" : "no data");
    setDataUrl(dataUrl);
  }, []);
  
  useEffect(() => {
  
  // console.log("Component mounted, checking for screenshot API");
  // console.log("screenshot API available:", !!window.screenshot);
  
  if (typeof window !== 'undefined' && window.screenshot) {
    console.log("Setting up screenshot listener");
    window.screenshot.screenshotCaptured(handleScreenshotCaptured);
  } else {
    console.warn("Screenshot API not available. Check if preload script is working.");
  }
  
  return () => {
    // Cleanup on unmount
    if (window.screenshot?.removeScreenshotTaken) {
      window.screenshot.removeScreenshotTaken();
    }
  };
}, [handleScreenshotCaptured]);

const handleCapture = () => {
  console.log("Capture button clicked");
  
  if (window.screenshot?.captureScreenshot) {
    console.log("Calling captureScreenshot");
    window.screenshot.captureScreenshot();
  } else {
    console.error("Screenshot API not available when trying to capture");
  }
};

    return (
        <>
          <Button onClick={()=>handleCapture()} style={{backgroundColor:"var(--color-subtext)"}}>Capture</Button>
           <div style={{ marginTop: '2rem',
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center" }}>
            <h4 style={{color:"var(--color-accent)"}}>Screenshot:</h4>
            
            {dataUrl && (
                  <img id='screenshot-image'
                    src={dataUrl}
                    alt="Captured Screenshot"
                    style={{ 
                  border: '2px solid #ccc',
                  borderRadius: '10px',
                  width: "60%",
                  maxWidth: "800px",
                  height: "auto",
            }}
                  />)}
        </div>
      
       
        </>
    )
}
