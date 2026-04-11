import React, { useState } from 'react';
import { Dumbbell, Target, TrendingUp, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { GoalType, ExperienceLevel } from '@/types';

const GOALS: { value: GoalType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'strength',    label: 'Force',        desc: 'Charges maximales, faibles répétitions',  icon: <Zap size={20} /> },
  { value: 'hypertrophy', label: 'Hypertrophie',  desc: 'Croissance musculaire, 8-12 reps',        icon: <Dumbbell size={20} /> },
  { value: 'endurance',   label: 'Endurance',     desc: 'Volume élevé, nombreuses répétitions',    icon: <TrendingUp size={20} /> },
  { value: 'general',     label: 'Général',       desc: 'Équilibre force et volume',               icon: <Target size={20} /> },
];

const LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Débutant',      desc: 'Moins d\'1 an d\'entraînement' },
  { value: 'intermediate', label: 'Intermédiaire', desc: '1-3 ans d\'entraînement' },
  { value: 'advanced',     label: 'Avancé',        desc: '3+ ans d\'entraînement' },
];

export default function Onboarding() {
  const completeSetup = useStore(s => s.completeSetup);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<GoalType>('hypertrophy');
  const [level, setLevel] = useState<ExperienceLevel>('beginner');

  function finish() {
    completeSetup({
      name: name.trim() || 'Athlète',
      goal,
      experienceLevel: level,
      weightUnit: 'kg',
      setupDone: true,
    });
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
      {step === 0 && (
        <div className="w-full max-w-sm animate-slide-up text-center">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <Dumbbell size={40} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">FonkySport</h1>
          <p className="text-slate-400 mb-8">Ton entraîneur personnel qui apprend de toi et s'adapte à tes performances.</p>
          <div className="space-y-3 text-left mb-8">
            {['Suivi des charges par exercice', 'Recommandations basées sur ta progression', 'Détection des plateaux et décharges', '1RM estimé & records personnels'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="w-full py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold text-base transition-colors">
            Commencer
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-sm text-orange-400 mb-1 font-medium">Étape 1 / 3</p>
          <h2 className="text-2xl font-bold mb-6">Comment tu t'appelles ?</h2>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ton prénom"
            autoFocus
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-orange-500 transition-colors mb-6"
          />
          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold transition-colors"
          >
            Suivant
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-sm text-orange-400 mb-1 font-medium">Étape 2 / 3</p>
          <h2 className="text-2xl font-bold mb-2">Ton objectif principal</h2>
          <p className="text-slate-400 text-sm mb-6">Adapte les recommandations à ton but.</p>
          <div className="space-y-3 mb-6">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  goal === g.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${goal === g.value ? 'bg-orange-500/20 text-orange-400' : 'bg-[#222] text-slate-400'}`}>
                  {g.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{g.label}</div>
                  <div className="text-xs text-slate-400">{g.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="w-full py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold transition-colors">
            Suivant
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-sm text-orange-400 mb-1 font-medium">Étape 3 / 3</p>
          <h2 className="text-2xl font-bold mb-2">Ton niveau</h2>
          <p className="text-slate-400 text-sm mb-6">Adapte les charges de départ et la progression.</p>
          <div className="space-y-3 mb-6">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  level === l.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                }`}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${level === l.value ? 'bg-orange-500' : 'bg-[#333]'}`} />
                <div>
                  <div className="font-semibold text-sm">{l.label}</div>
                  <div className="text-xs text-slate-400">{l.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={finish} className="w-full py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold transition-colors">
            C'est parti ! 🚀
          </button>
        </div>
      )}

      {/* Step indicator */}
      {step > 0 && (
        <div className="flex gap-2 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-orange-500' : i < step ? 'w-4 bg-orange-700' : 'w-4 bg-[#333]'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
