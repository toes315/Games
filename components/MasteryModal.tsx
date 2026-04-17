
import React from 'react';
import { CharacterType, CharacterStats, CharacterProgress, MASTERY_TRACK } from '../types';

interface MasteryModalProps {
    character: CharacterType;
    stats: CharacterStats;
    progress: CharacterProgress;
    onClose: () => void;
}

export const MasteryModal: React.FC<MasteryModalProps> = ({ character, stats, progress, onClose }) => {
    
    const currentLevelIdx = MASTERY_TRACK.findIndex(m => m.level === progress.level);
    const nextReward = MASTERY_TRACK[currentLevelIdx + 1];
    
    // XP Calculation
    const currentLevelBaseXP = MASTERY_TRACK[currentLevelIdx].xpRequired;
    const nextLevelXP = nextReward ? nextReward.xpRequired : currentLevelBaseXP; // Cap if maxed
    const xpInLevel = progress.xp - currentLevelBaseXP;
    const xpNeededForLevel = nextReward ? (nextLevelXP - currentLevelBaseXP) : 1;
    const xpPercent = Math.min(100, (xpInLevel / xpNeededForLevel) * 100);

    return (
        <div className="absolute inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-8 border-b border-gray-800 bg-gray-800/50 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-4 shadow-lg flex items-center justify-center text-3xl font-bold bg-black" style={{borderColor: stats.color, color: stats.color}}>
                         {progress.level}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter" style={{color: stats.color}}>
                            {stats.name} Mastery
                        </h2>
                        <div className="flex justify-between text-sm text-gray-400 mt-2 mb-1">
                            <span>TOTAL XP: {progress.xp}</span>
                            <span>{nextReward ? `NEXT: ${nextReward.xpRequired - progress.xp} XP` : "MAX LEVEL"}</span>
                        </div>
                        <div className="h-4 bg-black rounded-full overflow-hidden border border-gray-700">
                             <div 
                                className="h-full transition-all duration-500 relative"
                                style={{ width: `${nextReward ? xpPercent : 100}%`, backgroundColor: stats.color }}
                             >
                                 <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Rewards List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {MASTERY_TRACK.map((track) => {
                        const isUnlocked = progress.level >= track.level;
                        const isNext = progress.level + 1 === track.level;

                        return (
                            <div 
                                key={track.level}
                                className={`flex items-center gap-6 p-4 rounded-xl border-2 transition-all ${
                                    isUnlocked 
                                        ? 'bg-gray-800 border-neon-green/30' 
                                        : isNext 
                                            ? 'bg-gray-900 border-gray-600' 
                                            : 'bg-black border-gray-800 opacity-50'
                                }`}
                            >
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg border-2 ${
                                    isUnlocked ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'bg-gray-800 border-gray-600 text-gray-500'
                                }`}>
                                    {track.level}
                                </div>
                                
                                <div className="text-3xl">{track.icon}</div>
                                
                                <div className="flex-1">
                                    <h4 className={`text-lg font-bold uppercase ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                        {track.reward}
                                    </h4>
                                    <p className="text-xs text-gray-500">{track.xpRequired} XP Required</p>
                                </div>

                                {isUnlocked && (
                                    <div className="px-3 py-1 bg-neon-green text-black font-bold text-xs uppercase rounded tracking-wider">
                                        Owned
                                    </div>
                                )}
                                {isNext && (
                                    <div className="px-3 py-1 bg-gray-700 text-white font-bold text-xs uppercase rounded tracking-wider">
                                        Next
                                    </div>
                                )}
                                {!isUnlocked && !isNext && (
                                    <div className="px-3 py-1 border border-gray-700 text-gray-600 font-bold text-xs uppercase rounded tracking-wider">
                                        Locked
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
