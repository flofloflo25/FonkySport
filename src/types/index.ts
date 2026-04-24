// ── User ──────────────────────────────────────────────────────────────────────

export type GoalType = 'strength' | 'hypertrophy' | 'endurance' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type WeightUnit = 'kg' | 'lbs';

export interface UserProfile {
  name: string;
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  weightUnit: WeightUnit;
  bodyweight?: number;
  setupDone: boolean;
}

// ── Exercise library ──────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'pectoraux'
  | 'dos'
  | 'epaules'
  | 'biceps'
  | 'triceps'
  | 'jambes'
  | 'fessiers'
  | 'abdominaux'
  | 'mollets';

export type ExerciseCategory = 'compound' | 'isolation';
export type Equipment = 'barre' | 'haltères' | 'machine' | 'câble' | 'poids du corps' | 'autre';

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleGroup[];
  category: ExerciseCategory;
  equipment: Equipment;
}

// ── Workout data ──────────────────────────────────────────────────────────────

export interface SetLog {
  id: string;
  weight: number;      // always stored in kg
  reps: number;
  completed: boolean;
  rpe?: number;        // 1-10, Rate of Perceived Exertion
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;           // ISO 8601
  durationMin?: number;
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
}

// Active workout (not yet saved)
export interface ActiveWorkout {
  name: string;
  startTime: string;     // ISO 8601
  exercises: WorkoutExercise[];
  warmupSteps?: string[];
  cooldownSteps?: string[];
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface PersonalRecord {
  exerciseId: string;
  type: 'weight' | 'estimated1rm' | 'volume';
  value: number;
  date: string;
  sessionId: string;
}

// ── Recommendations ───────────────────────────────────────────────────────────

export type RecommendationTrend = 'increase' | 'maintain' | 'decrease' | 'deload' | 'new';
export type RecommendationConfidence = 'high' | 'medium' | 'low' | 'insufficient';

export interface Recommendation {
  exerciseId: string;
  suggestedWeight: number;
  suggestedSets: number;
  suggestedReps: [number, number];   // [min, max]
  trend: RecommendationTrend;
  confidence: RecommendationConfidence;
  title: string;
  message: string;
  estimated1RM?: number;
  previousBest1RM?: number;
  progressPercent?: number;           // vs last session 1RM
  sessionsAnalyzed: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export type Page = 'dashboard' | 'workout' | 'history' | 'progress' | 'profile' | 'programs';

// ── Chart helpers ─────────────────────────────────────────────────────────────

export interface ProgressDataPoint {
  date: string;        // formatted for display
  weight: number;
  est1RM: number;
  volume: number;      // total session volume for this exercise (kg × reps)
  reps: number;
}
