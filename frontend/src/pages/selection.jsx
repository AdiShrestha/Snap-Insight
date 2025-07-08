import React, { useState, useEffect, useRef, useCallback } from 'react';

const SelectionOverlay = () => {
  const canvasRef = useRef(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef(null);
  const drawTimeoutRef = useRef(null);

  useEffect(() => {
    console.log('Selection overlay component mounted');
    
    // Fade in animation
    setIsVisible(true);
    
    // Listen for background image from main process
    if (typeof window !== 'undefined' && window.screenshot) {
      console.log('window.screenshot is available');
      window.screenshot.onSetBackgroundImage((dataUrl) => {
        console.log('Background image received:', dataUrl ? 'data available' : 'no data');
        setBackgroundImage(dataUrl);
      });
    } else {
      console.error('window.screenshot not available');
    }

    // Handle ESC key to cancel selection
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        console.log('ESC key pressed, canceling selection');
        cancelSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (drawTimeoutRef.current) {
        clearTimeout(drawTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (backgroundImage && canvasRef.current) {
      console.log('Setting up canvas with background image');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size to match the display
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the background image to fill the entire canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        console.log('Canvas background image loaded and drawn');
      };
      
      img.onerror = () => {
        console.error('Failed to load background image');
      };
      
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  const getMousePosition = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      const pos = getMousePosition(e);
      setStartPoint(pos);
      setEndPoint(pos);
      setIsSelecting(true);
    }
  }, [getMousePosition]);

  const handleMouseMove = useCallback((e) => {
    if (isSelecting) {
      const pos = getMousePosition(e);
      setEndPoint(pos);
    }
  }, [isSelecting, getMousePosition]);

  const handleMouseUp = useCallback((e) => {
    if (isSelecting && e.button === 0) {
      setIsSelecting(false);
      
      const bounds = {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y)
      };

      console.log('Selection completed:', bounds);

      // Only proceed if selection is large enough (at least 5x5 pixels)
      if (bounds.width > 5 && bounds.height > 5) {
        console.log('Valid selection, sending to main process');
        if (window.screenshot?.regionSelected) {
          window.screenshot.regionSelected(bounds);
        } else {
          console.error('regionSelected function not available');
        }
      } else {
        console.log('Selection too small, canceling');
        // Selection too small, cancel
        cancelSelection();
      }
    }
  }, [isSelecting, startPoint, endPoint]);

  const cancelSelection = useCallback(() => {
    console.log('Canceling selection');
    
    // Smooth fade-out before closing
    setIsVisible(false);
    
    setTimeout(() => {
      if (window.screenshot?.cancelRegionSelection) {
        window.screenshot.cancelRegionSelection();
      } else {
        console.error('cancelRegionSelection function not available');
      }
    }, 300); // Match the fade-out transition duration
  }, []);

  const drawSelection = useCallback(() => {
    if (!canvasRef.current || !backgroundImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Cancel previous animation frame to prevent stacking
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Use requestAnimationFrame for smoother rendering
    animationRef.current = requestAnimationFrame(() => {
      // Clear canvas and redraw background
      const img = new Image();
      img.onload = () => {
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Only draw selection overlay if we're selecting or have a selection
        if (isSelecting || (Math.abs(endPoint.x - startPoint.x) > 1 && Math.abs(endPoint.y - startPoint.y) > 1)) {
          // Calculate selection bounds
          const selectionX = Math.min(startPoint.x, endPoint.x);
          const selectionY = Math.min(startPoint.y, endPoint.y);
          const selectionWidth = Math.abs(endPoint.x - startPoint.x);
          const selectionHeight = Math.abs(endPoint.y - startPoint.y);
          
          // Draw dark overlay everywhere except selection with smooth opacity
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Cut out the selection area (composite operation)
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillRect(selectionX, selectionY, selectionWidth, selectionHeight);
          
          // Restore composition mode
          ctx.globalCompositeOperation = 'source-over';
          ctx.restore();
          
          // Static selection border (no animation during selection for stability)
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.strokeRect(selectionX, selectionY, selectionWidth, selectionHeight);
          
          // Draw corner handles for better visual feedback
          const handleSize = 8;
          const corners = [
            { x: selectionX, y: selectionY },
            { x: selectionX + selectionWidth, y: selectionY },
            { x: selectionX, y: selectionY + selectionHeight },
            { x: selectionX + selectionWidth, y: selectionY + selectionHeight }
          ];
          
          ctx.fillStyle = '#00d4ff';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          
          corners.forEach(corner => {
            ctx.fillRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize);
            ctx.strokeRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize);
          });
          
          // Draw enhanced selection info box if selection is large enough
          if (selectionWidth > 80 && selectionHeight > 30) {
            const infoText = `${Math.round(selectionWidth)} × ${Math.round(selectionHeight)}`;
            const infoWidth = 150;
            const infoHeight = 32;
            
            // Position info box above selection, or below if too close to top
            let infoX = selectionX;
            let infoY = selectionY > infoHeight + 15 ? selectionY - infoHeight - 10 : selectionY + selectionHeight + 10;
            
            // Ensure info box stays within canvas bounds
            if (infoX + infoWidth > canvas.width) {
              infoX = canvas.width - infoWidth - 15;
            }
            if (infoX < 15) {
              infoX = 15;
            }
            
            // Draw info box background with rounded corners effect
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
            
            // Add subtle border
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
            
            // Draw info text with better typography
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(infoText, infoX + infoWidth / 2, infoY + 20);
            ctx.textAlign = 'start';
            ctx.restore();
          }
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image for drawing');
      };
      
      img.src = backgroundImage;
    });
  }, [isSelecting, startPoint, endPoint, backgroundImage]);

  useEffect(() => {
    drawSelection();
  }, [isSelecting, startPoint, endPoint, backgroundImage]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      cursor: isSelecting ? 'crosshair' : 'crosshair',
      userSelect: 'none',
      overflow: 'hidden',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          transition: 'filter 0.2s ease'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      {/* Enhanced Instructions */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '500',
        pointerEvents: 'none',
        zIndex: 1000,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transitionDelay: '0.1s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00d4ff' }}>✨</span>
          Click and drag to select an area
          <span style={{ opacity: 0.7, margin: '0 8px' }}>•</span>
          Press <kbd style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>ESC</kbd> to cancel
        </div>
      </div>
    </div>
  );
};

export default SelectionOverlay;
