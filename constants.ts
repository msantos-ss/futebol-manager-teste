import { Team, Tactics, DefStructure, DefLine, Pressing, BuildUp, Creation, Tempo, OffBall, SetPieces } from './types';

const defaultTactics: Tactics = {
  structure: DefStructure.Medium,
  line: DefLine.Standard,
  pressing: Pressing.Directed,
  buildUp: BuildUp.Mixed,
  creation: Creation.Center,
  tempo: Tempo.Balanced,
  offBall: OffBall.Mixed,
  setPieces: SetPieces.Balanced,
  conditionals: { 
    winning: 'maintain',
    losing: 'pressure_total',
    draw70: 'maintain'
  }
};

const aiTeamNames = [
  "Ironclad FC", "Dynamo City", "Real Veloce", "Athletic Peaks", "United Harbor",
  "Forest Rovers", "Grand Central", "North Star", "Southern Cross", "Eastern Dragons",
  "Western Wolves", "Royal Knights", "Sporting Nova", "Inter Stella", "Olympique Azure",
  "Red Bullion", "Violet Viola", "Golden Eagles", "Silver Sharks"
];

// Helper to randomize AI tactics to give them personality
const getRandomTactics = (): Tactics => {
  const rand = <T>(enumObj: any): T => {
    const values = Object.values(enumObj);
    return values[Math.floor(Math.random() * values.length)] as T;
  };

  return {
    structure: rand(DefStructure),
    line: rand(DefLine),
    pressing: rand(Pressing),
    buildUp: rand(BuildUp),
    creation: rand(Creation),
    tempo: rand(Tempo),
    offBall: rand(OffBall),
    setPieces: rand(SetPieces),
    conditionals: { 
      winning: Math.random() > 0.5 ? 'recuar' : 'maintain',
      losing: Math.random() > 0.3 ? 'pressure_total' : 'maintain',
      draw70: Math.random() > 0.6 ? 'risk_all' : 'maintain'
    }
  };
};

export const initializeTeams = (userTeamName: string): Team[] => {
  const teams: Team[] = [];

  // User Team
  teams.push({
    id: 'user-team',
    name: userTeamName || "My Club FC",
    isPlayer: true,
    tactics: { ...defaultTactics },
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
    form: []
  });

  // AI Teams
  aiTeamNames.forEach((name, idx) => {
    teams.push({
      id: `ai-${idx}`,
      name: name,
      isPlayer: false,
      tactics: getRandomTactics(),
      stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 },
      form: []
    });
  });

  return teams;
};