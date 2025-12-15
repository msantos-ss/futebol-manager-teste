import React, { useState, useEffect } from 'react';
import { initializeTeams } from './constants';
import { generateLeagueSchedule, simulateMatch } from './services/engine';
import { Team, MatchResult, Tactics } from './types';
import TacticsBoard from './components/TacticsBoard';
import LeagueTable from './components/LeagueTable';
import MatchView from './components/MatchView';

enum AppState {
  SETUP,
  DASHBOARD,
  TACTICS,
  MATCHING,
  MATCH_RESULT,
  SCOUTING
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [teams, setTeams] = useState<Team[]>([]);
  const [schedule, setSchedule] = useState<Array<{round: number, home: string, away: string}>[]>([]);
  const [currentRound, setCurrentRound] = useState(0); // 0-indexed for array access
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null);
  const [managerName, setManagerName] = useState("");

  const userTeam = teams.find(t => t.isPlayer);
  const nextOpponentId = schedule[currentRound]?.find(m => m.home === userTeam?.id || m.away === userTeam?.id);
  const nextOpponent = nextOpponentId ? teams.find(t => t.id === (nextOpponentId.home === userTeam?.id ? nextOpponentId.away : nextOpponentId.home)) : null;

  const startSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if(!managerName.trim()) return;
    
    const initialTeams = initializeTeams(managerName);
    const leagueSchedule = generateLeagueSchedule(initialTeams.map(t => t.id));
    
    setTeams(initialTeams);
    setSchedule(leagueSchedule);
    setAppState(AppState.DASHBOARD);
  };

  const handleUpdateTactics = (newTactics: Tactics) => {
    setTeams(prev => prev.map(t => t.isPlayer ? { ...t, tactics: newTactics } : t));
  };

  const playRound = () => {
    if (currentRound >= schedule.length) return;

    const roundMatches = schedule[currentRound];
    const newResults: MatchResult[] = [];
    let userMatchResult: MatchResult | null = null;

    // Clone teams to update stats
    const updatedTeams = [...teams];

    roundMatches.forEach(fixture => {
      const home = updatedTeams.find(t => t.id === fixture.home)!;
      const away = updatedTeams.find(t => t.id === fixture.away)!;

      const result = simulateMatch(home, away, currentRound + 1);
      newResults.push(result);

      if (home.isPlayer || away.isPlayer) {
        userMatchResult = result;
      }

      // Update Stats
      const updateTeamStats = (team: Team, gf: number, ga: number) => {
          team.stats.played++;
          team.stats.gf += gf;
          team.stats.ga += ga;
          if (gf > ga) {
              team.stats.won++;
              team.stats.pts += 3;
              team.form.push('W');
          } else if (gf === ga) {
              team.stats.drawn++;
              team.stats.pts += 1;
              team.form.push('D');
          } else {
              team.stats.lost++;
              team.form.push('L');
          }
      };

      updateTeamStats(home, result.homeScore, result.awayScore);
      updateTeamStats(away, result.awayScore, result.homeScore);
    });

    setMatchHistory(prev => [...prev, ...newResults]);
    setTeams(updatedTeams);
    setCurrentMatch(userMatchResult);
    setAppState(AppState.MATCH_RESULT);
  };

  const advanceRound = () => {
    setCurrentMatch(null);
    setCurrentRound(prev => prev + 1);
    setAppState(AppState.DASHBOARD);
  };

  // Helper to render match history list for scouting
  const MatchHistoryList = ({ teamId }: { teamId: string }) => {
      const history = matchHistory.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId).sort((a,b) => b.round - a.round);
      
      if (history.length === 0) return <div className="text-slate-500 text-sm italic">Nenhum jogo disputado.</div>;

      return (
          <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
              {history.map(m => {
                  const isHome = m.homeTeamId === teamId;
                  const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                  const opponent = teams.find(t => t.id === opponentId);
                  const goalsFor = isHome ? m.homeScore : m.awayScore;
                  const goalsAgainst = isHome ? m.awayScore : m.homeScore;
                  const resultColor = goalsFor > goalsAgainst ? 'text-green-400' : goalsFor < goalsAgainst ? 'text-red-400' : 'text-slate-400';
                  const resultChar = goalsFor > goalsAgainst ? 'V' : goalsFor < goalsAgainst ? 'D' : 'E';

                  return (
                      <div key={m.id} className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-1">
                          <span className="text-slate-500 w-8">R{m.round}</span>
                          <span className="text-slate-300 flex-1 truncate text-left pl-2">vs {opponent?.name}</span>
                          <span className={`font-mono font-bold ${resultColor}`}>{goalsFor}-{goalsAgainst} ({resultChar})</span>
                      </div>
                  );
              })}
          </div>
      );
  };

  // -- Views --

  if (appState === AppState.SETUP) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-blend-multiply">
        <div className="bg-slate-900/90 p-8 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full backdrop-blur">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">TACTICO <span className="text-emerald-500">MANAGER</span></h1>
          <p className="text-slate-400 mb-6">Simulador tático de futebol.</p>
          <form onSubmit={startSeason} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Nome do Clube</label>
              <input 
                type="text" 
                value={managerName} 
                onChange={e => setManagerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Ex: Real São Paulo"
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-all"
            >
              Iniciar Carreira
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto">
      {/* Sidebar Navigation */}
      <nav className="bg-slate-900 w-full md:w-20 md:min-h-screen border-r border-slate-800 flex flex-row md:flex-col items-center py-4 px-2 gap-6 justify-center md:justify-start z-10 sticky top-0 md:static">
         <div className="hidden md:block text-emerald-500 font-black text-2xl mb-8">TM</div>
         <NavBtn icon="dashboard" label="Home" active={appState === AppState.DASHBOARD} onClick={() => setAppState(AppState.DASHBOARD)} />
         <NavBtn icon="tactics" label="Táticas" active={appState === AppState.TACTICS} onClick={() => setAppState(AppState.TACTICS)} />
         <NavBtn icon="search" label="Scout" active={appState === AppState.SCOUTING} onClick={() => setAppState(AppState.SCOUTING)} />
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-800 gap-4">
           <div className="w-full md:w-auto">
              <h1 className="text-2xl font-bold text-white">{userTeam?.name}</h1>
              <span className="text-slate-400 text-sm">Rodada {currentRound + 1} de {schedule.length}</span>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
               {/* Next Opponent Mini-Card */}
               {nextOpponent && appState !== AppState.MATCH_RESULT && currentRound < schedule.length && (
                 <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Próximo Rival</span>
                        <span className="font-bold text-white text-sm">{nextOpponent.name}</span>
                    </div>
                    {/* Placeholder Symbol */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center shadow-inner">
                        <span className="text-lg font-black text-slate-400">{nextOpponent.name.charAt(0)}</span>
                    </div>
                 </div>
               )}

               {/* Action Button */}
               {appState !== AppState.MATCH_RESULT && currentRound < schedule.length ? (
                 <button 
                    onClick={playRound}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 animate-pulse transition-all hover:scale-105 w-full sm:w-auto justify-center"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    JOGAR RODADA
                 </button>
               ) : (
                 currentRound >= schedule.length && <div className="text-slate-500 font-bold">TEMPORADA FINALIZADA</div>
               )}
           </div>
        </header>

        {appState === AppState.DASHBOARD && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                {/* Next Match Card */}
                {nextOpponent ? (
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                     </div>
                     <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Análise Pré-Jogo</h3>
                     <div className="flex items-center justify-between">
                        <div>
                           <div className="text-3xl font-black text-white mb-1">{nextOpponent.name}</div>
                           <div className="text-emerald-400 font-medium">Estilo: {nextOpponent.tactics.structure} / {nextOpponent.tactics.buildUp}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-slate-500 text-sm">Posição</div>
                           <div className="text-2xl font-bold text-white">#{teams.sort((a,b) => b.stats.pts - a.stats.pts).findIndex(t => t.id === nextOpponent.id) + 1}</div>
                        </div>
                     </div>
                     <div className="mt-6 flex gap-2">
                        <button onClick={() => setAppState(AppState.TACTICS)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded border border-slate-600">Ajustar Tática</button>
                        <button onClick={() => setAppState(AppState.SCOUTING)} className="text-sm border border-slate-600 text-slate-300 hover:bg-slate-800 py-2 px-4 rounded">Ver Histórico Deles</button>
                     </div>
                  </div>
                ) : (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center text-slate-400">
                    Sem mais jogos agendados.
                  </div>
                )}
                
                <LeagueTable teams={teams} />
             </div>

             <div className="lg:col-span-1">
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 h-full">
                   <h3 className="font-bold text-white mb-4">Resultados Recentes</h3>
                   <div className="space-y-3">
                      {matchHistory.filter(m => m.round === currentRound).length > 0 ? 
                        matchHistory.filter(m => m.round === currentRound).map(m => {
                          const h = teams.find(t => t.id === m.homeTeamId);
                          const a = teams.find(t => t.id === m.awayTeamId);
                          const isMyGame = h?.isPlayer || a?.isPlayer;
                          return (
                            <div key={m.id} className={`flex justify-between text-sm p-2 rounded ${isMyGame ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-slate-800/50'}`}>
                              <span className={m.homeScore > m.awayScore ? 'font-bold text-white' : 'text-slate-400'}>{h?.name}</span>
                              <span className="text-slate-300 px-2 font-mono bg-slate-950 rounded">{m.homeScore} - {m.awayScore}</span>
                              <span className={m.awayScore > m.homeScore ? 'font-bold text-white' : 'text-slate-400'}>{a?.name}</span>
                            </div>
                          )
                        }) 
                        : 
                        <div className="text-slate-500 text-sm text-center italic py-10">A rodada ainda não começou.</div>
                      }
                   </div>
                </div>
             </div>
          </div>
        )}

        {appState === AppState.TACTICS && userTeam && (
          <TacticsBoard tactics={userTeam.tactics} onUpdate={handleUpdateTactics} />
        )}

        {appState === AppState.SCOUTING && (
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
             {/* NEXT OPPONENT DEEP DIVE */}
             {nextOpponent ? (
                 <div className="mb-8 p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-emerald-500/30 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-emerald-500">PRÓXIMO ADVERSÁRIO:</span> 
                        {nextOpponent.name}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tactical Profile */}
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Perfil Tático</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs">Estrutura Defensiva</p>
                                    <p className="text-white font-medium">{nextOpponent.tactics.structure}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Linha Defensiva</p>
                                    <p className="text-white font-medium">{nextOpponent.tactics.line}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Construção</p>
                                    <p className="text-white font-medium">{nextOpponent.tactics.buildUp}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Ritmo</p>
                                    <p className="text-white font-medium">{nextOpponent.tactics.tempo}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Pressão</p>
                                    <p className="text-white font-medium">{nextOpponent.tactics.pressing}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Criação</p>
                                    <p className="text-white font-medium">{nextOpponent.tactics.creation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Full Match History */}
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Histórico na Temporada</h3>
                            <MatchHistoryList teamId={nextOpponent.id} />
                        </div>
                    </div>
                 </div>
             ) : (
                <div className="mb-8 p-4 bg-slate-800 rounded border border-slate-700 text-center text-slate-400">
                    Você não tem um próximo oponente definido no momento.
                </div>
             )}

             <h2 className="text-lg font-bold text-white mb-4 border-t border-slate-800 pt-6">Outros Adversários da Liga</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.filter(t => !t.isPlayer && t.id !== nextOpponent?.id).map(t => (
                  <div key={t.id} className="bg-slate-800 p-4 rounded border border-slate-700">
                     <div className="flex justify-between mb-2">
                        <span className="font-bold text-white">{t.name}</span>
                        <span className="text-xs text-slate-500">#{teams.findIndex(x => x.id === t.id) + 1}</span>
                     </div>
                     <div className="text-xs text-slate-400 grid grid-cols-2 gap-y-1 mb-3">
                        <span>Defesa: <span className="text-slate-200">{t.tactics.structure}</span></span>
                        <span>Ritmo: <span className="text-slate-200">{t.tactics.tempo}</span></span>
                     </div>
                     
                     <div className="mt-2 pt-2 border-t border-slate-700">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Últimos Jogos:</span>
                        <MatchHistoryList teamId={t.id} />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {appState === AppState.MATCH_RESULT && currentMatch && userTeam && teams.find(t => t.id === currentMatch.homeTeamId) && teams.find(t => t.id === currentMatch.awayTeamId) && (
          <MatchView 
            match={currentMatch} 
            homeTeam={teams.find(t => t.id === currentMatch.homeTeamId)!} 
            awayTeam={teams.find(t => t.id === currentMatch.awayTeamId)!} 
            onContinue={advanceRound} 
          />
        )}

      </main>
    </div>
  );
}

// Simple Nav Button Component
const NavBtn = ({ icon, label, active, onClick }: any) => {
  const getIcon = () => {
    if(icon === 'dashboard') return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />;
    if(icon === 'tactics') return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
    if(icon === 'search') return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
    return null;
  };

  return (
    <button 
      onClick={onClick} 
      className={`p-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 group ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
      title={label}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {getIcon()}
      </svg>
      <span className="text-[10px] font-bold md:hidden lg:hidden">{label}</span>
    </button>
  );
};