import React, { useRef, useState, useEffect } from 'react';
import { VehicleData, Point } from '../types';

interface VehicleDrawerProps {
  onComplete: (data: VehicleData) => void;
  onBack: () => void;
}

type DrawMode = 'CHASSIS' | 'WEAPON';

export const VehicleDrawer: React.FC<VehicleDrawerProps> = ({ onComplete, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('CHASSIS');
  
  const [chassisPoints, setChassisPoints] = useState<Point[]>([]);
  const [weaponPoints, setWeaponPoints] = useState<Point[]>([]);
  const [color, setColor] = useState('#00f3ff');

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    addPoint(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    addPoint(e);
  };

  const addPoint = (e: React.MouseEvent | React.TouchEvent) => {
      const pos = getPos(e);
      const targetList = drawMode === 'CHASSIS' ? chassisPoints : weaponPoints;
      const setTarget = drawMode === 'CHASSIS' ? setChassisPoints : setWeaponPoints;

      // Distance check to avoid too many points
      const lastPoint = targetList[targetList.length - 1];
      if (lastPoint) {
          const dist = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
          if (dist < 5) return;
      }
      setTarget(prev => [...prev, pos]);
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, vx: 0, vy: 0, life: 1, color: '#fff', size: 1 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      vx: 0,
      vy: 0,
      life: 1.0,
      color: '#fff',
      size: 2
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=40) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Draw Wheel placeholders (Static)
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.arc(150, 400, 30, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(450, 400, 30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '12px monospace';
    ctx.fillText("REAR", 150, 450);
    ctx.fillText("FRONT", 450, 450);

    // Helper to draw a line strip
    const drawStrip = (pts: Point[], col: string, glow: boolean) => {
        if (pts.length < 2) return;
        ctx.strokeStyle = col;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = col;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    // Draw Chassis
    drawStrip(chassisPoints, color, true);

    // Draw Weapon
    drawStrip(weaponPoints, '#ff0000', true);

    // Draw Pilot preview
    ctx.fillStyle = '#666';
    ctx.beginPath(); ctx.arc(300, 250, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(295, 260, 10, 20);
    ctx.fillText("PILOT", 300, 240);


  }, [chassisPoints, weaponPoints, color]);

  const handleClear = () => {
      setChassisPoints([]);
      setWeaponPoints([]);
  };

  const handleSave = () => {
    if (chassisPoints.length < 5) {
        alert("Draw a bigger vehicle chassis!");
        return;
    }
    onComplete({ chassis: chassisPoints, weapon: weaponPoints, color });
  };

  return (
    <div className="absolute inset-0 bg-dark-bg flex flex-col items-center justify-center z-20">
       <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
            <h2 className="text-3xl font-bold text-white uppercase italic">Engineering Bay</h2>
            <p className="text-gray-400 text-sm mt-1">
                1. Draw the <span style={{color}}>CHASSIS</span> to protect your pilot.<br/>
                2. Draw the <span className="text-red-500">WEAPON</span> to destroy the enemy.
            </p>
       </div>

       <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button 
                onClick={() => setDrawMode('CHASSIS')}
                className={`p-4 rounded-xl border-2 transition-all ${drawMode === 'CHASSIS' ? 'border-white bg-gray-800 scale-110' : 'border-gray-700 bg-gray-900 opacity-50'}`}
            >
                <div className="text-sm font-bold mb-1" style={{color: color}}>CHASSIS</div>
                <div className="text-xs text-gray-400">Structure</div>
            </button>
            <button 
                onClick={() => setDrawMode('WEAPON')}
                className={`p-4 rounded-xl border-2 transition-all ${drawMode === 'WEAPON' ? 'border-white bg-gray-800 scale-110' : 'border-gray-700 bg-gray-900 opacity-50'}`}
            >
                <div className="text-sm font-bold mb-1 text-red-500">WEAPON</div>
                <div className="text-xs text-gray-400">Damage</div>
            </button>
       </div>

       <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="bg-dark-panel border-2 border-gray-700 rounded-lg cursor-crosshair touch-none shadow-2xl mt-12"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
       />

       <div className="mt-6 flex items-center gap-4">
            <div className="flex gap-2 bg-dark-panel p-2 rounded-lg border border-gray-700">
                {['#00f3ff', '#ff00ff', '#00ff00', '#ffff00'].map(c => (
                    <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            <button onClick={handleClear} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold uppercase text-sm">Clear</button>
            <button onClick={handleSave} className="px-8 py-2 bg-gradient-to-r from-neon-blue to-neon-pink hover:opacity-90 text-black rounded font-bold uppercase text-sm">BATTLE!</button>
       </div>
       <button onClick={onBack} className="mt-4 text-gray-500 hover:text-white text-xs uppercase tracking-widest">Back</button>
    </div>
  );
};