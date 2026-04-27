import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, X, Check, Clock, Dumbbell, Search, ArrowLeft,
  ChevronLeft, ChevronRight, TrendingUp, Play, SkipForward, RefreshCw, Flame,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EXERCISES, MUSCLE_GROUPS, EXERCISE_MAP } from '@/data/exercises';
import type { Exercise, MuscleGroup } from '@/types';
import { estimate1RM, TIME_BASED_EXERCISES } from '@/utils/calculations';

// ── Exercise Picker (unchanged) ───────────────────────────────────────────────

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
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e1e]">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a1a]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un exercice..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          {query && <button onClick={() => setQuery('')} className="text-slate-500"><X size={14} /></button>}
        </div>
      </div>
      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none border-b border-[#1e1e1e]">
        <FilterChip label="Tous" active={filterMuscle === 'all'} onClick={() => setFilterMuscle('all')} />
        {MUSCLE_GROUPS.map(mg => (
          <FilterChip key={mg.id} label={mg.label} active={filterMuscle === mg.id as MuscleGroup}
            onClick={() => setFilterMuscle(mg.id as MuscleGroup)} />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucun exercice trouvé</p>
          </div>
        )}
        {filtered.map(exercise => (
          <button key={exercise.id} onClick={() => { onSelect(exercise.id); onClose(); }}
            className="w-full flex items-center gap-4 p-4 hover:bg-[#141414] border-b border-[#111] text-left">
            <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{exercise.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                {exercise.category} · {exercise.muscles.slice(0, 2).join(', ')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-orange-500 text-white' : 'bg-[#1a1a1a] text-slate-400 hover:text-white'
      }`}>
      {label}
    </button>
  );
}

// ── Exercise Replace Picker ───────────────────────────────────────────────────

function ExerciseReplacePicker({
  currentMuscles,
  onSelect,
  onClose,
}: {
  currentMuscles: MuscleGroup[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>(
    currentMuscles.length > 0 ? currentMuscles[0] : 'all'
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = EXERCISES.filter(e => {
    const matchQuery = e.name.toLowerCase().includes(query.toLowerCase());
    const matchMuscle = filterMuscle === 'all' || e.muscles.includes(filterMuscle);
    return matchQuery && matchMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-slide-up">
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e1e]">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a1a]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="text-sm font-semibold">Remplacer l&apos;exercice</div>
          <div className="text-[10px] text-slate-500">Mêmes muscles ciblés</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e]">
        <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          {query && <button onClick={() => setQuery('')} className="text-slate-500"><X size={14} /></button>}
        </div>
      </div>
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-none border-b border-[#1e1e1e]">
        <FilterChip label="Tous" active={filterMuscle === 'all'} onClick={() => setFilterMuscle('all')} />
        {currentMuscles.map(m => {
          const mg = MUSCLE_GROUPS.find(g => g.id === m);
          return mg ? (
            <FilterChip key={m} label={mg.label} active={filterMuscle === m}
              onClick={() => setFilterMuscle(m)} />
          ) : null;
        })}
        {MUSCLE_GROUPS.filter(g => !currentMuscles.includes(g.id as MuscleGroup)).map(mg => (
          <FilterChip key={mg.id} label={mg.label} active={filterMuscle === mg.id as MuscleGroup}
            onClick={() => setFilterMuscle(mg.id as MuscleGroup)} />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucun exercice trouvé</p>
          </div>
        )}
        {filtered.map(exercise => (
          <button key={exercise.id} onClick={() => { onSelect(exercise.id); onClose(); }}
            className="w-full flex items-center gap-4 p-4 hover:bg-[#141414] border-b border-[#111] text-left">
            <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{exercise.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                {exercise.category} · {exercise.muscles.slice(0, 2).join(', ')}
              </div>
            </div>
            {currentMuscles.some(m => exercise.muscles.includes(m)) && (
              <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Même muscle
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Duration Timer (plank etc.) ───────────────────────────────────────────────

function DurationTimer({
  targetSec,
  onComplete,
}: {
  targetSec: number;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(targetSec);
  const [running, setRunning]     = useState(false);
  const endTimeRef   = useRef<number | null>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const completedRef = useRef(false);
  const wakeLockRef  = useRef<WakeLockSentinel | null>(null);

  const acquireWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator)
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
    } catch { /* not critical */ }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  // Schedule all audio upfront using the Web Audio clock.
  // Web Audio continues to play scheduled events even when the screen is locked.
  function scheduleAudio(ctx: AudioContext, secUntilEnd: number) {
    const beep = (freq: number, atTime: number, dur: number, vol = 0.35) => {
      try {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setValueAtTime(vol, atTime);
        gain.gain.exponentialRampToValueAtTime(0.001, atTime + dur);
        osc.start(atTime);
        osc.stop(atTime + dur + 0.05);
      } catch { /* ignore */ }
    };

    // Countdown ticks at 5 s, 4 s, 3 s, 2 s, 1 s before end
    for (let i = Math.min(5, Math.floor(secUntilEnd) - 1); i >= 1; i--) {
      const t = ctx.currentTime + secUntilEnd - i;
      if (t > ctx.currentTime + 0.05) beep(880, t, 0.08, 0.25);
    }

    // Final alarm
    const endT = ctx.currentTime + secUntilEnd;
    if (endT > ctx.currentTime + 0.05) {
      beep(880,  endT,       0.15);
      beep(1100, endT + 0.2, 0.15);
      beep(1320, endT + 0.4, 0.3, 0.5);
    }
  }

  function finish() {
    if (completedRef.current) return;
    completedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    releaseWakeLock();
    setTimeout(onComplete, 900);
  }

  function start() {
    if (remaining <= 0) return;
    completedRef.current = false;

    // Fresh AudioContext each start so we can cancel on pause by closing it
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;
      audioCtxRef.current = ctx;
      scheduleAudio(ctx, remaining);
    } catch { /* audio unavailable */ }

    endTimeRef.current = Date.now() + remaining * 1000;
    setRunning(true);
    acquireWakeLock();

    intervalRef.current = setInterval(() => {
      if (!endTimeRef.current) return;
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) finish();
    }, 200);
  }

  function pause() {
    setRunning(false);
    releaseWakeLock();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current  = null;
    // Closing the context cancels all scheduled sounds
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }

  function reset() {
    pause();
    completedRef.current = false;
    setRemaining(targetSec);
  }

  // Re-sync display & wake lock when coming back from locked screen
  useEffect(() => {
    const onVisible = () => {
      if (!running || !endTimeRef.current) return;
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) { finish(); return; }
      if (!wakeLockRef.current) acquireWakeLock();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [running]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    audioCtxRef.current?.close().catch(() => {});
    releaseWakeLock();
  }, []);

  const r      = 52;
  const circ   = 2 * Math.PI * r;
  const progress   = targetSec > 0 ? (targetSec - remaining) / targetSec : 0;
  const isEndZone  = running && remaining <= 5 && remaining > 0;
  const mins       = Math.floor(remaining / 60);
  const secs       = remaining % 60;
  const timeStr    = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${remaining}`;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e1e1e" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={remaining === 0 ? '#22c55e' : isEndZone ? '#ef4444' : '#f97316'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold tabular-nums leading-none transition-colors ${isEndZone ? 'text-red-400' : ''}`}>
            {timeStr}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            {remaining === 0 ? 'Terminé !' : mins > 0 ? 'min' : 'secondes'}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {remaining > 0 && (
          <button
            onClick={running ? pause : start}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold text-sm transition-colors"
          >
            {running ? '⏸ Pause' : <><Play size={14} /> Démarrer</>}
          </button>
        )}
        <button
          onClick={reset}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-slate-400"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Finish modal (unchanged) ──────────────────────────────────────────────────

function FinishModal({ onConfirm, onCancel }: { onConfirm: (notes: string) => void; onCancel: () => void }) {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 animate-slide-up">
        <h3 className="font-bold text-lg mb-4">Terminer la séance</h3>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optionnel) — ressenti, observations..."
          rows={3}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange-500 mb-4" />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-sm font-medium">Annuler</button>
          <button onClick={() => onConfirm(notes)} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-sm font-bold">Terminer</button>
        </div>
      </div>
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
  const diffSec = Math.floor((now - new Date(startTime).getTime()) / 1000);
  return `${Math.floor(diffSec / 60).toString().padStart(2, '0')}:${(diffSec % 60).toString().padStart(2, '0')}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ABS_IDS = new Set(['crunch', 'plank', 'leg_raise', 'russian_twist', 'cable_crunch', 'ab_rollout']);

function defaultRestSec(exerciseId: string): number {
  if (ABS_IDS.has(exerciseId)) return 45;
  const ex = EXERCISE_MAP.get(exerciseId);
  return ex?.category === 'compound' ? 90 : 60;
}

// ── NumStepper ────────────────────────────────────────────────────────────────

function NumStepper({
  value, onChange, step, unit, label,
}: {
  value: number; onChange: (v: number) => void; step: number; unit: string; label: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={() => onChange(Math.max(0, parseFloat((value - step).toFixed(2))))}
          className="w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-slate-300 font-bold text-lg flex items-center justify-center flex-shrink-0 active:scale-95"
        >−</button>
        <div className="flex-1 flex flex-col items-center">
          <input
            type="number"
            value={value || ''}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            className="w-full text-center text-2xl font-bold bg-transparent focus:outline-none"
            placeholder="0"
          />
          <span className="text-xs text-slate-500 -mt-1">{unit}</span>
        </div>
        <button
          onClick={() => onChange(parseFloat((value + step).toFixed(2)))}
          className="w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-slate-300 font-bold text-lg flex items-center justify-center flex-shrink-0 active:scale-95"
        >+</button>
      </div>
    </div>
  );
}

// ── RPE Selector ──────────────────────────────────────────────────────────────

function RpeSelector({ value, onChange }: { value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">Effort (RPE)</span>
      <div className="flex gap-1.5">
        {[6, 7, 8, 9, 10].map(r => (
          <button
            key={r}
            onClick={() => onChange(value === r ? undefined : r)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
              value === r
                ? 'bg-orange-500 text-white scale-110'
                : 'bg-[#1a1a1a] text-slate-400 hover:bg-[#222]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Rest Screen ───────────────────────────────────────────────────────────────

function RestScreen({
  remaining,
  total,
  nextLabel,
  onSkip,
}: {
  remaining: number;
  total: number;
  nextLabel: string;
  onSkip: () => void;
}) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? (total - remaining) / total : 1;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-10">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Repos</div>

      {/* Circular countdown */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r={r} fill="none" stroke="#1e1e1e" strokeWidth="8" />
          <circle
            cx="56" cy="56" r={r} fill="none"
            stroke="#f97316" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums leading-none">{remaining}</span>
          <span className="text-xs text-slate-500 mt-1">secondes</span>
        </div>
      </div>

      {/* Next up */}
      <div className="text-center px-4 py-3 bg-[#111] border border-[#1e1e1e] rounded-2xl w-full max-w-xs">
        <div className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Ensuite</div>
        <div className="font-semibold text-sm">{nextLabel}</div>
      </div>

      <button
        onClick={onSkip}
        className="flex items-center gap-2 px-8 py-3 bg-[#1a1a1a] hover:bg-[#222] rounded-2xl text-sm font-semibold transition-colors"
      >
        <SkipForward size={14} />
        Passer le repos
      </button>
    </div>
  );
}

// ── Step Phase (warmup & cooldown) ───────────────────────────────────────────

function StepPhase({
  title, subtitle, steps, stepIdx, onNext, onPrev, onSkip,
  skipLabel, finishLabel, elapsed, workoutName, icon, children,
}: {
  title: string; subtitle: string; steps: string[]; stepIdx: number;
  onNext: () => void; onPrev: () => void; onSkip: () => void;
  skipLabel: string; finishLabel: string;
  elapsed: string; workoutName: string;
  icon: React.ReactNode; children?: React.ReactNode;
}) {
  const isLast = stepIdx >= steps.length - 1;
  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{workoutName}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
              <Clock size={11} /><span>{elapsed}</span>
            </div>
          </div>
          <button onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-300 bg-[#1a1a1a] px-3 py-1.5 rounded-lg">
            {skipLabel}
          </button>
        </div>
        {/* Step progress bar */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
              i < stepIdx ? 'bg-green-500' : i === stepIdx ? 'bg-orange-500' : 'bg-[#1a1a1a]'
            }`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {icon}
          {title} — {subtitle} · Étape {stepIdx + 1}/{steps.length}
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 w-full">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-400 font-bold text-lg">{stepIdx + 1}</span>
          </div>
          <p className="text-lg font-semibold leading-relaxed">{steps[stepIdx]}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex gap-3">
        <button onClick={onPrev} disabled={stepIdx === 0}
          className="w-12 h-14 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-30 rounded-2xl transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button onClick={onNext}
          className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-bold text-base transition-colors">
          {isLast ? finishLabel : 'Étape suivante →'}
        </button>
      </div>

      {children}
    </div>
  );
}

// ── Guided Workout ────────────────────────────────────────────────────────────

type Phase = 'exercise' | 'rest';
type Section = 'warmup' | 'main' | 'cooldown';
type PendingAction = 'next-set' | 'next-exercise' | 'finish';

function GuidedWorkout() {
  const {
    activeWorkout, cancelWorkout, addExerciseToWorkout,
    replaceExerciseInWorkout, updateSet, finishWorkout, getRecommendationFor,
  } = useStore(s => ({
    activeWorkout: s.activeWorkout!,
    cancelWorkout: s.cancelWorkout,
    addExerciseToWorkout: s.addExerciseToWorkout,
    replaceExerciseInWorkout: s.replaceExerciseInWorkout,
    updateSet: s.updateSet,
    finishWorkout: s.finishWorkout,
    getRecommendationFor: s.getRecommendationFor,
  }));

  const warmupSteps   = activeWorkout.warmupSteps  ?? [];
  const cooldownSteps = activeWorkout.cooldownSteps ?? [];

  const [exIdx, setExIdx]         = useState(0);
  const [phase, setPhase]         = useState<Phase>('exercise');
  const [restRemaining, setRest]  = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [nextLabel, setNextLabel] = useState('');
  const [pending, setPending]     = useState<PendingAction>('next-set');
  const [section, setSection]     = useState<Section>(warmupSteps.length > 0 ? 'warmup' : 'main');
  const [stepIdx, setStepIdx]     = useState(0);
  const [showPicker, setShowPicker]   = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [showFinish, setShowFinish]   = useState(false);
  const [showRec, setShowRec]         = useState(false);

  const elapsed = useElapsed(activeWorkout.startTime);

  // Clamp exIdx if exercises shrink
  useEffect(() => {
    const len = activeWorkout.exercises.length;
    if (len > 0 && exIdx >= len) setExIdx(len - 1);
  }, [activeWorkout.exercises.length]);

  // Rest countdown
  useEffect(() => {
    if (phase !== 'rest') return;
    if (restRemaining <= 0) { advanceAfterRest(); return; }
    const id = setTimeout(() => setRest(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, restRemaining]);

  const advanceAfterRest = useCallback(() => {
    setPhase('exercise');
    if (pending === 'next-exercise') {
      setExIdx(i => i + 1);
      setShowRec(false);
    } else if (pending === 'finish') {
      if (cooldownSteps.length > 0) {
        setSection('cooldown');
        setStepIdx(0);
      } else {
        setShowFinish(true);
      }
    }
    // 'next-set': stay on same exercise; next incomplete set is auto-derived
  }, [pending, cooldownSteps.length]);

  function nextWarmupStep() {
    if (stepIdx < warmupSteps.length - 1) setStepIdx(i => i + 1);
    else { setSection('main'); setStepIdx(0); }
  }

  function nextCooldownStep() {
    if (stepIdx < cooldownSteps.length - 1) setStepIdx(i => i + 1);
    else setShowFinish(true);
  }

  function completeSet(setIdx: number) {
    const exercises = activeWorkout.exercises;
    const we = exercises[exIdx];
    updateSet(exIdx, setIdx, { completed: true });

    const isLastSet     = setIdx >= we.sets.length - 1;
    const isLastExercise = exIdx >= exercises.length - 1;
    const restSec = defaultRestSec(we.exerciseId);

    if (isLastSet && isLastExercise) {
      // Last set of last exercise — short rest then finish
      setPending('finish');
      setNextLabel('Séance terminée 🎉');
      setRestTotal(restSec);
      setRest(restSec);
      setPhase('rest');
    } else if (isLastSet) {
      const nextEx = EXERCISE_MAP.get(exercises[exIdx + 1].exerciseId);
      setPending('next-exercise');
      setNextLabel(`Exercice suivant : ${nextEx?.name ?? ''}`);
      setRestTotal(restSec);
      setRest(restSec);
      setPhase('rest');
    } else {
      const nextSet = we.sets[setIdx + 1];
      const isTime  = TIME_BASED_EXERCISES.has(we.exerciseId);
      const nextWeight = nextSet.weight > 0 ? `${nextSet.weight}kg × ` : '';
      const repsLabel  = isTime ? `${nextSet.reps}s` : `${nextSet.reps} reps`;
      setPending('next-set');
      setNextLabel(`Série ${setIdx + 2}/${we.sets.length} — ${nextWeight}${repsLabel}`);
      setRestTotal(restSec);
      setRest(restSec);
      setPhase('rest');
    }
  }

  const finishModal = showFinish ? (
    <FinishModal
      onConfirm={notes => { finishWorkout(notes); setShowFinish(false); }}
      onCancel={() => setShowFinish(false)}
    />
  ) : null;

  // ── Warmup phase ────────────────────────────────────────────────────────────
  if (section === 'warmup') {
    return (
      <StepPhase
        title="Échauffement" subtitle="5 min"
        steps={warmupSteps} stepIdx={stepIdx}
        onNext={nextWarmupStep}
        onPrev={() => setStepIdx(i => Math.max(0, i - 1))}
        onSkip={() => { setSection('main'); setStepIdx(0); }}
        skipLabel="Passer →"
        finishLabel="Commencer la séance"
        elapsed={elapsed} workoutName={activeWorkout.name}
        icon={<Flame size={13} className="text-orange-400" />}
      >{finishModal}</StepPhase>
    );
  }

  // ── Cooldown phase ──────────────────────────────────────────────────────────
  if (section === 'cooldown') {
    return (
      <StepPhase
        title="Étirements" subtitle="5 min"
        steps={cooldownSteps} stepIdx={stepIdx}
        onNext={nextCooldownStep}
        onPrev={() => setStepIdx(i => Math.max(0, i - 1))}
        onSkip={() => setShowFinish(true)}
        skipLabel="Terminer →"
        finishLabel="Terminer la séance"
        elapsed={elapsed} workoutName={activeWorkout.name}
        icon={<span className="text-sm leading-none">🧘</span>}
      >{finishModal}</StepPhase>
    );
  }

  // Empty workout
  if (activeWorkout.exercises.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-10">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
          <Dumbbell size={30} className="text-orange-400" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg mb-1">Aucun exercice</p>
          <p className="text-slate-500 text-sm">Ajoute des exercices pour commencer la séance guidée.</p>
        </div>
        <button onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold">
          <Plus size={18} />
          Ajouter un exercice
        </button>
        {showPicker && <ExercisePicker onSelect={id => { addExerciseToWorkout(id); setShowPicker(false); }} onClose={() => setShowPicker(false)} />}
      </div>
    );
  }

  const exercises = activeWorkout.exercises;
  const safeIdx = Math.min(exIdx, exercises.length - 1);
  const we = exercises[safeIdx];
  const ex = EXERCISE_MAP.get(we.exerciseId);

  const completedCount = exercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const totalCount = exercises.flatMap(e => e.sets).length;

  // First incomplete set in current exercise
  const currentSetIdx = we.sets.findIndex(s => !s.completed);
  const allSetsComplete = currentSetIdx === -1;
  const currentSet = allSetsComplete ? null : we.sets[currentSetIdx];
  const rec = getRecommendationFor(we.exerciseId);

  // ── Rest phase ────────────────────────────────────────────────────────────
  if (phase === 'rest') {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex items-center justify-between border-b border-[#1e1e1e]">
          <div>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{activeWorkout.name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
              <Clock size={11} /><span>{elapsed}</span>
              <span>·</span>
              <span>{completedCount}/{totalCount} séries</span>
            </div>
          </div>
          <button onClick={() => advanceAfterRest()}
            className="text-xs text-slate-500 hover:text-slate-300 bg-[#1a1a1a] px-3 py-1.5 rounded-lg">
            Passer →
          </button>
        </div>
        <RestScreen
          remaining={restRemaining}
          total={restTotal}
          nextLabel={nextLabel}
          onSkip={advanceAfterRest}
        />
      </div>
    );
  }

  // ── Exercise phase ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">

      {/* ── Top header ── */}
      <div className="px-4 pt-12 pb-3 border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{activeWorkout.name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
              <Clock size={11} /><span>{elapsed}</span>
              <span>·</span><span>{completedCount}/{totalCount} séries</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { if (confirm('Annuler la séance ? Les données seront perdues.')) cancelWorkout(); }}
              className="text-xs text-slate-500 hover:text-red-400 bg-[#1a1a1a] px-3 py-1.5 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button onClick={() => setShowFinish(true)}
              className="text-xs font-semibold bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg">
              Terminer
            </button>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* ── Exercise progress dots ── */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {exercises.map((e, i) => {
          const done = e.sets.every(s => s.completed);
          const partial = !done && e.sets.some(s => s.completed);
          const isCurrent = i === safeIdx;
          return (
            <button key={i} onClick={() => { setPhase('exercise'); setExIdx(i); setShowRec(false); }}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${isCurrent ? 'bg-orange-500/10' : 'hover:bg-[#1a1a1a]'}`}>
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                done ? 'bg-green-500' : partial ? 'bg-orange-500' : isCurrent ? 'bg-orange-400' : 'bg-[#2a2a2a]'
              }`} />
              <span className={`text-[9px] font-medium truncate max-w-[52px] ${isCurrent ? 'text-orange-400' : 'text-slate-600'}`}>
                {EXERCISE_MAP.get(e.exerciseId)?.name.split(' ')[0] ?? '?'}
              </span>
            </button>
          );
        })}
        <button onClick={() => setShowPicker(true)}
          className="flex-shrink-0 flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-[#1a1a1a]">
          <div className="w-2.5 h-2.5 rounded-full border border-dashed border-[#3a3a3a]" />
          <span className="text-[9px] text-slate-600">+</span>
        </button>
      </div>

      {/* ── Exercise card ── */}
      <div className="flex-1 flex flex-col px-4 gap-4 pb-4">

        {/* Exercise header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500/15 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Dumbbell size={22} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg leading-tight truncate">{ex?.name ?? '—'}</h2>
            <p className="text-xs text-slate-500 capitalize mt-0.5">
              {ex?.muscles.join(' · ')} · {ex?.category === 'compound' ? 'Composé' : 'Isolation'}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setShowReplace(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1a1a1a] text-slate-500 hover:text-slate-300 transition-colors"
              title="Remplacer l'exercice"
            >
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setShowRec(v => !v)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showRec ? 'bg-orange-500/20 text-orange-400' : 'bg-[#1a1a1a] text-slate-500 hover:text-slate-300'}`}>
              <TrendingUp size={15} />
            </button>
          </div>
        </div>

        {/* Recommendation */}
        {showRec && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-3 text-xs">
            <div className="font-semibold text-orange-400 mb-1">{rec.title}</div>
            <div className="text-slate-400 leading-relaxed">{rec.message}</div>
            <div className="mt-2 font-semibold text-slate-300">
              Cible : {rec.suggestedWeight}kg × {rec.suggestedSets}×{rec.suggestedReps[0]}–{rec.suggestedReps[1]} reps
            </div>
            {rec.estimated1RM != null && (
              <div className="text-slate-500 mt-1">1RM estimé : {rec.estimated1RM}kg</div>
            )}
          </div>
        )}

        {/* Completed sets */}
        {we.sets.some(s => s.completed) && (
          <div className="space-y-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-wide">Séries complétées</p>
            {we.sets.map((s, i) => !s.completed ? null : (
              <div key={s.id}
                className="flex items-center gap-3 px-3 py-2 bg-green-500/5 border border-green-500/10 rounded-xl text-sm">
                <Check size={13} className="text-green-500 flex-shrink-0" />
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  Série {i + 1}
                  {i === 0 && <Flame size={9} className="text-orange-400" />}
                </span>
                <span className="font-semibold flex-1">
                  {TIME_BASED_EXERCISES.has(we.exerciseId)
                    ? `${s.reps}s`
                    : s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps} reps`}
                </span>
                {s.rpe && <span className="text-[10px] text-slate-500">RPE {s.rpe}</span>}
                {!TIME_BASED_EXERCISES.has(we.exerciseId) && s.weight > 0 && s.reps > 0 && (
                  <span className="text-[10px] text-slate-600">~{estimate1RM(s.weight, s.reps).toFixed(0)}kg 1RM</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Current set input */}
        {allSetsComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <Check size={30} className="text-green-500" />
            </div>
            <p className="font-semibold text-lg">Exercice terminé !</p>
            {safeIdx < exercises.length - 1 ? (
              <button onClick={() => { setExIdx(safeIdx + 1); setShowRec(false); }}
                className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold">
                Exercice suivant <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={() => setShowFinish(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold">
                Terminer la séance <Check size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 flex flex-col gap-5">
            {/* Set label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Série {currentSetIdx + 1} / {we.sets.length}
                </span>
                {currentSetIdx === 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full font-semibold">
                    <Flame size={9} />
                    Échauffement
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {we.sets.map((s, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${
                    s.completed ? 'bg-green-500' : i === currentSetIdx ? 'bg-orange-400' : 'bg-[#2a2a2a]'
                  }`} />
                ))}
              </div>
            </div>

            {/* Weight + Reps OR Duration timer */}
            {TIME_BASED_EXERCISES.has(we.exerciseId) ? (
              <>
                {/* Adjust duration before starting — key includes reps so timer resets on change */}
                <NumStepper
                  value={currentSet!.reps}
                  onChange={v => updateSet(safeIdx, currentSetIdx, { reps: Math.max(5, Math.round(v)) })}
                  step={5}
                  unit="sec"
                  label="Durée cible"
                />
                <DurationTimer
                  key={`${we.exerciseId}-${currentSetIdx}-${currentSet!.reps}`}
                  targetSec={currentSet!.reps}
                  onComplete={() => completeSet(currentSetIdx)}
                />
                <button
                  onClick={() => completeSet(currentSetIdx)}
                  className="w-full py-3 bg-[#1a1a1a] hover:bg-[#222] rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Check size={15} className="text-green-500" />
                  Marquer terminé manuellement
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <NumStepper
                  value={currentSet!.weight}
                  onChange={v => updateSet(safeIdx, currentSetIdx, { weight: v })}
                  step={ex?.category === 'compound' ? 2.5 : 1}
                  unit="kg"
                  label="Charge"
                />
                <div className="w-px bg-[#1e1e1e]" />
                <NumStepper
                  value={currentSet!.reps}
                  onChange={v => updateSet(safeIdx, currentSetIdx, { reps: Math.max(0, Math.round(v)) })}
                  step={1}
                  unit="reps"
                  label="Répétitions"
                />
              </div>
            )}

            {/* RPE (not shown for time-based) */}
            {!TIME_BASED_EXERCISES.has(we.exerciseId) && (
              <RpeSelector
                value={currentSet!.rpe}
                onChange={rpe => updateSet(safeIdx, currentSetIdx, { rpe })}
              />
            )}

            {/* Complete button — auto-triggered by DurationTimer for time-based */}
            {!TIME_BASED_EXERCISES.has(we.exerciseId) && (
              <button
                onClick={() => completeSet(currentSetIdx)}
                disabled={currentSet!.reps === 0}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <Check size={18} />
                Série terminée
              </button>
            )}
          </div>
        )}

        {/* Exercise navigation */}
        <div className="flex items-center gap-3 mt-auto pt-2">
          <button
            onClick={() => { if (safeIdx > 0) { setExIdx(safeIdx - 1); setShowRec(false); } }}
            disabled={safeIdx === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-30 rounded-xl text-xs font-medium transition-colors"
          >
            <ChevronLeft size={14} />
            Précédent
          </button>
          <span className="text-xs text-slate-600 flex-shrink-0">
            {safeIdx + 1}/{exercises.length}
          </span>
          <button
            onClick={() => { if (safeIdx < exercises.length - 1) { setExIdx(safeIdx + 1); setShowRec(false); } }}
            disabled={safeIdx >= exercises.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-30 rounded-xl text-xs font-medium transition-colors"
          >
            Suivant
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {showPicker && (
        <ExercisePicker
          onSelect={id => { addExerciseToWorkout(id); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showReplace && ex && (
        <ExerciseReplacePicker
          currentMuscles={ex.muscles}
          onSelect={id => { replaceExerciseInWorkout(safeIdx, id); setShowReplace(false); setShowRec(false); }}
          onClose={() => setShowReplace(false)}
        />
      )}

      {finishModal}
    </div>
  );
}

// ── Main Workout Page ─────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const { activeWorkout, startWorkout } = useStore(s => ({
    activeWorkout: s.activeWorkout,
    startWorkout: s.startWorkout,
  }));

  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
          <Dumbbell size={40} className="text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pas de séance en cours</h2>
        <p className="text-slate-400 text-sm mb-8">Lance une séance depuis l&apos;Accueil ou un Programme.</p>
        <button
          onClick={() => {
            const name = `Séance ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}`;
            startWorkout(name);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-2xl font-semibold transition-colors"
        >
          <Play size={18} />
          Démarrer une séance libre
        </button>
      </div>
    );
  }

  return <GuidedWorkout />;
}
