import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { TrendingUp, Trophy, ChevronDown, Dumbbell, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EXERCISES, MUSCLE_GROUPS, EXERCISE_MAP } from '@/data/exercises';
import type { ExerciseProgressEntry } from '@/store/useStore';

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name} :</span>
          <span className="font-bold" style={{ color: p.color }}>
            {typeof p.value === 'number' ? `${p.value.toFixed(1)}kg` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Exercise progress chart ───────────────────────────────────────────────────

function ExerciseChart({ exerciseId }: { exerciseId: string }) {
  const getExerciseProgressData = useStore(s => s.getExerciseProgressData);
  const data: ExerciseProgressEntry[] = getExerciseProgressData(exerciseId);
  const [metric, setMetric] = useState<'est1RM' | 'maxWeight' | 'volume'>('est1RM');

  const metricConfig = {
    est1RM:    { label: '1RM estimé', color: '#f97316', unit: 'kg' },
    maxWeight: { label: 'Charge max',  color: '#6366f1', unit: 'kg' },
    volume:    { label: 'Volume',      color: '#22c55e', unit: 'kg' },
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Activity size={32} className="mb-2 opacity-40" />
        <p className="text-sm">Pas encore de données pour cet exercice</p>
      </div>
    );
  }

  const cfg = metricConfig[metric];

  // Progress summary
  const first = data[0];
  const last = data[data.length - 1];
  const progress = first[metric] > 0 ? ((last[metric] - first[metric]) / first[metric]) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Metric tabs */}
      <div className="flex gap-2">
        {(Object.entries(metricConfig) as [typeof metric, typeof metricConfig[typeof metric]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              metric === key ? 'bg-orange-500 text-white' : 'bg-[#1a1a1a] text-slate-400 hover:text-white'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Progress indicator */}
      {data.length >= 2 && (
        <div className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-xl">
          <div>
            <div className="text-xs text-slate-500">1ère séance</div>
            <div className="font-bold text-sm">{first[metric].toFixed(1)}{cfg.unit}</div>
          </div>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <div className={`text-sm font-bold ${progress > 0 ? 'text-green-400' : progress < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {progress > 0 ? '+' : ''}{progress.toFixed(1)}%
          </div>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <div>
            <div className="text-xs text-slate-500">Dernière séance</div>
            <div className="font-bold text-sm">{last[metric].toFixed(1)}{cfg.unit}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey={metric}
              name={cfg.label}
              stroke={cfg.color}
              strokeWidth={2}
              dot={{ fill: cfg.color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Session history table */}
      <div className="space-y-1">
        <div className="flex text-[10px] text-slate-600 uppercase tracking-wide px-2">
          <span className="w-14">Date</span>
          <span className="flex-1 text-center">Charge</span>
          <span className="flex-1 text-center">1RM est.</span>
          <span className="flex-1 text-center">Volume</span>
          <span className="flex-1 text-center">Reps</span>
        </div>
        {[...data].reverse().slice(0, 8).map((d, i) => (
          <div key={i} className="flex items-center px-2 py-1.5 rounded-lg hover:bg-[#1a1a1a] text-sm transition-colors">
            <span className="w-14 text-xs text-slate-500">{d.displayDate}</span>
            <span className="flex-1 text-center font-medium">{d.maxWeight}kg</span>
            <span className="flex-1 text-center text-orange-400 text-xs">{d.est1RM.toFixed(1)}kg</span>
            <span className="flex-1 text-center text-xs text-slate-400">
              {d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}t` : `${Math.round(d.volume)}kg`}
            </span>
            <span className="flex-1 text-center text-xs text-slate-400">{d.totalReps}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Volume par muscle ─────────────────────────────────────────────────────────

function MuscleVolumeChart() {
  const getMuscleWeeklyVolume = useStore(s => s.getMuscleWeeklyVolume);
  const volume = getMuscleWeeklyVolume();

  const data = MUSCLE_GROUPS.map(mg => ({
    name: mg.label,
    volume: Math.round((volume[mg.id] ?? 0)),
    color: mg.color,
  })).sort((a, b) => b.volume - a.volume);

  const maxVol = Math.max(...data.map(d => d.volume), 1);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Volume par groupe musculaire — 7 derniers jours</p>
      {data.map(d => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="w-20 text-xs text-slate-400 text-right flex-shrink-0">{d.name}</span>
          <div className="flex-1 h-5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d.volume / maxVol) * 100}%`,
                background: d.color,
                opacity: d.volume > 0 ? 1 : 0.2,
                minWidth: d.volume > 0 ? '8px' : '0',
              }}
            />
          </div>
          <span className="w-16 text-xs font-medium text-right flex-shrink-0" style={{ color: d.volume > 0 ? d.color : '#444' }}>
            {d.volume > 0 ? (d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}t` : `${d.volume}kg`) : '–'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Personal records panel ────────────────────────────────────────────────────

function PRPanel({ exerciseId }: { exerciseId: string }) {
  const prs = useStore(s => s.getPersonalRecordsFor(exerciseId));
  if (prs.length === 0) return (
    <p className="text-sm text-slate-500 text-center py-4">Pas encore de records — continue à t'entraîner !</p>
  );

  return (
    <div className="space-y-2">
      {prs.map((pr, i) => (
        <div key={i} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
          <div className="w-8 h-8 bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <Trophy size={16} className="text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500">
              {pr.type === 'estimated1rm' ? '1RM estimé' : pr.type === 'weight' ? 'Charge maximale' : 'Volume max'}
            </div>
            <div className="font-bold text-orange-400">{pr.value.toFixed(1)}kg</div>
          </div>
          <div className="text-xs text-slate-600">
            {new Date(pr.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Exercise selector ─────────────────────────────────────────────────────────

function ExerciseSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const sessions = useStore(s => s.sessions);
  const [open, setOpen] = useState(false);

  // Only show exercises that have been trained
  const trainedIds = new Set(
    sessions.flatMap(s => s.exercises.map(e => e.exerciseId))
  );
  const trainedExercises = EXERCISES.filter(e => trainedIds.has(e.id));

  const selected = EXERCISES.find(e => e.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm"
      >
        <span className="font-medium truncate">{selected?.name ?? 'Choisir un exercice'}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
          {trainedExercises.length === 0 ? (
            <div className="p-4 text-sm text-slate-500 text-center">Aucun exercice entraîné</div>
          ) : trainedExercises.map(e => (
            <button
              key={e.id}
              onClick={() => { onChange(e.id); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-[#222] transition-colors ${value === e.id ? 'text-orange-400' : 'text-slate-300'}`}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Progress Page ────────────────────────────────────────────────────────

type Tab = 'exercise' | 'volume' | 'records';

export default function ProgressPage() {
  const [tab, setTab] = useState<Tab>('exercise');
  const [selectedExercise, setSelectedExercise] = useState('');

  const sessions = useStore(s => s.sessions);
  const completedSessions = sessions.filter(s => s.completed);

  // Auto-select first trained exercise
  React.useEffect(() => {
    if (!selectedExercise && completedSessions.length > 0) {
      const firstId = completedSessions[completedSessions.length - 1]?.exercises[0]?.exerciseId;
      if (firstId) setSelectedExercise(firstId);
    }
  }, [completedSessions.length]);

  return (
    <div className="flex flex-col pb-4">
      <div className="pt-12 pb-4 px-4">
        <h1 className="text-2xl font-bold">Progrès</h1>
        <p className="text-slate-400 text-sm mt-1">Tes performances au fil du temps</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {([
          ['exercise', 'Par exercice'],
          ['volume',   'Volume musculaire'],
          ['records',  'Records'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              tab === t ? 'bg-orange-500 text-white' : 'bg-[#111] text-slate-400 hover:text-white border border-[#1e1e1e]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === 'exercise' && (
          <div className="space-y-4">
            <ExerciseSelector value={selectedExercise} onChange={setSelectedExercise} />
            {selectedExercise && (
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
                <ExerciseChart exerciseId={selectedExercise} />
              </div>
            )}
            {!selectedExercise && (
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
                <TrendingUp size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Sélectionne un exercice pour voir ta progression</p>
              </div>
            )}
          </div>
        )}

        {tab === 'volume' && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
            <MuscleVolumeChart />
          </div>
        )}

        {tab === 'records' && (
          <div className="space-y-4">
            <ExerciseSelector value={selectedExercise} onChange={setSelectedExercise} />
            {selectedExercise ? (
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={16} className="text-yellow-400" />
                  <span className="font-semibold text-sm">
                    {EXERCISE_MAP.get(selectedExercise)?.name}
                  </span>
                </div>
                <PRPanel exerciseId={selectedExercise} />
              </div>
            ) : (
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
                <Trophy size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Sélectionne un exercice pour voir tes records</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
