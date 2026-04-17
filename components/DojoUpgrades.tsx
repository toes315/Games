
import React, { useState, useEffect, useRef } from 'react';
import { CharacterType, CharacterProgress, SkinVisuals, SHOP_SKINS, SHOP_ABILITIES } from '../types';

interface DojoUpgradesProps {
    characterProgress: Record<CharacterType, CharacterProgress>;
    onUnlockSkin: (character: CharacterType, skinId: string, cost: number) => void;
    onEquipSkin: (character: CharacterType, skinId: string | null) => void;
    onUnlockAbility: (character: CharacterType, abilityId: string, cost: number) => void;
    onEquipAbility: (character: CharacterType, abilityId: string | null) => void;
    onBack: () => void;
}

const CHAR_INFO: Record<CharacterType, { name: string; color: string }> = {
    [CharacterType.NINJA]: { name: 'Ninja', color: '#00f3ff' },
    [CharacterType.TITAN]: { name: 'Titan', color: '#ff4400' },
    [CharacterType.VOLT]: { name: 'Volt', color: '#ffff00' },
    [CharacterType.LANCER]: { name: 'Lancer', color: '#bd00ff' },
    [CharacterType.PHANTOM]: { name: 'Phantom', color: '#00ff00' },
    [CharacterType.INFERNO]: { name: 'Inferno', color: '#ff3333' },
    [CharacterType.GLACIER]: { name: 'Glacier', color: '#00ffff' },
    [CharacterType.RONIN]: { name: 'Ronin', color: '#e0e0e0' },
    [CharacterType.ELEMENTAL]: { name: 'Elemental', color: '#10b981' },
    [CharacterType.MAGIC]: { name: 'Magic', color: '#d946ef' },
    [CharacterType.ANIMAL]: { name: 'Beast', color: '#d97706' },
    [CharacterType.DARKNESS]: { name: 'Void', color: '#4c1d95' },
    [CharacterType.SOLAR]: { name: 'Solar', color: '#fbbf24' },
    [CharacterType.HEAVY]: { name: 'Heavy', color: '#475569' },
    [CharacterType.TRAPPER]: { name: 'Trapper', color: '#65a30d' },
    [CharacterType.SAINT]: { name: 'Saint', color: '#fef08a' },
    [CharacterType.CYBORG]: { name: 'Cyborg', color: '#94a3b8' },
    [CharacterType.TIME]: { name: 'Time', color: '#bfa15f' },
    [CharacterType.DEVIL]: { name: 'Devil', color: '#7f1d1d' },
    [CharacterType.GRAVITY]: { name: 'Gravity', color: '#2e1065' },
    [CharacterType.INSECT]: { name: 'Insect', color: '#a3e635' },
    [CharacterType.BONE]: { name: 'Bone', color: '#e5e7eb' },
    [CharacterType.WIND]: { name: 'Wind', color: '#bae6fd' },
    [CharacterType.VENOM]: { name: 'Venom', color: '#171717' },
    [CharacterType.CHAOS]: { name: 'Chaos', color: '#555555' },
    [CharacterType.PLANT]: { name: 'Plant', color: '#22c55e' },
    [CharacterType.CRYSTAL]: { name: 'Crystal', color: '#a855f7' },
    [CharacterType.ZOMBIE]: { name: 'Zombie', color: '#65a30d' },
    [CharacterType.MONK]: { name: 'Monk', color: '#f97316' },
    [CharacterType.LIGHT]: { name: 'Light', color: '#fff' },
    [CharacterType.VIKING]: { name: 'Viking', color: '#94a3b8' },
    [CharacterType.PIRATE]: { name: 'Pirate', color: '#ef4444' },
    [CharacterType.CYBER]: { name: 'Cyber', color: '#f0abfc' }
};

const SkinPreview: React.FC<{ color: string; visuals?: SkinVisuals }> = ({ color, visuals }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + 10;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (visuals?.effect === 'NEON_OUTLINE') { ctx.shadowColor = color; ctx.shadowBlur = 10; }
        else if (visuals?.effect === 'FIRE') { ctx.shadowColor = 'orange'; ctx.shadowBlur = 15; }

        if (visuals?.backAccessory === 'CAPE') {
            ctx.fillStyle = '#900';
            ctx.beginPath(); ctx.moveTo(cx - 5, cy - 25); ctx.lineTo(cx + 5, cy - 25); ctx.lineTo(cx + 10, cy + 30); ctx.lineTo(cx - 10, cy + 30); ctx.fill();
        } else if (visuals?.backAccessory === 'WINGS') {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            if (color === '#450a0a') ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.ellipse(cx-20, cy-10, 30, 10, Math.PI/4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(cx+20, cy-10, 30, 10, -Math.PI/4, 0, Math.PI*2); ctx.fill();
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 10); ctx.lineTo(cx - 10, cy + 40);
        ctx.moveTo(cx, cy + 10); ctx.lineTo(cx + 10, cy + 40);
        ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 10);
        ctx.moveTo(cx, cy - 20); ctx.lineTo(cx - 15, cy + 5);
        ctx.moveTo(cx, cy - 20); ctx.lineTo(cx + 15, cy + 5);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy - 30, 10, 0, Math.PI * 2); ctx.stroke();

        if (visuals?.faceAccessory === 'VISOR') { ctx.fillStyle = '#0ff'; ctx.fillRect(cx - 6, cy - 34, 12, 4); }
        else if (visuals?.faceAccessory === 'EYEPATCH') { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx-3, cy-32, 3, 0, Math.PI*2); ctx.fill(); }
        
        if (visuals?.accessory === 'HALO') { ctx.strokeStyle = '#ff0'; ctx.beginPath(); ctx.ellipse(cx, cy - 45, 12, 4, 0, 0, Math.PI*2); ctx.stroke(); }
        else if (visuals?.accessory === 'HORNS') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx-5, cy-38); ctx.lineTo(cx-10, cy-48); ctx.lineTo(cx-2, cy-39); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx+5, cy-38); ctx.lineTo(cx+10, cy-48); ctx.lineTo(cx+2, cy-39); ctx.fill(); }
        else if (visuals?.accessory === 'HAT_GENERAL') { ctx.fillStyle = '#1e293b'; ctx.fillRect(cx-10, cy-45, 20, 10); ctx.fillStyle='#000'; ctx.fillRect(cx-12, cy-38, 24, 4); }

    }, [color, visuals]);

    return <canvas ref={canvasRef} width={100} height={100} className="w-full h-full object-contain" />;
};

export const DojoUpgrades: React.FC<DojoUpgradesProps> = ({ characterProgress, onUnlockSkin, onEquipSkin, onUnlockAbility, onEquipAbility, onBack }) => {
    const [selectedChar, setSelectedChar] = useState<CharacterType>(CharacterType.NINJA);
    const [tab, setTab] = useState<'SKINS' | 'ABILITIES'>('SKINS');

    const progress = characterProgress[selectedChar];
    const charInfo = CHAR_INFO[selectedChar];
    const availableSkins = SHOP_SKINS.filter(s => s.characterType === selectedChar);
    const availableAbilities = SHOP_ABILITIES.filter(a => a.characterType === selectedChar);

    return (
        <div className="absolute inset-0 bg-dark-bg flex flex-col z-50">
            <div className="p-6 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Dojo Upgrades</h1>
                    <p className="text-gray-400">Mastery Points: {progress.masteryPoints}</p>
                </div>
                <button onClick={onBack} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase rounded border border-gray-600">Back</button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
                    {Object.keys(CHAR_INFO).map((key) => {
                        const type = key as CharacterType;
                        const info = CHAR_INFO[type];
                        return (
                            <button key={type} onClick={() => setSelectedChar(type)} className={`w-full text-left p-4 border-l-4 transition-all ${selectedChar === type ? 'bg-gray-800 border-white' : 'border-transparent hover:bg-gray-800/50'}`}>
                                <div className="font-bold text-sm uppercase" style={{ color: selectedChar === type ? info.color : '#888' }}>{info.name}</div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center bg-black" style={{ borderColor: charInfo.color }}>
                            <div className="text-4xl" style={{ color: charInfo.color }}>🥋</div>
                        </div>
                        <div>
                            <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter" style={{ textShadow: `0 0 20px ${charInfo.color}` }}>{charInfo.name}</h2>
                            <div className="text-xl text-gray-400">Level {progress.level}</div>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6 border-b border-gray-700 pb-1">
                        <button onClick={() => setTab('SKINS')} className={`px-6 py-2 font-bold uppercase tracking-widest ${tab === 'SKINS' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>Skins</button>
                        <button onClick={() => setTab('ABILITIES')} className={`px-6 py-2 font-bold uppercase tracking-widest ${tab === 'ABILITIES' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>Abilities</button>
                    </div>
                    
                    {tab === 'SKINS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className={`p-6 rounded-xl border-2 flex flex-col gap-4 relative overflow-hidden transition-all ${!progress.equippedSkin ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-900'}`}>
                                <div className="flex justify-between items-start"><h4 className="text-2xl font-bold text-white uppercase">Default</h4>{!progress.equippedSkin && <span className="text-green-500 font-bold text-xs uppercase border border-green-500 px-2 py-1 rounded">Equipped</span>}</div>
                                <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center border border-gray-800"><div className="w-32 h-32"><SkinPreview color={charInfo.color} /></div></div>
                                <button onClick={() => onEquipSkin(selectedChar, null)} disabled={!progress.equippedSkin} className={`w-full py-3 font-bold uppercase rounded tracking-widest ${!progress.equippedSkin ? 'bg-gray-700 text-gray-500' : 'bg-white text-black hover:bg-gray-200'}`}>Equip</button>
                            </div>
                            {availableSkins.map(skin => {
                                const isUnlocked = progress.unlockedSkins.includes(skin.id);
                                const isEquipped = progress.equippedSkin === skin.id;
                                const canAfford = progress.masteryPoints >= skin.cost;
                                return (
                                    <div key={skin.id} className={`p-6 rounded-xl border-2 flex flex-col gap-4 relative overflow-hidden transition-all ${isEquipped ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-900'}`}>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-2xl font-bold text-white uppercase">{skin.name}</h4>
                                            {isEquipped && <span className="text-green-500 font-bold text-xs uppercase border border-green-500 px-2 py-1 rounded">Equipped</span>}
                                            {!isUnlocked && <span className="text-yellow-500 font-bold text-xs uppercase border border-yellow-500 px-2 py-1 rounded">Cost: {skin.cost}</span>}
                                        </div>
                                        <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center border border-gray-800 relative group">
                                            <div className="w-32 h-32"><SkinPreview color={skin.colorOverride || charInfo.color} visuals={skin.visuals} /></div>
                                            {!isUnlocked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-4xl">🔒</span></div>}
                                        </div>
                                        <p className="text-gray-400 text-sm h-10">{skin.description}</p>
                                        {isUnlocked ? (
                                            <button onClick={() => onEquipSkin(selectedChar, skin.id)} disabled={isEquipped} className={`w-full py-3 font-bold uppercase rounded tracking-widest ${isEquipped ? 'bg-gray-700 text-gray-500' : 'bg-white text-black hover:bg-gray-200'}`}>Equip</button>
                                        ) : (
                                            <button onClick={() => onUnlockSkin(selectedChar, skin.id, skin.cost)} disabled={!canAfford} className={`w-full py-3 font-bold uppercase rounded tracking-widest ${canAfford ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>Unlock</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {tab === 'ABILITIES' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <div className={`p-6 rounded-xl border-2 flex flex-col gap-4 relative overflow-hidden transition-all ${!progress.equippedAbility ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-900'}`}>
                                <div className="flex justify-between items-start"><h4 className="text-2xl font-bold text-white uppercase">Default Special</h4>{!progress.equippedAbility && <span className="text-green-500 font-bold text-xs uppercase border border-green-500 px-2 py-1 rounded">Equipped</span>}</div>
                                <div className="w-full h-32 bg-black rounded-lg flex items-center justify-center border border-gray-800 text-4xl">⚡</div>
                                <button onClick={() => onEquipAbility(selectedChar, null)} disabled={!progress.equippedAbility} className={`w-full py-3 font-bold uppercase rounded tracking-widest ${!progress.equippedAbility ? 'bg-gray-700 text-gray-500' : 'bg-white text-black hover:bg-gray-200'}`}>Equip</button>
                            </div>
                            {availableAbilities.map(ability => {
                                const isUnlocked = progress.unlockedAbilities.includes(ability.id);
                                const isEquipped = progress.equippedAbility === ability.id;
                                const canAfford = progress.masteryPoints >= ability.cost;
                                return (
                                    <div key={ability.id} className={`p-6 rounded-xl border-2 flex flex-col gap-4 relative overflow-hidden transition-all ${isEquipped ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-900'}`}>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-2xl font-bold text-white uppercase">{ability.name}</h4>
                                            {isEquipped && <span className="text-green-500 font-bold text-xs uppercase border border-green-500 px-2 py-1 rounded">Equipped</span>}
                                            {!isUnlocked && <span className="text-yellow-500 font-bold text-xs uppercase border border-yellow-500 px-2 py-1 rounded">Cost: {ability.cost}</span>}
                                        </div>
                                        <div className="w-full h-32 bg-black rounded-lg flex items-center justify-center border border-gray-800 text-4xl relative group">
                                            🌟{!isUnlocked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-4xl">🔒</span></div>}
                                        </div>
                                        <p className="text-gray-400 text-sm h-10">{ability.description}</p>
                                        {isUnlocked ? (
                                            <button onClick={() => onEquipAbility(selectedChar, ability.id)} disabled={isEquipped} className={`w-full py-3 font-bold uppercase rounded tracking-widest ${isEquipped ? 'bg-gray-700 text-gray-500' : 'bg-white text-black hover:bg-gray-200'}`}>Equip</button>
                                        ) : (
                                            <button onClick={() => onUnlockAbility(selectedChar, ability.id, ability.cost)} disabled={!canAfford} className={`w-full py-3 font-bold uppercase rounded tracking-widest ${canAfford ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>Unlock</button>
                                        )}
                                    </div>
                                );
                            })}
                            {availableAbilities.length === 0 && <div className="col-span-full p-8 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">No abilities available yet.</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
