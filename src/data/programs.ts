// ── Pre-defined workout programs ──────────────────────────────────────────────

export type ProgramType = 'upper_body' | 'full_body';

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: [number, number];   // [min, max] — for isTime exercises: seconds
  restSec: number;
  isTime?: boolean;         // reps represent seconds (e.g. plank)
  notes?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  subtitle: string;
  type: ProgramType;
  durationMin: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  description: string;
  color: string;
  warmup: string[];
  exercises: ProgramExercise[];
  cooldown: string[];
}

// ── Programs ──────────────────────────────────────────────────────────────────

export const PROGRAMS: WorkoutProgram[] = [
  // ── Upper A ─────────────────────────────────────────────────────────────
  {
    id: 'upper_push',
    name: 'Upper A',
    subtitle: 'Push — Pec & Épaules',
    type: 'upper_body',
    durationMin: 50,
    difficulty: 'intermediate',
    targetMuscles: ['pectoraux', 'epaules', 'triceps', 'abdominaux'],
    description: 'Séance push complète axée sur les muscles pousseurs. Priorité aux mouvements composés pour maximiser la force, suivis d\'isolations pour sculpter.',
    color: '#f97316',
    warmup: [
      'Rotation des épaules vers l\'avant et vers l\'arrière — 30s',
      'Pompes légères (tempo lent) — 2 × 10',
      'Band pull-apart ou étirement pec au mur — 2 × 15',
      'Swing des bras croisés devant la poitrine — 30s',
      'Rotation du tronc debout — 30s de chaque côté',
    ],
    exercises: [
      { exerciseId: 'bench_press',      sets: 4, reps: [8,  10], restSec: 90  },
      { exerciseId: 'incline_db_bench', sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'db_ohp',           sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'lateral_raise',    sets: 3, reps: [12, 15], restSec: 60  },
      { exerciseId: 'tricep_pushdown',  sets: 3, reps: [12, 15], restSec: 60  },
      { exerciseId: 'crunch',           sets: 3, reps: [15, 20], restSec: 45  },
      { exerciseId: 'plank',            sets: 3, reps: [30, 45], restSec: 45, isTime: true, notes: 'Gainage strict, respire normalement' },
    ],
    cooldown: [
      'Étirement pectoraux à la porte — 30s de chaque côté',
      'Étirement épaule croisée devant la poitrine — 30s chaque',
      'Étirement triceps overhead (main derrière la tête) — 30s chaque',
      'Cobra yoga, poussée au sol — 30s',
      'Child\'s pose (posture enfant) — 60s',
    ],
  },

  // ── Upper B ─────────────────────────────────────────────────────────────
  {
    id: 'upper_pull',
    name: 'Upper B',
    subtitle: 'Pull — Dos & Biceps',
    type: 'upper_body',
    durationMin: 50,
    difficulty: 'intermediate',
    targetMuscles: ['dos', 'biceps', 'epaules', 'abdominaux'],
    description: 'Séance pull pour développer un dos large et des bras forts. Enchaîne tractions et rowing pour un maximum de stimulus musculaire.',
    color: '#6366f1',
    warmup: [
      'Rotation des épaules vers l\'avant et vers l\'arrière — 30s',
      'Rotation du buste assis (torsion) — 30s de chaque côté',
      'Traction australienne légère ou tirage poulie basse léger — 2 × 10',
      'Face pull léger pour réchauffer les rotateurs — 2 × 15',
      'Cat-Cow (dos-creux / dos-rond) à 4 pattes — 60s',
    ],
    exercises: [
      { exerciseId: 'pullup',        sets: 4, reps: [5,  8],  restSec: 90  },
      { exerciseId: 'barbell_row',   sets: 4, reps: [8,  10], restSec: 90  },
      { exerciseId: 'lat_pulldown',  sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'face_pull',     sets: 3, reps: [12, 15], restSec: 60  },
      { exerciseId: 'barbell_curl',  sets: 3, reps: [10, 12], restSec: 60  },
      { exerciseId: 'leg_raise',     sets: 3, reps: [12, 15], restSec: 45  },
      { exerciseId: 'russian_twist', sets: 3, reps: [16, 20], restSec: 45, notes: '8-10 de chaque côté' },
    ],
    cooldown: [
      'Suspension barre fixe bras tendus — 30s (étire tout le dos)',
      'Étirement grand dorsal assis, bras tendu au-dessus — 30s chaque',
      'Étirement biceps mur (paume contre mur, rotation) — 30s chaque',
      'Child\'s pose — 60s',
      'Rotation du cou lente, cercles complets — 30s',
    ],
  },

  // ── Upper C ─────────────────────────────────────────────────────────────
  {
    id: 'upper_full',
    name: 'Upper C',
    subtitle: 'Full Upper — Push & Pull',
    type: 'upper_body',
    durationMin: 50,
    difficulty: 'intermediate',
    targetMuscles: ['pectoraux', 'dos', 'epaules', 'biceps', 'triceps', 'abdominaux'],
    description: 'Séance haut du corps complète combinant poussée et tirage. Idéale pour équilibrer le développement musculaire et prévenir les déséquilibres posturaux.',
    color: '#06b6d4',
    warmup: [
      'Rotation complète des épaules en cercles — 30s chaque sens',
      'Pompes légères (2 × 10) + Cat-Cow (30s)',
      'Band pull-apart ou tirage élastique — 2 × 15',
      'Swing bras horizontaux croisés — 30s',
      'Rotation du tronc debout, bras tendus — 30s',
    ],
    exercises: [
      { exerciseId: 'bench_press',   sets: 3, reps: [8,  10], restSec: 90  },
      { exerciseId: 'barbell_row',   sets: 3, reps: [8,  10], restSec: 90  },
      { exerciseId: 'db_ohp',        sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'lat_pulldown',  sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'lateral_raise', sets: 3, reps: [12, 15], restSec: 60  },
      { exerciseId: 'hammer_curl',   sets: 3, reps: [12, 15], restSec: 60  },
      { exerciseId: 'crunch',        sets: 3, reps: [15, 20], restSec: 45  },
      { exerciseId: 'plank',         sets: 3, reps: [30, 45], restSec: 45, isTime: true },
    ],
    cooldown: [
      'Étirement pectoraux à la porte — 30s',
      'Étirement grand dorsal assis bras en l\'air — 30s chaque',
      'Étirement épaules croisées — 30s chaque',
      'Cobra yoga — 30s',
      'Child\'s pose — 60s',
    ],
  },

  // ── Full Body A ──────────────────────────────────────────────────────────
  {
    id: 'full_strength',
    name: 'Full Body A',
    subtitle: 'Force — Les 3 grands',
    type: 'full_body',
    durationMin: 55,
    difficulty: 'advanced',
    targetMuscles: ['jambes', 'pectoraux', 'dos', 'epaules', 'fessiers', 'abdominaux'],
    description: 'Programme de force basé sur les 3 mouvements fondamentaux. Charges lourdes, faibles répétitions. Temps de repos plus longs pour une récupération optimale entre les séries.',
    color: '#eab308',
    warmup: [
      'Squats au poids du corps, tempo lent — 2 × 10',
      'Hip circles (cercles de hanches) debout — 30s chaque sens',
      'Leg swings avant/arrière et latéraux — 10 chaque jambe',
      'Pompes légères — 2 × 10',
      'Rotation du tronc + étirement dynamique — 30s',
    ],
    exercises: [
      { exerciseId: 'squat',       sets: 4, reps: [4, 6], restSec: 120, notes: 'Descente 3 secondes, montée explosive' },
      { exerciseId: 'bench_press', sets: 4, reps: [4, 6], restSec: 120 },
      { exerciseId: 'deadlift',    sets: 3, reps: [4, 5], restSec: 180, notes: 'Position parfaite avant tout — dos droit, barre contre les jambes' },
      { exerciseId: 'ohp',         sets: 3, reps: [6, 8], restSec: 90  },
      { exerciseId: 'plank',       sets: 3, reps: [30, 60], restSec: 45, isTime: true, notes: 'Serrer les fessiers et le ventre' },
      { exerciseId: 'leg_raise',   sets: 3, reps: [10, 12], restSec: 45 },
    ],
    cooldown: [
      'Étirement quadriceps debout (pied à la fesse) — 30s chaque',
      'Étirement ischio-jambiers assis jambe tendue — 30s chaque',
      'Pigeon yoga pour les fessiers — 45s chaque côté',
      'Cobra yoga — 30s',
      'Child\'s pose — 60s',
    ],
  },

  // ── Full Body B ──────────────────────────────────────────────────────────
  {
    id: 'full_hypertrophy',
    name: 'Full Body B',
    subtitle: 'Hypertrophie — Volume & Pump',
    type: 'full_body',
    durationMin: 50,
    difficulty: 'intermediate',
    targetMuscles: ['jambes', 'pectoraux', 'dos', 'fessiers', 'abdominaux'],
    description: 'Full body orienté croissance musculaire avec des gammes de répétitions modérées. Enchaîne les exercices push/pull pour un maximum de volume en un minimum de temps.',
    color: '#22c55e',
    warmup: [
      'Squats au poids du corps — 2 × 10',
      'Fentes statiques légères — 2 × 8 chaque jambe',
      'Pompes légères — 2 × 10',
      'Hip circles debout — 30s chaque sens',
      'Jumping jacks ou petite course sur place — 60s',
    ],
    exercises: [
      { exerciseId: 'squat',           sets: 3, reps: [10, 12], restSec: 90  },
      { exerciseId: 'db_bench',        sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'rdl',             sets: 3, reps: [10, 12], restSec: 90, notes: 'Ressentir l\'étirement des ischios, dos droit' },
      { exerciseId: 'db_row',          sets: 3, reps: [10, 12], restSec: 75  },
      { exerciseId: 'bulgarian_squat', sets: 3, reps: [12, 15], restSec: 75, notes: '12-15 reps par jambe' },
      { exerciseId: 'crunch',          sets: 3, reps: [15, 20], restSec: 45  },
      { exerciseId: 'russian_twist',   sets: 3, reps: [20, 20], restSec: 45, notes: '10 de chaque côté, optionnel avec médecine ball' },
    ],
    cooldown: [
      'Étirement quadriceps (pied à la fesse debout) — 30s chaque',
      'Étirement ischio-jambiers assis jambe tendue — 30s chaque',
      'Étirement fessiers allongé (genou vers épaule opposée) — 30s chaque',
      'Étirement pectoraux à la porte — 30s',
      'Child\'s pose — 60s',
    ],
  },
];

export const PROGRAM_MAP = new Map<string, WorkoutProgram>(
  PROGRAMS.map(p => [p.id, p])
);
