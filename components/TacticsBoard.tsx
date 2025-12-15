import React from 'react';
import { Tactics, DefStructure, DefLine, Pressing, BuildUp, Creation, Tempo, OffBall, SetPieces } from '../types';

interface Props {
  tactics: Tactics;
  onUpdate: (t: Tactics) => void;
  disabled?: boolean;
}

const TacticsBoard: React.FC<Props> = ({ tactics, onUpdate, disabled }) => {
  
  const update = (key: keyof Tactics, value: any) => {
    onUpdate({ ...tactics, [key]: value });
  };

  const updateConditional = (key: string, value: any) => {
    onUpdate({ ...tactics, conditionals: { ...tactics.conditionals, [key]: value } });
  };

  const SelectGroup = ({ label, value, options, onChange }: any) => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Object.values(options).map((opt: any) => (
          <button
            key={opt}
            onClick={() => !disabled && onChange(opt)}
            className={`px-2 py-3 md:px-3 md:py-2 text-[10px] md:text-sm rounded border transition-all truncate ${
              value === opt
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 p-4 md:p-6 rounded-lg border border-slate-800 shadow-xl overflow-y-auto mb-20 md:mb-0">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        Prancheta Tática
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Defense */}
        <div className="space-y-4">
          <h3 className="text-emerald-400 font-bold border-b border-slate-700 pb-2 mb-4">Fase Defensiva</h3>
          <SelectGroup label="Estrutura" value={tactics.structure} options={DefStructure} onChange={(v: any) => update('structure', v)} />
          <SelectGroup label="Linha Defensiva" value={tactics.line} options={DefLine} onChange={(v: any) => update('line', v)} />
          <SelectGroup label="Pressão" value={tactics.pressing} options={Pressing} onChange={(v: any) => update('pressing', v)} />
          <SelectGroup label="Sem Bola" value={tactics.offBall} options={OffBall} onChange={(v: any) => update('offBall', v)} />
        </div>

        {/* Offense */}
        <div className="space-y-4">
          <h3 className="text-emerald-400 font-bold border-b border-slate-700 pb-2 mb-4">Fase Ofensiva</h3>
          <SelectGroup label="Construção" value={tactics.buildUp} options={BuildUp} onChange={(v: any) => update('buildUp', v)} />
          <SelectGroup label="Criação" value={tactics.creation} options={Creation} onChange={(v: any) => update('creation', v)} />
          <SelectGroup label="Ritmo" value={tactics.tempo} options={Tempo} onChange={(v: any) => update('tempo', v)} />
          <SelectGroup label="Bolas Paradas" value={tactics.setPieces} options={SetPieces} onChange={(v: any) => update('setPieces', v)} />
        </div>
      </div>

      {/* Conditionals */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <h3 className="text-emerald-400 font-bold border-b border-slate-700 pb-2 mb-4">Ajustes Dinâmicos (Condicionais)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <label className="font-bold text-slate-300 text-sm">Se estiver Ganhando</label>
             </div>
             <select 
                disabled={disabled}
                value={tactics.conditionals.winning}
                onChange={(e) => updateConditional('winning', e.target.value)}
                className="w-full bg-slate-900 text-white p-3 md:p-2 rounded border border-slate-600 text-sm"
              >
                <option value="maintain">Manter Tática</option>
                <option value="recuar">Recuar Linhas (Retranca)</option>
              </select>
          </div>

          <div className="bg-slate-800 p-4 rounded border border-slate-700">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <label className="font-bold text-slate-300 text-sm">Se estiver Perdendo</label>
             </div>
             <select 
                disabled={disabled}
                value={tactics.conditionals.losing}
                onChange={(e) => updateConditional('losing', e.target.value)}
                className="w-full bg-slate-900 text-white p-3 md:p-2 rounded border border-slate-600 text-sm"
              >
                <option value="maintain">Manter Tática</option>
                <option value="pressure_total">Pressão Total</option>
              </select>
          </div>

          <div className="bg-slate-800 p-4 rounded border border-slate-700">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <label className="font-bold text-slate-300 text-sm">Empate aos 70'</label>
             </div>
             <select 
                disabled={disabled}
                value={tactics.conditionals.draw70}
                onChange={(e) => updateConditional('draw70', e.target.value)}
                className="w-full bg-slate-900 text-white p-3 md:p-2 rounded border border-slate-600 text-sm"
              >
                <option value="maintain">Manter (Aceitar Empate)</option>
                <option value="risk_all">Arriscar Tudo (Ataque)</option>
              </select>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TacticsBoard;