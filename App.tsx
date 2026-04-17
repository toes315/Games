
import React, { useState } from 'react';
import { GameState, CharacterType, TournamentBracketData, TournamentMatch, ACHIEVEMENT_LIST, Achievement, STORY_CAMPAIGN, StoryLevel, CharacterProgress, MASTERY_TRACK } from './types';
import { CharacterSelect } from './components/CharacterSelect';
import { BrawlGame } from './components/BrawlGame';
import { TournamentBracket } from './components/TournamentBracket';
import { AchievementPanel, AchievementNotification } from './components/Achievements';
import { Story } from './components/Story';
import { Map } from './components/Map';
import { DojoUpgrades } from './components/DojoUpgrades';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [lastGameMode, setLastGameMode] = useState<GameState>(GameState.MENU);
  const [p1Char, setP1Char] = useState<CharacterType>(CharacterType.NINJA);
  const [p2Char, setP2Char] = useState<CharacterType | null>(null);
  const [winner, setWinner] = useState<'PLAYER' | 'CPU' | null>(null);
  const [tournamentRound, setTournamentRound] = useState(1);
  const [selectionStage, setSelectionStage] = useState<1 | 2>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [storyProgress, setStoryProgress] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<StoryLevel | null>(null);
  const [unlockedCharacters, setUnlockedCharacters] = useState<CharacterType[]>([CharacterType.NINJA]);

  const [characterProgress, setCharacterProgress] = useState<Record<CharacterType, CharacterProgress>>(() => {
      const initial: any = {};
      Object.keys(CharacterType).forEach(k => {
          initial[k] = { 
              level: 1, 
              xp: 0, 
              masteryPoints: 1, 
              unlockedSkins: [], 
              equippedSkin: null,
              unlockedAbilities: [], 
              equippedAbility: null 
          };
      });
      return initial;
  });

  const [bracket, setBracket] = useState<TournamentBracketData>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  const handleUnlockAchievement = (id: string) => {
      if (!unlockedAchievements.includes(id)) {
          const ach = ACHIEVEMENT_LIST.find(a => a.id === id);
          if (ach) {
              setUnlockedAchievements(prev => {
                  const newState = [...prev, id];
                  if (newState.length === 3 && !newState.includes('VETERAN')) {
                      setTimeout(() => handleUnlockAchievement('VETERAN'), 3500); 
                  }
                  return newState;
              });
              setRecentUnlock(ach);
          }
      }
  };

  const handleUnlockSkin = (character: CharacterType, skinId: string, cost: number) => {
      setCharacterProgress(prev => {
          const charProg = prev[character];
          if (charProg.masteryPoints < cost) return prev;
          return {
              ...prev,
              [character]: {
                  ...charProg,
                  masteryPoints: charProg.masteryPoints - cost,
                  unlockedSkins: [...charProg.unlockedSkins, skinId],
                  equippedSkin: skinId 
              }
          };
      });
  };

  const handleEquipSkin = (character: CharacterType, skinId: string | null) => {
       setCharacterProgress(prev => ({
           ...prev,
           [character]: { ...prev[character], equippedSkin: skinId }
       }));
  };

  const handleUnlockAbility = (character: CharacterType, abilityId: string, cost: number) => {
      setCharacterProgress(prev => {
          const charProg = prev[character];
          if (charProg.masteryPoints < cost) return prev;
          return {
              ...prev,
              [character]: {
                  ...charProg,
                  masteryPoints: charProg.masteryPoints - cost,
                  unlockedAbilities: [...charProg.unlockedAbilities, abilityId],
                  equippedAbility: abilityId 
              }
          };
      });
  };

  const handleEquipAbility = (character: CharacterType, abilityId: string | null) => {
       setCharacterProgress(prev => ({
           ...prev,
           [character]: { ...prev[character], equippedAbility: abilityId }
       }));
  };

  const startMode = (mode: GameState) => {
      setLastGameMode(mode);
      setIsPlaying(false);
      setP2Char(null);
      setTournamentRound(1);
      
      if (mode === GameState.TOURNAMENT_LADDER) setGameState(GameState.CHARACTER_SELECT);
      else if (mode === GameState.STORY_HUB) setGameState(GameState.STORY_HUB);
      else if (mode === GameState.DOJO) setGameState(GameState.DOJO);
      else {
          setGameState(mode);
          if (mode === GameState.PLAYING_PVP) setSelectionStage(1);
      }
  };
  
  const generateBracket = (playerType: CharacterType): TournamentBracketData => {
      const types = Object.keys(CharacterType) as CharacterType[];
      const pool = types.filter(t => t !== playerType);
      for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const opponents = pool.slice(0, 7);
      
      const r1: TournamentMatch[] = [
          { id: 1, p1: playerType, p2: opponents[0], winner: null }, 
          { id: 2, p1: opponents[1], p2: opponents[2], winner: null }, 
          { id: 3, p1: opponents[3], p2: opponents[4], winner: null }, 
          { id: 4, p1: opponents[5], p2: opponents[6], winner: null }, 
      ];
      const r2: TournamentMatch[] = [ { id: 5, p1: null, p2: null, winner: null }, { id: 6, p1: null, p2: null, winner: null } ];
      const r3: TournamentMatch[] = [ { id: 7, p1: null, p2: null, winner: null } ];
      return [r1, r2, r3];
  };

  const simulateRoundWinners = (currentBracket: TournamentBracketData, roundIdx: number) => {
      const newBracket = [...currentBracket];
      const roundMatches = newBracket[roundIdx];
      roundMatches.forEach(match => { if (!match.winner && match.p1 && match.p2) match.winner = Math.random() > 0.5 ? match.p1 : match.p2; });
      const nextRoundIdx = roundIdx + 1;
      if (nextRoundIdx < newBracket.length) {
          const nextRound = newBracket[nextRoundIdx];
          for(let i=0; i < roundMatches.length; i += 2) {
              const m1 = roundMatches[i];
              const m2 = roundMatches[i+1];
              const targetMatchIdx = i / 2;
              if (nextRound[targetMatchIdx]) {
                  nextRound[targetMatchIdx].p1 = m1.winner;
                  nextRound[targetMatchIdx].p2 = m2.winner;
              }
          }
      }
      return newBracket;
  };

  const confirmSelection = (char: CharacterType) => {
      if (gameState === GameState.PLAYING_PVP) {
          if (selectionStage === 1) { setP1Char(char); setSelectionStage(2); }
          else { setP2Char(char); setIsPlaying(true); }
      } else if (lastGameMode === GameState.TOURNAMENT_LADDER) {
          setP1Char(char);
          const initialBracket = generateBracket(char);
          setBracket(initialBracket);
          setGameState(GameState.TOURNAMENT_BRACKET);
      } else {
          setP1Char(char);
          setIsPlaying(true);
      }
  };

  const confirmSelectionBoth = (p1: CharacterType, p2: CharacterType) => { setP1Char(p1); setP2Char(p2); setIsPlaying(true); };
  const handleTournamentNext = () => { setGameState(GameState.PLAYING_BRAWL); setIsPlaying(true); };
  const handleStoryLevelSelect = (level: StoryLevel) => {
      setCurrentLevel(level);
      setP2Char(level.opponent);
      setLastGameMode(GameState.PLAYING_STORY);
      setGameState(GameState.CHARACTER_SELECT);
  };

  const handleGameOver = (w: 'PLAYER' | 'CPU') => {
      setWinner(w);
      setIsPlaying(false);
      const xpGain = w === 'PLAYER' ? 100 : 25;
      setCharacterProgress(prev => {
          const current = prev[p1Char] || { level: 1, xp: 0, masteryPoints: 0, unlockedSkins: [], equippedSkin: null, unlockedAbilities: [], equippedAbility: null };
          const newXP = current.xp + xpGain;
          let newLevel = current.level;
          let addedPoints = 0;
          for (const track of MASTERY_TRACK) {
              if (newXP >= track.xpRequired && newLevel < track.level) { newLevel = track.level; addedPoints += 1; }
          }
          if (w === 'PLAYER') addedPoints += 1;
          return { ...prev, [p1Char]: { ...current, level: newLevel, xp: newXP, masteryPoints: current.masteryPoints + addedPoints } };
      });

      if (lastGameMode === GameState.TOURNAMENT_LADDER && w === 'PLAYER') {
          const newBracket = [...bracket];
          const currentRoundMatches = newBracket[tournamentRound - 1];
          const playerMatch = currentRoundMatches.find(m => m.p1 === p1Char || m.p2 === p1Char);
          if (playerMatch) playerMatch.winner = p1Char;
          const updatedBracket = simulateRoundWinners(newBracket, tournamentRound - 1);
          setBracket(updatedBracket);
          if (tournamentRound < 3) { setTournamentRound(r => r + 1); setGameState(GameState.TOURNAMENT_BRACKET); return; }
          else handleUnlockAchievement('CHAMPION');
      } else if (lastGameMode === GameState.PLAYING_STORY && w === 'PLAYER' && currentLevel) {
          if (currentLevel.unlocks && !unlockedCharacters.includes(currentLevel.unlocks)) {
              setUnlockedCharacters(prev => [...prev, currentLevel.unlocks]);
          }
          if (currentLevel.id === storyProgress) setStoryProgress(prev => Math.min(prev + 1, STORY_CAMPAIGN.length + 1));
      }
      setGameState(GameState.GAME_OVER);
  };

  const getTournamentOpponent = (): CharacterType | undefined => {
      if (lastGameMode !== GameState.TOURNAMENT_LADDER) return undefined;
      const currentRoundMatches = bracket[tournamentRound - 1];
      if (!currentRoundMatches) return undefined;
      const match = currentRoundMatches.find(m => m.p1 === p1Char || m.p2 === p1Char);
      if (!match) return undefined;
      return match.p1 === p1Char ? (match.p2 || undefined) : (match.p1 || undefined);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-dark-bg font-sans selection:bg-neon-pink selection:text-white">
      <AchievementNotification achievement={recentUnlock} />
      {showAchievements && <AchievementPanel unlockedIds={unlockedAchievements} onClose={() => setShowAchievements(false)} />}

      {gameState === GameState.MENU && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg z-50">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-pink to-neon-blue animate-pulse tracking-tighter italic mb-8">STICKMAN<br/>GENESIS</h1>
            <div className="grid grid-cols-2 gap-4 w-96">
              <button onClick={() => startMode(GameState.STORY_HUB)} className="col-span-2 px-8 py-4 bg-white text-black hover:bg-neon-blue hover:text-black font-bold text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-neon">Story Mode</button>
              <button onClick={() => startMode(GameState.PLAYING_BRAWL)} className="px-6 py-4 bg-transparent border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black font-bold text-lg uppercase tracking-widest transition-all">Quick Brawl</button>
              <button onClick={() => startMode(GameState.PLAYING_PVP)} className="px-6 py-4 bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-bold text-lg uppercase tracking-widest transition-all">VS Player</button>
              <button onClick={() => startMode(GameState.TOURNAMENT_LADDER)} className="px-6 py-4 bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold text-lg uppercase tracking-widest transition-all">Tournament</button>
              <button onClick={() => startMode(GameState.PLAYING_WAVE)} className="px-6 py-4 bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold text-lg uppercase tracking-widest transition-all">Survival</button>
              <button onClick={() => startMode(GameState.PLAYING_FREERUN)} className="col-span-2 px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold text-xl uppercase tracking-widest transition-all">Freerun</button>
              <button onClick={() => startMode(GameState.DOJO)} className="col-span-2 px-8 py-4 bg-gray-900 border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-black font-bold text-xl uppercase tracking-widest transition-all">DOJO UPGRADES</button>
            </div>
             <button onClick={() => setShowAchievements(true)} className="mt-8 text-gray-500 hover:text-white text-sm uppercase tracking-widest">Achievements ({unlockedAchievements.length}/{ACHIEVEMENT_LIST.length})</button>
            <div className="absolute bottom-4 text-gray-600 text-xs">Powered by React & Gemini AI • v3.0</div>
          </div>
      )}

      {gameState === GameState.DOJO && (
          <DojoUpgrades 
              characterProgress={characterProgress}
              onUnlockSkin={handleUnlockSkin}
              onEquipSkin={handleEquipSkin}
              onUnlockAbility={handleUnlockAbility}
              onEquipAbility={handleEquipAbility}
              onBack={() => setGameState(GameState.MENU)}
          />
      )}

      {gameState === GameState.STORY_HUB && <Story progress={storyProgress} onSelectLevel={handleStoryLevelSelect} onBack={() => setGameState(GameState.MENU)} />}

      {(gameState === GameState.CHARACTER_SELECT || gameState === GameState.PLAYING_PVP || gameState === GameState.PLAYING_BRAWL || gameState === GameState.PLAYING_WAVE || gameState === GameState.PLAYING_FREERUN || gameState === GameState.PLAYING_STORY || gameState === GameState.PLAYING_SLOWMO) && !isPlaying && (
           <CharacterSelect 
                onSelect={confirmSelection} onSelectBoth={confirmSelectionBoth} 
                onBack={() => { if (lastGameMode === GameState.PLAYING_STORY) setGameState(GameState.STORY_HUB); else setGameState(GameState.MENU); }}
                playerNumber={gameState === GameState.PLAYING_PVP ? selectionStage : 0} isPvp={gameState === GameState.PLAYING_PVP}
                unlockedCharacters={(gameState === GameState.PLAYING_PVP || gameState === GameState.PLAYING_BRAWL) ? undefined : unlockedCharacters}
                characterProgress={characterProgress}
           />
      )}

      {gameState === GameState.TOURNAMENT_BRACKET && <TournamentBracket round={tournamentRound} playerChar={p1Char} bracket={bracket} onNext={handleTournamentNext} />}

      {isPlaying && (
          <div className="relative w-full h-full">
            {lastGameMode === GameState.PLAYING_STORY && currentLevel && <div className="absolute inset-0 z-0"><Map mapName={currentLevel.mapName} /></div>}
            <div className="relative w-full h-full z-10 mix-blend-screen">
                <BrawlGame 
                    key={`${lastGameMode}-${tournamentRound}`} 
                    playerCharType={p1Char}
                    cpuCharType={lastGameMode === GameState.TOURNAMENT_LADDER ? getTournamentOpponent() : p2Char || undefined}
                    gameMode={lastGameMode === GameState.PLAYING_STORY ? GameState.PLAYING_BRAWL : (lastGameMode === GameState.PLAYING_SLOWMO ? GameState.PLAYING_SLOWMO : lastGameMode)}
                    tournamentRound={lastGameMode === GameState.PLAYING_STORY && currentLevel ? currentLevel.id : tournamentRound}
                    onGameOver={handleGameOver}
                    onBack={() => { if (lastGameMode === GameState.PLAYING_STORY) setGameState(GameState.STORY_HUB); else setGameState(GameState.MENU); }}
                    onUnlockAchievement={handleUnlockAchievement}
                />
            </div>
          </div>
      )}

      {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
            <h2 className={`text-8xl font-black mb-6 ${winner === 'PLAYER' ? 'text-neon-green' : 'text-neon-red'} italic tracking-tighter`}>{winner === 'PLAYER' ? (lastGameMode === GameState.PLAYING_STORY ? "MISSION COMPLETE" : "VICTORY") : "DEFEAT"}</h2>
            <p className="text-white text-xl mb-8 uppercase tracking-widest">{winner === 'PLAYER' ? "+100 XP" : "+25 XP"}</p>
            <p className="text-white text-xl mb-8 uppercase tracking-widest">
               {lastGameMode === GameState.PLAYING_STORY && winner === 'PLAYER' && currentLevel?.unlocks ? `Unlocked Character: ${currentLevel.unlocks}!` : (winner === 'PLAYER' ? 'Well fought, warrior.' : 'The arena claims another soul.')}
            </p>
            <div className="flex gap-4">
                <button onClick={() => { setIsPlaying(false); setWinner(null); if (lastGameMode === GameState.TOURNAMENT_LADDER) { setGameState(GameState.CHARACTER_SELECT); setTournamentRound(1); } else if (lastGameMode === GameState.PLAYING_STORY) { if (winner === 'PLAYER') { setGameState(GameState.STORY_HUB); } else { setIsPlaying(true); } } else { setGameState(lastGameMode); } }} className="px-8 py-3 bg-neon-blue text-black hover:bg-white font-bold uppercase tracking-widest shadow-lg shadow-neon-blue/20">{lastGameMode === GameState.PLAYING_STORY && winner === 'PLAYER' ? "Continue" : "Play Again"}</button>
                <button onClick={() => { if (lastGameMode === GameState.PLAYING_STORY) setGameState(GameState.STORY_HUB); else setGameState(GameState.MENU); }} className="px-8 py-3 bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest">{lastGameMode === GameState.PLAYING_STORY ? "Back to Map" : "Menu"}</button>
            </div>
          </div>
      )}
    </div>
  );
};

export default App;
