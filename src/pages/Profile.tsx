import React, { useState } from 'react';
import {
  User, Target, TrendingUp, Zap, ChevronRight, AlertTriangle,
  Trash2, Check, Edit3, Weight
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { GoalType, ExperienceLevel } from '@/types';

const GOALS: { value: GoalType; label: string; desc: string }[] = [
  { value: 'strength',    label: 'Force',       desc: '3–5 reps, charges max' },
  { value: 'hypertrophy', label: 'Hypertrophie', desc: '8–12 reps, croissance musculaire' },
  { value: 'endurance',   label: 'Endurance',    desc: '15+ reps, volume élevé' },
  { value: 'general',     label: 'Général',      desc: 'Équilibre force / volume' },
];

const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner',     label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced',     label: 'Avancé' },
];

const GOAL_ICON: Record<GoalType, React.ReactNode> = {
  strength:    <Zap size={16} className="text-yellow-400" />,
  hypertrophy: <TrendingUp size={16} className="text-orange-400" />,
  endurance:   <TrendingUp size={16} className="text-green-400" />,
  general:     <Target size={16} className="text-indigo-400" />,
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">{title}</h2>
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon, label, value, onClick, danger
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#1a1a1a] last:border-0 text-left transition-colors ${onClick ? 'hover:bg-[#181818]' : 'cursor-default'} ${danger ? 'text-red-400' : ''}`}
    >
      {icon && <div className="w-7 flex items-center justify-center text-slate-500 flex-shrink-0">{icon}</div>}
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value !== undefined && (
        <span className="text-sm text-slate-500">{value}</span>
      )}
      {onClick && !danger && <ChevronRight size={14} className="text-slate-700 flex-shrink-0" />}
    </button>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e1e]">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-sm">Fermer</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, sessions, personalRecords, updateUser } = useStore(s => ({
    user: s.user,
    sessions: s.sessions,
    personalRecords: s.personalRecords,
    updateUser: s.updateUser,
  }));

  const [editName, setEditName] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [editLevel, setEditLevel] = useState(false);
  const [editBodyweight, setEditBodyweight] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempBW, setTempBW] = useState(String(user.bodyweight ?? ''));

  const completedSessions = sessions.filter(s => s.completed);
  const totalVolume = sessions
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.exercises.reduce((es, we) =>
      es + we.sets.reduce((ss, set) => ss + (set.completed ? set.weight * set.reps : 0), 0), 0
    ), 0);

  const goalLabel = GOALS.find(g => g.value === user.goal)?.label ?? '–';
  const levelLabel = LEVELS.find(l => l.value === user.experienceLevel)?.label ?? '–';

  function resetAllData() {
    useStore.setState({
      sessions: [],
      personalRecords: [],
      activeWorkout: null,
    });
    setShowReset(false);
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <div className="pt-12 pb-2 px-4">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-slate-400 text-sm mt-1">Tes paramètres et statistiques</p>
      </div>

      {/* Avatar / name */}
      <div className="flex flex-col items-center gap-3 px-4">
        <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-orange-400">
            {user.name.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl">{user.name || 'Athlète'}</div>
          <div className="text-sm text-slate-400">{levelLabel} · {goalLabel}</div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <StatCard label="Séances" value={String(completedSessions.length)} />
        <StatCard label="Records" value={String(personalRecords.length)} />
        <StatCard
          label="Volume total"
          value={totalVolume >= 1000000
            ? `${(totalVolume / 1000000).toFixed(1)}M`
            : totalVolume >= 1000
            ? `${(totalVolume / 1000).toFixed(0)}t`
            : `${Math.round(totalVolume)}kg`}
        />
      </div>

      {/* Identity */}
      <div className="px-4">
        <Section title="Identité">
          <Row
            icon={<User size={16} />}
            label="Prénom"
            value={user.name || 'Non renseigné'}
            onClick={() => { setTempName(user.name); setEditName(true); }}
          />
          <Row
            icon={<Weight size={16} />}
            label="Poids de corps"
            value={user.bodyweight ? `${user.bodyweight}kg` : 'Non renseigné'}
            onClick={() => { setTempBW(String(user.bodyweight ?? '')); setEditBodyweight(true); }}
          />
        </Section>
      </div>

      {/* Training settings */}
      <div className="px-4">
        <Section title="Entraînement">
          <Row
            icon={GOAL_ICON[user.goal]}
            label="Objectif"
            value={goalLabel}
            onClick={() => setEditGoal(true)}
          />
          <Row
            icon={<TrendingUp size={16} />}
            label="Niveau"
            value={levelLabel}
            onClick={() => setEditLevel(true)}
          />
        </Section>
      </div>

      {/* Algorithm info */}
      <div className="px-4">
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-orange-400" />
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Comment l'IA apprend</div>
              <div className="text-xs text-slate-400 leading-relaxed space-y-1">
                <p>• Analyse tes 3 dernières séances par exercice</p>
                <p>• Détecte plateaux, décharges et progressions</p>
                <p>• Adapte les charges selon ton RPE (effort perçu)</p>
                <p>• Calcule ton 1RM estimé avec les formules Brzycki & Epley</p>
                <p>• Plus tu t'entraînes, plus les recommandations sont précises</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="px-4">
        <Section title="Zone de danger">
          <Row
            icon={<Trash2 size={16} />}
            label="Effacer toutes les données"
            danger
            onClick={() => setShowReset(true)}
          />
        </Section>
      </div>

      {/* Edit modals */}
      {editName && (
        <EditModal title="Modifier le prénom" onClose={() => setEditName(false)}>
          <input
            type="text"
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            autoFocus
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 mb-4"
          />
          <button
            onClick={() => { updateUser({ name: tempName.trim() || user.name }); setEditName(false); }}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 rounded-xl font-semibold text-sm transition-colors"
          >
            Enregistrer
          </button>
        </EditModal>
      )}

      {editBodyweight && (
        <EditModal title="Poids de corps" onClose={() => setEditBodyweight(false)}>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="number"
              value={tempBW}
              onChange={e => setTempBW(e.target.value)}
              autoFocus
              placeholder="75"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
            />
            <span className="text-slate-400 font-medium">kg</span>
          </div>
          <button
            onClick={() => {
              const bw = parseFloat(tempBW);
              updateUser({ bodyweight: isNaN(bw) ? undefined : bw });
              setEditBodyweight(false);
            }}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 rounded-xl font-semibold text-sm transition-colors"
          >
            Enregistrer
          </button>
        </EditModal>
      )}

      {editGoal && (
        <EditModal title="Objectif d'entraînement" onClose={() => setEditGoal(false)}>
          <div className="space-y-2 mb-4">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => { updateUser({ goal: g.value }); setEditGoal(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  user.goal === g.value ? 'border-orange-500 bg-orange-500/10' : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                }`}
              >
                {user.goal === g.value ? (
                  <Check size={14} className="text-orange-400 flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#3a3a3a] flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm font-semibold">{g.label}</div>
                  <div className="text-xs text-slate-500">{g.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </EditModal>
      )}

      {editLevel && (
        <EditModal title="Niveau d'expérience" onClose={() => setEditLevel(false)}>
          <div className="space-y-2">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => { updateUser({ experienceLevel: l.value }); setEditLevel(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  user.experienceLevel === l.value ? 'border-orange-500 bg-orange-500/10' : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                }`}
              >
                {user.experienceLevel === l.value ? (
                  <Check size={14} className="text-orange-400 flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#3a3a3a] flex-shrink-0" />
                )}
                <span className="text-sm font-semibold">{l.label}</span>
              </button>
            ))}
          </div>
        </EditModal>
      )}

      {showReset && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 animate-slide-up text-center">
            <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Effacer toutes les données ?</h3>
            <p className="text-sm text-slate-400 mb-6">Toutes tes séances et records seront définitivement supprimés. Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)} className="flex-1 py-3 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-sm font-medium transition-colors">
                Annuler
              </button>
              <button onClick={resetAllData} className="flex-1 py-3 bg-red-500 hover:bg-red-400 rounded-xl text-sm font-bold text-white transition-colors">
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
