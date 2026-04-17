import React, { useRef, useEffect, useState } from 'react';
import { Entity, CharacterType, CharacterStats, Particle, GameState } from '../types';

interface BrawlGameProps {
  playerCharType: CharacterType;
  cpuCharType?: CharacterType; // Initial CPU type or P2 type
  gameMode: GameState;
  onGameOver: (winner: 'PLAYER' | 'CPU') => void;
  tournamentRound?: number; // 1, 2, 3
  onBack: () => void;
  onUnlockAchievement: (id: string) => void;
}

interface Shockwave {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    life: number;
    width: number;
}

interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    life: number;
    damage: number;
    homing: boolean;
    ownerId: string;
    isPlayerTeam: boolean;
    // Special types
    specialType?: 'FIRE_PILLAR' | 'ICE_SPIKE' | 'VOID_CUT' | 'EARTH_SPIKE' | 'BLACK_HOLE' | 'SOLAR_FLARE' | 'MINE' | 'ROCKET' | 'BULLET' | 'BUG' | 'BONE' | 'TORNADO' | 'SYMBIOTE' | 'TOXIC_PUKE' | 'PHOTON_RAY'; 
    width?: number;
    height?: number;
    delay?: number; // For delayed activation
    hitIds?: string[]; // IDs of entities already hit by this projectile (for lingering hitboxes)
}

interface Ghost extends Entity {
    life: number;
    snapshotTime: number; // The time this snapshot was taken, to freeze pose
}

interface Portal {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    color: string;
    pairId: string;
}

// Arena Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const GRAVITY = 0.6;
const FRICTION = 0.85; 
const AIR_DRAG = 0.96; 
const GROUND_Y = 550;
const CEILING_Y = 50; 
const WALL_SLIDE_SPEED = 1.5;

// Stats map
const CHAR_STATS: Record<CharacterType, CharacterStats> = {
  [CharacterType.NINJA]: { name: 'Ninja', hp: 120, speed: 9, power: 12, color: '#00f3ff', description: '', ability: '', maxSpecialCooldown: 180 },
  [CharacterType.TITAN]: { name: 'Titan', hp: 180, speed: 3, power: 18, color: '#ff4400', description: '', ability: '', maxSpecialCooldown: 300 },
  [CharacterType.VOLT]: { name: 'Volt', hp: 90, speed: 15, power: 8, color: '#ffff00', description: '', ability: '', maxSpecialCooldown: 150 },
  [CharacterType.LANCER]: { name: 'Lancer', hp: 110, speed: 10, power: 14, color: '#bd00ff', description: '', ability: '', maxSpecialCooldown: 240 },
  [CharacterType.PHANTOM]: { name: 'Phantom', hp: 100, speed: 11, power: 10, color: '#00ff00', description: '', ability: '', maxSpecialCooldown: 220 },
  [CharacterType.INFERNO]: { name: 'Inferno', hp: 115, speed: 7, power: 16, color: '#ff3333', description: '', ability: '', maxSpecialCooldown: 280 },
  [CharacterType.GLACIER]: { name: 'Glacier', hp: 150, speed: 4, power: 11, color: '#00ffff', description: '', ability: '', maxSpecialCooldown: 320 },
  [CharacterType.RONIN]: { name: 'Ronin', hp: 100, speed: 11, power: 13, color: '#e0e0e0', description: '', ability: '', maxSpecialCooldown: 200 },
  [CharacterType.ELEMENTAL]: { name: 'Elemental', hp: 150, speed: 6, power: 15, color: '#10b981', description: '', ability: '', maxSpecialCooldown: 260 },
  [CharacterType.MAGIC]: { name: 'Magic', hp: 95, speed: 8, power: 16, color: '#d946ef', description: '', ability: '', maxSpecialCooldown: 290 },
  [CharacterType.ANIMAL]: { name: 'Beast', hp: 140, speed: 13, power: 14, color: '#d97706', description: '', ability: '', maxSpecialCooldown: 160 },
  [CharacterType.DARKNESS]: { name: 'Void', hp: 110, speed: 8, power: 18, color: '#4c1d95', description: '', ability: '', maxSpecialCooldown: 280 },
  [CharacterType.SOLAR]: { name: 'Solar', hp: 130, speed: 7, power: 16, color: '#fbbf24', description: '', ability: '', maxSpecialCooldown: 250 },
  [CharacterType.HEAVY]: { name: 'Heavy', hp: 170, speed: 2, power: 14, color: '#475569', description: '', ability: '', maxSpecialCooldown: 350 },
  [CharacterType.TRAPPER]: { name: 'Trapper', hp: 115, speed: 8, power: 12, color: '#65a30d', description: '', ability: '', maxSpecialCooldown: 200 },
  [CharacterType.SAINT]: { name: 'Saint', hp: 140, speed: 6, power: 11, color: '#fef08a', description: '', ability: '', maxSpecialCooldown: 300 },
  [CharacterType.CYBORG]: { name: 'Cyborg', hp: 155, speed: 5, power: 20, color: '#94a3b8', description: '', ability: '', maxSpecialCooldown: 280 },
  [CharacterType.TIME]: { name: 'Time', hp: 105, speed: 10, power: 11, color: '#bfa15f', description: '', ability: '', maxSpecialCooldown: 300 },
  [CharacterType.DEVIL]: { name: 'Devil', hp: 160, speed: 8, power: 17, color: '#7f1d1d', description: '', ability: '', maxSpecialCooldown: 220 }, // Buffed
  [CharacterType.GRAVITY]: { name: 'Gravity', hp: 150, speed: 4, power: 16, color: '#2e1065', description: '', ability: '', maxSpecialCooldown: 320 },
  [CharacterType.INSECT]: { name: 'Insect', hp: 95, speed: 14, power: 10, color: '#a3e635', description: '', ability: '', maxSpecialCooldown: 190 },
  [CharacterType.BONE]: { name: 'Bone', hp: 160, speed: 5, power: 13, color: '#e5e7eb', description: '', ability: '', maxSpecialCooldown: 240 },
  [CharacterType.WIND]: { name: 'Wind', hp: 100, speed: 13, power: 11, color: '#bae6fd', description: '', ability: '', maxSpecialCooldown: 210 },
  [CharacterType.VENOM]: { name: 'Venom', hp: 130, speed: 12, power: 16, color: '#171717', description: '', ability: '', maxSpecialCooldown: 230 },
  [CharacterType.CHAOS]: { name: 'Chaos', hp: 125, speed: 10, power: 14, color: '#555555', description: '', ability: '', maxSpecialCooldown: 250 },
  [CharacterType.PLANT]: { name: 'Plant', hp: 145, speed: 5, power: 13, color: '#22c55e', description: '', ability: '', maxSpecialCooldown: 240 },
  [CharacterType.CRYSTAL]: { name: 'Crystal', hp: 130, speed: 8, power: 15, color: '#a855f7', description: '', ability: '', maxSpecialCooldown: 260 },
  [CharacterType.ZOMBIE]: { name: 'Zombie', hp: 160, speed: 4, power: 14, color: '#65a30d', description: '', ability: '', maxSpecialCooldown: 220 },
  [CharacterType.MONK]: { name: 'Monk', hp: 125, speed: 9, power: 13, color: '#f97316', description: '', ability: '', maxSpecialCooldown: 180 },
  [CharacterType.LIGHT]: { name: 'Light', hp: 100, speed: 13, power: 12, color: '#fff', description: '', ability: '', maxSpecialCooldown: 150 },
  [CharacterType.VIKING]: { name: 'Viking', hp: 160, speed: 6, power: 16, color: '#94a3b8', description: '', ability: '', maxSpecialCooldown: 200 },
  [CharacterType.PIRATE]: { name: 'Pirate', hp: 130, speed: 8, power: 14, color: '#ef4444', description: '', ability: '', maxSpecialCooldown: 240 },
  [CharacterType.CYBER]: { name: 'Cyber Samurai', hp: 120, speed: 12, power: 15, color: '#f0abfc', description: '', ability: '', maxSpecialCooldown: 180 },
};

export const BrawlGame: React.FC<BrawlGameProps> = ({ playerCharType, cpuCharType, gameMode, onGameOver, tournamentRound = 1, onBack, onUnlockAchievement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [specialCooldown, setSpecialCooldown] = useState(0); 
  const [p2SpecialCooldown, setP2SpecialCooldown] = useState(0); 
  const [waveKillCount, setWaveKillCount] = useState(0);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0); 

  // Visual Flair State
  const [comboCounter, setComboCounter] = useState(0);

  // Audio contexts
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game Loop Refs
  const requestRef = useRef<number>(0);
  const introTimerRef = useRef(180); // 3 seconds at 60fps for intro
  const playerRef = useRef<Entity>({} as Entity);
  const opponentsRef = useRef<Entity[]>([]);
  const alliesRef = useRef<Entity[]>([]); // New: Allies for minion logic
  
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const projectilesRef = useRef<Projectile[]>([]); 
  const shakeRef = useRef<number>(0); 
  const hitStopRef = useRef<number>(0);
  const flashRef = useRef<number>(0);
  const darkenScreenRef = useRef<number>(0);
  const screenTintRef = useRef<{color: string, alpha: number} | null>(null); // Colored screen flashes
  const comboTextRef = useRef<{text: string, x: number, y: number, life: number, scale: number}[]>([]);
  const ghostsRef = useRef<Ghost[]>([]);
  
  const portalsRef = useRef<Portal[]>([]);
  const portalCooldownRef = useRef<number>(0);

  const keysRef = useRef<Record<string, boolean>>({});
  const finisherRef = useRef<{active: boolean, timer: number, type: CharacterType | null, victimX: number, victimY: number}>({active: false, timer: 0, type: null, victimX: 0, victimY: 0});
  const slashesRef = useRef<{x1: number, y1: number, x2: number, y2: number, width: number, color: string, life: number, decay?: number}[]>([]);

  // Wave Mode Refs
  const waveStateRef = useRef({
      nextSpawnTime: 0,
      active: gameMode === GameState.PLAYING_WAVE,
      killCount: 0,
      wave: 1,
      achievedWave5: false
  });

  const createEntity = (type: CharacterType, isPlayer: boolean, x: number, y: number, id: string): Entity => {
      const stats = CHAR_STATS[type];
      let hpMult = 1;
      let calculatedSpeed = stats.speed;
      let calculatedPower = stats.power;
      let calculatedHp = stats.hp;

      // Chaos Random Stats
      if (type === CharacterType.CHAOS) {
          calculatedSpeed = 5 + Math.floor(Math.random() * 12); // 5 to 17
          calculatedPower = 10 + Math.floor(Math.random() * 15); // 10 to 25
          calculatedHp = 90 + Math.floor(Math.random() * 100); // 90 to 190
      }
      
      if (!isPlayer) {
          hpMult = 1.3; 
      }
      
      if (gameMode === GameState.TOURNAMENT_LADDER) {
          if (tournamentRound === 1) { hpMult = 1.2; }
          if (tournamentRound === 2) { hpMult = 1.5; }
          if (tournamentRound === 3) { hpMult = 2.0; }
      }
      
      calculatedHp *= hpMult;
      
      if (gameMode === GameState.PLAYING_WAVE && !isPlayer) {
          calculatedHp = 20 + (waveStateRef.current.wave * 5); 
      }

      return {
          id,
          x, y, vx: 0, vy: 0, width: 40, height: 80,
          color: stats.color,
          hp: calculatedHp,
          maxHp: calculatedHp,
          speed: calculatedSpeed,
          power: calculatedPower,
          isPlayer,
          facingRight: isPlayer,
          state: 'IDLE',
          comboCount: 0,
          lastAttackTime: 0,
          specialCooldown: 0,
          maxSpecialCooldown: stats.maxSpecialCooldown,
          type,
          jumpCount: 0,
          onWall: false,
          rotation: 0,
          vr: 0,
          deadHandled: false,
          frozen: false,
          attackVariant: 0,
          abilityTimer: 0,
          specialChainWindow: 0,
          specialChainStep: 0,
      };
  };

  const addPortalPair = () => {
       const pairId = `pair_${Date.now()}_${Math.random()}`;
       
       // Portals on walls (Left: x=40, Right: x=Width-40)
       // Determine sides. P1 on random side, P2 on opposite side for cross-map traversal.
       const isLeft1 = Math.random() > 0.5;
       
       const x1 = isLeft1 ? 40 : CANVAS_WIDTH - 40;
       const x2 = isLeft1 ? CANVAS_WIDTH - 40 : 40; // Opposite wall

       const y1 = 200 + Math.random() * (GROUND_Y - 350);
       const y2 = 200 + Math.random() * (GROUND_Y - 350);

       const p1 = { 
           id: `p_${Date.now()}_1`, 
           x: x1, 
           y: y1, 
           targetX: 0, targetY: 0, 
           color: '#00f3ff',
           pairId
       };
       const p2 = { 
           id: `p_${Date.now()}_2`, 
           x: x2, 
           y: y2, 
           targetX: 0, targetY: 0, 
           color: '#ff00ff',
           pairId
       };

       // Set targets. If entering P1, exit P2.
       const offset = 60;
       
       if (x2 < 100) { // P2 is Left
           p1.targetX = x2 + offset;
       } else { // P2 is Right
           p1.targetX = x2 - offset;
       }
       p1.targetY = y2; 

       if (x1 < 100) { // P1 is Left
           p2.targetX = x1 + offset;
       } else { // P1 is Right
           p2.targetX = x1 - offset;
       }
       p2.targetY = y1;
       
       portalsRef.current.push(p1, p2);
       createParticles(p1.x, p1.y, p1.color, 20);
       createParticles(p2.x, p2.y, p2.color, 20);
  };

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
    }

    playerRef.current = createEntity(playerCharType, true, 200, 300, 'p1');
    setPlayerHealth(playerRef.current.hp);

    opponentsRef.current = [];
    alliesRef.current = [];
    portalsRef.current = [];
    
    if (gameMode === GameState.PLAYING_WAVE) {
        spawnWaveEnemy();
        spawnWaveEnemy();
    } else if (gameMode === GameState.PLAYING_FREERUN) {
        // Spawn multiple sets of portals
        addPortalPair();
        addPortalPair();
        addPortalPair();
    } else {
        let targetCpuType = cpuCharType || CharacterType.NINJA;
        
        if (!cpuCharType && gameMode !== GameState.PLAYING_PVP) {
            const types = Object.keys(CHAR_STATS) as CharacterType[];
            targetCpuType = types[Math.floor(Math.random() * types.length)];
        }
        
        const opponent = createEntity(targetCpuType, false, CANVAS_WIDTH - 200, 300, 'cpu1');
        opponentsRef.current.push(opponent);
    }

    const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const spawnWaveEnemy = () => {
      const types = Object.keys(CHAR_STATS) as CharacterType[];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const x = Math.random() > 0.5 ? -50 : CANVAS_WIDTH + 50;
      const enemy = createEntity(randomType, false, x, 300, `wave_${Date.now()}_${Math.random()}`);
      opponentsRef.current.push(enemy);
  };

  const playSound = (type: 'hit' | 'swing' | 'jump' | 'special' | 'heavy' | 'finisher' | 'laser' | 'ice' | 'burn' | 'gun' | 'wind' | 'bug' | 'time') => {
      if (!audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      const now = audioCtxRef.current.currentTime;
      
      if (type === 'hit') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'heavy') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
      } else if (type === 'gun') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'swing') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
      } else if (type === 'jump') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(300, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'special') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.4);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
      } else if (type === 'laser') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
      } else if (type === 'ice') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
      } else if (type === 'burn') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(50, now + 1.0);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 1.0);
          osc.start(now);
          osc.stop(now + 1.0);
      } else if (type === 'finisher') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(50, now);
          osc.frequency.linearRampToValueAtTime(20, now + 2.0);
          gain.gain.setValueAtTime(0.8, now);
          gain.gain.linearRampToValueAtTime(0, now + 2.0);
          osc.start(now);
          osc.stop(now + 2.0);
      } else if (type === 'wind') {
          osc.type = 'sine'; 
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(500, now + 0.5);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
      } else if (type === 'bug') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(400, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'time') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
      }
  };

  const createParticles = (x: number, y: number, color: string, count: number, speed: number = 10) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        life: 1.0,
        color: color,
        size: Math.random() * 5 + 2
      });
    }
  };

  const addShockwave = (x: number, y: number, color: string) => {
      shockwavesRef.current.push({
          x, y,
          radius: 10,
          maxRadius: 120,
          color: color,
          life: 1.0,
          width: 10
      });
  };

  const showComboText = (txt: string, x: number, y: number, isBig: boolean = false) => {
      comboTextRef.current.push({ 
          text: txt, 
          x, 
          y, 
          life: 1.0, 
          scale: isBig ? 1.5 : 1.0 
      });
  };

  const checkCollision = (attacker: Entity, defender: Entity, rangeBonus: number = 0) => {
    if (defender.state === 'DEAD' || defender.state === 'FINISHER') return false;
    const range = attacker.width + 50 + rangeBonus; 
    const dx = Math.abs(attacker.x - defender.x);
    const dy = Math.abs(attacker.y - defender.y);

    if (dx < range && dy < 90) {
       const facingEnemy = (attacker.x < defender.x && attacker.facingRight) || (attacker.x > defender.x && !attacker.facingRight);
       if (facingEnemy || dx < 40) {
           return true;
       }
    }
    return false;
  };

  const executeSpecial = (ent: Entity, opponents: Entity[], overrideType?: CharacterType) => {
      if (ent.state === 'DEAD') return;
      const type = overrideType || ent.type;

      if (ent.type !== CharacterType.CHAOS) {
          ent.state = 'ABILITY';
          ent.specialCooldown = ent.maxSpecialCooldown;
          ent.vy = 0; ent.vx = 0;
      }
      
      const target = opponents.reduce((prev, curr) => {
          const distPrev = Math.abs(ent.x - prev.x);
          const distCurr = Math.abs(ent.x - curr.x);
          return distCurr < distPrev ? curr : prev;
      }, opponents[0]);
      
      if (!target && gameMode !== GameState.PLAYING_WAVE && gameMode !== GameState.PLAYING_FREERUN && opponents.length > 0) return;

      if (!overrideType) {
          playSound('special');
          addShockwave(ent.x + ent.width/2, ent.y + ent.height/2, ent.color);
      }

      if (type === CharacterType.CHAOS) {
          ent.state = 'ABILITY';
          ent.specialCooldown = ent.maxSpecialCooldown;
          playSound('time');
          showComboText("???", ent.x, ent.y - 50, true);
          createParticles(ent.x, ent.y, '#fff', 30);
          
          const possibleTypes = Object.keys(CHAR_STATS).filter(t => t !== CharacterType.CHAOS) as CharacterType[];
          const randomType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
          executeSpecial(ent, opponents, randomType);
          return;
      }

      if (type === CharacterType.VENOM) {
          ent.vy = -10;
          playSound('bug');
          const dir = ent.facingRight ? 1 : -1;
          for(let i=0; i<8; i++) {
              projectilesRef.current.push({
                  x: ent.x + (Math.random()-0.5)*20, y: ent.y - 20, 
                  vx: dir * (10 + Math.random()*10), vy: (Math.random()-0.5)*10,
                  radius: 8, color: '#000', life: 80, damage: 5, homing: true,
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'SYMBIOTE'
              });
          }
          ent.state = 'IDLE';
      }
      else if (type === CharacterType.TIME) {
           playSound('time');
           darkenScreenRef.current = 20; 
           opponents.forEach(op => {
               op.frozen = true;
               op.state = 'STUNNED';
               op.vx = 0; op.vy = 0;
               createParticles(op.x, op.y, '#bfa15f', 10);
           });
           ent.vx = ent.facingRight ? 50 : -50; 
           setTimeout(() => {
                opponents.forEach(op => {
                    op.frozen = false;
                    applyDamage(ent, op, 20); 
                    showComboText("STOP!", op.x, op.y - 40);
                    op.vx = (Math.random()-0.5) * 20;
                    op.vy = -10;
                });
                ent.state = 'IDLE';
           }, 800);
      }
      else if (type === CharacterType.DEVIL) {
           ent.vy = -15;
           playSound('burn');
           const targetX = target ? target.x : ent.x + (ent.facingRight ? 200 : -200);
           
           // Visuals
           shakeRef.current = 20;
           screenTintRef.current = { color: 'rgba(100, 0, 0, 0.4)', alpha: 0.6 };
           addShockwave(targetX, GROUND_Y, '#7f1d1d');

           // Hellfire area - BUFFED
           for(let i=0; i<5; i++) {
               const pillarX = targetX + (Math.random()-0.5) * 200;
               projectilesRef.current.push({
                   x: pillarX, y: GROUND_Y, vx: 0, vy: 0,
                   radius: 40, color: '#ef4444', life: 50, damage: 18, homing: false,
                   ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'FIRE_PILLAR',
                   width: 60, height: 350, delay: i*10
               });
           }
           setTimeout(() => ent.state = 'IDLE', 600);
      }
      else if (type === CharacterType.GRAVITY) {
           playSound('heavy');
           shakeRef.current = 15;
           const zoneX = target ? target.x : ent.x + (ent.facingRight ? 150 : -150);
           projectilesRef.current.push({
               x: zoneX, y: GROUND_Y - 100, vx: 0, vy: 0,
               radius: 100, color: '#2e1065', life: 120, damage: 1, homing: false,
               ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'BLACK_HOLE'
           });
           ent.state = 'IDLE';
      }
      else if (type === CharacterType.INSECT) {
           playSound('bug');
           for(let i=0; i<6; i++) {
               projectilesRef.current.push({
                   x: ent.x + (Math.random()-0.5)*40, y: ent.y - 40, 
                   vx: (Math.random()-0.5)*10, vy: -10 - Math.random()*5,
                   radius: 6, color: '#a3e635', life: 200, damage: 4, homing: true,
                   ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'BUG'
               });
           }
           ent.state = 'IDLE';
      }
      else if (type === CharacterType.BONE) {
           ent.vy = -5;
           playSound('heavy');
           for(let i=1; i<3; i++) {
               const dist = i * 60;
               projectilesRef.current.push({
                   x: ent.x + (ent.facingRight ? dist : -dist), y: GROUND_Y, vx: 0, vy: 0,
                   radius: 20, color: '#e5e7eb', life: 40, damage: 8, homing: false,
                   ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'EARTH_SPIKE',
                   width: 30, height: 80 + i*15, delay: i*8
               });
           }
           setTimeout(() => ent.state = 'IDLE', 600);
      }
      else if (type === CharacterType.WIND) {
           playSound('wind');
           const dir = ent.facingRight ? 1 : -1;
           projectilesRef.current.push({
               x: ent.x + dir * 50, y: GROUND_Y - 50, vx: dir * 15, vy: 0,
               radius: 60, color: '#bae6fd', life: 100, damage: 15, homing: false,
               ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'TORNADO',
               width: 100, height: 200
           });
           ent.vx = -dir * 10; 
           ent.state = 'IDLE';
      }
      else if (type === CharacterType.SOLAR) {
          ent.vy = -10;
          for(let i=0; i<3; i++) {
              projectilesRef.current.push({
                  x: ent.x + (Math.random()-0.5)*50, y: ent.y - 50, vx: 0, vy: -5,
                  radius: 20, color: '#fbbf24', life: 180, damage: 15, homing: true,
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'SOLAR_FLARE'
              });
          }
          setTimeout(() => ent.state = 'IDLE', 600);
      }
      else if (type === CharacterType.HEAVY) {
          ent.state = 'ABILITY';
          ent.abilityTimer = 60;
      }
      else if (type === CharacterType.TRAPPER) {
          playSound('heavy');
          projectilesRef.current.push({
              x: ent.x, y: GROUND_Y - 5, vx: 0, vy: 0,
              radius: 15, color: '#65a30d', life: 600, damage: 30, homing: false,
              ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'MINE'
          });
          ent.state = 'IDLE';
      }
      else if (type === CharacterType.SAINT) {
          addShockwave(ent.x + ent.width/2, ent.y + ent.height/2, '#fef08a');
          createParticles(ent.x, ent.y, '#fef08a', 40);
          ent.hp = Math.min(ent.maxHp, ent.hp + 20); 
          showComboText("HEAL!", ent.x, ent.y - 60);
          
          opponents.forEach(op => {
              const dx = op.x - ent.x;
              const dy = op.y - ent.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 300) {
                  op.vx = dx > 0 ? 30 : -30; 
                  op.vy = -10;
                  op.state = 'HIT';
                  applyDamage(ent, op, 5);
              }
          });
          setTimeout(() => ent.state = 'IDLE', 500);
      }
      else if (type === CharacterType.CYBORG) {
          ent.state = 'ATTACK';
          const dir = ent.facingRight ? 1 : -1;
          projectilesRef.current.push({
              x: ent.x + dir * 40, y: ent.y, vx: dir * 5, vy: 0,
              radius: 12, color: '#94a3b8', life: 120, damage: 22, homing: false,
              ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'ROCKET'
          });
          setTimeout(() => ent.state = 'IDLE', 400);
      }
      else if (type === CharacterType.RONIN) {
          if (!target) return;
          const destX = target.x + (target.facingRight ? -80 : 80);
          createParticles(ent.x, ent.y, '#e0e0e0', 10);
          ent.x = destX; 
          ent.y = target.y;
          ent.facingRight = !target.facingRight;
          darkenScreenRef.current = 25; 
          hitStopRef.current = 30;     
          shakeRef.current = 5;

          for(let i=0; i<10; i++) {
              slashesRef.current.push({
                  x1: target.x + (Math.random()-0.5)*200, y1: target.y + (Math.random()-0.5)*200,
                  x2: target.x + (Math.random()-0.5)*200, y2: target.y + (Math.random()-0.5)*200,
                  width: 2, color: '#fff', life: 1.0
              });
          }

          projectilesRef.current.push({
              x: target.x, y: target.y, vx: 0, vy: 0,
              radius: 300, // Increased radius to guarantee hit
              color: 'transparent', life: 1, 
              damage: 60, // Buffed damage (was 30)
              homing: false,
              ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'VOID_CUT', delay: 30
          });
          
          ent.state = 'ATTACK';
          setTimeout(() => {
               ent.state = 'IDLE'; 
               playSound('swing'); 
          }, 500);
      } 
      else if (type === CharacterType.GLACIER) {
          ent.vy = -5;
          createParticles(ent.x, ent.y, '#00ffff', 30);
          
          // --- VISUAL BUFF ---
          screenTintRef.current = { color: 'rgba(0, 255, 255, 0.4)', alpha: 0.6 };
          hitStopRef.current = 10; // Time freeze feel
          // Screen-wide frost particles
          for(let i=0; i<50; i++) {
              particlesRef.current.push({
                  x: Math.random() * CANVAS_WIDTH,
                  y: Math.random() * CANVAS_HEIGHT,
                  vx: 0,
                  vy: 0.5, 
                  life: 2.0, 
                  color: '#fff',
                  size: 2
              });
          }
          // -------------------

          const spikeCount = 2; 
          for(let i=1; i<=spikeCount; i++) {
              projectilesRef.current.push({
                  x: ent.x, y: GROUND_Y, vx: 12, vy: 0,
                  radius: 35, color: 'transparent', life: 30, damage: 3, homing: false, 
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'ICE_SPIKE', delay: i * 5,
                  width: 35, height: 60 + i*10
              });
              projectilesRef.current.push({
                  x: ent.x, y: GROUND_Y, vx: -12, vy: 0,
                  radius: 35, color: 'transparent', life: 30, damage: 3, homing: false,
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'ICE_SPIKE', delay: i * 5,
                  width: 35, height: 60 + i*10
              });
          }
          ent.state = 'ATTACK';
          setTimeout(() => ent.state = 'IDLE', 800);
      }
      else if (type === CharacterType.INFERNO) {
          ent.vy = -10;
          playSound('burn');
          const targetX = target ? target.x : ent.x + (ent.facingRight ? 200 : -200);

          // --- VISUAL BUFF ---
          shakeRef.current = 25; // Intensify shake
          screenTintRef.current = { color: 'rgba(255, 50, 0, 0.4)', alpha: 0.5 };
          // Rain of fire particles
          for(let i=0; i<30; i++) {
                particlesRef.current.push({
                    x: targetX + (Math.random()-0.5)*400,
                    y: -50,
                    vx: (Math.random()-0.5)*5,
                    vy: 15 + Math.random()*10,
                    life: 1.0,
                    color: '#ffaa00',
                    size: 4 + Math.random()*4
                });
          }
          // -------------------

          for(let i=0; i<3; i++) {
              const pillarX = targetX + (Math.random()-0.5)*150;
              projectilesRef.current.push({
                  x: pillarX, y: GROUND_Y, vx: 0, vy: 0,
                  radius: 50, color: '#ff3333', life: 60, damage: 15, homing: false, 
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'FIRE_PILLAR', delay: 20 + i*15,
                  width: 80, height: 400
              });
          }
          ent.state = 'ATTACK';
          setTimeout(() => ent.state = 'IDLE', 1000);
      }
      else if (type === CharacterType.ANIMAL) {
          if (!target) return;
          createParticles(ent.x, ent.y, '#d97706', 15);
          playSound('jump');
          const dx = target.x - ent.x;
          ent.vx = dx > 0 ? 30 : -30; 
          ent.vy = -5;
          ent.facingRight = dx > 0;
          ent.state = 'ABILITY';
          slashesRef.current.push({
              x1: ent.x, y1: ent.y, x2: target.x, y2: target.y,
              width: 40, color: '#d97706', life: 0.5, decay: 0.1
          });
      }
      else if (type === CharacterType.DARKNESS) {
          ent.vy = -20;
          playSound('special');
          const tx = target ? target.x : ent.x + (ent.facingRight?200:-200);
          
          // --- VISUAL BUFF ---
          darkenScreenRef.current = 40; 
          // Implosion particles
          for(let i=0; i<30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 200;
                particlesRef.current.push({
                    x: tx + Math.cos(angle) * dist,
                    y: (target ? target.y - 50 : ent.y) + Math.sin(angle) * dist,
                    vx: -Math.cos(angle) * 12,
                    vy: -Math.sin(angle) * 12,
                    life: 0.5,
                    color: '#000',
                    size: 4
                });
          }
          // -------------------

          projectilesRef.current.push({
              x: tx, y: target ? target.y - 50 : ent.y, vx: 0, vy: 0,
              radius: 10, color: '#000', life: 100, damage: 2, homing: false,
              ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'BLACK_HOLE'
          });
          setTimeout(() => ent.state = 'IDLE', 500);
      }
      else if (type === CharacterType.VOLT) {
          if (!target) return;
          createParticles(ent.x, ent.y, '#ffff00', 20, 20);
          
          // --- VISUAL BUFF ---
          // Lightning Trail
          slashesRef.current.push({
                x1: ent.x, y1: ent.y,
                x2: target.x + (target.facingRight ? -80 : 80), y2: target.y,
                width: 5, color: '#ffff00', life: 0.5
          });
          flashRef.current = 3; 
          // -------------------

          ent.x = target.x + (target.facingRight ? -80 : 80);
          ent.y = target.y;
          ent.facingRight = !target.facingRight;
          ent.vx = ent.facingRight ? 15 : -15; 
          hitStopRef.current = 5;
          setTimeout(() => {
              if (checkCollision(ent, target, 50)) {
                  applyDamage(ent, target, 15);
                  target.vx = ent.facingRight ? 10 : -10;
                  createParticles(target.x, target.y, '#ff0000', 10);
                  addShockwave(target.x, target.y, '#ffff00');
                  shakeRef.current = 8;
                  playSound('hit');
              }
          }, 100);
      } else if (type === CharacterType.TITAN) {
          ent.vy = -18; 
          setTimeout(() => {
             ent.vy = 30; // Slam
          }, 250);
      } else if (type === CharacterType.NINJA) {
          ent.vx = ent.facingRight ? 40 : -40;
          createParticles(ent.x, ent.y, '#00f3ff', 15);
          hitStopRef.current = 5;
      } else if (type === CharacterType.LANCER) {
          let hitCount = 0;
          const interval = setInterval(() => {
              hitCount++;
              if (hitCount > 5) clearInterval(interval);
              createParticles(ent.x + (ent.facingRight?60:-60), ent.y, '#bd00ff', 3);
              opponents.forEach(op => {
                  if (checkCollision(ent, op, 150)) {
                      applyDamage(ent, op, 4);
                      op.vx = ent.facingRight ? 4 : -4; 
                      playSound('hit');
                  }
              });
          }, 50);
      } else if (type === CharacterType.PHANTOM) {
          createParticles(ent.x, ent.y, '#00ff00', 20);
          for(let i=0; i<3; i++) {
              const angle = -Math.PI/2 + (i-1)*0.5;
              const sx = Math.cos(angle) * 10;
              const sy = Math.sin(angle) * 10;
              projectilesRef.current.push({
                  x: ent.x + ent.width/2,
                  y: ent.y,
                  vx: sx,
                  vy: sy,
                  radius: 8,
                  color: '#00ff00',
                  life: 150,
                  damage: 6,
                  homing: true,
                  ownerId: ent.id,
                  isPlayerTeam: ent.isPlayer
              });
          }
          ent.state = 'IDLE';
      } else if (type === CharacterType.ELEMENTAL) {
          ent.state = 'ATTACK';
          shakeRef.current = 10;
          playSound('heavy');
          const spikeCount = 2; 
          for(let i=1; i<=spikeCount; i++) {
               const dist = i * 70;
               const spikeX = ent.x + (ent.facingRight ? dist : -dist);
               projectilesRef.current.push({
                    x: spikeX, y: GROUND_Y, vx: 0, vy: 0,
                    radius: 50, color: '#10b981', life: 40, damage: 8, homing: false,
                    ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'EARTH_SPIKE', delay: i * 8,
                    width: 50, height: 120 
                });
          }
          setTimeout(() => ent.state = 'IDLE', 600);
      } else if (type === CharacterType.MAGIC) {
          ent.state = 'ATTACK';
          playSound('laser');
          
          // --- VISUAL BUFF ---
          // Main Purple Beam
          slashesRef.current.push({
              x1: ent.x, y1: ent.y - 30,
              x2: ent.facingRight ? ent.x + 800 : ent.x - 800, y2: ent.y - 30,
              width: 50, color: '#d946ef', life: 1.0, decay: 0.02
          });
          // White Core
          slashesRef.current.push({
                x1: ent.x, y1: ent.y - 30,
                x2: ent.facingRight ? ent.x + 800 : ent.x - 800, y2: ent.y - 30,
                width: 20, color: '#ffffff', life: 1.0, decay: 0.02
          });
          shakeRef.current = 15; 
          // -------------------

          opponents.forEach(op => {
               const inRangeX = ent.facingRight ? (op.x > ent.x) : (op.x < ent.x);
               if (inRangeX && Math.abs(op.y - ent.y) < 80) {
                   applyDamage(ent, op, 18); 
                   op.vx = ent.facingRight ? 15 : -15;
                   createParticles(op.x, op.y, '#d946ef', 20);
                   flashRef.current = 3;
                   shakeRef.current = 10;
               }
          });
          setTimeout(() => ent.state = 'IDLE', 500);
      } else if (type === CharacterType.PLANT) {
          ent.state = 'ATTACK';
          playSound('swing');
          const dist = 300;
          const tx = ent.x + (ent.facingRight ? dist : -dist);
          slashesRef.current.push({
              x1: ent.x, y1: ent.y,
              x2: tx, y2: ent.y + 50,
              width: 20, color: '#22c55e', life: 1.0, decay: 0.05
          });
          opponents.forEach(op => {
               if (Math.abs(op.x - ent.x) < dist && (ent.facingRight ? op.x > ent.x : op.x < ent.x)) {
                   applyDamage(ent, op, 25);
                   op.vx = ent.facingRight ? -15 : 15; // Pull in
                   op.vy = -5;
                   createParticles(op.x, op.y, '#22c55e', 10);
               }
          });
          setTimeout(() => ent.state = 'IDLE', 400);
      } else if (type === CharacterType.CRYSTAL) {
          ent.state = 'ATTACK';
          playSound('ice');
          for(let i=0; i<5; i++) {
              const angle = (Math.random()-0.5) + (ent.facingRight ? 0 : Math.PI);
              projectilesRef.current.push({
                  x: ent.x, y: ent.y,
                  vx: Math.cos(angle)*15, vy: Math.sin(angle)*15,
                  radius: 8, color: '#a855f7', life: 60, damage: 8, homing: false,
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer
              });
          }
          setTimeout(() => ent.state = 'IDLE', 300);
      } else if (type === CharacterType.ZOMBIE) {
          ent.vy = -10;
          playSound('special');
          // Spawn 2 zombies
          for(let i=0; i<2; i++) {
              const x = ent.x + (ent.facingRight ? 50 + i*30 : -50 - i*30);
              const minion = createEntity(CharacterType.ZOMBIE, ent.isPlayer, x, ent.y, `minion_${Date.now()}_${Math.random()}`);
              minion.hp = 40;
              minion.maxHp = 40;
              minion.width = 30; // Smaller
              minion.height = 60;
              minion.power = 6;
              minion.speed = 6;
              minion.color = '#4d7c0f'; // Darker green
              
              if (ent.isPlayer) {
                  alliesRef.current.push(minion);
              } else {
                  opponentsRef.current.push(minion);
              }
              createParticles(x, ent.y, '#65a30d', 15);
          }
          ent.state = 'IDLE';
      } else if (type === CharacterType.MONK) {
          createParticles(ent.x, ent.y, '#f97316', 20);
          ent.state = 'ATTACK';
          const interval = setInterval(() => {
              const dx = (Math.random() - 0.5) * 60 + (ent.facingRight ? 40 : -40);
              const dy = (Math.random() - 0.5) * 60;
              createParticles(ent.x + dx, ent.y + dy, '#fff', 5);
              
              opponents.forEach(op => {
                  if (checkCollision(ent, op, 60)) {
                      applyDamage(ent, op, 3);
                      op.vx = ent.facingRight ? 2 : -2;
                      playSound('hit');
                  }
              });
          }, 50);
          setTimeout(() => { clearInterval(interval); ent.state = 'IDLE'; }, 1000);
      } else if (type === CharacterType.LIGHT) {
          const tx = target ? target.x : ent.x + (ent.facingRight ? 300 : -300);
          createParticles(ent.x, ent.y, '#fff', 20);
          ent.x = tx + (ent.facingRight ? -50 : 50);
          createParticles(ent.x, ent.y, '#fff', 20);
          playSound('laser');
          
          slashesRef.current.push({
              x1: ent.x - 500, y1: ent.y, x2: ent.x + 500, y2: ent.y,
              width: 10, color: '#fff', life: 0.5, decay: 0.1
          });
          
          opponents.forEach(op => {
              if (Math.abs(op.y - ent.y) < 50) {
                  applyDamage(ent, op, 20);
                  op.state = 'STUNNED';
                  flashRef.current = 5;
              }
          });
          ent.state = 'IDLE';
      }
  };

  const triggerFinisher = (player: Entity, victim: Entity) => {
      if (finisherRef.current.active) return;
      const duration = 300; 

      finisherRef.current = { active: true, timer: duration, type: player.type, victimX: victim.x, victimY: victim.y };
      slashesRef.current = [];
      player.state = 'FINISHER';
      victim.state = 'STUNNED';
      victim.vx = 0; victim.vy = 0;
      player.vx = 0; player.vy = 0;
      playSound('finisher');
  };

  const applyDamage = (attacker: Entity, defender: Entity, baseDamage: number) => {
      let dmg = baseDamage;
      if (!attacker.isPlayer && defender.isPlayer && gameMode !== GameState.PLAYING_PVP) {
          dmg *= 0.5;
      }
      defender.hp -= dmg;
      if (defender.state !== 'STUNNED' && defender.state !== 'FINISHER' && !defender.frozen) defender.state = 'HIT';

      if (dmg > 10 && !defender.frozen) {
          defender.vr = (Math.random() > 0.5 ? 1 : -1) * (0.1 + dmg * 0.01);
      }
      
      if (defender.frozen && dmg > 15) {
          defender.frozen = false;
          playSound('ice');
          createParticles(defender.x, defender.y, '#00ffff', 20, 5);
          showComboText("SHATTER!", defender.x, defender.y - 50, true);
      }
  };

  const updateEntity = (ent: Entity, keys: Record<string, boolean> | null, opponents: Entity[], isControlled: boolean = false) => {
     if (ent.state === 'FINISHER') return;
     
     if (ent.frozen) {
         ent.vx = 0;
         ent.vy = 0;
         ent.state = 'STUNNED';
         if (Math.random() < 0.02) { 
             ent.frozen = false; 
             createParticles(ent.x, ent.y, '#ccffff', 10);
         }
         return; 
     }
     if (ent.state === 'STUNNED') {
         if(Math.random() < 0.02) ent.state = 'IDLE';
         return;
     }

     if (ent.state === 'DEAD') {
         if (ent.y < GROUND_Y - ent.height) ent.rotation += ent.vr;
         else ent.rotation = Math.PI/2; 
     } else {
         ent.rotation += ent.vr;
         ent.vr *= 0.9;
         if (Math.abs(ent.rotation) > 0.01) {
             ent.vr += -ent.rotation * 0.1;
         } else {
             ent.rotation = 0;
         }
     }

     if (ent.hp <= 0 && ent.state !== 'DEAD') {
         ent.state = 'DEAD';
         ent.vx = 0;
         ent.frozen = false;
         
         if (gameMode === GameState.PLAYING_WAVE && !ent.isPlayer && !ent.deadHandled) {
             ent.deadHandled = true;
             waveStateRef.current.killCount++;
             setWaveKillCount(c => c + 1);
             ent.vy = -20;
             ent.vx = (Math.random() - 0.5) * 30;
             ent.vr = (Math.random() - 0.5) * 0.5;
         } else if (gameMode === GameState.PLAYING_WAVE && !ent.isPlayer) {
             // Force despawn logic for existing dead bodies in wave mode to prevent lingering special usage
             ent.y += 5; // Fall faster
         }
         return;
     }

     if (ent.specialCooldown > 0) ent.specialCooldown--;

     if (ent.type === CharacterType.HEAVY && ent.state === 'ABILITY') {
         ent.vx = 0;
         ent.abilityTimer--;
         if (ent.abilityTimer % 5 === 0) {
             const dir = ent.facingRight ? 1 : -1;
             projectilesRef.current.push({
                  x: ent.x + (ent.facingRight ? 40 : 0), y: ent.y + 25, vx: dir * 25, vy: (Math.random()-0.5)*2,
                  radius: 4, color: '#fbbf24', life: 50, damage: 8, homing: false,
                  ownerId: ent.id, isPlayerTeam: ent.isPlayer, specialType: 'BULLET'
              });
              playSound('gun');
              ent.vx = -dir * 2; 
         }
         if (ent.abilityTimer <= 0) ent.state = 'IDLE';
     }

     let input = {
         left: false, right: false, up: false, attack: false, special: false, jumpHeld: false
     };

     if (isControlled && keys) {
         let left = keys['a'] || keys['A'];
         let right = keys['d'] || keys['D'];
         let up = keys['w'] || keys['W'];
         let attack = keys['z'] || keys['Z'];
         let special = keys['x'] || keys['X'];
         let jumpHeld = keys['jumpHeld_p1'] || false;

         if (!ent.isPlayer && gameMode === GameState.PLAYING_PVP) {
             // P2 Controls
             left = keys['ArrowLeft'];
             right = keys['ArrowRight'];
             up = keys['ArrowUp'];
             attack = keys['n'] || keys['N'];
             special = keys['m'] || keys['M'];
             jumpHeld = keys['jumpHeld_p2'] || false;
         } else if (gameMode !== GameState.PLAYING_PVP && ent.isPlayer) {
             // Single Player Alternate
             left = left || keys['ArrowLeft'];
             right = right || keys['ArrowRight'];
             up = up || keys['ArrowUp'];
         }

         input.left = left;
         input.right = right;
         input.up = up;
         input.attack = attack;
         input.special = special;
         input.jumpHeld = jumpHeld;
     }

     if (isControlled) {
        if (ent.state !== 'ATTACK' && ent.state !== 'ABILITY' && ent.state !== 'HIT') {
            const isAir = ent.y < GROUND_Y - ent.height;
            const isFreerun = gameMode === GameState.PLAYING_FREERUN;
            
            // Movement speed affects acceleration
            // Normalize speed around 9 (Ninja). 1.5 base Acc.
            const speedMult = ent.speed / 9;
            const baseAcc = (isFreerun ? 7.0 : 1.5) * (speedMult * 0.7 + 0.3); // dampen effect slightly
            const airAcc = (isFreerun ? 5.0 : 1.75) * (speedMult * 0.7 + 0.3);
            const acc = isAir ? airAcc : baseAcc; 
            
            if (input.right) { 
                ent.vx += acc; ent.facingRight = true; ent.state = 'RUN'; 
            }
            if (input.left) { 
                ent.vx -= acc; ent.facingRight = false; ent.state = 'RUN'; 
            }
            
            if (!input.right && !input.left) {
                 if (Math.abs(ent.vx) < 0.5) ent.state = 'IDLE'; 
            }

            if (ent.onWall) {
                const pushingWall = (ent.x < 100 && input.left) || (ent.x > CANVAS_WIDTH - 100 && input.right);
                if (pushingWall && ent.vy > 0) {
                    ent.vy = Math.min(ent.vy, WALL_SLIDE_SPEED);
                }
            }

            const jumpKeyName = ent.isPlayer ? 'jumpHeld_p1' : 'jumpHeld_p2';
            const jumpPower = isFreerun ? -40 : -20;
            const wallJumpPower = isFreerun ? -30 : -18;
            
            if (input.up) {
                if (!input.jumpHeld) { 
                    if (keys) keys[jumpKeyName] = true;
                    
                    if (ent.onWall) {
                        ent.vy = wallJumpPower;
                        ent.vx = ent.x < 400 ? 15 : -15; 
                        ent.facingRight = !ent.facingRight;
                        ent.onWall = false;
                        ent.jumpCount = 1;
                        playSound('jump');
                        createParticles(ent.x + (ent.facingRight ? -20 : 20), ent.y, '#fff', 5);
                    } else if (ent.y >= GROUND_Y - ent.height - 5) { 
                        ent.vy = isFreerun ? -45 : -22; 
                        ent.jumpCount = 1;
                        playSound('jump');
                    } else if (ent.jumpCount < 2) {
                        ent.vy = jumpPower; 
                        ent.jumpCount = 2;
                        playSound('jump');
                        createParticles(ent.x, ent.y + 40, '#fff', 5);
                    }
                }
            } else {
                if (keys) keys[jumpKeyName] = false;
            }
        }

        if (input.attack && ent.state !== 'HIT' && ent.state !== 'ABILITY') {
             const now = Date.now();
             const timeSinceLast = now - ent.lastAttackTime;
             
             if (timeSinceLast > 1200) {
                 ent.comboCount = 0;
                 if (ent.isPlayer && ent.id === 'p1') setComboCounter(0);
             }
             
             if (timeSinceLast > 350) { 
                 ent.state = 'ATTACK';
                 ent.lastAttackTime = now;
                 
                 // COMBO LOGIC - 3 Distinct Styles
                 // 0: Blitz (Speed, multi-hit)
                 // 1: Power (Heavy, slam)
                 // 2: Technical (Air launcher)
                 
                 if (ent.comboCount === 0) {
                     ent.attackVariant = Math.floor(Math.random() * 3);
                     // Direction override
                     if (input.right !== input.left) {
                         const movingForward = (input.right && ent.facingRight) || (input.left && !ent.facingRight);
                         if (movingForward) ent.attackVariant = 1; // Power
                         else ent.attackVariant = 2; // Tech
                     }
                 }

                 let maxCombo = 3;
                 let comboName = "";
                 
                 // --- VARIANT 0: BLITZ (5 hits) ---
                 if (ent.attackVariant === 0) {
                     maxCombo = 5;
                     ent.comboCount++;
                     if (ent.comboCount > maxCombo) { ent.comboCount = 1; ent.attackVariant = Math.floor(Math.random()*3); }
                     
                     if (ent.comboCount === 1) comboName = "JAB";
                     else if (ent.comboCount === 2) comboName = "CROSS";
                     else if (ent.comboCount === 3) comboName = "HOOK";
                     else if (ent.comboCount === 4) comboName = "RUSH";
                     else if (ent.comboCount === 5) comboName = "FINISH";
                 } 
                 // --- VARIANT 1: POWER (3 hits) ---
                 else if (ent.attackVariant === 1) {
                     maxCombo = 3;
                     ent.comboCount++;
                     if (ent.comboCount > maxCombo) { ent.comboCount = 1; ent.attackVariant = 0; }
                     
                     if (ent.comboCount === 1) comboName = "BASH";
                     else if (ent.comboCount === 2) comboName = "CRUSH";
                     else if (ent.comboCount === 3) comboName = "SLAM";
                 }
                 // --- VARIANT 2: TECH (4 hits) ---
                 else {
                     maxCombo = 4;
                     ent.comboCount++;
                     if (ent.comboCount > maxCombo) { ent.comboCount = 1; ent.attackVariant = 1; }
                     
                     if (ent.comboCount === 1) comboName = "SWEEP";
                     else if (ent.comboCount === 2) comboName = "LAUNCH";
                     else if (ent.comboCount === 3) comboName = "SPIN";
                     else if (ent.comboCount === 4) comboName = "SPIKE";
                 }

                 if (ent.isPlayer && ent.id === 'p1') {
                     setComboCounter(ent.comboCount);
                     if (ent.comboCount > 1) showComboText(comboName, ent.x, ent.y - 60);
                 }

                 // Physics & Damage Calculation
                 let dmg = ent.power; 
                 let knockbackX = 10; 
                 let knockbackY = -5;
                 let range = 30;
                 let hitStun = 5;
                 let shake = 0;
                 let particleColor = '#fff';

                 // Blitz Stats
                 if (ent.attackVariant === 0) {
                     dmg *= 0.6; // Low dmg per hit
                     knockbackX = 5;
                     particleColor = '#00f3ff';
                     
                     if (ent.comboCount === 4) { // Flurry
                         dmg *= 0.5;
                         hitStun = 2; // Fast
                         knockbackX = 2;
                         // Multi-hit handled visually or via logic? Logic below handles single hit per press usually.
                         // We can make flurry trigger multiple hits if we wanted, but let's stick to 1 press = 1 hit logic for control feel
                     }
                     if (ent.comboCount === 5) {
                         dmg *= 2.0;
                         knockbackX = 30;
                         knockbackY = -10;
                         hitStun = 10;
                         shake = 5;
                         particleColor = '#ffffff';
                     }
                     ent.vx = ent.facingRight ? 15 : -15; // Fast lunges
                 } 
                 // Power Stats
                 else if (ent.attackVariant === 1) {
                     dmg *= 1.5;
                     range = 50;
                     knockbackX = 15;
                     hitStun = 10;
                     particleColor = '#ff4400';
                     ent.vx = ent.facingRight ? 5 : -5;

                     if (ent.comboCount === 2) {
                         knockbackY = -15; // Upper
                     }
                     if (ent.comboCount === 3) {
                         dmg *= 2.5;
                         knockbackX = 5;
                         knockbackY = 20; // Downward slam
                         range = 80;
                         shake = 15;
                         addShockwave(ent.x + (ent.facingRight?40:-40), GROUND_Y, '#ff4400');
                     }
                 }
                 // Tech Stats
                 else {
                     dmg *= 0.9;
                     knockbackX = 8;
                     particleColor = '#10b981';
                     ent.vx = ent.facingRight ? 8 : -8;
                     
                     if (ent.comboCount === 1) { // Sweep
                         knockbackY = -2; // Low pop
                     }
                     if (ent.comboCount === 2) { // Launch
                         knockbackY = -25;
                         knockbackX = 2;
                     }
                     if (ent.comboCount === 3) { // Air spin
                         knockbackY = -5; // Juggle
                         ent.vy = -5; // Player hops
                     }
                     if (ent.comboCount === 4) { // Spike
                         knockbackY = 25; // Spike down
                         knockbackX = 10;
                         shake = 8;
                     }
                 }

                 playSound(ent.comboCount === maxCombo ? 'heavy' : 'swing');
                 shakeRef.current = shake;

                 opponents.forEach(opponent => {
                     if (checkCollision(ent, opponent, range)) {
                         
                         // Ground bounce logic for spikes
                         if (knockbackY > 0 && opponent.y >= GROUND_Y - opponent.height - 20) {
                             opponent.vy = -knockbackY * 0.5; // Bounce up
                         } else {
                             opponent.vy = knockbackY;
                         }
                         
                         opponent.vx = ent.facingRight ? knockbackX : -knockbackX;
                         applyDamage(ent, opponent, dmg);
                         
                         hitStopRef.current = hitStun + (ent.comboCount === maxCombo ? 8 : 0);
                         
                         createParticles(opponent.x, opponent.y - 20, particleColor, 5 + ent.comboCount * 3);
                         
                         if (ent.comboCount === maxCombo) {
                             flashRef.current = 3;
                         }

                         playSound('hit');
                         
                         if (opponent.hp <= 0 && !finisherRef.current.active && gameMode !== GameState.PLAYING_WAVE && gameMode !== GameState.PLAYING_FREERUN && ent.id === 'p1') {
                             triggerFinisher(ent, opponent);
                         }
                     }
                 });
             }
        }

        if (input.special && ent.specialCooldown <= 0 && ent.state !== 'HIT') {
            executeSpecial(ent, opponents);
        }

     } else if (!finisherRef.current.active && gameMode !== GameState.PLAYING_FREERUN) {
         // AI / Minion Logic
         const target = opponents[0]; 
         if (target) {
            const dist = ent.x - target.x;
            const absDist = Math.abs(dist);
            
            const moveSpeed = 2.0 * (ent.speed / 9); 
            if (Math.abs(dist) > 80) {
                if (ent.x < target.x) { ent.vx += moveSpeed; ent.facingRight = true; }
                else { ent.vx -= moveSpeed; ent.facingRight = false; }
                ent.state = 'RUN';
            } else {
                ent.state = 'IDLE';
            }
            
            if (absDist < 100 && Math.abs(ent.y - target.y) < 60) {
                 const now = Date.now();
                 // Minions attack faster/more chaotic
                 const attackDelay = ent.width < 40 ? 400 + Math.random() * 500 : 900 + Math.random() * 800;
                 if (now - ent.lastAttackTime > attackDelay) {
                     ent.state = 'ATTACK';
                     ent.lastAttackTime = now;
                     ent.attackVariant = Math.floor(Math.random() * 3);
                     ent.comboCount = 1; 

                     playSound('swing');
                     ent.vx = ent.facingRight ? 4 : -4;

                     if (checkCollision(ent, target)) {
                         applyDamage(ent, target, ent.power);
                         target.vx = ent.facingRight ? 10 : -10;
                         target.vy = -5;
                         createParticles(target.x, target.y - 20, ent.color, 5);
                         hitStopRef.current = 2;
                         playSound('hit');
                     }
                 }
            }
            
            if (ent.specialCooldown <= 0 && absDist < 250 && Math.random() < 0.01 && ent.width >= 40) {
                // Minions (width < 40) don't use specials
                executeSpecial(ent, opponents);
            }
         }
     }

     ent.vy += GRAVITY;
     if (ent.y < GROUND_Y - ent.height) ent.vx *= AIR_DRAG;
     else {
        if (ent.type === CharacterType.ANIMAL && ent.state === 'ABILITY') {
             ent.vx *= 0.98;
        } else {
             ent.vx *= FRICTION;
        }
     }

     if (ent.y < CEILING_Y) {
         ent.y = CEILING_Y;
         ent.vy = Math.abs(ent.vy) * (gameMode === GameState.PLAYING_FREERUN ? 0.9 : 0.6); 
         playSound('hit');
     }

     if (ent.state === 'ABILITY') {
         if (ent.type === CharacterType.NINJA) {
            if (Math.abs(ent.vx) > 10) {
                opponents.forEach(op => {
                     if (checkCollision(ent, op)) {
                        applyDamage(ent, op, 2);
                        op.vy = -2;
                        hitStopRef.current = 2;
                        createParticles(op.x, op.y, '#ff0000', 2);
                    }
                });
            }
         }
         else if (ent.type === CharacterType.TITAN) {
             if (ent.y >= GROUND_Y - ent.height && ent.vy > 0) {
                 ent.state = 'IDLE';
                 
                 // --- VISUAL BUFF ---
                 shakeRef.current = 30; // Huge shake
                 screenTintRef.current = { color: 'rgba(255, 68, 0, 0.3)', alpha: 0.5 }; // Flash orange
                 addShockwave(ent.x + ent.width/2, GROUND_Y, '#ff4400');
                 createParticles(ent.x + ent.width/2, GROUND_Y, '#ff4400', 30);
                 // -------------------

                 playSound('heavy');
                 opponents.forEach(op => {
                     if (Math.abs(ent.x - op.x) < 220 && op.y >= GROUND_Y - op.height - 10) {
                         applyDamage(ent, op, 30);
                         op.vy = -15;
                         if (op.hp <= 0 && ent.isPlayer && ent.id === 'p1' && gameMode !== GameState.PLAYING_WAVE) triggerFinisher(ent, op);
                     }
                 });
             }
         }
         else if (ent.type === CharacterType.ANIMAL) {
             opponents.forEach(op => {
                 if (checkCollision(ent, op, 20)) {
                     applyDamage(ent, op, 5); 
                     createParticles(op.x, op.y, '#d97706', 5);
                     op.vx = ent.facingRight ? 10 : -10;
                     op.vy = -5;
                     ent.vx = -ent.vx * 0.5; 
                     ent.state = 'IDLE';
                     showComboText("SAVAGE!", ent.x, ent.y - 40);
                     playSound('hit');
                 }
             });
             if (Math.abs(ent.vx) < 5) ent.state = 'IDLE';
         }
     }

     ent.x += ent.vx;
     ent.y += ent.vy;

     ent.onWall = false;
     if (ent.y > GROUND_Y - ent.height) {
         if (gameMode === GameState.PLAYING_WAVE && ent.state === 'DEAD') {
             // FALL THROUGH FLOOR
         } else {
             ent.y = GROUND_Y - ent.height;
             
             if (gameMode === GameState.PLAYING_FREERUN) {
                if (ent.vy > 5) {
                     ent.vy = -ent.vy * 0.95; 
                     ent.jumpCount = 1; 
                } else {
                     ent.vy = 0;
                     ent.jumpCount = 0;
                }
             } else {
                 if (ent.vy > 5) ent.vy = -ent.vy * 0.1;
                 else ent.vy = 0;
                 ent.jumpCount = 0; 
                 if (ent.state === 'HIT') ent.state = 'IDLE';
                 if (ent.state === 'ATTACK' && Date.now() - ent.lastAttackTime > 350) ent.state = 'IDLE';
                 if (ent.state === 'ABILITY' && ent.type !== CharacterType.TITAN && ent.type !== CharacterType.ANIMAL && ent.type !== CharacterType.HEAVY) ent.state = 'IDLE';
             }
         }
     }
     
     if (ent.x < 0) { 
         if (gameMode === GameState.PLAYING_WAVE && ent.state === 'DEAD') {
             // FALL THROUGH WALL
         } else {
             ent.x = 0; 
             if (gameMode === GameState.PLAYING_FREERUN) {
                 ent.vx = -ent.vx * 0.95;
             } else {
                 if (ent.state !== 'DEAD') { ent.onWall = true; ent.vx = 0; }
             }
         }
     }
     if (ent.x > CANVAS_WIDTH - ent.width) { 
         if (gameMode === GameState.PLAYING_WAVE && ent.state === 'DEAD') {
             // FALL THROUGH WALL
         } else {
             ent.x = CANVAS_WIDTH - ent.width; 
             if (gameMode === GameState.PLAYING_FREERUN) {
                 ent.vx = -ent.vx * 0.95;
             } else {
                 if (ent.state !== 'DEAD') { ent.onWall = true; ent.vx = 0; }
             }
         }
     } 
  };

  const updateIntro = (player: Entity, opponents: Entity[], timer: number) => {
      const t = 180 - timer; 
      
      const handleIntro = (ent: Entity, isRightSide: boolean) => {
          const finalX = isRightSide ? CANVAS_WIDTH - 200 : 200;
          
          if (ent.type === CharacterType.NINJA) {
              if (timer > 60) {
                  ent.x = finalX; ent.y = -500;
              } else if (timer === 60) {
                  ent.x = finalX; ent.y = GROUND_Y - ent.height;
                  createParticles(ent.x, ent.y, ent.color, 30);
                  playSound('wind');
              } else {
                  ent.state = 'IDLE';
              }
          } 
          else if (ent.type === CharacterType.TITAN || ent.type === CharacterType.GRAVITY || ent.type === CharacterType.HEAVY) {
              if (t < 100) {
                  ent.x = finalX;
                  ent.y = -200 + t * 7; 
              } else if (t === 100) {
                  ent.y = GROUND_Y - ent.height;
                  playSound('heavy');
                  shakeRef.current = 15;
                  addShockwave(ent.x + ent.width/2, GROUND_Y, ent.color);
              } else {
                  ent.y = GROUND_Y - ent.height;
              }
          }
          else if (ent.type === CharacterType.VOLT || ent.type === CharacterType.TIME || ent.type === CharacterType.LIGHT) {
              if (t < 120) {
                   if (t % 10 === 0) {
                       ent.x = Math.random() * CANVAS_WIDTH;
                       ent.y = Math.random() * CANVAS_HEIGHT;
                       createParticles(ent.x, ent.y, ent.color, 5);
                   }
              } else {
                   ent.x = finalX;
                   ent.y = GROUND_Y - ent.height;
              }
          }
          else if (ent.type === CharacterType.INSECT || ent.type === CharacterType.WIND || ent.type === CharacterType.PHANTOM) {
              ent.x = finalX;
              ent.y = Math.max(GROUND_Y - ent.height, -200 + t*5);
          }
          else if (ent.type === CharacterType.ZOMBIE) {
             if (t < 100) {
                 ent.x = finalX;
                 ent.y = GROUND_Y + 50 - (t/100)*130; // Rise from below
             } else {
                 ent.y = GROUND_Y - ent.height;
             }
          }
          else {
              if (t < 60) {
                  ent.y = GROUND_Y - ent.height;
                  ent.x = isRightSide ? CANVAS_WIDTH + 100 - t*5 : -100 + t*5;
              } else {
                  ent.x = finalX;
                  ent.y = GROUND_Y - ent.height;
              }
          }
          
          ent.facingRight = !isRightSide;
      };

      handleIntro(player, false);
      opponents.forEach(op => handleIntro(op, true));
  };

  const drawIceBlock = (ctx: CanvasRenderingContext2D, e: Entity) => {
      ctx.save();
      ctx.translate(e.x + e.width/2, e.y + e.height/2);
      ctx.fillStyle = 'rgba(200, 255, 255, 0.4)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const spikes = 8;
      const radius = 60;
      for(let i=0; i<spikes*2; i++) {
          const angle = (Math.PI*2 * i) / (spikes*2);
          const r = radius + (i%2===0 ? 10 : -10) + Math.random()*5;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i===0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
  };

  const drawStickman = (ctx: CanvasRenderingContext2D, e: Entity, overrideTime?: number) => {
      if (introTimerRef.current > 60 && e.type === CharacterType.NINJA) return;

      const isIntro = introTimerRef.current > 0;
      const isFinisherWinner = finisherRef.current.active && finisherRef.current.type === e.type && (e.isPlayer ? finisherRef.current.type === playerRef.current.type : true);
      const isFinisherLoser = finisherRef.current.active && !isFinisherWinner;
      
      // Zombie Finisher Effect on Loser
      let drawColor = e.color;
      if (isFinisherLoser && finisherRef.current.type === CharacterType.ZOMBIE) {
          drawColor = '#65a30d'; // Turn Green
      }

      ctx.strokeStyle = drawColor;
      ctx.fillStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 15;
      ctx.shadowColor = drawColor;

      const cx = e.x + e.width / 2;
      const cy = e.y + e.height / 2;

      const currentTime = overrideTime || Date.now();
      const idleT = currentTime / 300; 

      ctx.save();
      ctx.translate(cx, cy);

      ctx.rotate(e.rotation);
      
      // Monk Meditation Pose Rotation Fix
      const isMonkMeditating = (e.type === CharacterType.MONK && (isIntro || isFinisherWinner));
      if (isMonkMeditating) {
          // Adjust position to sit on ground
          ctx.translate(0, 15);
      }
      
      // Loser on ground for Monk Finisher
      if (isFinisherLoser && finisherRef.current.type === CharacterType.MONK) {
          ctx.rotate(Math.PI/2);
          ctx.translate(20, 0);
      }

      let leanAngle = (e.vx * 0.02); 
      if (leanAngle > 0.3) leanAngle = 0.3;
      if (leanAngle < -0.3) leanAngle = -0.3;
      if (e.state !== 'DEAD' && Math.abs(e.vr) < 0.01 && !isMonkMeditating && !isFinisherLoser) ctx.rotate(leanAngle);

      let stretch = 1 + (Math.abs(e.vy) * 0.015);
      if (e.state === 'IDLE') {
          stretch += Math.sin(idleT) * 0.01; // Slower breathe
      }
      const squash = 1 / stretch;
      
      if (!isMonkMeditating && !isFinisherLoser) ctx.scale(squash, stretch);

      if (!e.facingRight) ctx.scale(-1, 1);

      if (e.state === 'STUNNED' || e.frozen) ctx.translate(Math.random()*2, Math.random()*2);
      
      const isMinion = e.width < 40;

      // HEAD
      if (isMinion) {
           ctx.beginPath(); ctx.arc(0, -25, 8, 0, Math.PI*2); ctx.stroke();
      }
      else if (e.type === CharacterType.TITAN) {
          ctx.fillRect(-12, -40, 24, 20); 
      } else if (e.type === CharacterType.HEAVY) {
          ctx.fillRect(-15, -45, 30, 25);
          ctx.fillStyle = '#000'; ctx.fillRect(-5, -40, 15, 5); // Visor
      } else if (e.type === CharacterType.SAINT) {
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
           ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -45, 15, 5, 0, 0, Math.PI*2); ctx.stroke(); // Halo
      } else if (e.type === CharacterType.CYBORG) {
           ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(10, -30); ctx.lineTo(0, -45); ctx.fill();
           ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(4, -34, 2, 0, Math.PI*2); ctx.fill();
      } else if (e.type === CharacterType.SOLAR) {
           ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 20;
           ctx.beginPath(); ctx.arc(0, -30, 12, 0, Math.PI*2); ctx.stroke();
           for(let i=0; i<8; i++) {
               const ang = (i/8) * Math.PI*2;
               ctx.moveTo(Math.cos(ang)*15, -30+Math.sin(ang)*15);
               ctx.lineTo(Math.cos(ang)*25, -30+Math.sin(ang)*25);
           }
           ctx.stroke();
      } else if (e.type === CharacterType.TRAPPER) {
           ctx.fillStyle = drawColor; ctx.fillRect(-12, -42, 24, 10); // Hat
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
      } else if (e.type === CharacterType.INSECT) {
           ctx.beginPath(); ctx.arc(0, -30, 8, 0, Math.PI*2); ctx.fill();
           ctx.beginPath(); ctx.moveTo(-5, -38); ctx.quadraticCurveTo(-10, -50, -20, -45); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(5, -38); ctx.quadraticCurveTo(10, -50, 20, -45); ctx.stroke();
      } else if (e.type === CharacterType.DEVIL) {
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
           ctx.fillStyle = '#ef4444';
           ctx.beginPath(); ctx.moveTo(-5, -38); ctx.lineTo(-12, -50); ctx.lineTo(-2, -40); ctx.fill();
           ctx.beginPath(); ctx.moveTo(5, -38); ctx.lineTo(12, -50); ctx.lineTo(2, -40); ctx.fill();
      } else if (e.type === CharacterType.TIME) {
           ctx.beginPath(); ctx.arc(0, -30, 11, 0, Math.PI*2); ctx.stroke();
           ctx.strokeStyle = '#fff';
           ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -38); ctx.stroke(); 
           ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(5, -30); ctx.stroke(); 
      } else if (e.type === CharacterType.WIND) {
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(-10, -30); ctx.quadraticCurveTo(-15, -50, 0, -55); ctx.stroke();
      } else if (e.type === CharacterType.BONE) {
           ctx.strokeStyle = '#e5e7eb';
           ctx.beginPath(); ctx.arc(0, -30, 9, 0, Math.PI*2); ctx.stroke();
           ctx.fillStyle = '#000';
           ctx.fillRect(-4, -32, 3, 3);
           ctx.fillRect(1, -32, 3, 3);
      } else if (e.type === CharacterType.GRAVITY) {
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.fill();
           const orbX = Math.cos(currentTime/200)*20;
           const orbY = Math.sin(currentTime/200)*5 - 30;
           ctx.fillStyle = '#4c1d95';
           ctx.beginPath(); ctx.arc(orbX, orbY, 4, 0, Math.PI*2); ctx.fill();
      }
      else if (e.type === CharacterType.VOLT) {
          ctx.beginPath(); ctx.moveTo(5, -40); ctx.lineTo(-10, -30); ctx.lineTo(5, -20); ctx.stroke(); 
          ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
      } else if (e.type === CharacterType.LANCER) {
          ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -55); ctx.stroke(); 
      } else if (e.type === CharacterType.PHANTOM) {
           ctx.globalAlpha = 0.8;
           ctx.beginPath(); ctx.arc(0, -30, 9, 0, Math.PI*2); ctx.fill(); 
           ctx.globalAlpha = 1;
      } else if (e.type === CharacterType.INFERNO) {
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(-8, -38); ctx.lineTo(0, -50); ctx.lineTo(8, -38); ctx.stroke();
      } else if (e.type === CharacterType.GLACIER) {
           ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(0, -45); ctx.lineTo(10, -30); ctx.lineTo(0, -20); ctx.closePath(); ctx.stroke();
      } else if (e.type === CharacterType.RONIN) {
           ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(-20, -35); ctx.lineTo(20, -35); ctx.lineTo(0, -45); ctx.closePath(); ctx.fill();
      } else if (e.type === CharacterType.ELEMENTAL) {
           ctx.beginPath(); ctx.moveTo(-10, -40); ctx.lineTo(10, -40); ctx.lineTo(12, -20); ctx.lineTo(-12, -20); ctx.closePath(); ctx.stroke();
      } else if (e.type === CharacterType.MAGIC) {
            ctx.beginPath(); ctx.arc(0, -30, 8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-12, -25); ctx.lineTo(0, -45); ctx.lineTo(12, -25); ctx.stroke();
      } else if (e.type === CharacterType.ANIMAL) {
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-8, -38); ctx.lineTo(-12, -50); ctx.lineTo(0, -40); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8, -38); ctx.lineTo(12, -50); ctx.lineTo(0, -40); ctx.stroke();
      } else if (e.type === CharacterType.DARKNESS) {
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#4c1d95';
            ctx.beginPath(); ctx.arc(0, -30, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-5, -38); ctx.quadraticCurveTo(-15, -45, -8, -55); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(5, -38); ctx.quadraticCurveTo(15, -45, 8, -55); ctx.stroke();
      } else if (e.type === CharacterType.VENOM) {
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#333';
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(2, -32); ctx.quadraticCurveTo(8, -40, 6, -25); ctx.fill();
      } else if (e.type === CharacterType.CHAOS) {
            ctx.fillStyle = `hsl(${currentTime % 360}, 50%, 50%)`;
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText("?", 0, -30);
      } else if (e.type === CharacterType.ZOMBIE || (isFinisherLoser && finisherRef.current.type === CharacterType.ZOMBIE)) {
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(-4, -32, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(4, -30, 3, 0, Math.PI*2); ctx.fill();
      } else if (e.type === CharacterType.MONK) {
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -32, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -28, 2, 0, Math.PI*2); ctx.fill();
      } else if (e.type === CharacterType.LIGHT) {
            ctx.shadowColor = '#fff'; ctx.shadowBlur = 30;
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.fill();
      } else {
          if (e.state === 'DEAD') {
               ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
          } else {
              ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(-25, -35); ctx.stroke(); 
          }
      }

      // BODY
      ctx.strokeStyle = drawColor;
      // Default Limb Positions
      let handLy = 10, handRy = 0;
      let legLy = 40, legRy = 40;
      let bodyY = 0;

      // Limb Logic
      const t = currentTime / 200; // Slowed down from 100
      const speedMult = Math.min(Math.abs(e.vx) * 0.4, 1.2); 
      
      let legL = 0, legR = 0, armL = 0, armR = 0;

      if (e.frozen) {
          legL = 10; legR = -10; armL = 10; armR = -10;
      } else if (isMonkMeditating) {
          // Meditation Pose
          legL = -15; legR = -15; // Crossed legs
          armL = -10; armR = -10; // Hands on knees
      } else if ((isIntro && e.type === CharacterType.ZOMBIE) || (isFinisherLoser && finisherRef.current.type === CharacterType.ZOMBIE)) {
          // Zombie Rising Arms
          armL = -40; armR = -40;
          if (isFinisherLoser) {
              legL = 0; legR = 0; // Standing
          } else {
              legL = 0; legR = 0;
          }
      } else if (e.state === 'RUN') {
          legL = Math.sin(t) * (15 + speedMult * 5);
          legR = Math.sin(t + Math.PI) * (15 + speedMult * 5);
          armL = Math.cos(t) * (15 + speedMult * 5);
          armR = Math.cos(t + Math.PI) * (15 + speedMult * 5);
      } else if (e.state === 'IDLE') {
          // Default Breathing
          armL = Math.sin(idleT * 1.5) * 3;
          armR = -Math.sin(idleT * 1.5) * 3;
          
          // --- IDLE ANIMATION OVERRIDES ---
          if (e.type === CharacterType.NINJA || e.type === CharacterType.RONIN) {
              // Combat Stance
              armL = -5; armR = 5;
              handLy = -5 + Math.sin(idleT * 2)*2;
              handRy = -5 + Math.cos(idleT * 2)*2;
              bodyY = 2; // Slight crouch
          } else if (e.type === CharacterType.ZOMBIE) {
              // Zombie Shuffle
              armL = -30; armR = 20; // Arms forwardish
              handLy = -5 + Math.sin(idleT*6)*5;
              handRy = -5 + Math.cos(idleT*6)*5;
              ctx.rotate(Math.sin(idleT*2)*0.1);
          } else if (e.type === CharacterType.MONK || e.type === CharacterType.SAINT) {
              // Disciplined / Prayer-like
              armL = -12; armR = -12;
              handLy = -5 + Math.sin(idleT * 2)*1;
              handRy = -5 + Math.sin(idleT * 2)*1;
          } else if (e.type === CharacterType.PHANTOM || e.type === CharacterType.LIGHT || e.type === CharacterType.VOLT || e.type === CharacterType.MAGIC || e.type === CharacterType.TIME) {
              // Floating / Hovering
              bodyY = Math.sin(idleT*4) * 4 - 5;
              legL = 0; legR = 0;
              legLy = 45; legRy = 45; // Legs dangling
              armL = 5 + Math.sin(idleT*2)*3;
              armR = 5 - Math.sin(idleT*2)*3;
          } else if (e.type === CharacterType.ANIMAL || e.type === CharacterType.VENOM || e.type === CharacterType.INSECT) {
              // Feral Crouch
              bodyY = 15;
              handLy = 35; handRy = 35;
              legLy = 25; legRy = 25;
              ctx.rotate(Math.sin(idleT*2)*0.05);
          } else if (e.type === CharacterType.HEAVY || e.type === CharacterType.TITAN || e.type === CharacterType.GRAVITY) {
              // Heavy Stance
              handLy = 15 + Math.sin(idleT)*2;
              handRy = 5 + Math.sin(idleT)*2;
              armL = 5; armR = 5; // Wide arms
              legL = 10; legR = -10; // Wide stance
          }
      } else if (e.state === 'ATTACK') {
          const progress = Math.min(1, (currentTime - e.lastAttackTime) / 350); // Slowed down from 200
          
          // BLITZ (Variant 0)
          if (e.attackVariant === 0) {
              if (e.comboCount === 1) { // Jab
                  armR = 30 * Math.sin(progress * Math.PI); armL = -10;
              } else if (e.comboCount === 2) { // Cross
                  armR = -10; armL = 40 * Math.sin(progress * Math.PI);
                  ctx.rotate(progress * 0.2); // Twist
              } else if (e.comboCount === 3) { // Hook
                  armR = 30 * Math.sin(progress * Math.PI); armL = -10;
                  ctx.rotate(-progress * 0.3);
              } else if (e.comboCount === 4) { // Flurry
                  armR = Math.random() * 30; armL = Math.random() * 30;
              } else if (e.comboCount === 5) { // Kick
                  legR = 40 * Math.sin(progress * Math.PI);
                  ctx.rotate(-0.5 * Math.sin(progress * Math.PI));
              }
          } 
          // POWER (Variant 1)
          else if (e.attackVariant === 1) {
              if (e.comboCount === 1) { // Bash
                  armR = -20; armL = -20;
                  ctx.rotate(0.4 * Math.sin(progress * Math.PI));
              } else if (e.comboCount === 2) { // Uppercut
                  armR = 50 * Math.sin(progress * Math.PI); armL = -10;
                  ctx.rotate(-0.3 * Math.sin(progress * Math.PI));
              } else if (e.comboCount === 3) { // Slam
                  armR = 20; armL = 20;
                  if (progress < 0.5) ctx.translate(0, -20 * progress);
                  else ctx.translate(0, 10);
              }
          }
          // TECHNICAL (Variant 2)
          else {
              if (e.comboCount === 1) { // Low Kick
                  legR = 30 * Math.sin(progress * Math.PI);
                  ctx.translate(0, 10); // Crouch
              } else if (e.comboCount === 2) { // High Kick
                  legL = -40 * Math.sin(progress * Math.PI);
                  ctx.rotate(-0.4 * Math.sin(progress * Math.PI));
              } else if (e.comboCount === 3) { // Spin
                  legR = 20; legL = -20;
                  ctx.scale(Math.cos(progress * Math.PI * 4), 1); // Fake 3D Spin
              } else if (e.comboCount === 4) { // Spike
                  legR = 20;
                  armR = 30;
                  ctx.rotate(0.5);
              }
          }
      } else if (e.state === 'HIT') {
           armL = Math.sin(t * 5) * (10 + Math.abs(e.vr)*50);
           armR = Math.cos(t * 5) * (10 + Math.abs(e.vr)*50);
           legL = Math.sin(t * 6) * (10 + Math.abs(e.vr)*50);
           legR = Math.cos(t * 6) * (10 + Math.abs(e.vr)*50);
      }
      
      if (e.jumpCount > 0 && !e.onWall && e.state !== 'HIT') {
          legL = 10; legR = -10;
          armL = -15; armR = -15; 
          if (e.jumpCount === 2) ctx.rotate(t * 0.5); 
      }
      if (e.onWall) {
          legL = 15; legR = 5; 
          armL = 20; armR = 10;
      }
      if (e.state === 'ABILITY') {
          if (e.type === CharacterType.ANIMAL) {
             armL = 30; armR = 30; legL = -20; legR = -20;
          } else if (e.type === CharacterType.HEAVY) {
             armR = 20; armL = 0; 
          } else if (e.type === CharacterType.INSECT) {
             armL = -30; armR = 30; 
          } else if (e.type === CharacterType.GRAVITY) {
             armL = -20; armR = -20; 
          } else if (e.type === CharacterType.VENOM) {
             armR = 40; armL = -20;
          } else if (e.type === CharacterType.ZOMBIE) {
             armL = 40; armR = 40; 
          }
      }

      // Apply Body Bobbing for Idle
      ctx.translate(0, bodyY);

      ctx.beginPath();
      ctx.moveTo(0, -20); ctx.lineTo(0, 10); ctx.stroke();
      if (!isMinion && (e.type === CharacterType.TITAN || e.type === CharacterType.GLACIER || e.type === CharacterType.ELEMENTAL || e.type === CharacterType.HEAVY || e.type === CharacterType.GRAVITY || e.type === CharacterType.ZOMBIE)) {
          ctx.fillRect(-15, -20, 30, 30); 
      }
      
      if (e.type === CharacterType.ANIMAL || e.type === CharacterType.DEVIL || e.type === CharacterType.VENOM) {
           const tailWag = Math.sin(idleT * 4) * 10;
           ctx.beginPath();
           ctx.moveTo(0, 5);
           ctx.quadraticCurveTo(-15, 0, -25 + tailWag, -5);
           ctx.stroke();
           if (e.type === CharacterType.DEVIL) {
               ctx.fillStyle = drawColor;
               ctx.beginPath(); ctx.moveTo(-25 + tailWag, -5); ctx.lineTo(-30+tailWag, -10); ctx.lineTo(-30+tailWag, 0); ctx.fill();
           }
      }

      ctx.beginPath();
      if (e.state === 'DEAD') {
          ctx.moveTo(0, 10); ctx.quadraticCurveTo(-20, 20, -10, 35);
          ctx.moveTo(0, 10); ctx.quadraticCurveTo(20, 20, 10, 35);
      } else {
          if (isMonkMeditating) {
              // Crossed Legs
              ctx.moveTo(0, 10); ctx.lineTo(-15, 25); ctx.lineTo(0, 30);
              ctx.moveTo(0, 10); ctx.lineTo(15, 25); ctx.lineTo(0, 30);
          } else {
              ctx.moveTo(0, 10); ctx.quadraticCurveTo(-5, 25, -10 + legL, legLy); 
              ctx.moveTo(0, 10); ctx.quadraticCurveTo(5, 25, 10 + legR, legRy); 
          }
      }
      ctx.stroke();

      ctx.beginPath();
      if (e.type === CharacterType.LANCER) {
          ctx.moveTo(0, -15); ctx.lineTo(10, 0); ctx.stroke();
          ctx.save();
          ctx.strokeStyle = '#fff';
          ctx.translate(10, 0);
          if (e.state === 'ATTACK') {
             const stab = Math.sin((currentTime - e.lastAttackTime)/100) * 40;
             ctx.translate(stab, 0);
          }
          ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(80, 0); ctx.lineTo(60, -5); ctx.moveTo(80, 0); ctx.lineTo(60, 5); ctx.stroke();
          ctx.restore();
      } else if (e.type === CharacterType.HEAVY) {
          ctx.moveTo(0, -15); ctx.lineTo(armR+10, 0); ctx.stroke();
          ctx.save();
          ctx.translate(armR+10, 0);
          if (e.state === 'ABILITY') ctx.translate((Math.random()-0.5)*5, 0);
          ctx.fillStyle = '#333'; ctx.fillRect(0, -5, 50, 10);
          ctx.fillStyle = '#111'; ctx.fillRect(10, -8, 30, 16); 
          ctx.fillStyle = '#555'; ctx.fillRect(50, -3, 10, 6); 
          if (e.state === 'ABILITY') {
              ctx.fillStyle = '#fbbf24'; ctx.fillRect(60, -8, 20, 16); 
          }
          ctx.restore();
      }
      else if (e.type === CharacterType.RONIN) {
          ctx.moveTo(0, -15); ctx.lineTo(10 + armR, 10 + handRy); ctx.stroke();
           ctx.save();
           ctx.strokeStyle = '#fff';
           ctx.translate(10, 10);
           if (e.state === 'ATTACK') {
               ctx.rotate(-Math.PI/2);
           }
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(70, 0); ctx.stroke();
           ctx.restore();
      } else if (e.type === CharacterType.MAGIC) {
            ctx.moveTo(0, -15); ctx.lineTo(armR + 10, handRy); ctx.stroke();
            ctx.save();
            ctx.translate(armR+10, handRy);
            ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 30); ctx.stroke();
            ctx.fillStyle = e.color;
            ctx.beginPath(); ctx.arc(0, -30, 4, 0, Math.PI*2); ctx.fill();
            ctx.restore();
      } else if (e.type === CharacterType.ANIMAL) {
            ctx.moveTo(0, -15); ctx.quadraticCurveTo(-10, -5, -15 - armL, handLy);
            ctx.moveTo(0, -15); ctx.quadraticCurveTo(10, -5, 15 + armR, handRy);
            ctx.stroke(); 
      } else if (e.type === CharacterType.INSECT || e.type === CharacterType.ZOMBIE) {
             ctx.moveTo(0, -15); ctx.lineTo(-15 + armL, -5 + handLy*0.5); // Custom adjustment
             ctx.moveTo(0, -10); ctx.lineTo(-15 + armL, 10 + handLy*0.5);
             ctx.moveTo(0, -15); ctx.lineTo(15 + armR, -5 + handRy*0.5);
             ctx.moveTo(0, -10); ctx.lineTo(15 + armR, 10 + handRy*0.5);
             ctx.stroke();
      } else {
          if (e.state === 'DEAD') {
               ctx.moveTo(0, -15); ctx.quadraticCurveTo(-20, -5, -25, 10);
               ctx.moveTo(0, -15); ctx.quadraticCurveTo(20, -5, 25, 10);
               ctx.stroke();
          } else {
               ctx.moveTo(0, -15); ctx.quadraticCurveTo(-10, -5, -15 - armL, handLy); 
               ctx.moveTo(0, -15); ctx.quadraticCurveTo(10, -5, 15 + armR, handRy); 
               ctx.stroke();
          }
      }

      if (e.state === 'ATTACK' && e.type !== CharacterType.HEAVY && e.type !== CharacterType.LANCER) {
          ctx.save();
          const progress = Math.min(1, (currentTime - e.lastAttackTime) / 350); // Slowed down from 200
          if (progress < 0.9) {
            ctx.translate(10, -10); 
            ctx.strokeStyle = drawColor;
            ctx.shadowColor = drawColor;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 4 - (progress*3);
            
            // Custom Visuals based on Variant
            if (e.attackVariant === 0) { // BLITZ (Blue/White Arcs)
                ctx.strokeStyle = '#00f3ff';
                if (e.comboCount === 1) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(40, -10); ctx.stroke(); } // Jab
                else if (e.comboCount === 2) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(50, 0); ctx.stroke(); } // Cross
                else if (e.comboCount === 3) { ctx.beginPath(); ctx.arc(0, 0, 40, -Math.PI/2, Math.PI/2); ctx.stroke(); } // Hook
                else if (e.comboCount === 4) { // Flurry
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    for(let i=0; i<3; i++) {
                        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(30 + Math.random()*20, (Math.random()-0.5)*30); ctx.stroke();
                    }
                } else if (e.comboCount === 5) { // Kick
                     ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(30, -30); ctx.stroke();
                }
            } else if (e.attackVariant === 1) { // POWER (Red/Orange Thick)
                ctx.strokeStyle = '#ff4400';
                ctx.lineWidth = 6 - (progress*3);
                if (e.comboCount === 1) { ctx.beginPath(); ctx.arc(0,0, 30, -Math.PI/4, Math.PI/4); ctx.stroke(); }
                else if (e.comboCount === 2) { ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(40, -40); ctx.stroke(); } // Uppercut
                else if (e.comboCount === 3) { // Slam
                     ctx.lineWidth = 8;
                     ctx.beginPath(); ctx.arc(0, 20, 50, Math.PI, 0); ctx.stroke();
                }
            } else { // TECH (Green/Yellow)
                ctx.strokeStyle = '#10b981';
                if (e.comboCount === 1) { ctx.beginPath(); ctx.moveTo(0,20); ctx.lineTo(30, 20); ctx.stroke(); } // Low
                else if (e.comboCount === 2) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(10, -50); ctx.stroke(); } // High
                else if (e.comboCount === 3) { ctx.beginPath(); ctx.arc(0,0, 40, 0, Math.PI*2); ctx.stroke(); } // Spin
                else if (e.comboCount === 4) { ctx.beginPath(); ctx.moveTo(10, -30); ctx.lineTo(30, 30); ctx.stroke(); } // Spike
            }
          }
          ctx.restore();
      }

      ctx.restore();

      if (e.frozen) {
          drawIceBlock(ctx, e);
      }
  };

  const drawFinisherEffects = (ctx: CanvasRenderingContext2D, timer: number, type: CharacterType, victimX: number, victimY: number) => {
       if (!type) return;

       if (timer > 100 && timer < 280) {
           const freq = 6;
           if (timer % freq === 0) {
               const angle = (Math.random() * Math.PI * 2);
               const dist = 80 + Math.random() * 50;
               const tx = victimX + Math.cos(angle) * dist;
               const ty = victimY + Math.sin(angle) * dist;
               
               const tempEnt: Entity = {
                   ...createEntity(type, false, tx, ty, 'temp'),
                   color: CHAR_STATS[type].color,
                   facingRight: tx < victimX
               };
               tempEnt.x -= tempEnt.width/2;
               tempEnt.y -= tempEnt.height/2;

               ctx.save();
               ctx.globalAlpha = 0.7;
               drawStickman(ctx, tempEnt);
               
               ctx.beginPath();
               ctx.strokeStyle = '#fff';
               ctx.lineWidth = 2;
               ctx.moveTo(tx, ty);
               ctx.lineTo(victimX, victimY);
               ctx.stroke();
               
               ctx.fillStyle = '#fff';
               ctx.beginPath();
               ctx.arc(victimX + (Math.random()-0.5)*20, victimY + (Math.random()-0.5)*40, 10, 0, Math.PI*2);
               ctx.fill();

               ctx.restore();
               playSound('hit');
           }
       }

       if (type === CharacterType.SOLAR) {
           ctx.fillStyle = `rgba(255, 200, 0, ${Math.min(1, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(victimX, victimY, 50 + (250-timer)*5, 0, Math.PI*2); ctx.fill();
           }
       }
       else if (type === CharacterType.SAINT) {
           ctx.fillStyle = `rgba(255, 255, 200, ${Math.min(0.8, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.fillStyle = 'white';
               ctx.fillRect(victimX - 50, 0, 100, CANVAS_HEIGHT);
           }
       }
       else if (type === CharacterType.CYBORG) {
           ctx.fillStyle = `rgba(50, 50, 50, ${Math.min(1, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer > 150 && timer < 250) {
                ctx.strokeStyle = 'red'; ctx.lineWidth = 5;
                ctx.strokeRect(victimX-50, victimY-50, 100, 100);
                ctx.moveTo(victimX, victimY-50); ctx.lineTo(victimX, victimY+50);
                ctx.moveTo(victimX-50, victimY); ctx.lineTo(victimX+50, victimY);
                ctx.stroke();
           } else if (timer < 150) {
                ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(victimX, victimY, 200, 0, Math.PI*2); ctx.fill();
           }
       }
       else if (type === CharacterType.INFERNO) {
           ctx.fillStyle = `rgba(255, 100, 0, ${Math.min(1, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 200) {
               ctx.fillStyle = '#fff';
               ctx.beginPath(); ctx.arc(victimX, victimY - timer*2, 100, 0, Math.PI*2); ctx.fill();
               ctx.fillStyle = '#ff4400'; ctx.fillRect(victimX - 50, 0, 100, CANVAS_HEIGHT);
           }
       } else if (type === CharacterType.GLACIER) {
           ctx.fillStyle = `rgba(0, 255, 255, ${Math.min(0.5, (300-timer)/100)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.fillStyle = 'rgba(200, 255, 255, 0.8)';
               ctx.beginPath(); ctx.moveTo(victimX - 60, victimY + 60); ctx.lineTo(victimX, victimY - 100); ctx.lineTo(victimX + 60, victimY + 60); ctx.fill();
               ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
           }
       } else if (type === CharacterType.RONIN) {
           ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, (300-timer)/20)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 200 && timer > 100) {
               ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
               ctx.beginPath(); ctx.moveTo(0, CANVAS_HEIGHT); ctx.lineTo(CANVAS_WIDTH, 0); ctx.stroke();
           }
       } else if (type === CharacterType.VOLT) {
           ctx.fillStyle = 'rgba(0,0,0,0.8)';
           ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250 && timer > 230) {
               ctx.fillStyle = '#ffff00';
               ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT); 
           }
       } else if (type === CharacterType.DARKNESS) {
           ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 200 && timer > 100) {
               ctx.fillStyle = '#fff';
               ctx.beginPath(); ctx.arc(victimX, victimY, 5 + (200-timer), 0, Math.PI*2); ctx.fill();
           }
       } else if (type === CharacterType.NINJA) {
           ctx.fillStyle = '#000';
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer > 200 && timer < 220) {
               ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
               ctx.beginPath(); ctx.moveTo(0, victimY); ctx.lineTo(CANVAS_WIDTH, victimY); ctx.stroke();
           }
       } else if (type === CharacterType.LANCER) {
           ctx.fillStyle = `rgba(50, 0, 100, ${Math.min(0.8, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.fillStyle = '#fff';
               ctx.fillRect(victimX - 20, 0, 40, CANVAS_HEIGHT);
               ctx.fillStyle = '#bd00ff';
               ctx.fillRect(victimX - 10, 0, 20, CANVAS_HEIGHT);
           }
       } else if (type === CharacterType.PHANTOM) {
           ctx.fillStyle = `rgba(0, 50, 0, ${Math.min(0.9, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer % 10 < 5) {
               for(let i=0; i<5; i++) {
                   const rx = Math.random() * CANVAS_WIDTH;
                   const ry = Math.random() * CANVAS_HEIGHT;
                   ctx.fillStyle = '#fff';
                   ctx.beginPath(); ctx.arc(rx, ry, 20, 0, Math.PI*2); ctx.fill();
                   ctx.fillStyle = '#000';
                   ctx.beginPath(); ctx.arc(rx-5, ry-5, 5, 0, Math.PI*2); ctx.fill();
                   ctx.beginPath(); ctx.arc(rx+5, ry-5, 5, 0, Math.PI*2); ctx.fill();
               }
           }
       } else if (type === CharacterType.ELEMENTAL) {
           ctx.fillStyle = `rgba(10, 50, 20, ${Math.min(0.8, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.strokeStyle = '#10b981';
               ctx.lineWidth = 20;
               for(let i=0; i<10; i++) {
                   ctx.beginPath();
                   ctx.moveTo(i * 120, CANVAS_HEIGHT);
                   ctx.lineTo(i * 120 + Math.sin(timer/10)*50, 0);
                   ctx.stroke();
               }
           }
       } else if (type === CharacterType.MAGIC) {
           ctx.fillStyle = `rgba(200, 0, 200, ${Math.min(0.3, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               for(let i=0; i<100; i++) {
                   ctx.fillStyle = '#d946ef';
                   ctx.fillRect(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 5, 5);
               }
           }
       } else if (type === CharacterType.ANIMAL || type === CharacterType.VENOM || type === CharacterType.ZOMBIE) {
           // Swampy/Bloody overlay
           ctx.fillStyle = `rgba(50, 60, 20, ${Math.min(0.6, (300-timer)/50)})`;
           if (type === CharacterType.ANIMAL) ctx.fillStyle = `rgba(100, 0, 0, ${Math.min(0.6, (300-timer)/50)})`;
           
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer > 150 && timer < 250 && type !== CharacterType.ZOMBIE) {
               ctx.strokeStyle = '#000'; ctx.lineWidth = 10;
               ctx.beginPath(); ctx.moveTo(victimX-50, victimY-50); ctx.lineTo(victimX+50, victimY+50); ctx.stroke();
               ctx.beginPath(); ctx.moveTo(victimX, victimY-60); ctx.lineTo(victimX+100, victimY+40); ctx.stroke();
               ctx.beginPath(); ctx.moveTo(victimX-100, victimY-40); ctx.lineTo(victimX, victimY+60); ctx.stroke();
           }
       } else if (type === CharacterType.TITAN) {
           const shake = Math.random() * 20;
           ctx.save();
           ctx.translate(shake, shake);
           ctx.fillStyle = `rgba(100, 50, 0, ${Math.min(0.6, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
               ctx.beginPath(); ctx.moveTo(0, CANVAS_HEIGHT); ctx.lineTo(victimX, victimY); ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT); ctx.stroke();
           }
           ctx.restore();
       } else if (type === CharacterType.TIME || type === CharacterType.CHAOS) {
           ctx.fillStyle = `rgba(150, 100, 50, ${Math.min(0.8, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.save();
               ctx.translate(victimX, victimY);
               ctx.strokeStyle = '#fff';
               ctx.lineWidth = 10;
               ctx.beginPath(); ctx.arc(0,0, 100, 0, Math.PI*2); ctx.stroke();
               ctx.rotate(timer * 0.5);
               ctx.moveTo(0,0); ctx.lineTo(0, -80); ctx.stroke();
               ctx.restore();
           }
       } else if (type === CharacterType.DEVIL) {
           ctx.fillStyle = `rgba(100, 0, 0, ${Math.min(0.9, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.fillStyle = '#ef4444';
               ctx.beginPath(); ctx.moveTo(victimX, 0); ctx.lineTo(victimX-50, CANVAS_HEIGHT); ctx.lineTo(victimX+50, CANVAS_HEIGHT); ctx.fill();
           }
       } else if (type === CharacterType.GRAVITY) {
           const scale = 1 - (300-timer)/300;
           ctx.save();
           ctx.translate(victimX, victimY);
           ctx.scale(scale, scale);
           ctx.fillStyle = '#000';
           ctx.fillRect(-CANVAS_WIDTH, -CANVAS_HEIGHT, CANVAS_WIDTH*2, CANVAS_HEIGHT*2);
           ctx.restore();
       } else if (type === CharacterType.INSECT) {
           ctx.fillStyle = `rgba(0, 50, 0, ${Math.min(0.8, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               for(let i=0; i<50; i++) {
                   ctx.fillStyle = '#a3e635';
                   ctx.beginPath(); ctx.arc(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 5, 0, Math.PI*2); ctx.fill();
               }
           }
       } else if (type === CharacterType.BONE) {
           ctx.fillStyle = `rgba(50, 50, 50, ${Math.min(0.9, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
                ctx.fillStyle = '#e5e7eb';
                for(let i=0; i<10; i++) {
                    ctx.beginPath(); ctx.moveTo(victimX + (i-5)*20, CANVAS_HEIGHT); ctx.lineTo(victimX + (i-5)*10, victimY); ctx.lineTo(victimX + (i-4)*20, CANVAS_HEIGHT); ctx.fill();
                }
           }
       } else if (type === CharacterType.WIND) {
           ctx.fillStyle = `rgba(200, 240, 255, ${Math.min(0.6, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
           if (timer < 250) {
               ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
               ctx.beginPath();
               for(let i=0; i<20; i++) {
                   ctx.moveTo(victimX + Math.sin(i + timer*0.1)*50, CANVAS_HEIGHT - i*30);
                   ctx.lineTo(victimX + Math.sin(i + 1 + timer*0.1)*50, CANVAS_HEIGHT - (i+1)*30);
               }
               ctx.stroke();
           }
       } else if (type === CharacterType.LIGHT) {
           ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
       } else if (type === CharacterType.MONK) {
           // Peaceful White/Orange overlay
           ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.7, (300-timer)/50)})`;
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
       }
  };

  const animate = (time: number) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const player = playerRef.current;
      const opponents = opponentsRef.current;
      
      if (introTimerRef.current > 0) {
          introTimerRef.current--;
          updateIntro(player, opponents, introTimerRef.current);
      } else {
        if (hitStopRef.current > 0) {
            hitStopRef.current--;
        } else {
                if (finisherRef.current.active) {
                    finisherRef.current.timer--;
                    if (finisherRef.current.timer <= 0) {
                        onGameOver(finisherRef.current.type === player.type ? 'PLAYER' : 'CPU');
                    }
                } else {
                    // Update Player
                    updateEntity(player, keysRef.current, opponents, true);
                    
                    // Update Allies (if any)
                    alliesRef.current.forEach(ally => {
                        updateEntity(ally, null, opponents, false);
                    });
                    
                    // Filter dead allies
                    alliesRef.current = alliesRef.current.filter(a => a.hp > 0 || a.state === 'DEAD');
                    
                    // Update Opponents
                    const playerSide = [player, ...alliesRef.current];
                    opponents.forEach(op => {
                        updateEntity(op, keysRef.current, playerSide, gameMode === GameState.PLAYING_PVP);
                        if (op.state === 'ATTACK' && op.comboCount > 1 && time % 3 === 0) {
                             ghostsRef.current.push({
                                ...op,
                                life: 1.0,
                                snapshotTime: Date.now()
                            });
                        }
                    });

                    if (player.state === 'ATTACK' && player.comboCount > 1 && time % 3 === 0) {
                        ghostsRef.current.push({
                            ...player,
                            life: 1.0,
                            snapshotTime: Date.now() 
                        });
                    }
                    
                    // Filter out enemies that are off-screen or dead for too long
                    opponentsRef.current = opponentsRef.current.filter(o => {
                         if (gameMode === GameState.PLAYING_WAVE && o.state === 'DEAD' && o.y > CANVAS_HEIGHT + 100) return false;
                         return o.y < 1000 && o.x > -500 && o.x < CANVAS_WIDTH + 500;
                    });
                    
                    // Clean up allies
                    alliesRef.current = alliesRef.current.filter(o => {
                         if (o.state === 'DEAD' && o.y > CANVAS_HEIGHT + 100) return false;
                         return o.y < 1000;
                    });

                    // Portals
                    if (gameMode === GameState.PLAYING_FREERUN && portalsRef.current.length > 0) {
                        if (portalCooldownRef.current > 0) portalCooldownRef.current--;
                        
                        // Portal Ambient Particles
                        portalsRef.current.forEach(p => {
                             if (Math.random() < 0.4) {
                                  const angle = Math.random() * Math.PI * 2;
                                  const r = 60;
                                  particlesRef.current.push({
                                      x: p.x + Math.cos(angle) * r,
                                      y: p.y + Math.sin(angle) * r,
                                      vx: -Math.cos(angle) * 3, // suck in fast
                                      vy: -Math.sin(angle) * 3,
                                      life: 0.4,
                                      color: p.color,
                                      size: Math.random() * 2 + 1
                                  });
                             }
                        });

                        // We iterate backward to safely splice if needed, though we replace via addPortalPair logic
                        for (let i = portalsRef.current.length - 1; i >= 0; i--) {
                            const portal = portalsRef.current[i];
                            const dist = Math.hypot(player.x + player.width/2 - portal.x, player.y + player.height/2 - portal.y);
                            
                            if (dist < 50 && portalCooldownRef.current <= 0) {
                                player.x = portal.targetX; 
                                player.y = portal.targetY;
                                // Momentum is preserved by NOT resetting vx/vy
                                portalCooldownRef.current = 60; 
                                createParticles(player.x, player.y, portal.color, 30);
                                playSound('time');
                                onUnlockAchievement('DIMENSION_HOPPER');
                                
                                // Remove this portal pair and spawn a new one elsewhere
                                portalsRef.current = portalsRef.current.filter(p => p.pairId !== portal.pairId);
                                addPortalPair();
                                break; // Only trigger one portal per frame
                            }
                        }
                    }

                    if (gameMode === GameState.PLAYING_WAVE) {
                        const now = Date.now();
                        
                        // Wave Logic
                        // Increase difficulty every 5 kills
                        const killsPerWave = 5;
                        const currentWave = Math.floor(waveStateRef.current.killCount / killsPerWave) + 1;
                        if (currentWave > waveStateRef.current.wave) {
                            waveStateRef.current.wave = currentWave;
                            showComboText(`WAVE ${currentWave}!`, player.x, player.y - 100, true);
                        }

                        if (now > waveStateRef.current.nextSpawnTime) {
                            const aliveCount = opponents.filter(o => o.state !== 'DEAD').length;
                            const maxEnemies = Math.min(3 + Math.floor(waveStateRef.current.wave / 2), 6);
                            if (aliveCount < maxEnemies) {
                                spawnWaveEnemy();
                                waveStateRef.current.nextSpawnTime = now + Math.max(1000, 4000 - (waveStateRef.current.wave * 200));
                            }
                        }
                    }

                    projectilesRef.current.forEach((p, idx) => {
                        if (p.delay && p.delay > 0) {
                            p.delay--;
                            return;
                        }

                        if (p.life <= 0) {
                            projectilesRef.current.splice(idx, 1);
                            return;
                        }
                        
                        if (p.specialType === 'BLACK_HOLE') {
                            const targets = p.isPlayerTeam ? opponents : playerSide;
                            targets.forEach(t => {
                                if (t.state !== 'DEAD') {
                                    const dx = p.x - t.x;
                                    const dy = p.y - t.y;
                                    const dist = Math.hypot(dx, dy);
                                    if (dist < 300) {
                                        t.vx += dx * 0.05;
                                        t.vy += dy * 0.05;
                                        createParticles(t.x, t.y, '#000', 1);
                                    }
                                }
                            });
                            if (p.life % 10 === 0) {
                                createParticles(p.x, p.y, '#4c1d95', 2);
                            }
                        } else if (p.homing) {
                            const targets = p.isPlayerTeam ? opponents : playerSide;
                            // Simple homing to closest
                            let target = targets[0];
                            let minDist = 9999;
                            targets.forEach(t => {
                                const d = Math.hypot(t.x - p.x, t.y - p.y);
                                if (d < minDist) { minDist = d; target = t; }
                            });
                            
                            if (target) {
                                const dx = (target.x + target.width/2) - p.x;
                                const dy = (target.y + target.height/2) - p.y;
                                const angle = Math.atan2(dy, dx);
                                
                                const homingSpeed = p.life < 130 ? 0.8 : 0.05; 
                                p.vx += Math.cos(angle) * homingSpeed;
                                p.vy += Math.sin(angle) * homingSpeed;
                            }
                        }
                        
                        if (p.specialType === 'ROCKET') {
                            p.vx *= 1.05;
                            createParticles(p.x, p.y, '#555', 1);
                        }
                        if (p.specialType === 'TORNADO') {
                            p.vx *= 1.01;
                            const targets = p.isPlayerTeam ? opponents : playerSide;
                            targets.forEach(t => {
                                const dist = Math.abs(t.x - p.x);
                                if (dist < 80 && Math.abs(t.y - p.y) < 150) {
                                    t.vy -= 1;
                                    t.vx += p.vx * 0.1;
                                }
                            });
                        }

                        p.x += p.vx;
                        p.y += p.vy;
                        p.life--;

                        const targets = p.isPlayerTeam ? opponents : playerSide;
                        targets.forEach(target => {
                            let hit = false;
                            
                            // Check for single hit limit (e.g., Inferno Pillar)
                            if (p.hitIds && p.hitIds.includes(target.id)) return;

                            if (p.specialType === 'FIRE_PILLAR' || p.specialType === 'ICE_SPIKE' || p.specialType === 'EARTH_SPIKE') {
                                if (target.x < p.x + (p.width||40)/2 && target.x + target.width > p.x - (p.width||40)/2 &&
                                    target.y < p.y && target.y + target.height > p.y - (p.height||100)) {
                                        hit = true;
                                }
                            } else if (p.specialType === 'VOID_CUT') {
                                if (Math.hypot(p.x - target.x, p.y - target.y) < p.radius) hit = true;
                            }
                            else if (p.specialType === 'BLACK_HOLE') {
                                if (Math.hypot(p.x - (target.x+target.width/2), p.y - (target.y+target.height/2)) < 30 && p.life % 10 === 0) {
                                    hit = true;
                                }
                            }
                            else if (p.specialType === 'MINE') {
                                const dist = Math.hypot(p.x - (target.x+target.width/2), p.y - (target.y+target.height/2));
                                if (dist < 40) hit = true;
                            }
                            else if (p.specialType === 'TORNADO') {
                                if (Math.abs(p.x - target.x) < p.width!/2 && Math.abs(p.y - target.y) < p.height!/2 && p.life % 5 === 0) {
                                    hit = true;
                                }
                            }
                            else {
                                const dist = Math.hypot(p.x - (target.x+target.width/2), p.y - (target.y+target.height/2));
                                if (dist < p.radius + 30) hit = true;
                            }

                            if (hit) {
                                // Record hit for persistent projectiles
                                if (p.specialType === 'FIRE_PILLAR' || p.specialType === 'ICE_SPIKE' || p.specialType === 'EARTH_SPIKE') {
                                    p.hitIds = [...(p.hitIds || []), target.id];
                                }

                                applyDamage({type: player.type, isPlayer: p.isPlayerTeam} as any, target, p.damage);
                                
                                if (p.specialType === 'ICE_SPIKE') {
                                    target.frozen = true;
                                    playSound('ice');
                                    createParticles(target.x, target.y, '#00ffff', 10);
                                } else if (p.specialType === 'EARTH_SPIKE') {
                                    target.vy = -25; 
                                    createParticles(target.x, target.y, '#10b981', 15);
                                    playSound('heavy');
                                    showComboText("CRUSH!", target.x, target.y - 50, true);
                                } else if (p.specialType === 'FIRE_PILLAR') {
                                    target.vy = -15;
                                    playSound('burn');
                                    createParticles(target.x, target.y, '#ff4400', 10);
                                } else if (p.specialType === 'VOID_CUT') {
                                    playSound('heavy');
                                    shakeRef.current = 15;
                                    showComboText("OBLITERATE", target.x, target.y - 60, true);
                                } else if (p.specialType === 'SOLAR_FLARE') {
                                    playSound('burn');
                                    createParticles(p.x, p.y, '#fbbf24', 20);
                                    addShockwave(p.x, p.y, '#fbbf24');
                                } else if (p.specialType === 'MINE') {
                                    playSound('heavy');
                                    createParticles(p.x, p.y, '#65a30d', 30);
                                    addShockwave(p.x, p.y, '#65a30d');
                                    target.state = 'STUNNED';
                                } else if (p.specialType === 'ROCKET') {
                                    playSound('heavy');
                                    createParticles(p.x, p.y, '#94a3b8', 30);
                                    addShockwave(p.x, p.y, '#fff');
                                    shakeRef.current = 5;
                                } else if (p.specialType === 'TORNADO') {
                                    target.vx = p.vx > 0 ? 10 : -10;
                                    target.vy = -15;
                                    createParticles(target.x, target.y, '#fff', 5);
                                } else if (p.specialType === 'BUG' || p.specialType === 'TOXIC_PUKE') {
                                    playSound('hit');
                                    createParticles(p.x, p.y, '#a3e635', 5);
                                } else if (p.specialType === 'SYMBIOTE') {
                                    playSound('hit');
                                    target.vx *= 0.1; 
                                    createParticles(p.x, p.y, '#000', 5);
                                }
                                
                                if (p.specialType !== 'FIRE_PILLAR' && p.specialType !== 'ICE_SPIKE' && p.specialType !== 'EARTH_SPIKE' && p.specialType !== 'BLACK_HOLE' && p.specialType !== 'TORNADO') {
                                    projectilesRef.current.splice(idx, 1);
                                }
                            }
                        });
                    });
                    
                    slashesRef.current.forEach((s, idx) => {
                        s.life -= (s.decay || 0.05);
                        if (s.life <= 0) slashesRef.current.splice(idx, 1);
                    });

                    if (player.hp <= 0) onGameOver('CPU');
                    
                    if (gameMode !== GameState.PLAYING_WAVE && gameMode !== GameState.PLAYING_FREERUN) {
                        const allDead = opponents.every(o => o.hp <= 0);
                        if (opponents.length > 0 && allDead && !finisherRef.current.active) {
                            const lastEnemy = opponents[0];
                            if (lastEnemy.state !== 'DEAD') lastEnemy.state = 'DEAD';
                            
                            // Check Win Achievements before Game Over screen
                            onUnlockAchievement('FIRST_WIN');
                            if (player.hp >= player.maxHp * 0.95) {
                                onUnlockAchievement('FLAWLESS');
                            }
                            
                            if (['LANCER', 'MAGIC', 'HEAVY', 'LIGHT'].includes(player.type)) {
                                onUnlockAchievement('SNIPER');
                            }
                            if (['INFERNO', 'GLACIER', 'WIND', 'ELEMENTAL'].includes(player.type)) {
                                onUnlockAchievement('ELEMENTALIST');
                            }
                            if (['ZOMBIE', 'BONE', 'DEVIL'].includes(player.type)) {
                                onUnlockAchievement('UNDEAD_LEGION');
                            }
                            if (['MONK', 'SAINT'].includes(player.type)) {
                                onUnlockAchievement('ENLIGHTENED');
                            }
                            if (['LIGHT', 'VOLT'].includes(player.type)) {
                                onUnlockAchievement('PHOTON_BLITZ');
                            }

                            setTimeout(() => onGameOver('PLAYER'), 1000);
                        }
                    }
                }
        }
      }

      if (Math.abs(player.hp - playerHealth) > 1) setPlayerHealth(player.hp);
      
      if (gameMode === GameState.PLAYING_WAVE) {
           const alive = opponents.filter(o => o.state !== 'DEAD').length;
           setEnemiesRemaining(alive);
      }
      
      const cd = Math.floor((player.specialCooldown / player.maxSpecialCooldown) * 100);
      setSpecialCooldown(100 - cd);

      const p2 = opponents[0];
      if (p2) {
          const cdP2 = Math.floor((p2.specialCooldown / p2.maxSpecialCooldown) * 100);
          setP2SpecialCooldown(100 - cdP2);
      }

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.save();
      if (shakeRef.current > 0) {
          const dx = (Math.random() - 0.5) * shakeRef.current;
          const dy = (Math.random() - 0.5) * shakeRef.current;
          ctx.translate(dx, dy);
          shakeRef.current *= 0.9;
          if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      ctx.fillStyle = '#222';
      ctx.fillRect(0, GROUND_Y, ctx.canvas.width, 150);
      ctx.strokeStyle = '#333';
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(CANVAS_WIDTH, GROUND_Y); ctx.stroke();

      ctx.strokeStyle = '#333';
      ctx.beginPath(); ctx.moveTo(0, CEILING_Y); ctx.lineTo(CANVAS_WIDTH, CEILING_Y); ctx.stroke();

      // Draw Portals
      if (gameMode === GameState.PLAYING_FREERUN) {
          portalsRef.current.forEach(p => {
              const time = Date.now();
              ctx.save();
              ctx.translate(p.x, p.y);
              
              // Pulsing Effect
              const pulse = Math.sin(time / 500) * 5;
              const glowRadius = 40 + pulse;
              
              const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, glowRadius);
              grad.addColorStop(0, '#fff');
              grad.addColorStop(0.5, p.color);
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, glowRadius, 0, Math.PI*2);
              ctx.fill();

              // Swirling Vortex
              ctx.save();
              ctx.rotate(time / 800);
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 2;
              for(let i=0; i<3; i++) {
                   ctx.rotate(Math.PI*2/3);
                   ctx.beginPath();
                   ctx.moveTo(10, 0);
                   ctx.quadraticCurveTo(30, 10, 35, 35);
                   ctx.stroke();
              }
              ctx.restore();
              
              // Core
              ctx.fillStyle = '#000';
              ctx.beginPath();
              ctx.arc(0, 0, 15, 0, Math.PI*2);
              ctx.fill();

              ctx.restore();
          });
      }

      shockwavesRef.current.forEach((s, i) => {
          s.radius += 5;
          s.life -= 0.05;
          if(s.life <= 0 || s.radius > s.maxRadius) {
              shockwavesRef.current.splice(i, 1);
          } else {
              ctx.strokeStyle = s.color;
              ctx.lineWidth = s.width * s.life;
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
              ctx.stroke();
          }
      });
      
      ghostsRef.current.forEach((g, idx) => {
          ctx.save();
          ctx.globalAlpha = g.life * 0.4;
          if (g.attackVariant === 1) ctx.filter = 'hue-rotate(-30deg) brightness(1.5)'; 
          else if (g.attackVariant === 2) ctx.filter = 'hue-rotate(30deg) brightness(1.5)'; 
          
          drawStickman(ctx, g, g.snapshotTime);
          ctx.restore();
          
          g.life -= 0.05; // Slowed down from 0.08
      });
      ghostsRef.current = ghostsRef.current.filter(g => g.life > 0);
      
      slashesRef.current.forEach(s => {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.width * s.life;
          ctx.globalAlpha = s.life;
          ctx.shadowBlur = 20;
          ctx.shadowColor = s.color;
          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
      });

      let drawP = true;
      let drawEnemies = true;

      projectilesRef.current.forEach(p => {
           if (p.delay && p.delay > 0) {
               ctx.strokeStyle = 'rgba(255,255,255,0.3)';
               ctx.beginPath();
               if(p.specialType === 'FIRE_PILLAR') ctx.arc(p.x, GROUND_Y, 40, 0, Math.PI*2);
               else ctx.arc(p.x, p.y, 10, 0, Math.PI*2);
               ctx.stroke();
               return;
           }

           if (p.specialType === 'FIRE_PILLAR') {
               const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y - p.height!);
               grad.addColorStop(0, '#ffff00');
               grad.addColorStop(0.5, '#ef4444');
               grad.addColorStop(1, 'transparent');
               ctx.fillStyle = grad;
               ctx.fillRect(p.x - p.width!/2, p.y - p.height!, p.width!, p.height!);
           } else if (p.specialType === 'ICE_SPIKE') {
               ctx.fillStyle = '#ccffff';
               ctx.beginPath();
               ctx.moveTo(p.x, p.y);
               ctx.lineTo(p.x - p.width!/2, p.y - p.height!);
               ctx.lineTo(p.x + p.width!/2, p.y);
               ctx.fill();
           } else if (p.specialType === 'EARTH_SPIKE') {
               if (p.color === '#e5e7eb') ctx.fillStyle = '#e5e7eb';
               else ctx.fillStyle = '#4ade80';
               
               ctx.beginPath();
               ctx.moveTo(p.x - p.width!/2, p.y);
               ctx.lineTo(p.x, p.y - p.height!);
               ctx.lineTo(p.x + p.width!/2, p.y);
               ctx.fill();
           } else if (p.specialType === 'BLACK_HOLE') {
               ctx.fillStyle = '#000';
               ctx.shadowColor = '#4c1d95';
               ctx.shadowBlur = 20 + Math.random()*10;
               ctx.beginPath();
               ctx.arc(p.x, p.y, p.radius || 20, 0, Math.PI*2);
               ctx.fill();
               ctx.shadowBlur = 0;
           } else if (p.specialType === 'SOLAR_FLARE') {
               ctx.fillStyle = '#fbbf24';
               ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 15;
               ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
           } else if (p.specialType === 'MINE') {
               ctx.fillStyle = '#65a30d'; ctx.strokeStyle = '#365314'; ctx.lineWidth = 2;
               ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill(); ctx.stroke();
               if (Math.floor(Date.now()/500) % 2 === 0) {
                   ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(p.x, p.y-5, 3, 0, Math.PI*2); ctx.fill();
               }
           } else if (p.specialType === 'ROCKET') {
               ctx.fillStyle = '#94a3b8';
               ctx.beginPath(); ctx.ellipse(p.x, p.y, 15, 6, 0, 0, Math.PI*2); ctx.fill();
               ctx.fillStyle = 'orange'; ctx.beginPath(); ctx.arc(p.x - (p.vx>0?15:-15), p.y, 4, 0, Math.PI*2); ctx.fill();
           } else if (p.specialType === 'BULLET') {
               ctx.fillStyle = '#fbbf24';
               ctx.fillRect(p.x-5, p.y-2, 10, 4);
           } else if (p.specialType === 'TORNADO') {
               const grad = ctx.createLinearGradient(p.x-p.width!/2, 0, p.x+p.width!/2, 0);
               grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
               grad.addColorStop(0.5, 'rgba(186, 230, 253, 0.5)');
               grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
               ctx.fillStyle = grad;
               ctx.fillRect(p.x - p.width!/2, p.y - p.height!/2, p.width!, p.height!);
               ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
               ctx.beginPath();
               for(let i=0; i<5; i++) {
                   const y = p.y - p.height!/2 + Math.random()*p.height!;
                   const w = Math.random() * p.width!;
                   ctx.moveTo(p.x - w/2, y); ctx.lineTo(p.x + w/2, y);
               }
               ctx.stroke();
           } else if (p.specialType === 'BUG' || p.specialType === 'TOXIC_PUKE') {
               ctx.fillStyle = '#a3e635';
               ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
               ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
           } else if (p.specialType === 'SYMBIOTE') {
               ctx.fillStyle = '#000';
               ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
           }
      });

      if(drawP) drawStickman(ctx, player);
      
      alliesRef.current.forEach(ally => {
          if (ally.state !== 'DEAD' || Math.abs(ally.vx) > 0.1 || ally.y < GROUND_Y - ally.height) drawStickman(ctx, ally);
          else {
              ctx.globalAlpha = 0.5; drawStickman(ctx, ally); ctx.globalAlpha = 1;
          }
      });

      if(drawEnemies) {
          opponents.forEach(op => {
              if (op.state !== 'DEAD' || Math.abs(op.vx) > 0.1 || op.y < GROUND_Y - op.height) drawStickman(ctx, op);
              else {
                   ctx.globalAlpha = 0.5;
                   drawStickman(ctx, op);
                   ctx.globalAlpha = 1;
              }
          });
      }

      projectilesRef.current.forEach(p => {
          if (p.specialType) return; 

          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.beginPath();
          ctx.arc(p.x - p.vx, p.y - p.vy, p.radius * 0.6, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;
      });

      particlesRef.current.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.05;
          // Apply gravity if it's falling debris
          if (p.vy > 0 && p.color === '#ffaa00') p.vy += 0.2;

          if (p.life > 0) {
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.life;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
              ctx.globalAlpha = 1;
          } else {
              particlesRef.current.splice(index, 1);
          }
      });

      comboTextRef.current.forEach((ct, i) => {
          ctx.save();
          ctx.translate(ct.x, ct.y);
          const s = ct.scale + (1-ct.life) * 0.5; 
          ctx.scale(s, s);
          ctx.fillStyle = '#fff';
          ctx.font = 'italic 900 32px monospace';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.strokeText(ct.text, 0, 0);
          ctx.fillText(ct.text, 0, 0);
          ctx.restore();
          
          ct.y -= 1;
          ct.life -= 0.02;
          if(ct.life <= 0) comboTextRef.current.splice(i, 1);
      });

      if (finisherRef.current.active) {
          drawFinisherEffects(ctx, finisherRef.current.timer, finisherRef.current.type!, finisherRef.current.victimX, finisherRef.current.victimY);
      }

      if (introTimerRef.current > 0) {
          const t = introTimerRef.current;
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = CANVAS_WIDTH / 2;
          const centerY = CANVAS_HEIGHT / 2;

          if (t > 60) {
             const scale = 1 + (t-60)/100;
             ctx.translate(centerX, centerY);
             ctx.scale(scale, scale);
             ctx.fillStyle = '#fff';
             ctx.strokeStyle = '#000';
             ctx.lineWidth = 8;
             ctx.font = 'italic 900 120px monospace';
             ctx.strokeText("ROUND 1", 0, 0);
             ctx.fillText("ROUND 1", 0, 0);
          } else {
             const scale = 1 + (60-t)/30;
             ctx.translate(centerX, centerY);
             ctx.scale(scale, scale);
             ctx.fillStyle = '#ff0000';
             ctx.strokeStyle = '#fff';
             ctx.lineWidth = 5;
             ctx.font = 'italic 900 150px monospace';
             ctx.shadowColor = 'red';
             ctx.shadowBlur = 20;
             ctx.strokeText("FIGHT", 0, 0);
             ctx.fillText("FIGHT", 0, 0);
          }
          ctx.restore();
      }

      if (flashRef.current > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashRef.current * 0.2})`;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          flashRef.current--;
      }
      
      if (darkenScreenRef.current > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.7, darkenScreenRef.current * 0.1)})`;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          darkenScreenRef.current--;
      }
      
      // Screen Tint Overlay (For Specials)
      if (screenTintRef.current) {
          ctx.fillStyle = screenTintRef.current.color;
          ctx.globalAlpha = screenTintRef.current.alpha;
          ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.globalAlpha = 1;
          screenTintRef.current.alpha -= 0.05;
          if (screenTintRef.current.alpha <= 0) screenTintRef.current = null;
      }

      ctx.restore();
      requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-dark-bg overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="w-1/3 pointer-events-auto">
             <button onClick={onBack} className="mb-4 px-4 py-1 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-xs text-white uppercase tracking-widest rounded">
                 &lt; Menu
             </button>
            <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold italic" style={{color: CHAR_STATS[playerCharType].color}}>PLAYER 1</span>
            </div>
            <div className="h-6 bg-gray-800 skew-x-12 border border-gray-600 relative overflow-hidden mb-2">
                <div 
                    className="h-full transition-all duration-200" 
                    style={{ width: `${Math.max(0, (playerHealth / playerRef.current.maxHp) * 100)}%`, backgroundColor: CHAR_STATS[playerCharType].color }}
                />
            </div>
            <div className="flex items-center gap-2">
                     <span className="text-xs text-white font-bold">ABILITY (X)</span>
                     <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                         <div className={`h-full transition-all duration-100 ${specialCooldown >= 100 ? 'bg-white animate-pulse' : 'bg-gray-500'}`} style={{ width: `${specialCooldown}%` }} />
                     </div>
            </div>
        </div>

        <div className="text-center mt-2 flex flex-col items-center">
            {gameMode === GameState.PLAYING_WAVE ? (
                <>
                    <span className="text-xl font-bold text-gray-400">WAVE SURVIVAL</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter shadow-neon">KILLS: {waveKillCount}</span>
                </>
            ) : gameMode === GameState.PLAYING_FREERUN ? (
                <span className="text-4xl font-black text-white italic tracking-tighter shadow-neon">FREERUN</span>
            ) : (
                <span className="text-4xl font-black text-white italic tracking-tighter shadow-neon">
                   {gameMode === GameState.TOURNAMENT_LADDER ? `ROUND ${tournamentRound}` : 'VS'}
                </span>
            )}
            
            {comboCounter > 1 && (
                <div className="mt-4 animate-bounce">
                    <span className="text-3xl font-black text-neon-red italic">{comboCounter} HITS!</span>
                </div>
            )}
        </div>

        <div className="w-1/3 text-right">
             {gameMode === GameState.PLAYING_WAVE ? (
                 <div className="text-2xl font-bold italic text-neon-red">
                     ENEMIES: {enemiesRemaining}
                 </div>
             ) : gameMode !== GameState.PLAYING_FREERUN && (
                 <>
                    <div className="flex items-end gap-2 mb-1 justify-end">
                        <span className="text-2xl font-bold italic" style={{color: '#ff0000'}}>
                            {gameMode === GameState.PLAYING_PVP ? 'PLAYER 2' : (opponentsRef.current[0] ? CHAR_STATS[opponentsRef.current[0].type].name : 'ENEMY')}
                        </span>
                    </div>
                    {opponentsRef.current[0] && (
                        <>
                            <div className="h-6 bg-gray-800 -skew-x-12 border border-gray-600 relative overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-200 float-right" 
                                    style={{ 
                                        width: `${Math.max(0, (opponentsRef.current[0].hp / opponentsRef.current[0].maxHp) * 100)}%`,
                                        backgroundColor: CHAR_STATS[opponentsRef.current[0].type].color
                                    }}
                                />
                            </div>
                            {gameMode === GameState.PLAYING_PVP && (
                                <div className="flex items-center gap-2 justify-end mt-1">
                                     <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden border border-gray-700 transform rotate-180">
                                         <div className={`h-full transition-all duration-100 ${p2SpecialCooldown >= 100 ? 'bg-white animate-pulse' : 'bg-gray-500'}`} style={{ width: `${p2SpecialCooldown}%` }} />
                                     </div>
                                     <span className="text-xs text-white font-bold">ABILITY (M)</span>
                                </div>
                            )}
                        </>
                    )}
                 </>
             )}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-gray-500 text-xs z-10 flex gap-8">
          <div><strong className="text-white">P1:</strong> Arrows/WASD (Move) • Z (Attack) • X (Special)</div>
          {gameMode === GameState.PLAYING_PVP && (
            <div><strong className="text-white">P2:</strong> Arrows (Move) • N (Attack) • M (Special)</div>
          )}
      </div>

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="bg-gradient-to-b from-gray-900 to-black w-full h-full object-contain"
      />
    </div>
  );
};