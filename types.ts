export enum DefStructure { Low = "Bloco Baixo", Medium = "Bloco Médio", High = "Bloco Alto" }
export enum DefLine { Deep = "Recuada", Standard = "Normal", High = "Alta" }
export enum Pressing { Contain = "Contenção", Trigger = "Pós-perda", Directed = "Direcionada", Total = "Total" }
export enum BuildUp { Short = "Curta", Mixed = "Mista", Direct = "Direta" }
export enum Creation { Center = "Centro", Wings = "Pontas", Crosses = "Cruzamentos", Infiltration = "Infiltração" }
export enum Tempo { Slow = "Lento", Balanced = "Equilibrado", Fast = "Intenso" }
export enum OffBall { Individual = "Individual", Zone = "Por Zona", Mixed = "Mista" }
export enum SetPieces { Defensive = "Foco Defensivo", Balanced = "Equilibrado", Offensive = "Ofensivo" }

export interface Conditionals {
  winning: 'maintain' | 'recuar';
  losing: 'maintain' | 'pressure_total';
  draw70: 'maintain' | 'risk_all';
}

export interface Tactics {
  structure: DefStructure;
  line: DefLine;
  pressing: Pressing;
  buildUp: BuildUp;
  creation: Creation;
  tempo: Tempo;
  offBall: OffBall;
  setPieces: SetPieces;
  conditionals: Conditionals;
}

export interface Team {
  id: string;
  name: string;
  isPlayer: boolean;
  tactics: Tactics;
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    pts: number;
  };
  form: ('W' | 'D' | 'L')[];
}

export interface MatchStats {
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeXG: number;
  awayXG: number;
  tacticalAnalysis: string[];
}

export interface MatchResult {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  played: boolean;
  stats?: MatchStats;
}