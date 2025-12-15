import React from 'react';
import { MatchResult, Team } from '../types';

interface Props {
  match: MatchResult;
  homeTeam: Team;
  awayTeam: Team;
  onContinue: () => void;
}

const MatchView: React.FC<Props> = ({ match, homeTeam, awayTeam, onContinue }) => {
  if (!match.stats) return null;

  const getScoreColor = (score: number, opponentScore: number) => {
    if (score > opponentScore) return "text-emerald-400";
    if (score < opponentScore) return "text-slate-200";
    return "text-slate-200";
  };

  const StatBar = ({ label, homeVal, awayVal, suffix = '' }: any) => {
    const total = homeVal + awayVal || 1;
    const homePct = (homeVal / total) * 100;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{homeVal}{suffix}</span>
          <span className="uppercase tracking-widest font-bold text-slate-500 text-[10px] md:text-xs">{label}</span>
          <span>{awayVal}{suffix}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full" style={{ width: `${homePct}%` }}></div>
          <div className="bg-red-500 h-full flex-1"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
      <div className="bg-slate-900 w-full md:max-w-2xl h-full md:h-auto rounded-none md:rounded-xl border-0 md:border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
        
        {/* Header - Scoreboard */}
        <div className="bg-slate-800 p-4 md:p-8 flex justify-between items-center border-b border-slate-700 relative shrink-0">
            <div className="text-center w-1/3 overflow-hidden px-1">
                <h3 className="text-sm md:text-xl font-bold text-white truncate">{homeTeam.name}</h3>
                <div className="text-[10px] md:text-xs text-emerald-400 mt-1 truncate">{homeTeam.tactics.structure}</div>
            </div>
            
            <div className="text-center w-1/3 flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-black text-white flex gap-2 md:gap-4 tracking-tighter">
                   <span className={getScoreColor(match.homeScore, match.awayScore)}>{match.homeScore}</span>
                   <span className="text-slate-600">:</span>
                   <span className={getScoreColor(match.awayScore, match.homeScore)}>{match.awayScore}</span>
                </div>
                <div className="bg-slate-700 text-slate-300 text-[10px] md:text-xs px-2 py-0.5 rounded mt-2">
                    FIM DE JOGO
                </div>
            </div>

            <div className="text-center w-1/3 overflow-hidden px-1">
                <h3 className="text-sm md:text-xl font-bold text-white truncate">{awayTeam.name}</h3>
                <div className="text-[10px] md:text-xs text-red-400 mt-1 truncate">{awayTeam.tactics.structure}</div>
            </div>
        </div>

        {/* Content - Stats & Feedback */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <h4 className="text-center text-slate-500 text-xs md:text-sm font-bold uppercase mb-6 tracking-widest">Estatísticas da Partida</h4>
            
            <div className="space-y-4 mb-8">
                <StatBar label="Posse de Bola" homeVal={match.stats.homePossession} awayVal={match.stats.awayPossession} suffix="%" />
                <StatBar label="Chutes" homeVal={match.stats.homeShots} awayVal={match.stats.awayShots} />
                <StatBar label="xG (Gols Esperados)" homeVal={match.stats.homeXG} awayVal={match.stats.awayXG} />
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h5 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 text-sm md:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Análise do Auxiliar
                </h5>
                <ul className="list-disc list-inside text-slate-300 text-xs md:text-sm space-y-2 md:space-y-1">
                    {match.stats.tacticalAnalysis.map((note, idx) => (
                        <li key={idx} className="leading-relaxed">{note}</li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 text-center shrink-0 safe-area-bottom">
            <button 
                onClick={onContinue}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-12 rounded shadow-lg transition-transform transform md:hover:scale-105 active:scale-95"
            >
                Continuar
            </button>
        </div>
      </div>
    </div>
  );
};

export default MatchView;