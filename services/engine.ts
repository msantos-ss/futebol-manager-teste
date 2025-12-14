import { Team, Tactics, MatchResult, MatchStats, DefStructure, Pressing, BuildUp, Tempo, DefLine, Creation, OffBall } from '../types';

// Helper to generate random number between min and max
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Determine tactical matchup advantages based on rock-paper-scissors logic
const calculateTacticalAdvantage = (t1: Tactics, t2: Tactics): { advantage: number, analysis: string[] } => {
  let advantage = 0; // Positive favors T1, Negative favors T2
  const analysis: string[] = [];

  // --- 1. Structure vs Tempo/Style ---
  // Low Block counters Slow Tempo (denies space)
  if (t1.structure === DefStructure.Low && t2.tempo === Tempo.Slow) {
    advantage += 10;
    analysis.push("Bloco baixo neutralizou a posse lenta adversária.");
  }
  // Low Block weak against Crosses (sits too deep)
  if (t1.structure === DefStructure.Low && t2.creation === Creation.Crosses) {
    advantage -= 8;
    analysis.push("Defesa muito recuada permitiu cruzamentos perigosos.");
  }

  // --- 2. Line vs Build Up ---
  // High Line vulnerable to Direct Build (long balls)
  if (t1.line === DefLine.High && t2.buildUp === BuildUp.Direct) {
    advantage -= 12;
    analysis.push("Linha alta sofreu contra bolas longas nas costas.");
  }
  // High Line strong against Short Build (compresses space)
  if (t1.line === DefLine.High && t2.buildUp === BuildUp.Short) {
    advantage += 8;
    analysis.push("Linha alta dificultou a saída curta do rival.");
  }

  // --- 3. Pressing vs Build Up ---
  // Pressing 'Post-Loss' effective against 'Short' build
  if (t1.pressing === Pressing.Trigger && t2.buildUp === BuildUp.Short) {
    advantage += 10;
    analysis.push("Pressão pós-perda forçou erros na saída curta.");
  }
  // Total Pressing tires out if opponent plays Slow Tempo (keeps ball)
  if (t1.pressing === Pressing.Total && t2.tempo === Tempo.Slow) {
    advantage -= 5;
    analysis.push("Pressão total desgastou o time contra posse cadenciada.");
  }

  // --- 4. Off Ball vs Creation ---
  // Zone marking good against Infiltration
  if (t1.offBall === OffBall.Zone && t2.creation === Creation.Infiltration) {
    advantage += 8;
    analysis.push("Marcação por zona fechou as linhas de infiltração.");
  }
  // Individual marking weak against Rotation/Wings if speed matches
  if (t1.offBall === OffBall.Individual && t2.creation === Creation.Wings) {
    advantage -= 5;
    analysis.push("Marcação individual sofreu com a largura do campo.");
  }

  return { advantage, analysis };
};

export const simulateMatch = (home: Team, away: Team, round: number): MatchResult => {
  // Base Squad Strength (slightly randomized for "form")
  let homeStrength = 100 + random(-3, 3);
  let awayStrength = 95 + random(-3, 3); // Slight home field base

  // 1. Initial Tactical Clash
  const homeTactical = calculateTacticalAdvantage(home.tactics, away.tactics);
  const awayTactical = calculateTacticalAdvantage(away.tactics, home.tactics);

  // Apply Advantages
  homeStrength += homeTactical.advantage;
  awayStrength += awayTactical.advantage;

  // Collect initial feedback
  let feedback = [...homeTactical.analysis];
  // Add away perspective if significant (inverted for display)
  if (awayTactical.advantage > 5) {
     feedback.push("O adversário explorou falhas na sua organização.");
  }

  // 2. Base Simulation Logic (Possession & Chances)
  const homePressBonus = home.tactics.pressing === Pressing.Total ? 5 : 0;
  const awayPressBonus = away.tactics.pressing === Pressing.Total ? 5 : 0;
  
  let possession = 50 + (homeStrength - awayStrength) * 0.5 + (homePressBonus - awayPressBonus);
  possession = Math.max(30, Math.min(70, possession));

  // Determine raw chances based on final strength
  let homeChances = Math.floor((homeStrength / 10) * random(0.8, 1.2));
  let awayChances = Math.floor((awayStrength / 10) * random(0.8, 1.2));

  // 3. APPLY CONDITIONAL LOGIC (Simulating "In-Game" adjustments)
  // We simulate a check at the 60-70th minute mark essentially.
  
  // Calculate a temporary "current state" to see who is likely winning
  const tempHomeScore = homeChances * 0.15; // expected goals roughly
  const tempAwayScore = awayChances * 0.15;

  // --- HOME TEAM CONDITIONALS ---
  if (tempHomeScore > tempAwayScore + 0.5) {
      // Home is winning
      if (home.tactics.conditionals.winning === 'recuar') {
          homeStrength += 5; // Better defense
          homeChances -= 2; // Less attack
          feedback.push("Seu time recuou para segurar o resultado.");
      }
  } else if (tempAwayScore > tempHomeScore + 0.5) {
      // Home is losing
      if (home.tactics.conditionals.losing === 'pressure_total') {
          homeChances += 2; // Push for goal
          awayChances += 1; // Vulnerable to counter
          feedback.push("Time se lançou ao ataque para buscar o empate.");
      }
  } else {
      // Drawing
      if (home.tactics.conditionals.draw70 === 'risk_all') {
           homeChances += 1;
           awayChances += 1;
           feedback.push("Arriscou tudo no final para desempatar.");
      }
  }

  // --- AWAY TEAM CONDITIONALS (Simplified logic for AI) ---
  if (tempAwayScore > tempHomeScore + 0.5 && away.tactics.conditionals.winning === 'recuar') {
      awayChances -= 1;
      // Away parks the bus
  } else if (tempHomeScore > tempAwayScore + 0.5 && away.tactics.conditionals.losing === 'pressure_total') {
      awayChances += 2;
      homeChances += 1; // Home gets counter chance
  }

  // 4. Final Scoring Conversion
  let homeScore = 0;
  let awayScore = 0;

  // Conversion rates modified by Creation type vs Defense
  const homeConversionRate = home.tactics.creation === Creation.Infiltration ? 20 : 15;
  const awayConversionRate = away.tactics.creation === Creation.Infiltration ? 20 : 15;

  for(let i=0; i<Math.max(0, homeChances); i++) {
      if(random(0, 100) < homeConversionRate) homeScore++;
  }
  for(let i=0; i<Math.max(0, awayChances); i++) {
      if(random(0, 100) < awayConversionRate) awayScore++;
  }

  // Set Pieces Check (Lucky Dip)
  if (home.tactics.setPieces === "Ofensivo" && random(0, 100) > 92) {
      homeScore++;
      feedback.push("Gol de bola parada (foco ofensivo).");
  }

  // Ensure unique feedback
  feedback = [...new Set(feedback)];
  if (feedback.length === 0) feedback.push("Duelo tático equilibrado.");

  const xGHome = homeChances * (homeConversionRate/100);
  const xGAway = awayChances * (awayConversionRate/100);

  return {
    id: Math.random().toString(36).substr(2, 9),
    round,
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeScore,
    awayScore,
    played: true,
    stats: {
      homePossession: Math.floor(possession),
      awayPossession: 100 - Math.floor(possession),
      homeShots: homeChances,
      awayShots: awayChances,
      homeXG: parseFloat(xGHome.toFixed(2)),
      awayXG: parseFloat(xGAway.toFixed(2)),
      tacticalAnalysis: feedback
    }
  };
};

export const generateLeagueSchedule = (teamIds: string[]): Array<{round: number, home: string, away: string}>[] => {
    // Round robin algorithm
    const schedule = [];
    const numberOfTeams = teamIds.length;
    const teams = [...teamIds];
    
    if (numberOfTeams % 2 !== 0) {
        teams.push('bye'); 
    }

    const n = teams.length;
    const roundsOneLeg = n - 1;

    // First leg (Ida)
    for (let r = 0; r < roundsOneLeg; r++) {
        const roundMatches = [];
        for (let i = 0; i < n / 2; i++) {
            const t1 = teams[i];
            const t2 = teams[n - 1 - i];
            if (t1 !== 'bye' && t2 !== 'bye') {
                roundMatches.push({
                    round: r + 1,
                    home: r % 2 === 0 ? t1 : t2, 
                    away: r % 2 === 0 ? t2 : t1
                });
            }
        }
        teams.splice(1, 0, teams.pop()!); 
        schedule.push(roundMatches);
    }

    // Second leg (Volta) - Mirror of first leg with home/away swapped
    const firstLegMatches = [...schedule];
    firstLegMatches.forEach((roundMatches, i) => {
        const returnMatches = roundMatches.map(m => ({
            round: roundsOneLeg + i + 1,
            home: m.away, // Swap home and away
            away: m.home
        }));
        schedule.push(returnMatches);
    });

    return schedule;
};