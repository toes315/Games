
import React, { useRef, useEffect } from 'react';

interface MapProps {
    mapName: string;
}

export const Map: React.FC<MapProps> = ({ mapName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const w = canvas.width;
        const h = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // --- Drawing Helpers ---
        const drawMountain = (x: number, y: number, width: number, height: number, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width / 2, y - height);
            ctx.lineTo(x + width, y);
            ctx.fill();
        };

        const drawTree = (x: number, y: number, scale: number, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 10 * scale, y + 40 * scale);
            ctx.lineTo(x + 10 * scale, y + 40 * scale);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x, y - 15 * scale);
            ctx.lineTo(x - 8 * scale, y + 15 * scale);
            ctx.lineTo(x + 8 * scale, y + 15 * scale);
            ctx.fill();
        };
        
        const drawStar = (x: number, y: number, brightness: number) => {
             ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
             ctx.beginPath(); ctx.arc(x, y, Math.random()*2, 0, Math.PI*2); ctx.fill();
        };
        
        const drawGrid = (color: string) => {
             ctx.strokeStyle = color;
             ctx.lineWidth = 2;
             const horizon = h * 0.6;
             for(let i=0; i<w; i+=120) {
                 ctx.beginPath(); ctx.moveTo(i, horizon); ctx.lineTo((i-w/2)*4 + w/2, h); ctx.stroke();
             }
             for(let i=horizon; i<h; i+=60) {
                 ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
             }
        };

        const name = mapName.toLowerCase();

        // --- Theme Logic ---
        // Colors slightly dimmed to serve as background
        
        if (name.includes('forest') || name.includes('jungle') || name.includes('garden') || name.includes('growth')) {
             const grad = ctx.createLinearGradient(0, 0, 0, h);
             grad.addColorStop(0, '#051a0a'); 
             grad.addColorStop(1, '#0a2a1a'); 
             ctx.fillStyle = grad;
             ctx.fillRect(0, 0, w, h);
             
             // Trees moved to background (higher Y, smaller scale)
             for(let i=0; i<40; i++) {
                 // Spread across full width in background
                 const x = Math.random() * w;
                 // Y position: Horizon line area (h*0.6) to mid-screen, not floor (h)
                 const y = (h * 0.5) + Math.random() * (h * 0.2); 
                 // Smaller scale for distance
                 drawTree(x, y, 1.5 + Math.random() * 1.5, '#1a4a2a');
             }
             // Fireflies
             for(let i=0; i<30; i++) {
                 ctx.fillStyle = `rgba(255, 255, 100, ${0.3 + Math.random()*0.4})`;
                 ctx.beginPath(); ctx.arc(Math.random()*w, h - Math.random()*300, 2, 0, Math.PI*2); ctx.fill();
             }
        }
        else if (name.includes('mountain') || name.includes('peak') || name.includes('sky') || name.includes('wind')) {
             const grad = ctx.createLinearGradient(0, 0, 0, h);
             grad.addColorStop(0, '#0a1a3a'); 
             grad.addColorStop(1, '#1a2a4a');
             ctx.fillStyle = grad;
             ctx.fillRect(0, 0, w, h);
             
             ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
             // Clouds
             for(let i=0; i<8; i++) {
                 ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*(h*0.4), 80 + Math.random()*100, 0, Math.PI*2); ctx.fill();
             }
             drawMountain(w/2 - 300, h, 600, 450, '#0a1a2a');
             drawMountain(w/2 + 100, h, 500, 300, '#102035');
        }
        else if (name.includes('volcano') || name.includes('inferno') || name.includes('sun') || name.includes('underworld') || name.includes('hell')) {
             const grad = ctx.createLinearGradient(0, 0, 0, h);
             grad.addColorStop(0, '#2a0a05');
             grad.addColorStop(1, '#1a0502');
             ctx.fillStyle = grad;
             ctx.fillRect(0, 0, w, h);
             
             const grd = ctx.createLinearGradient(0, h-100, 0, h);
             grd.addColorStop(0, '#551000');
             grd.addColorStop(1, '#aa4400');
             ctx.fillStyle = grd;
             ctx.fillRect(0, h-100, w, 100);

             drawMountain(w/2 - 400, h-50, 800, 350, '#1a0502');
             
             // Embers
             ctx.fillStyle = '#ffaa00';
             for(let i=0; i<100; i++) {
                 ctx.globalAlpha = Math.random() * 0.5 + 0.2;
                 ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, 1 + Math.random()*3, 0, Math.PI*2); ctx.fill();
                 ctx.globalAlpha = 1;
             }
        }
        else if (name.includes('ice') || name.includes('glacier') || name.includes('prism') || name.includes('crystal')) {
             const grad = ctx.createLinearGradient(0, 0, 0, h);
             grad.addColorStop(0, '#001a2a');
             grad.addColorStop(1, '#002a3a');
             ctx.fillStyle = grad;
             ctx.fillRect(0, 0, w, h);
             
             for(let i=0; i<20; i++) {
                 drawMountain(100 + Math.random()*(w-200), h, 80 + Math.random()*150, 300 + Math.random()*200, `#003344`);
             }
             for(let i=0; i<50; i++) drawStar(Math.random()*w, Math.random()*h, 0.9);
        }
        else if (name.includes('base') || name.includes('lab') || name.includes('power') || name.includes('space') || name.includes('void') || name.includes('station')) {
             const grad = ctx.createLinearGradient(0, 0, 0, h);
             grad.addColorStop(0, '#050510');
             grad.addColorStop(1, '#0a0a20');
             ctx.fillStyle = grad;
             ctx.fillRect(0, 0, w, h);

             if (name.includes('space') || name.includes('void')) {
                 for(let i=0; i<200; i++) drawStar(Math.random()*w, Math.random()*h, Math.random());
             }
             drawGrid(name.includes('void') ? '#3a1a5a' : '#004455');
        }
        else {
             if (name.includes('dojo') || name.includes('temple')) {
                 // Vibrant Silent Dojo
                 const grad = ctx.createLinearGradient(0, 0, 0, h);
                 grad.addColorStop(0, '#2a0a0a'); 
                 grad.addColorStop(0.5, '#3a1a0a'); 
                 grad.addColorStop(1, '#1a0a05'); 
                 ctx.fillStyle = grad;
                 ctx.fillRect(0, 0, w, h);

                 // Rising Sun - Deep Red
                 ctx.save();
                 ctx.shadowColor = '#880000';
                 ctx.shadowBlur = 50;
                 ctx.fillStyle = '#660000'; 
                 ctx.beginPath();
                 ctx.arc(w/2, h/2 - 80, 200, 0, Math.PI*2);
                 ctx.fill();
                 ctx.restore();
                 
                 // Shoji Screen Pattern
                 ctx.strokeStyle = '#1a0a05'; 
                 ctx.lineWidth = 6;
                 
                 const screenW = 140;
                 const paperColor = '#2a1a10'; 
                 
                 for(let x = 60; x < w-60; x += screenW) {
                     // Panel background
                     ctx.fillStyle = paperColor;
                     ctx.fillRect(x, 0, screenW, h * 0.8);
                     
                     // Frame
                     ctx.strokeRect(x, 0, screenW, h * 0.8);
                     
                     // Grid lines
                     ctx.beginPath();
                     for(let y=0; y < h * 0.8; y+=120) {
                         ctx.moveTo(x, y); ctx.lineTo(x+screenW, y);
                     }
                     ctx.moveTo(x + screenW/2, 0); ctx.lineTo(x + screenW/2, h * 0.8);
                     ctx.stroke();
                 }
                 
                 // Floor
                 const floorY = h * 0.75;
                 ctx.fillStyle = '#1a0a05';
                 ctx.fillRect(0, floorY, w, h-floorY);
             } 
             else {
                 drawGrid('#333');
             }
        }
        
    }, [mapName]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-0" 
        />
    );
};
