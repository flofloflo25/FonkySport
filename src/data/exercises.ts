import type { Exercise } from '@/types';

export const EXERCISES: Exercise[] = [
  // ── Pectoraux ──────────────────────────────────────────────────────────────
  { id: 'bench_press', name: 'Développé couché (barre)', muscles: ['pectoraux', 'triceps', 'epaules'], category: 'compound', equipment: 'barre' },
  { id: 'incline_bench', name: 'Développé incliné (barre)', muscles: ['pectoraux', 'epaules'], category: 'compound', equipment: 'barre' },
  { id: 'decline_bench', name: 'Développé décliné (barre)', muscles: ['pectoraux', 'triceps'], category: 'compound', equipment: 'barre' },
  { id: 'db_bench', name: 'Développé couché (haltères)', muscles: ['pectoraux', 'triceps'], category: 'compound', equipment: 'haltères' },
  { id: 'incline_db_bench', name: 'Développé incliné (haltères)', muscles: ['pectoraux', 'epaules'], category: 'compound', equipment: 'haltères' },
  { id: 'db_fly', name: 'Écarté couché (haltères)', muscles: ['pectoraux'], category: 'isolation', equipment: 'haltères' },
  { id: 'cable_fly', name: 'Écarté poulie croisée', muscles: ['pectoraux'], category: 'isolation', equipment: 'câble' },
  { id: 'dips_chest', name: 'Dips pectoraux', muscles: ['pectoraux', 'triceps'], category: 'compound', equipment: 'poids du corps' },
  { id: 'pushup', name: 'Pompes', muscles: ['pectoraux', 'triceps', 'epaules'], category: 'compound', equipment: 'poids du corps' },
  { id: 'machine_chest', name: 'Pec Deck / Butterfly', muscles: ['pectoraux'], category: 'isolation', equipment: 'machine' },

  // ── Dos ───────────────────────────────────────────────────────────────────
  { id: 'deadlift', name: 'Soulevé de terre (barre)', muscles: ['dos', 'fessiers', 'jambes'], category: 'compound', equipment: 'barre' },
  { id: 'pullup', name: 'Traction (prise pronation)', muscles: ['dos', 'biceps'], category: 'compound', equipment: 'poids du corps' },
  { id: 'chinup', name: 'Traction (prise supination)', muscles: ['dos', 'biceps'], category: 'compound', equipment: 'poids du corps' },
  { id: 'barbell_row', name: 'Rowing barre (penché)', muscles: ['dos', 'biceps', 'epaules'], category: 'compound', equipment: 'barre' },
  { id: 'db_row', name: 'Rowing haltère 1 bras', muscles: ['dos', 'biceps'], category: 'compound', equipment: 'haltères' },
  { id: 'lat_pulldown', name: 'Tirage poulie haute', muscles: ['dos', 'biceps'], category: 'compound', equipment: 'câble' },
  { id: 'cable_row', name: 'Rowing poulie basse', muscles: ['dos', 'biceps'], category: 'compound', equipment: 'câble' },
  { id: 'face_pull', name: 'Face Pull', muscles: ['dos', 'epaules'], category: 'isolation', equipment: 'câble' },
  { id: 'shrug', name: 'Haussement d\'épaules', muscles: ['dos'], category: 'isolation', equipment: 'barre' },
  { id: 'rack_pull', name: 'Soulevé de terre sumo', muscles: ['dos', 'fessiers'], category: 'compound', equipment: 'barre' },

  // ── Épaules ───────────────────────────────────────────────────────────────
  { id: 'ohp', name: 'Développé militaire (barre)', muscles: ['epaules', 'triceps'], category: 'compound', equipment: 'barre' },
  { id: 'db_ohp', name: 'Développé épaules (haltères)', muscles: ['epaules', 'triceps'], category: 'compound', equipment: 'haltères' },
  { id: 'lateral_raise', name: 'Élévation latérale', muscles: ['epaules'], category: 'isolation', equipment: 'haltères' },
  { id: 'front_raise', name: 'Élévation frontale', muscles: ['epaules'], category: 'isolation', equipment: 'haltères' },
  { id: 'rear_delt_fly', name: 'Oiseau / Reverse Fly', muscles: ['epaules', 'dos'], category: 'isolation', equipment: 'haltères' },
  { id: 'arnold_press', name: 'Arnold Press', muscles: ['epaules'], category: 'compound', equipment: 'haltères' },
  { id: 'upright_row', name: 'Rowing montant', muscles: ['epaules', 'dos'], category: 'compound', equipment: 'barre' },

  // ── Biceps ────────────────────────────────────────────────────────────────
  { id: 'barbell_curl', name: 'Curl barre droite', muscles: ['biceps'], category: 'isolation', equipment: 'barre' },
  { id: 'db_curl', name: 'Curl haltères', muscles: ['biceps'], category: 'isolation', equipment: 'haltères' },
  { id: 'hammer_curl', name: 'Curl marteau', muscles: ['biceps'], category: 'isolation', equipment: 'haltères' },
  { id: 'preacher_curl', name: 'Curl pupitre (Larry Scott)', muscles: ['biceps'], category: 'isolation', equipment: 'machine' },
  { id: 'cable_curl', name: 'Curl poulie basse', muscles: ['biceps'], category: 'isolation', equipment: 'câble' },
  { id: 'incline_db_curl', name: 'Curl incliné haltères', muscles: ['biceps'], category: 'isolation', equipment: 'haltères' },
  { id: 'concentration_curl', name: 'Curl concentration', muscles: ['biceps'], category: 'isolation', equipment: 'haltères' },

  // ── Triceps ───────────────────────────────────────────────────────────────
  { id: 'tricep_dip', name: 'Dips triceps', muscles: ['triceps'], category: 'compound', equipment: 'poids du corps' },
  { id: 'skullcrusher', name: 'Barre au front (Skullcrusher)', muscles: ['triceps'], category: 'isolation', equipment: 'barre' },
  { id: 'tricep_pushdown', name: 'Extension poulie haute (corde)', muscles: ['triceps'], category: 'isolation', equipment: 'câble' },
  { id: 'overhead_tricep', name: 'Extension triceps au-dessus tête', muscles: ['triceps'], category: 'isolation', equipment: 'haltères' },
  { id: 'close_grip_bench', name: 'Développé serré (triceps)', muscles: ['triceps', 'pectoraux'], category: 'compound', equipment: 'barre' },
  { id: 'kickback', name: 'Kickback triceps', muscles: ['triceps'], category: 'isolation', equipment: 'haltères' },

  // ── Jambes ────────────────────────────────────────────────────────────────
  { id: 'squat', name: 'Squat barre (back squat)', muscles: ['jambes', 'fessiers'], category: 'compound', equipment: 'barre' },
  { id: 'front_squat', name: 'Squat avant (front squat)', muscles: ['jambes', 'fessiers'], category: 'compound', equipment: 'barre' },
  { id: 'leg_press', name: 'Presse à jambes', muscles: ['jambes', 'fessiers'], category: 'compound', equipment: 'machine' },
  { id: 'leg_extension', name: 'Extension jambes (machine)', muscles: ['jambes'], category: 'isolation', equipment: 'machine' },
  { id: 'leg_curl', name: 'Curl jambes couché (ischio)', muscles: ['jambes'], category: 'isolation', equipment: 'machine' },
  { id: 'rdl', name: 'Soulevé de terre roumain', muscles: ['fessiers', 'jambes', 'dos'], category: 'compound', equipment: 'barre' },
  { id: 'lunge', name: 'Fentes avant (haltères)', muscles: ['jambes', 'fessiers'], category: 'compound', equipment: 'haltères' },
  { id: 'bulgarian_squat', name: 'Squat bulgare', muscles: ['jambes', 'fessiers'], category: 'compound', equipment: 'haltères' },
  { id: 'hack_squat', name: 'Hack Squat', muscles: ['jambes'], category: 'compound', equipment: 'machine' },
  { id: 'goblet_squat', name: 'Goblet Squat', muscles: ['jambes', 'fessiers'], category: 'compound', equipment: 'haltères' },

  // ── Fessiers ──────────────────────────────────────────────────────────────
  { id: 'hip_thrust', name: 'Hip Thrust (barre)', muscles: ['fessiers', 'jambes'], category: 'compound', equipment: 'barre' },
  { id: 'cable_kickback', name: 'Kickback fessiers (câble)', muscles: ['fessiers'], category: 'isolation', equipment: 'câble' },
  { id: 'glute_bridge', name: 'Pont fessiers', muscles: ['fessiers'], category: 'isolation', equipment: 'poids du corps' },
  { id: 'abductor', name: 'Abducteur (machine)', muscles: ['fessiers'], category: 'isolation', equipment: 'machine' },

  // ── Mollets ───────────────────────────────────────────────────────────────
  { id: 'standing_calf', name: 'Mollets debout (machine)', muscles: ['mollets'], category: 'isolation', equipment: 'machine' },
  { id: 'seated_calf', name: 'Mollets assis (machine)', muscles: ['mollets'], category: 'isolation', equipment: 'machine' },
  { id: 'calf_raise_db', name: 'Mollets haltères', muscles: ['mollets'], category: 'isolation', equipment: 'haltères' },

  // ── Abdominaux ────────────────────────────────────────────────────────────
  { id: 'plank', name: 'Planche (Plank)', muscles: ['abdominaux'], category: 'isolation', equipment: 'poids du corps' },
  { id: 'crunch', name: 'Crunch', muscles: ['abdominaux'], category: 'isolation', equipment: 'poids du corps' },
  { id: 'leg_raise', name: 'Relevé de jambes', muscles: ['abdominaux'], category: 'isolation', equipment: 'poids du corps' },
  { id: 'cable_crunch', name: 'Crunch poulie haute', muscles: ['abdominaux'], category: 'isolation', equipment: 'câble' },
  { id: 'russian_twist', name: 'Rotations russes', muscles: ['abdominaux'], category: 'isolation', equipment: 'poids du corps' },
  { id: 'ab_rollout', name: 'Ab Wheel / Roulette abdos', muscles: ['abdominaux'], category: 'isolation', equipment: 'autre' },
];

export const EXERCISE_MAP = new Map<string, Exercise>(
  EXERCISES.map(e => [e.id, e])
);

export const MUSCLE_GROUPS: MuscleGroupInfo[] = [
  { id: 'pectoraux', label: 'Pectoraux', color: '#f97316' },
  { id: 'dos', label: 'Dos', color: '#6366f1' },
  { id: 'epaules', label: 'Épaules', color: '#06b6d4' },
  { id: 'biceps', label: 'Biceps', color: '#22c55e' },
  { id: 'triceps', label: 'Triceps', color: '#a855f7' },
  { id: 'jambes', label: 'Jambes', color: '#eab308' },
  { id: 'fessiers', label: 'Fessiers', color: '#ec4899' },
  { id: 'abdominaux', label: 'Abdominaux', color: '#14b8a6' },
  { id: 'mollets', label: 'Mollets', color: '#f43f5e' },
];

export interface MuscleGroupInfo {
  id: string;
  label: string;
  color: string;
}

export function getExercise(id: string): Exercise | undefined {
  return EXERCISE_MAP.get(id);
}

export function getExercisesByMuscle(muscle: string): Exercise[] {
  return EXERCISES.filter(e => e.muscles.includes(muscle as any));
}
