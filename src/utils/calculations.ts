import type { SetLog, WorkoutSession, WorkoutExercise } from '@/types';

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
