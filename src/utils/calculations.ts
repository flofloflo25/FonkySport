import type { SetLog, WorkoutSession, WorkoutExercise } from '@/types';

// ── Default weights (85kg / 1m80 moderately fit beginner) ────────────────────

export const DEFAULT_WEIGHTS: Record<string, number> = {
  // Chest
  bench_press: 40, incline_bench: 35, decline_bench: 40,
  db_bench: 22.5, incline_db_bench: 17.5, db_fly: 12,
  cable_fly: 8, dips_chest: 0, pushup: 0, machine_chest: 30,
  // Back
  deadlift: 60, pullup: 0, chinup: 0, barbell_row: 40,
  db_row: 22.5, lat_pulldown: 40, cable_row: 40,
  face_pull: 12.5, shrug: 50, rack_pull: 80,
  // Shoulders
  ohp: 30, db_ohp: 15, lateral_raise: 8, front_raise: 7.5,
  rear_delt_fly: 8, arnold_press: 14, upright_row: 25,
  // Biceps
  barbell_curl: 25, db_curl: 12, hammer_curl: 12,
  preacher_curl: 20, cable_curl: 12, incline_db_curl: 10,
  concentration_curl: 10,
  // Triceps
  tricep_dip: 0, skullcrusher: 22.5, tricep_pushdown: 17.5,
  overhead_tricep: 14, close_grip_bench: 35, kickback: 10,
  // Legs
  squat: 50, front_squat: 40, leg_press: 80,
  leg_extension: 35, leg_curl: 30, rdl: 50,
  lunge: 20, bulgarian_squat: 20, hack_squat: 60, goblet_squat: 20,
  // Glutes
  hip_thrust: 60, cable_kickback: 10, glute_bridge: 0, abductor: 25,
  // Calves
  standing_calf: 40, seated_calf: 30, calf_raise_db: 15,
  // Abs
  plank: 0, crunch: 0, leg_raise: 0,
  cable_crunch: 15, russian_twist: 5, ab_rollout: 0,
};

// Exercises where "reps" = duration in seconds
export const TIME_BASED_EXERCISES = new Set<string>(['plank', 'glute_bridge']);

export const DEFAULT_DURATIONS: Record<string, number> = {
  plank: 30, glute_bridge: 30,
};

export const DEFAULT_REPS: Record<string, number> = {
  crunch: 15, leg_raise: 12, russian_twist: 16,
  cable_crunch: 15, ab_rollout: 8,
};

export function warmupWeightFor(workWeight: number): number {
  if (workWeight === 0) return 0;
  return Math.round((workWeight * 0.6) / 2.5) * 2.5;
}

// ── 1RM Estimation ────────────────────────────────────────────────────────────

/** Brzycki formula */
function brzycki(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps > 30) return weight * 1.35; // rough cap
  return weight * (36 / (37 - reps));
}

/** Epley formula */
function epley(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Average of Brzycki + Epley for better accuracy. Rounds to 0.5kg precision. */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  const est = (brzycki(weight, reps) + epley(weight, reps)) / 2;
  return Math.round(est * 2) / 2; // round to nearest 0.5
}

/** Best 1RM from a list of sets */
export function best1RMFromSets(sets: SetLog[]): number {
  const completed = sets.filter(s => s.completed && s.weight > 0 && s.reps > 0);
  if (completed.length === 0) return 0;
  return Math.max(...completed.map(s => estimate1RM(s.weight, s.reps)));
}

// ── Volume Calculations ───────────────────────────────────────────────────────

/** Total volume for a set: weight × reps */
export function setVolume(set: SetLog): number {
  return set.completed ? set.weight * set.reps : 0;
}

/** Total volume for an exercise entry in a session */
export function exerciseVolume(we: WorkoutExercise): number {
  return we.sets.reduce((sum, s) => sum + setVolume(s), 0);
}

/** Total session volume */
export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((sum, we) => sum + exerciseVolume(we), 0);
}

// ── Completion Rates ──────────────────────────────────────────────────────────

export function completionRate(sets: SetLog[]): number {
  if (sets.length === 0) return 0;
  const done = sets.filter(s => s.completed).length;
  return done / sets.length;
}

export function averageRPE(sets: SetLog[]): number {
  const withRPE = sets.filter(s => s.completed && s.rpe !== undefined);
  if (withRPE.length === 0) return 7; // neutral default
  return withRPE.reduce((sum, s) => sum + (s.rpe ?? 7), 0) / withRPE.length;
}

// ── Max set helpers ───────────────────────────────────────────────────────────

export function maxWeightInSession(sets: SetLog[]): number {
  const completed = sets.filter(s => s.completed);
  if (completed.length === 0) return 0;
  return Math.max(...completed.map(s => s.weight));
}

// ── Weight increment suggestion ───────────────────────────────────────────────

/**
 * Returns the smallest sensible increment for a given weight and exercise type.
 * Compound lifts: 2.5kg up to 100kg, then 5kg.
 * Isolation / small weights: 1–2.5kg.
 */
export function suggestIncrement(weight: number, isCompound: boolean): number {
  if (!isCompound) return weight >= 20 ? 1 : 0.5;
  if (weight < 60) return 2.5;
  if (weight < 100) return 2.5;
  return 5;
}

// ── Days since last training ──────────────────────────────────────────────────

export function daysSince(isoDate: string): number {
  const then = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

// ── Weekly volume per muscle ──────────────────────────────────────────────────

export function weeklyVolumeForMuscle(
  sessions: WorkoutSession[],
  muscleId: string,
  exerciseIds: string[],
  days = 7
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return sessions
    .filter(s => s.completed && new Date(s.date) >= cutoff)
    .flatMap(s => s.exercises)
    .filter(we => exerciseIds.includes(we.exerciseId))
    .reduce((sum, we) => sum + exerciseVolume(we), 0);
}
