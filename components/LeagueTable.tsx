import React from 'react';
import { Team } from '../types';

interface Props {
  teams: Team[];
}

const LeagueTable: React.FC<Props> = ({ teams }) => {
  // Sort teams
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
    const gdA = a.stats.gf - a.stats.ga;
    const gdB = b.stats.gf - b.stats.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.stats.gf !== a.stats.gf) return b.stats.gf - a.stats.gf;
    return b.stats.won - a.stats.won;
  });

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="font-bold text-white text-lg">Classificação</h2>
        <span className="text-xs text-slate-400">Critérios: PTS &gt; SG &gt; GP &gt; V</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
            <tr>
              <th scope="col" className="px-4 py-3 w-12 text-center">#</th>
              <th scope="col" className="px-4 py-3">Clube</th>
              <th scope="col" className="px-2 py-3 text-center">J</th>
              <th scope="col" className="px-2 py-3 text-center font-bold text-white">PTS</th>
              <th scope="col" className="px-2 py-3 text-center">V</th>
              <th scope="col" className="px-2 py-3 text-center">E</th>
              <th scope="col" className="px-2 py-3 text-center">D</th>
              <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">GP</th>
              <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">GC</th>
              <th scope="col" className="px-2 py-3 text-center">SG</th>
              <th scope="col" className="px-2 py-3 text-center hidden md:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
               const gd = team.stats.gf - team.stats.ga;
               const isUser = team.isPlayer;
               return (
                <tr key={team.id} className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${isUser ? 'bg-emerald-900/10' : ''}`}>
                  <td className={`px-4 py-3 text-center font-bold ${index < 4 ? 'text-blue-400' : index > sortedTeams.length - 4 ? 'text-red-400' : 'text-slate-500'}`}>
                    {index + 1}
                  </td>
                  <td className={`px-4 py-3 font-medium flex items-center gap-2 ${isUser ? 'text-emerald-400' : 'text-white'}`}>
                    {team.name}
                    {isUser && <span className="bg-emerald-500 text-slate-900 text-[10px] px-1 rounded font-bold">VOCÊ</span>}
                  </td>
                  <td className="px-2 py-3 text-center">{team.stats.played}</td>
                  <td className="px-2 py-3 text-center font-bold text-white bg-slate-800/30 rounded">{team.stats.pts}</td>
                  <td className="px-2 py-3 text-center">{team.stats.won}</td>
                  <td className="px-2 py-3 text-center">{team.stats.drawn}</td>
                  <td className="px-2 py-3 text-center">{team.stats.lost}</td>
                  <td className="px-2 py-3 text-center hidden sm:table-cell">{team.stats.gf}</td>
                  <td className="px-2 py-3 text-center hidden sm:table-cell">{team.stats.ga}</td>
                  <td className={`px-2 py-3 text-center font-medium ${gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {gd > 0 ? '+' : ''}{gd}
                  </td>
                  <td className="px-2 py-3 text-center hidden md:table-cell">
                    <div className="flex justify-center gap-1">
                      {team.form.slice(-5).map((r, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${r === 'W' ? 'bg-green-500' : r === 'D' ? 'bg-gray-400' : 'bg-red-500'}`}
                          title={r === 'W' ? 'Vitória' : r === 'D' ? 'Empate' : 'Derrota'}
                        ></div>
                      ))}
                    </div>
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueTable;