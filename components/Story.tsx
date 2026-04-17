
import React, { useState, useMemo } from 'react';
import { StoryLevel, STORY_CAMPAIGN, CharacterType } from '../types';

interface StoryProps {
  progress: number;
  onSelectLevel: (level: StoryLevel) => void;
  onBack: () => void;
}

export const Story: React.FC<StoryProps> = ({ progress, onSelectLevel, onBack }) => {
  // Ensure levels are sorted by ID to prevent disorder
  const sortedCampaign = useMemo(() => {
      return [...STORY_CAMPAIGN].sort((a, b) => a.id - b.id);
  }, []);

  // Initialize selection to current progress, but clamp to max level ID if game is beaten
  const [selectedLevelId, setSelectedLevelId] = useState<number>(() => {
      const maxId = sortedCampaign[sortedCampaign.length - 1].id;
      return Math.min(progress, maxId);
  });

  const selectedLevel = sortedCampaign.find(l => l.id === selectedLevelId) || sortedCampaign[0];

  return (
    <div className="absolute inset-0 bg-dark-bg flex flex-col z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      
      {/* Header */}
      <div className="relative z-10 p-8 flex justify-between items-center bg-gray-900 border-b border-gray-800">
        <div>
            <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase mb-1">
                Campaign Mode
            </h1>
            <p className="text-gray-400 text-sm">Fight your way through the Stickman Chronicles.</p>
        </div>
        <button 
            onClick={onBack}
            className="px-6 py-2 border border-gray-600 hover:border-white text-gray-300 hover:text-white transition-colors uppercase text-sm tracking-widest rounded"
        >
            Back to Menu
        </button>
      </div>

      <div className="flex-1 relative z-10 flex overflow-hidden">
          {/* Level List */}
          <div className="w-1/3 bg-gray-900/80 border-r border-gray-800 overflow-y-auto">
              <div className="p-4 space-y-2">
                  {sortedCampaign.map((level) => {
                      const isLocked = level.id > progress;
                      const isCompleted = level.id < progress;
                      const isSelected = selectedLevelId === level.id;
                      
                      return (
                          <button
                            key={level.id}
                            disabled={isLocked}
                            onClick={() => setSelectedLevelId(level.id)}
                            className={`w-full text-left p-4 rounded-lg border-l-4 transition-all duration-200 ${
                                isSelected 
                                    ? 'bg-gray-800 border-neon-blue' 
                                    : isLocked 
                                        ? 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed' 
                                        : 'bg-transparent border-gray-700 hover:bg-gray-800'
                            }`}
                          >
                              <div className="flex justify-between items-center mb-1">
                                  <span className={`font-bold uppercase tracking-widest text-sm ${isSelected ? 'text-neon-blue' : 'text-gray-400'}`}>
                                      Level {level.id}
                                  </span>
                                  {isCompleted && <span className="text-neon-green text-xs">✓ COMPLETE</span>}
                                  {isLocked && <span className="text-red-500 text-xs">LOCKED</span>}
                              </div>
                              <h3 className={`text-xl font-bold italic ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                                  {level.title}
                              </h3>
                          </button>
                      );
                  })}
              </div>
          </div>

          {/* Level Detail */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {/* Background Character Art Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                     <h1 className="text-[200px] font-black text-white italic">{selectedLevel.id}</h1>
                </div>

                <div className="max-w-2xl w-full">
                    <div className="mb-2 text-neon-blue font-bold tracking-widest uppercase">Target Unlocked</div>
                    <h2 className="text-6xl font-black text-white italic mb-6">{selectedLevel.title}</h2>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">Mission Details</div>
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Opponent:</span>
                                <span className="text-xl font-bold text-white">{selectedLevel.opponent}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Location:</span>
                                <span className="text-lg font-bold text-neon-green">{selectedLevel.mapName}</span>
                             </div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                             <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">Rewards</div>
                             <div className="text-xl font-bold text-white mb-1">Unlock: <span className="text-neon-blue">{selectedLevel.unlocks}</span></div>
                             <div className="text-sm text-gray-400">XP & Glory</div>
                        </div>
                    </div>

                    <p className="text-xl text-gray-300 mb-12 leading-relaxed border-l-2 border-neon-blue pl-6">
                        {selectedLevel.description}
                    </p>

                    <button 
                        onClick={() => onSelectLevel(selectedLevel)}
                        disabled={selectedLevel.id > progress}
                        className="w-full py-6 bg-white text-black font-black text-2xl uppercase tracking-[0.2em] hover:bg-neon-blue hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {selectedLevel.id > progress ? "LOCKED" : "START MISSION"}
                    </button>
                </div>
          </div>
      </div>
    </div>
  );
};
