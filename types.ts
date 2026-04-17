
export enum GameState {
  MENU = 'MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  PLAYING_BRAWL = 'PLAYING_BRAWL',
  PLAYING_PVP = 'PLAYING_PVP',
  PLAYING_WAVE = 'PLAYING_WAVE',
  PLAYING_FREERUN = 'PLAYING_FREERUN',
  TOURNAMENT_LADDER = 'TOURNAMENT_LADDER',
  TOURNAMENT_BRACKET = 'TOURNAMENT_BRACKET',
  STORY_HUB = 'STORY_HUB',
  PLAYING_STORY = 'PLAYING_STORY',
  PLAYING_SLOWMO = 'PLAYING_SLOWMO',
  DOJO = 'DOJO',
  GAME_OVER = 'GAME_OVER'
}

export enum CharacterType {
  NINJA = 'NINJA',
  TITAN = 'TITAN',
  VOLT = 'VOLT',
  LANCER = 'LANCER',
  PHANTOM = 'PHANTOM',
  INFERNO = 'INFERNO',
  GLACIER = 'GLACIER',
  RONIN = 'RONIN',
  ELEMENTAL = 'ELEMENTAL',
  MAGIC = 'MAGIC',
  ANIMAL = 'ANIMAL',
  DARKNESS = 'DARKNESS',
  SOLAR = 'SOLAR',
  HEAVY = 'HEAVY',
  TRAPPER = 'TRAPPER',
  SAINT = 'SAINT',
  CYBORG = 'CYBORG',
  TIME = 'TIME',
  DEVIL = 'DEVIL',
  GRAVITY = 'GRAVITY',
  INSECT = 'INSECT',
  BONE = 'BONE',
  WIND = 'WIND',
  VENOM = 'VENOM',
  CHAOS = 'CHAOS',
  PLANT = 'PLANT',
  CRYSTAL = 'CRYSTAL',
  ZOMBIE = 'ZOMBIE',
  MONK = 'MONK',
  LIGHT = 'LIGHT',
  VIKING = 'VIKING',
  PIRATE = 'PIRATE',
  CYBER = 'CYBER'
}

export enum MapType {
  DEFAULT = 'DEFAULT'
}

export interface CharacterStats {
  name: string;
  hp: number;
  speed: number;
  power: number;
  color: string;
  description: string;
  ability: string;
  maxSpecialCooldown: number;
}

export interface Entity {
  id: string; 
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  hp: number;
  maxHp: number;
  speed: number; 
  power: number; 
  isPlayer: boolean;
  facingRight: boolean;
  state: 'IDLE' | 'RUN' | 'ATTACK' | 'ABILITY' | 'HIT' | 'DEAD' | 'FINISHER' | 'STUNNED';
  comboCount: number;
  lastAttackTime: number;
  specialCooldown: number;
  maxSpecialCooldown: number;
  type: CharacterType;
  jumpCount: number;
  onWall: boolean;
  rotation: number;
  vr: number;
  targetId?: string; 
  deadHandled?: boolean; 
  frozen: boolean; 
  attackVariant: number; 
  abilityTimer: number; 
  specialChainWindow: number; 
  specialChainStep: number; 
  skinId?: string;
  abilityId?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface VehicleData {
  chassis: Point[];
  weapon: Point[];
  color: string;
}

export interface TournamentMatch {
  id: number;
  p1: CharacterType | null;
  p2: CharacterType | null;
  winner: CharacterType | null;
}

export type TournamentBracketData = TournamentMatch[][];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENT_LIST: Achievement[] = [
  { id: 'FIRST_WIN', title: 'First Blood', description: 'Win your first match.', icon: '⚔️' },
  { id: 'FLAWLESS', title: 'Untouchable', description: 'Win a match with full health.', icon: '🛡️' },
  { id: 'CHAMPION', title: 'Legend', description: 'Win a Tournament.', icon: '🏆' },
  { id: 'SNIPER', title: 'Deadeye', description: 'Win using Lancer, Magic, Heavy, or Light.', icon: '🎯' },
  { id: 'ELEMENTALIST', title: 'Avatar', description: 'Win using Fire, Ice, Wind, or Earth.', icon: '🌍' },
  { id: 'UNDEAD_LEGION', title: 'Undead Legion', description: 'Win using Zombie, Bone, or Devil.', icon: '💀' },
  { id: 'ENLIGHTENED', title: 'Enlightened', description: 'Win using Monk or Saint.', icon: '📿' },
  { id: 'DIMENSION_HOPPER', title: 'Voyager', description: 'Use a Portal in Freerun Mode.', icon: '🌀' },
  { id: 'PHOTON_BLITZ', title: 'Photon Blitz', description: 'Win using Light or Volt.', icon: '⚡' },
  { id: 'VETERAN', title: 'Veteran', description: 'Unlock 3 other achievements.', icon: '🎖️' }
];

export interface StoryLevel {
  id: number;
  title: string;
  opponent: CharacterType;
  description: string;
  mapName: string;
  unlocks: CharacterType;
}

export const STORY_CAMPAIGN: StoryLevel[] = [
  { id: 1, title: "Way of the Sword", opponent: CharacterType.RONIN, mapName: "Silent Dojo", unlocks: CharacterType.RONIN, description: "Your journey begins. Defeat the swordsman to prove your skill." },
  { id: 2, title: "Inner Peace", opponent: CharacterType.MONK, mapName: "Mountain Peak", unlocks: CharacterType.MONK, description: "A test of discipline against the master of fists." },
  { id: 3, title: "The Long Reach", opponent: CharacterType.LANCER, mapName: "Training Grounds", unlocks: CharacterType.LANCER, description: "Keep your distance, or be skewered." },
  { id: 4, title: "Ambush", opponent: CharacterType.TRAPPER, mapName: "Dense Forest", unlocks: CharacterType.TRAPPER, description: "Watch your step. The ground itself is a weapon." },
  { id: 5, title: "Heavy Artillery", opponent: CharacterType.HEAVY, mapName: "Military Base", unlocks: CharacterType.HEAVY, description: "Face the walking tank. Brute force is required." },
  { id: 6, title: "Graveyard Shift", opponent: CharacterType.BONE, mapName: "Boneyard", unlocks: CharacterType.BONE, description: "The dead do not rest easy here." },
  { id: 7, title: "Patient Zero", opponent: CharacterType.ZOMBIE, mapName: "Quarantine Zone", unlocks: CharacterType.ZOMBIE, description: "Survive the infection. Don't let him bite." },
  { id: 8, title: "Hive Mind", opponent: CharacterType.INSECT, mapName: "Bug Nest", unlocks: CharacterType.INSECT, description: "They come in swarms. Don't get overwhelmed." },
  { id: 9, title: "Wild Hunt", opponent: CharacterType.ANIMAL, mapName: "Jungle Ruins", unlocks: CharacterType.ANIMAL, description: "It's kill or be killed against this feral beast." },
  { id: 10, title: "Overgrowth", opponent: CharacterType.PLANT, mapName: "Botanical Garden", unlocks: CharacterType.PLANT, description: "Nature fights back with thorny vines." },
  { id: 11, title: "Earthshaker", opponent: CharacterType.ELEMENTAL, mapName: "Canyon Floor", unlocks: CharacterType.ELEMENTAL, description: "The earth trembles beneath your feet." },
  { id: 12, title: "Gale Force", opponent: CharacterType.WIND, mapName: "Sky Platform", unlocks: CharacterType.WIND, description: "Don't get blown away by the tornados." },
  { id: 13, title: "Ring of Fire", opponent: CharacterType.INFERNO, mapName: "Volcano Rim", unlocks: CharacterType.INFERNO, description: "The heat is rising. Dodge the pillars of flame." },
  { id: 14, title: "Zero Kelvin", opponent: CharacterType.GLACIER, mapName: "Ice Cavern", unlocks: CharacterType.GLACIER, description: "Freeze him before he freezes you." },
  { id: 15, title: "High Voltage", opponent: CharacterType.VOLT, mapName: "Power Plant", unlocks: CharacterType.VOLT, description: "He moves like lightning. Predict the flash." },
  { id: 16, title: "Refraction", opponent: CharacterType.CRYSTAL, mapName: "Crystal Caves", unlocks: CharacterType.CRYSTAL, description: "Shatter his defenses." },
  { id: 17, title: "Toxic Spill", opponent: CharacterType.VENOM, mapName: "Sewers", unlocks: CharacterType.VENOM, description: "The symbiote is aggressive. Stay mobile." },
  { id: 18, title: "Ghost Story", opponent: CharacterType.PHANTOM, mapName: "Haunted Manor", unlocks: CharacterType.PHANTOM, description: "You can't hit what you can't see." },
  { id: 19, title: "Arcane Arts", opponent: CharacterType.MAGIC, mapName: "Wizard Tower", unlocks: CharacterType.MAGIC, description: "Magic versus steel. Avoid the death ray." },
  { id: 20, title: "Upgrade Complete", opponent: CharacterType.CYBORG, mapName: "Cyber Lab", unlocks: CharacterType.CYBORG, description: "Man vs Machine. Dodge the rockets." },
  { id: 21, title: "Colossus", opponent: CharacterType.TITAN, mapName: "Ancient Arena", unlocks: CharacterType.TITAN, description: "The bigger they are, the harder they fall." },
  { id: 22, title: "Event Horizon", opponent: CharacterType.GRAVITY, mapName: "Space Station", unlocks: CharacterType.GRAVITY, description: "Gravity is not your friend here." },
  { id: 23, title: "Divine Intervention", opponent: CharacterType.SAINT, mapName: "Golden Temple", unlocks: CharacterType.SAINT, description: "A holy warrior stands in your way." },
  { id: 24, title: "Hellbound", opponent: CharacterType.DEVIL, mapName: "Underworld", unlocks: CharacterType.DEVIL, description: "Face the demon in his own home." },
  { id: 25, title: "Abyss", opponent: CharacterType.DARKNESS, mapName: "Void Realm", unlocks: CharacterType.DARKNESS, description: "Stare into the abyss." },
  { id: 26, title: "Solar Flare", opponent: CharacterType.SOLAR, mapName: "Sun Temple", unlocks: CharacterType.SOLAR, description: "Blinding light and searing heat." },
  { id: 27, title: "Speed of Light", opponent: CharacterType.LIGHT, mapName: "Prism Core", unlocks: CharacterType.LIGHT, description: "Can you catch a photon?" },
  { id: 28, title: "Timekeeper", opponent: CharacterType.TIME, mapName: "Clock Tower", unlocks: CharacterType.TIME, description: "He controls the flow of battle." },
  { id: 29, title: "Entropy", opponent: CharacterType.CHAOS, mapName: "Glitch Dimension", unlocks: CharacterType.CHAOS, description: "The final test. Expect the unexpected." },
];

export interface CharacterProgress {
  level: number;
  xp: number;
  masteryPoints: number;
  unlockedSkins: string[]; 
  equippedSkin: string | null;
  unlockedAbilities: string[]; 
  equippedAbility: string | null;
}

export interface MasteryReward {
  level: number;
  xpRequired: number;
  reward: string;
  icon: string;
}

export const MASTERY_TRACK: MasteryReward[] = [
  { level: 1, xpRequired: 0, reward: 'Recruit', icon: '🥋' },
  { level: 2, xpRequired: 500, reward: 'Title: Novice', icon: '🏷️' },
  { level: 3, xpRequired: 1500, reward: 'Skin: Bronze', icon: '🥉' },
  { level: 4, xpRequired: 3000, reward: 'XP Boost +10%', icon: '📈' },
  { level: 5, xpRequired: 5000, reward: 'Skin: Silver', icon: '🥈' },
  { level: 6, xpRequired: 8000, reward: 'Title: Expert', icon: '🎖️' },
  { level: 7, xpRequired: 12000, reward: 'Effect: Trail', icon: '✨' },
  { level: 8, xpRequired: 18000, reward: 'Skin: Gold', icon: '🥇' },
  { level: 9, xpRequired: 25000, reward: 'Title: Master', icon: '👑' },
  { level: 10, xpRequired: 40000, reward: 'Skin: Diamond', icon: '💎' },
];

export interface SkinVisuals {
    accessory?: 'HAT_COWBOY' | 'HAT_WIZARD' | 'HALO' | 'HORNS' | 'HEADPHONES' | 'CROWN' | 'HAT_STRAW' | 'HAT_GENERAL';
    faceAccessory?: 'MASK_ONI' | 'VISOR' | 'EYEPATCH' | 'MASK_NINJA' | 'GLASSES';
    backAccessory?: 'CAPE' | 'WINGS' | 'JETPACK' | 'SCARF'; 
    effect?: 'FIRE' | 'SPARKLE' | 'GHOST' | 'GLITCH' | 'NEON_OUTLINE' | 'SLIME';
}

export interface Skin {
    id: string;
    characterType: CharacterType;
    name: string;
    description: string;
    cost: number;
    colorOverride?: string;
    visuals?: SkinVisuals;
}

export interface Ability {
    id: string;
    characterType: CharacterType;
    name: string;
    description: string;
    cost: number;
}

export const SHOP_SKINS: Skin[] = [
    { id: 'ninja_shadow', characterType: CharacterType.NINJA, name: 'Shadow Ops', description: 'Stealth black.', cost: 2, colorOverride: '#1a1a1a', visuals: { faceAccessory: 'MASK_NINJA', backAccessory: 'SCARF' } },
    { id: 'ninja_neon', characterType: CharacterType.NINJA, name: 'Cyber Neon', description: 'Future suit.', cost: 5, colorOverride: '#00ffaa', visuals: { faceAccessory: 'VISOR', effect: 'NEON_OUTLINE' } },
    { id: 'titan_magma', characterType: CharacterType.TITAN, name: 'Magma Core', description: 'Molten rock.', cost: 3, colorOverride: '#3f0a0a', visuals: { effect: 'FIRE' } },
    { id: 'titan_gold', characterType: CharacterType.TITAN, name: 'Golden God', description: 'Pure gold.', cost: 6, colorOverride: '#ffd700', visuals: { accessory: 'HALO', effect: 'SPARKLE' } },
    { id: 'ronin_blood', characterType: CharacterType.RONIN, name: 'Blood Moon', description: 'Red robes.', cost: 3, colorOverride: '#991111', visuals: { accessory: 'HAT_STRAW', backAccessory: 'CAPE' } },
    { id: 'ronin_ghost', characterType: CharacterType.RONIN, name: 'Ghost Walker', description: 'Translucent spirit.', cost: 5, colorOverride: 'rgba(255,255,255,0.5)', visuals: { faceAccessory: 'MASK_ONI', effect: 'GHOST' } },
    { id: 'volt_plasma', characterType: CharacterType.VOLT, name: 'Plasma Arc', description: 'Overloaded energy.', cost: 3, colorOverride: '#d946ef', visuals: { effect: 'GLITCH', faceAccessory: 'VISOR' } },
    { id: 'inferno_blue', characterType: CharacterType.INFERNO, name: 'Blue Flame', description: 'Hotter than hell.', cost: 4, colorOverride: '#3b82f6', visuals: { effect: 'FIRE' } },
    { id: 'glacier_black', characterType: CharacterType.GLACIER, name: 'Black Ice', description: 'Deadly slippery.', cost: 4, colorOverride: '#0f172a', visuals: { accessory: 'CROWN' } },
    { id: 'cyborg_proto', characterType: CharacterType.CYBORG, name: 'Prototype', description: 'Unfinished.', cost: 3, colorOverride: '#555', visuals: { faceAccessory: 'EYEPATCH' } },
    { id: 'devil_lord', characterType: CharacterType.DEVIL, name: 'Demon Lord', description: 'Full wings.', cost: 5, colorOverride: '#450a0a', visuals: { accessory: 'HORNS', backAccessory: 'WINGS' } },
    { id: 'saint_angel', characterType: CharacterType.SAINT, name: 'Archangel', description: 'Divine.', cost: 5, colorOverride: '#fff', visuals: { accessory: 'HALO', backAccessory: 'WINGS' } },
    { id: 'heavy_general', characterType: CharacterType.HEAVY, name: 'The General', description: 'Rank insignia.', cost: 3, colorOverride: '#1e293b', visuals: { accessory: 'HAT_GENERAL', faceAccessory: 'GLASSES' } },
    { id: 'ninja_master', characterType: CharacterType.NINJA, name: 'Shinobi Master', description: 'Legendary.', cost: 4, colorOverride: '#222', visuals: { faceAccessory: 'MASK_ONI', backAccessory: 'SCARF' } },
    { id: 'titan_colossus', characterType: CharacterType.TITAN, name: 'Colossus', description: 'Ancient.', cost: 4, colorOverride: '#5c4033', visuals: { accessory: 'HAT_GENERAL', backAccessory: 'CAPE' } },
    { id: 'volt_spark', characterType: CharacterType.VOLT, name: 'High Voltage', description: 'Surging.', cost: 4, colorOverride: '#fbbf24', visuals: { effect: 'SPARKLE', faceAccessory: 'VISOR' } },
    { id: 'lancer_royal', characterType: CharacterType.LANCER, name: 'Royal Guard', description: 'Elite.', cost: 4, colorOverride: '#4c1d95', visuals: { accessory: 'HAT_GENERAL', backAccessory: 'CAPE' } },
    { id: 'phantom_specter', characterType: CharacterType.PHANTOM, name: 'Grim Specter', description: 'Abyss.', cost: 4, colorOverride: '#111', visuals: { effect: 'GHOST', faceAccessory: 'MASK_ONI' } },
    { id: 'inferno_magma', characterType: CharacterType.INFERNO, name: 'Magma Lord', description: 'Molten.', cost: 4, colorOverride: '#7f1d1d', visuals: { accessory: 'HORNS', effect: 'FIRE' } },
    { id: 'glacier_frost', characterType: CharacterType.GLACIER, name: 'Frost King', description: 'Ruler.', cost: 4, colorOverride: '#e0f2fe', visuals: { accessory: 'CROWN', backAccessory: 'CAPE' } },
    { id: 'ronin_wandering', characterType: CharacterType.RONIN, name: 'Wandering Soul', description: 'Lost.', cost: 4, colorOverride: '#555', visuals: { accessory: 'HAT_STRAW', faceAccessory: 'EYEPATCH' } },
    { id: 'elemental_sage', characterType: CharacterType.ELEMENTAL, name: 'Elder Sage', description: 'Nature.', cost: 4, colorOverride: '#166534', visuals: { accessory: 'HAT_WIZARD', backAccessory: 'CAPE' } },
    { id: 'magic_arcane', characterType: CharacterType.MAGIC, name: 'Arcane Master', description: 'Supreme.', cost: 4, colorOverride: '#701a75', visuals: { accessory: 'HAT_WIZARD', effect: 'SPARKLE' } },
    { id: 'animal_alpha', characterType: CharacterType.ANIMAL, name: 'Alpha Beast', description: 'Leader.', cost: 4, colorOverride: '#92400e', visuals: { faceAccessory: 'MASK_ONI', effect: 'FIRE' } },
    { id: 'darkness_void', characterType: CharacterType.DARKNESS, name: 'Void Walker', description: 'Consumed.', cost: 4, colorOverride: '#000', visuals: { effect: 'GLITCH', backAccessory: 'CAPE' } },
    { id: 'solar_eclipse', characterType: CharacterType.SOLAR, name: 'Solar Eclipse', description: 'Darkened.', cost: 4, colorOverride: '#b45309', visuals: { accessory: 'HALO', effect: 'FIRE' } },
    { id: 'heavy_juggernaut', characterType: CharacterType.HEAVY, name: 'Juggernaut', description: 'Unstoppable.', cost: 4, colorOverride: '#111', visuals: { faceAccessory: 'VISOR', accessory: 'HAT_GENERAL' } },
    { id: 'trapper_hunter', characterType: CharacterType.TRAPPER, name: 'Bounty Hunter', description: 'Target.', cost: 4, colorOverride: '#3f6212', visuals: { accessory: 'HAT_COWBOY', faceAccessory: 'EYEPATCH' } },
    { id: 'saint_fallen', characterType: CharacterType.SAINT, name: 'Fallen Angel', description: 'Cast down.', cost: 4, colorOverride: '#555', visuals: { accessory: 'HALO', backAccessory: 'WINGS' } },
    { id: 'cyborg_terminator', characterType: CharacterType.CYBORG, name: 'Terminator', description: 'Mission.', cost: 4, colorOverride: '#334155', visuals: { faceAccessory: 'VISOR', effect: 'NEON_OUTLINE' } },
    { id: 'time_traveler', characterType: CharacterType.TIME, name: 'Time Traveler', description: 'Lost.', cost: 4, colorOverride: '#854d0e', visuals: { faceAccessory: 'GLASSES', backAccessory: 'SCARF' } },
    { id: 'devil_prince', characterType: CharacterType.DEVIL, name: 'Prince', description: 'Royalty.', cost: 4, colorOverride: '#000', visuals: { accessory: 'HORNS', backAccessory: 'CAPE' } },
    { id: 'gravity_star', characterType: CharacterType.GRAVITY, name: 'Neutron Star', description: 'Dense.', cost: 4, colorOverride: '#1e1b4b', visuals: { effect: 'SPARKLE', faceAccessory: 'VISOR' } },
    { id: 'insect_queen', characterType: CharacterType.INSECT, name: 'Hive Queen', description: 'Ruler.', cost: 4, colorOverride: '#65a30d', visuals: { accessory: 'CROWN', backAccessory: 'WINGS' } },
    { id: 'bone_lich', characterType: CharacterType.BONE, name: 'Lich King', description: 'Master.', cost: 4, colorOverride: '#f3f4f6', visuals: { accessory: 'CROWN', effect: 'GHOST' } },
    { id: 'wind_zephyr', characterType: CharacterType.WIND, name: 'Zephyr', description: 'Breeze.', cost: 4, colorOverride: '#bae6fd', visuals: { backAccessory: 'SCARF', effect: 'SPARKLE' } },
    { id: 'venom_toxin', characterType: CharacterType.VENOM, name: 'Toxic Avenger', description: 'Radioactive.', cost: 4, colorOverride: '#064e3b', visuals: { effect: 'SLIME', faceAccessory: 'MASK_NINJA' } },
    { id: 'chaos_entropy', characterType: CharacterType.CHAOS, name: 'Entropy', description: 'Disorder.', cost: 4, colorOverride: '#333', visuals: { effect: 'GLITCH', faceAccessory: 'MASK_ONI' } },
    { id: 'plant_druid', characterType: CharacterType.PLANT, name: 'Arch Druid', description: 'Keeper.', cost: 4, colorOverride: '#14532d', visuals: { accessory: 'HAT_WIZARD', backAccessory: 'CAPE' } },
    { id: 'crystal_prism', characterType: CharacterType.CRYSTAL, name: 'Prism Guardian', description: 'Refracting.', cost: 4, colorOverride: '#c084fc', visuals: { accessory: 'CROWN', effect: 'SPARKLE' } },
    { id: 'zombie_undead', characterType: CharacterType.ZOMBIE, name: 'Undead General', description: 'Rotting.', cost: 4, colorOverride: '#365314', visuals: { accessory: 'HAT_GENERAL', effect: 'SLIME' } },
    { id: 'monk_grandmaster', characterType: CharacterType.MONK, name: 'Grandmaster', description: 'Enlightened.', cost: 4, colorOverride: '#fdba74', visuals: { faceAccessory: 'GLASSES', accessory: 'HAT_STRAW' } },
    { id: 'light_divine', characterType: CharacterType.LIGHT, name: 'Divine Light', description: 'Radiance.', cost: 4, colorOverride: '#fff', visuals: { accessory: 'HALO', effect: 'SPARKLE' } },
    { id: 'viking_lord', characterType: CharacterType.VIKING, name: 'Viking Lord', description: 'Ruler.', cost: 4, colorOverride: '#334155', visuals: { accessory: 'HORNS', backAccessory: 'CAPE' } },
    { id: 'pirate_captain', characterType: CharacterType.PIRATE, name: 'Dread Captain', description: 'Scourge.', cost: 4, colorOverride: '#7f1d1d', visuals: { accessory: 'HAT_GENERAL', faceAccessory: 'EYEPATCH' } },
    { id: 'cyber_neon', characterType: CharacterType.CYBER, name: 'Neo Tokyo', description: 'Street.', cost: 4, colorOverride: '#e879f9', visuals: { faceAccessory: 'VISOR', effect: 'NEON_OUTLINE' } },
];

export const SHOP_ABILITIES: Ability[] = [
    { id: 'ninja_shuriken', characterType: CharacterType.NINJA, name: 'Shuriken Storm', description: 'Throw projectiles.', cost: 5 },
    { id: 'titan_boulder', characterType: CharacterType.TITAN, name: 'Boulder Toss', description: 'Hurl rock.', cost: 5 },
    { id: 'inferno_fireball', characterType: CharacterType.INFERNO, name: 'Great Fireball', description: 'Explosive projectile.', cost: 5 },
    { id: 'ronin_dash', characterType: CharacterType.RONIN, name: 'Sonic Slash', description: 'Instant dash attack.', cost: 5 },
    { id: 'volt_thunder', characterType: CharacterType.VOLT, name: 'Thunder Strike', description: 'Call lightning.', cost: 5 },
];
