import React from 'react';
import { CharacterType, TournamentBracketData } from '../types';

interface TournamentBracketProps {
  round: number; // 1, 2, 3
  playerChar: CharacterType;
  bracket: TournamentBracketData;
  onNext: () => void;
}

// Minimal character info map for display
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
  [CharacterType.CYBER]: { name: 'Cyber Samurai', color: '#f0abfc' }
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ round, playerChar, bracket, onNext }) => {
  
  // Helper to get match data safely
  const getMatch = (r: number, m: number) => {
    if (bracket[r] && bracket[r][m]) return bracket[r][m];
    return { p1: null, p2: null, winner: null };
  };

  const renderName = (type: CharacterType | null, isWinner: boolean) => {
      if (!type) return "TBD";
      const info = CHAR_INFO[type];
      return (
          <span style={{ color: isWinner ? info.color : (type === playerChar ? info.color : '#9ca3af') }}>
              {info.name}
          </span>
      );
  };

  // Determine current player opponent for display
  let currentOpponent: CharacterType | null = null;
  const currentRoundMatches = bracket[round - 1];
  const playerMatch = currentRoundMatches?.find(m => m.p1 === playerChar || m.p2 === playerChar);
  if (playerMatch) {
      currentOpponent = playerMatch.p1 === playerChar ? playerMatch.p2 : playerMatch.p1;
  }

  return (
    <div className="absolute inset-0 bg-dark-bg flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      
      <h2 className="text-5xl font-black text-white italic tracking-tighter mb-8 relative z-10 shadow-neon uppercase">
        Tournament Bracket
      </h2>

      <div className="flex justify-center items-center gap-8 md:gap-16 relative z-10 w-full max-w-7xl px-4 scale-90 md:scale-100">
        
        {/* Round 1: Quarter Finals */}
        <div className="flex flex-col gap-6">
          <div className="text-center text-gray-500 font-bold tracking-widest mb-2 text-sm">QUARTER FINALS</div>
          {[0, 1, 2, 3].map(i => {
             const m = getMatch(0, i);
             const hasPlayer = m.p1 === playerChar || m.p2 === playerChar;
             
             return (
                <div key={i} className={`w-40 md:w-48 bg-gray-900 border-l-4 p-3 relative ${hasPlayer ? 'border-neon-blue bg-gray-800' : 'border-gray-700'}`}>
                  <div className="text-[10px] text-gray-500 mb-1">MATCH {i + 1}</div>
                  <div className={`font-bold text-sm md:text-base ${m.winner === m.p1 && m.winner ? 'text-white' : ''}`}>
                    {renderName(m.p1, m.winner === m.p1)}
                  </div>
                  <div className="text-[10px] text-gray-600">VS</div>
                  <div className={`font-bold text-sm md:text-base ${m.winner === m.p2 && m.winner ? 'text-white' : ''}`}>
                    {renderName(m.p2, m.winner === m.p2)}
                  </div>
                  
                  {/* Connector lines */}
                  <div className="absolute -right-8 md:-right-16 top-1/2 w-8 md:w-16 h-0.5 bg-gray-800"></div>
                  {i % 2 === 0 && <div className="absolute -right-8 md:-right-16 top-1/2 w-0.5 h-[calc(100%+24px)] bg-gray-800 origin-top"></div>}
                </div>
             );
          })}
        </div>

        {/* Round 2: Semi Finals */}
        <div className="flex flex-col gap-20 md:gap-24">
           <div className="text-center text-gray-500 font-bold tracking-widest mb-2 text-sm">SEMI FINALS</div>
           {[0, 1].map(i => {
              const m = getMatch(1, i);
              const hasPlayer = m.p1 === playerChar || m.p2 === playerChar;

              return (
                <div key={i} className={`w-40 md:w-48 bg-gray-900 border-l-4 p-3 relative ${hasPlayer ? 'border-neon-blue bg-gray-800' : 'border-gray-700'}`}>
                   <div className="text-[10px] text-gray-500 mb-1">MATCH {5+i}</div>
                   <div className={`font-bold text-sm md:text-base ${m.winner === m.p1 && m.winner ? 'text-white' : ''}`}>
                     {renderName(m.p1, m.winner === m.p1)}
                   </div>
                   <div className="text-[10px] text-gray-600">VS</div>
                   <div className={`font-bold text-sm md:text-base ${m.winner === m.p2 && m.winner ? 'text-white' : ''}`}>
                     {renderName(m.p2, m.winner === m.p2)}
                   </div>

                   {/* Connector lines */}
                  <div className="absolute -right-8 md:-right-16 top-1/2 w-8 md:w-16 h-0.5 bg-gray-800"></div>
                  {i % 2 === 0 && <div className="absolute -right-8 md:-right-16 top-1/2 w-0.5 h-[calc(100%+96px)] bg-gray-800 origin-top"></div>}
                </div>
              );
           })}
        </div>

        {/* Round 3: Finals */}
        <div className="flex flex-col gap-8">
          <div className="text-center text-yellow-500 font-bold tracking-widest mb-2 text-sm">CHAMPIONSHIP</div>
          {(() => {
             const m = getMatch(2, 0);
             const hasPlayer = m.p1 === playerChar || m.p2 === playerChar;
             
             return (
              <div className={`w-48 md:w-56 bg-gray-900 border-l-4 p-6 relative ${round === 3 && hasPlayer ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-700'}`}>
                  <div className="text-xs text-yellow-600 mb-2 font-bold">GRAND FINAL</div>
                  <div className={`text-xl font-bold ${m.winner === m.p1 && m.winner ? 'text-neon-blue' : ''}`}>
                    {renderName(m.p1, m.winner === m.p1)}
                  </div>
                  <div className="text-sm text-gray-600 my-2 font-bold">VS</div>
                  <div className={`text-xl font-bold ${m.winner === m.p2 && m.winner ? 'text-neon-blue' : ''}`}>
                    {renderName(m.p2, m.winner === m.p2)}
                  </div>
              </div>
             );
          })()}
        </div>

      </div>

      <div className="mt-12 text-center relative z-20 flex flex-col items-center">
        <h3 className="text-2xl text-white mb-2 uppercase font-bold">
          {round === 1 ? "Round 1" : round === 2 ? "Semi Finals" : "Grand Final"}
        </h3>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
           {currentOpponent ? (
             <>Next Opponent: <span className="text-white font-bold">{CHAR_INFO[currentOpponent].name}</span></>
           ) : (
             "Tournament Complete"
           )}
        </p>
        
        {/* Play Button always visible if there is an opponent */}
        {currentOpponent && (
            <button 
                onClick={onNext}
                className="px-12 py-4 bg-neon-blue text-black font-black uppercase tracking-widest text-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] animate-pulse"
            >
                ENTER ARENA
            </button>
        )}
      </div>
    </div>
  );
};