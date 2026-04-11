import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, X, Check, ChevronDown, ChevronUp, Clock, Dumbbell,
  Search, ArrowLeft, Trash2, Info, TrendingUp
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EXERCISES, MUSCLE_GROUPS, EXERCISE_MAP } from '@/data/exercises';
import type { Exercise, MuscleGroup } from '@/types';
import { estimate1RM } from '@/utils/calculations';

// ── Exercise Picker Modal ─────────────────────────────────────────────────────

function ExercisePicker({ onSelect, onClose }: { onSelect: (id: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = EXERCISES.filter(e => {
    const matchQuery = e.name.toLowerCase().includes(query.toLowerCase());
    const matchMuscle = filterMuscle === 'all' || e.muscles.includes(filterMuscle);
    return matchQuery && matchMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e1e]">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a1a]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un exercice..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Muscle filter */}
      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none border-b border-[#1e1e1e]">
        <FilterChip label="Tous" active={filterMuscle === 'all'} onClick={() => setFilterMuscle('all')} />
        {MUSCLE_GROUPS.map(mg => (
          <FilterChip
            key={mg.id}
            label={mg.label}
            active={filterMuscle === mg.id as MuscleGroup}
            onClick={() => setFilterMuscle(mg.id as MuscleGroup)}
            color={mg.color}
          />
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucun exercice trouvé</p>
          </div>
        )}
        {filtered.map(exercise => (
          <button
            key={exercise.id}
            onClick={() => { onSelect(exercise.id); onClose(); }}
            className="w-full flex items-center gap-4 p-4 hover:bg-[#141414] border-b border-[#111] text-left"
          >
            <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{exercise.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 capitalize">{exercise.category}</span>
                <span className="text-slate-700">·</span>
                <span className="text-[10px] text-slate-500">{exercise.muscles.slice(0, 2).join(', ')}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-600 capitalize">{exercise.equipment}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-orange-500 text-white' : 'bg-[#1a1a1a] text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

// ── Set Row ───────────────────────────────────────────────────────────────────

function SetRow({
  set,
  index,
  onChange,
  onRemove,
}: {
  set: { id: string; weight: number; reps: number; completed: boolean; rpe?: number };
  index: number;
  onChange: (patch: Partial<typeof set>) => void;
  onRemove: () => void;
}) {
  const est1rm = set.completed && set.weight > 0 && set.reps > 0
    ? estimate1RM(set.weight, set.reps)
    : null;

  return (
    <div className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-colors ${set.completed ? 'bg-green-500/5' : 'bg-[#1a1a1a]'}`}>
      {/* Set number */}
      <button
        onClick={() => onChange({ completed: !set.completed })}
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
          set.completed ? 'bg-green-500 text-white' : 'bg-[#222] text-slate-500 hover:bg-[#2a2a2a]'
        }`}
      >
        {set.completed ? <Check size={14} /> : index + 1}
      </button>

      {/* Weight */}
      <div className="flex-1 flex items-center gap-1 bg-[#111]/60 rounded-lg px-2 py-1.5">
        <input
          type="number"
          value={set.weight || ''}
          onChange={e => onChange({ weight: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          className="w-full bg-transparent text-center text-sm font-semibold focus:outline-none"
        />
        <span className="text-xs text-slate-600">kg</span>
      </div>

      <span className="text-slate-600 text-sm">×</span>

      {/* Reps */}
      <div className="flex-1 flex items-center gap-1 bg-[#111]/60 rounded-lg px-2 py-1.5">
        <input
          type="number"
          value={set.reps || ''}
          onChange={e => onChange({ reps: parseInt(e.target.value) || 0 })}
          placeholder="0"
          className="w-full bg-transparent text-center text-sm font-semibold focus:outline-none"
        />
        <span className="text-xs text-slate-600">reps</span>
      </div>

      {/* RPE */}
      <select
        value={set.rpe ?? ''}
        onChange={e => onChange({ rpe: e.target.value ? parseInt(e.target.value) : undefined })}
        className="w-14 bg-[#111]/60 rounded-lg px-1 py-1.5 text-xs text-slate-400 focus:outline-none appearance-none text-center"
      >
        <option value="">RPE</option>
        {[6, 7, 8, 9, 10].map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* Remove */}
      <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exerciseIndex,
  exerciseId,
  sets,
}: {
  exerciseIndex: number;
  exerciseId: string;
  sets: Array<{ id: string; weight: number; reps: number; completed: boolean; rpe?: number }>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showRec, setShowRec] = useState(false);
  const {
    addSetToExercise,
    removeSet,
    updateSet,
    removeExerciseFromWorkout,
    getRecommendationFor,
  } = useStore(s => ({
    addSetToExercise: s.addSetToExercise,
    removeSet: s.removeSet,
    updateSet: s.updateSet,
    removeExerciseFromWorkout: s.removeExerciseFromWorkout,
    getRecommendationFor: s.getRecommendationFor,
  }));

  const exercise = EXERCISE_MAP.get(exerciseId);

  const rec = getRecommendationFor(exerciseId);
  const completedCount = sets.filter(s => s.completed).length;

  if (!exercise) return null;

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => setCollapsed(!collapsed)} className="flex-1 flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{exercise.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {completedCount}/{sets.length} séries complétées
            </div>
          </div>
          {collapsed ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronUp size={16} className="text-slate-500" />}
        </button>

        <button
          onClick={() => setShowRec(!showRec)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${showRec ? 'bg-orange-500/20 text-orange-400' : 'bg-[#1a1a1a] text-slate-500 hover:text-slate-300'}`}
        >
          <TrendingUp size={14} />
        </button>
        <button
          onClick={() => removeExerciseFromWorkout(exerciseIndex)}
          className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Recommendation banner */}
      {showRec && (
        <div className="mx-4 mb-3 p-3 bg-[#1a1a1a] rounded-xl border border-orange-500/20 animate-fade-in">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-orange-400 mb-0.5">{rec.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{rec.message}</div>
              {rec.estimated1RM && (
                <div className="mt-1.5 text-xs">
                  <span className="text-slate-500">1RM estimé : </span>
                  <span className="font-semibold text-slate-200">{rec.estimated1RM}kg</span>
                  {rec.progressPercent !== undefined && (
                    <span className={`ml-2 font-medium ${rec.progressPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {rec.progressPercent > 0 ? '+' : ''}{rec.progressPercent.toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
              <div className="mt-2 text-[10px] text-slate-600">
                Suggéré : {rec.suggestedWeight}kg × {rec.suggestedSets}×{rec.suggestedReps[0]}-{rec.suggestedReps[1]}
                {' '}({rec.sessionsAnalyzed} séances analysées)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sets */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-3 text-[10px] text-slate-600 uppercase tracking-wide">
            <div className="w-7" />
            <div className="flex-1 text-center">Charge</div>
            <div className="w-4" />
            <div className="flex-1 text-center">Reps</div>
            <div className="w-14 text-center">RPE</div>
            <div className="w-7" />
          </div>

          {sets.map((set, si) => (
            <SetRow
              key={set.id}
              set={set}
              index={si}
              onChange={patch => updateSet(exerciseIndex, si, patch)}
              onRemove={() => removeSet(exerciseIndex, si)}
            />
          ))}

          <button
            onClick={() => addSetToExercise(exerciseIndex)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#2a2a2a] rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:border-[#3a3a3a] transition-colors"
          >
            <Plus size={14} />
            Ajouter une série
          </button>
        </div>
      )}
    </div>
  );
}

// ── Timer hook ────────────────────────────────────────────────────────────────

function useElapsed(startTime: string | null): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  if (!startTime) return '00:00';
  const diffMs = now - new Date(startTime).getTime();
  const totalSec = Math.floor(diffMs / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Finish modal ──────────────────────────────────────────────────────────────

function FinishModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}) {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 animate-slide-up">
        <h3 className="font-bold text-lg mb-4">Terminer la séance</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optionnel) — ressenti, observations..."
          rows={3}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-sm font-medium transition-colors">
            Annuler
          </button>
          <button onClick={() => onConfirm(notes)} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-sm font-bold text-white transition-colors">
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Workout Page ─────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const {
    activeWorkout,
    startWorkout,
    cancelWorkout,
    addExerciseToWorkout,
    finishWorkout,
    navigate,
  } = useStore(s => ({
    activeWorkout: s.activeWorkout,
    startWorkout: s.startWorkout,
    cancelWorkout: s.cancelWorkout,
    addExerciseToWorkout: s.addExerciseToWorkout,
    finishWorkout: s.finishWorkout,
    navigate: s.navigate,
  }));

  const elapsed = useElapsed(activeWorkout?.startTime ?? null);

  // No active workout
  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
          <Dumbbell size={40} className="text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pas de séance en cours</h2>
        <p className="text-slate-400 text-sm text-center mb-8">Lance une nouvelle séance pour commencer à logger tes exercices.</p>
        <button
          onClick={() => {
            const name = `Séance ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}`;
            startWorkout(name);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold transition-colors"
        >
          <Plus size={18} />
          Démarrer une séance
        </button>
      </div>
    );
  }

  const completedSets = activeWorkout.exercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const totalSets = activeWorkout.exercises.flatMap(e => e.sets).length;

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold truncate max-w-[180px] text-sm">{activeWorkout.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <div className="flex items-center gap-1">
                <Clock size={11} />
                <span>{elapsed}</span>
              </div>
              <span>{completedSets}/{totalSets} séries</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Annuler la séance ? Toutes les données seront perdues.')) cancelWorkout();
              }}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 bg-[#1a1a1a] rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => setShowFinish(true)}
              className="px-4 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: totalSets > 0 ? `${(completedSets / totalSets) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-3 p-4">
        {activeWorkout.exercises.length === 0 && (
          <div className="bg-[#111] border border-dashed border-[#2a2a2a] rounded-2xl p-8 text-center">
            <Dumbbell size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Ajoute ton premier exercice ci-dessous</p>
          </div>
        )}

        {activeWorkout.exercises.map((we, i) => (
          <ExerciseCard
            key={`${we.exerciseId}-${i}`}
            exerciseIndex={i}
            exerciseId={we.exerciseId}
            sets={we.sets}
          />
        ))}

        {/* Add exercise */}
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center justify-center gap-2 py-4 border border-dashed border-[#2a2a2a] rounded-2xl text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium">Ajouter un exercice</span>
        </button>
      </div>

      {showPicker && (
        <ExercisePicker
          onSelect={addExerciseToWorkout}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showFinish && (
        <FinishModal
          onConfirm={notes => { finishWorkout(notes); setShowFinish(false); }}
          onCancel={() => setShowFinish(false)}
        />
      )}
    </div>
  );
}
