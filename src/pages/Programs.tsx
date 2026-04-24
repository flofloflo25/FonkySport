import React, { useState } from 'react';
import {
  Dumbbell, Clock, ChevronRight, ChevronLeft, Play,
  Flame, ChevronDown, ChevronUp, CheckCircle2, Circle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PROGRAMS, type WorkoutProgram, type ProgramExercise } from '@/data/programs';
import { EXERCISE_MAP } from '@/data/exercises';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     'Débutant',
  intermediate: 'Intermédiaire',
  advanced:     'Avancé',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'text-green-400 bg-green-500/10',
  intermediate: 'text-yellow-400 bg-yellow-500/10',
  advanced:     'text-red-400 bg-red-500/10',
};

const TYPE_LABEL: Record<string, string> = {
  upper_body: 'Haut du corps',
  full_body:  'Full Body',
};

function repsLabel(ex: ProgramExercise): string {
  const [lo, hi] = ex.reps;
  if (ex.isTime) return lo === hi ? `${lo}s` : `${lo}–${hi}s`;
  return lo === hi ? `${lo} reps` : `${lo}–${hi} reps`;
}

function restLabel(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}min` : `${m}min${s}s`;
}

// ── Program Card ──────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  onSelect,
}: {
  program: WorkoutProgram;
  onSelect: (p: WorkoutProgram) => void;
}) {
  return (
    <button
      onClick={() => onSelect(program)}
      className="w-full bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 text-left hover:bg-[#161616] transition-colors active:scale-[0.98]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: program.color + '20' }}
        >
          <Dumbbell size={18} style={{ color: program.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight">{program.name}</div>
          <div className="text-slate-400 text-xs mt-0.5">{program.subtitle}</div>
        </div>
        <ChevronRight size={16} className="text-slate-600 flex-shrink-0 mt-1" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[program.difficulty]}`}>
          {DIFFICULTY_LABEL[program.difficulty]}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-400 bg-slate-800">
          {TYPE_LABEL[program.type]}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-400 bg-slate-800 flex items-center gap-1">
          <Clock size={9} />
          {program.durationMin} min
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
        {program.description}
      </p>

      {/* Muscle dots */}
      <div className="flex flex-wrap gap-1 mt-3">
        {program.targetMuscles.map(m => (
          <span key={m} className="text-[10px] text-slate-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full capitalize">
            {m}
          </span>
        ))}
      </div>
    </button>
  );
}

// ── Expandable section ────────────────────────────────────────────────────────

function ExpandSection({
  title,
  icon,
  items,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#181818] transition-colors"
      >
        <div className="flex-1 flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 flex-shrink-0 mt-1.5" />
              <span className="text-xs text-slate-400 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Exercise row in program detail ────────────────────────────────────────────

function ExerciseDetailRow({
  programEx,
  index,
  isAbs,
}: {
  programEx: ProgramExercise;
  index: number;
  isAbs: boolean;
}) {
  const ex = EXERCISE_MAP.get(programEx.exerciseId);
  if (!ex) return null;

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-[#1a1a1a] last:border-0 ${isAbs ? 'opacity-80' : ''}`}>
      <span className="text-xs text-slate-600 w-5 text-right flex-shrink-0">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{ex.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-orange-400 font-semibold">
            {programEx.sets} × {repsLabel(programEx)}
          </span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500">repos {restLabel(programEx.restSec)}</span>
        </div>
        {programEx.notes && (
          <div className="text-[10px] text-slate-500 italic mt-0.5">{programEx.notes}</div>
        )}
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
        ex.category === 'compound'
          ? 'bg-orange-500/10 text-orange-400'
          : 'bg-slate-700/50 text-slate-500'
      }`}>
        {ex.category === 'compound' ? 'Composé' : 'Isolation'}
      </span>
    </div>
  );
}

// ── Program Detail ────────────────────────────────────────────────────────────

const ABS_IDS = new Set(['crunch', 'plank', 'leg_raise', 'russian_twist', 'cable_crunch', 'ab_rollout']);

function ProgramDetail({
  program,
  onBack,
  onStart,
}: {
  program: WorkoutProgram;
  onBack: () => void;
  onStart: (p: WorkoutProgram) => void;
}) {
  const mainExercises = program.exercises.filter(e => !ABS_IDS.has(e.exerciseId));
  const absExercises  = program.exercises.filter(e =>  ABS_IDS.has(e.exerciseId));

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Back + header */}
      <div className="pt-12 px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm mb-4"
        >
          <ChevronLeft size={16} />
          Programmes
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: program.color + '20' }}
          >
            <Dumbbell size={24} style={{ color: program.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <p className="text-slate-400 text-sm">{program.subtitle}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[program.difficulty]}`}>
            {DIFFICULTY_LABEL[program.difficulty]}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-slate-400 bg-slate-800">
            {TYPE_LABEL[program.type]}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-slate-400 bg-slate-800 flex items-center gap-1">
            <Clock size={11} />
            {program.durationMin} min total
          </span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mt-3">{program.description}</p>
      </div>

      {/* Warmup */}
      <div className="px-4">
        <ExpandSection
          title="Échauffement — 5 min"
          icon={<Flame size={14} className="text-orange-400" />}
          items={program.warmup}
          defaultOpen
        />
      </div>

      {/* Main exercises */}
      <div className="px-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Exercices principaux
        </h2>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl px-4">
          {mainExercises.map((ex, i) => (
            <ExerciseDetailRow key={ex.exerciseId} programEx={ex} index={i} isAbs={false} />
          ))}
        </div>
      </div>

      {/* Abs */}
      {absExercises.length > 0 && (
        <div className="px-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Abdominaux
          </h2>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl px-4">
            {absExercises.map((ex, i) => (
              <ExerciseDetailRow key={ex.exerciseId} programEx={ex} index={i} isAbs />
            ))}
          </div>
        </div>
      )}

      {/* Cooldown */}
      <div className="px-4">
        <ExpandSection
          title="Étirements — 5 min"
          icon={<span className="text-sm">🧘</span>}
          items={program.cooldown}
          defaultOpen
        />
      </div>

      {/* Start button */}
      <div className="px-4">
        <button
          onClick={() => onStart(program)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-bold text-base transition-colors"
        >
          <Play size={18} />
          Démarrer la séance
        </button>
        <p className="text-[10px] text-slate-600 text-center mt-2">
          Les derniers poids utilisés seront pré-remplis automatiquement
        </p>
      </div>
    </div>
  );
}

// ── Main Programs Page ────────────────────────────────────────────────────────

type Filter = 'all' | 'upper_body' | 'full_body';

export default function ProgramsPage() {
  const startWorkoutWithPlan = useStore(s => s.startWorkoutWithPlan);

  const [selected, setSelected]   = useState<WorkoutProgram | null>(null);
  const [filter, setFilter]       = useState<Filter>('all');

  function handleStart(program: WorkoutProgram) {
    startWorkoutWithPlan(
      program.name + ' — ' + program.subtitle,
      program.exercises.map(e => e.exerciseId),
      program.warmup,
      program.cooldown,
      program.exercises.map(e => e.sets),
    );
  }

  if (selected) {
    return (
      <ProgramDetail
        program={selected}
        onBack={() => setSelected(null)}
        onStart={handleStart}
      />
    );
  }

  const filtered = filter === 'all' ? PROGRAMS : PROGRAMS.filter(p => p.type === filter);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="pt-12 pb-2 px-4">
        <h1 className="text-2xl font-bold">Programmes</h1>
        <p className="text-slate-400 text-sm mt-1">
          {PROGRAMS.length} programmes prêts à l&apos;emploi · 5 min échauffement + étirements inclus
        </p>
      </div>

      {/* Filter tabs */}
      <div className="px-4">
        <div className="flex gap-2">
          {([ ['all', 'Tous'], ['upper_body', 'Haut du corps'], ['full_body', 'Full Body'] ] as [Filter, string][]).map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === value
                    ? 'bg-orange-500 text-white'
                    : 'bg-[#1a1a1a] text-slate-400 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Program cards */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.map(program => (
          <ProgramCard key={program.id} program={program} onSelect={setSelected} />
        ))}
      </div>
    </div>
  );
}
