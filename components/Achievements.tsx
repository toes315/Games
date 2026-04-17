
import React, { useEffect, useState } from 'react';
import { Achievement, ACHIEVEMENT_LIST } from '../types';

interface AchievementPanelProps {
    unlockedIds: string[];
    onClose: () => void;
}

interface AchievementNotificationProps {
    achievement: Achievement | null;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ unlockedIds, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-dark-panel border-2 border-neon-blue rounded-xl p-6 shadow-neon max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">Achievements</h2>
                    <div className="text-xl text-neon-blue font-bold">
                        {unlockedIds.length} / {ACHIEVEMENT_LIST.length}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                    {ACHIEVEMENT_LIST.map((ach) => {
                        const isUnlocked = unlockedIds.includes(ach.id);
                        return (
                            <div 
                                key={ach.id} 
                                className={`p-4 rounded-lg border flex items-center gap-4 transition-all duration-300 ${isUnlocked ? 'bg-gray-800 border-neon-green/50 shadow-lg' : 'bg-gray-900/50 border-gray-800 opacity-50 grayscale'}`}
                            >
                                <div className="text-4xl">{ach.icon}</div>
                                <div>
                                    <h3 className={`text-xl font-bold uppercase ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h3>
                                    <p className="text-sm text-gray-400">{ach.description}</p>
                                </div>
                                {isUnlocked && (
                                    <div className="ml-auto text-neon-green font-bold text-xs uppercase tracking-widest border border-neon-green px-2 py-1 rounded">
                                        Unlocked
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [achievement]);

    if (!achievement || !visible) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
            <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(251,191,36,0.5)] min-w-[300px]">
                <div className="text-4xl animate-pulse">{achievement.icon}</div>
                <div>
                    <div className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-1">Achievement Unlocked</div>
                    <div className="text-white text-lg font-bold italic">{achievement.title}</div>
                    <div className="text-gray-400 text-sm">{achievement.description}</div>
                </div>
            </div>
        </div>
    );
};
