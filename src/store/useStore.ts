import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  WorkoutSession,
  ActiveWorkout,
  WorkoutExercise,
  SetLog,
  Page,
  PersonalRecord,
  Recommendation,
  GoalType,
  ExperienceLevel,
} from '@/types';
import { EXERCISES, EXERCISE_MAP } from '@/data/exercises';
import { best1RMFromSets, exerciseVolume, estimate1RM, maxWeightInSession } from '@/utils/calculations';
import { getRecommendation } from '@/utils/recommendations';

// ── ID generator ──────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Default set template ──────────────────────────────────────────────────────

function defaultSet(): SetLog {
  return { id: uid(), weight: 0, reps: 0, completed: false };
}

// ── Store interface ───────────────────────────────────────────────────────────

interface State {
  // Persistent
  user: UserProfile;
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  anthropicApiKey: string;

  // Transient UI
  currentPage: Page;
  activeWorkout: ActiveWorkout | null;

  // ── User actions ────────────────────────────────────────────────────────────
  updateUser: (patch: Partial<UserProfile>) => void;
  completeSetup: (profile: UserProfile) => void;
  setAnthropicApiKey: (key: string) => void;

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigate: (page: Page) => void;

  // ── Workout actions ─────────────────────────────────────────────────────────
  startWorkout: (name: string) => void;
  startWorkoutWithPlan: (name: string, exerciseIds: string[]) => void;
  cancelWorkout: () => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (index: number) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, patch: Partial<SetLog>) => void;
  updateExerciseNotes: (exerciseIndex: number, notes: string) => void;
  finishWorkout: (notes?: string) => void;

  // ── Analytics (computed, not stored) ────────────────────────────────────────
  getRecommendationFor: (exerciseId: string) => Recommendation;
  getExerciseProgressData: (exerciseId: string) => ExerciseProgressEntry[];
  getMuscleWeeklyVolume: () => Record<string, number>;
  getPersonalRecordsFor: (exerciseId: string) => PersonalRecord[];
  getRecentPRs: (limit?: number) => (PersonalRecord & { exerciseName: string })[];
}

export interface ExerciseProgressEntry {
  date: string;
  displayDate: string;
  maxWeight: number;
  est1RM: number;
  volume: number;
  totalReps: number;
  sessionName: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: {
        name: '',
        goal: 'hypertrophy',
        experienceLevel: 'beginner',
        weightUnit: 'kg',
        setupDone: false,
      },
      sessions: [],
      personalRecords: [],
      anthropicApiKey: '',
      currentPage: 'dashboard',
      activeWorkout: null,

      // ── User ──────────────────────────────────────────────────────────────

      updateUser: (patch) =>
        set(s => ({ user: { ...s.user, ...patch } })),

      completeSetup: (profile) =>
        set({ user: { ...profile, setupDone: true } }),

      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),

      // ── Navigation ────────────────────────────────────────────────────────

      navigate: (page) => set({ currentPage: page }),

      // ── Workout ───────────────────────────────────────────────────────────

      startWorkout: (name) =>
        set({
          activeWorkout: {
            name,
            startTime: new Date().toISOString(),
            exercises: [],
          },
          currentPage: 'workout',
        }),

      cancelWorkout: () => set({ activeWorkout: null }),

      startWorkoutWithPlan: (name, exerciseIds) => {
        const s = get();
        const exercises: WorkoutExercise[] = exerciseIds
          .filter(id => EXERCISE_MAP.has(id))
          .map(exerciseId => {
            const lastSession = [...s.sessions]
              .filter(sess => sess.completed && sess.exercises.some(e => e.exerciseId === exerciseId))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            let initialSets: SetLog[];
            if (lastSession) {
              const lastEx = lastSession.exercises.find(e => e.exerciseId === exerciseId)!;
              initialSets = lastEx.sets.map(s => ({
                id: uid(), weight: s.weight, reps: s.reps, completed: false,
              }));
            } else {
              initialSets = [defaultSet(), defaultSet(), defaultSet()];
            }
            return { exerciseId, sets: initialSets };
          });

        set({
          activeWorkout: { name, startTime: new Date().toISOString(), exercises },
          currentPage: 'workout',
        });
      },

      addExerciseToWorkout: (exerciseId) =>
        set(s => {
          if (!s.activeWorkout) return s;
          // Pre-fill with last session data for this exercise
          const lastSession = [...s.sessions]
            .filter(sess => sess.completed && sess.exercises.some(e => e.exerciseId === exerciseId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          let initialSets: SetLog[];
          if (lastSession) {
            const lastExercise = lastSession.exercises.find(e => e.exerciseId === exerciseId)!;
            // Pre-fill with last weights (not completed)
            initialSets = lastExercise.sets.map(s => ({
              id: uid(),
              weight: s.weight,
              reps: s.reps,
              completed: false,
            }));
          } else {
            // New exercise: 3 empty sets
            initialSets = [defaultSet(), defaultSet(), defaultSet()];
          }

          const newExercise: WorkoutExercise = {
            exerciseId,
            sets: initialSets,
          };

          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises: [...s.activeWorkout.exercises, newExercise],
            },
          };
        }),

      removeExerciseFromWorkout: (index) =>
        set(s => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          exercises.splice(index, 1);
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),

      addSetToExercise: (exerciseIndex) =>
        set(s => {
          if (!s.activeWorkout) return s;
          const exercises = s.activeWorkout.exercises.map((we, i) => {
            if (i !== exerciseIndex) return we;
            const lastSet = we.sets[we.sets.length - 1];
            const newSet: SetLog = lastSet
              ? { id: uid(), weight: lastSet.weight, reps: lastSet.reps, completed: false }
              : defaultSet();
            return { ...we, sets: [...we.sets, newSet] };
          });
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),

      removeSet: (exerciseIndex, setIndex) =>
        set(s => {
          if (!s.activeWorkout) return s;
          const exercises = s.activeWorkout.exercises.map((we, i) => {
            if (i !== exerciseIndex) return we;
            const sets = we.sets.filter((_, si) => si !== setIndex);
            return { ...we, sets };
          });
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),

      updateSet: (exerciseIndex, setIndex, patch) =>
        set(s => {
          if (!s.activeWorkout) return s;
          const exercises = s.activeWorkout.exercises.map((we, i) => {
            if (i !== exerciseIndex) return we;
            const sets = we.sets.map((set, si) =>
              si === setIndex ? { ...set, ...patch } : set
            );
            return { ...we, sets };
          });
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),

      updateExerciseNotes: (exerciseIndex, notes) =>
        set(s => {
          if (!s.activeWorkout) return s;
          const exercises = s.activeWorkout.exercises.map((we, i) =>
            i === exerciseIndex ? { ...we, notes } : we
          );
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),

      finishWorkout: (notes) => {
        const state = get();
        if (!state.activeWorkout) return;

        const { activeWorkout, sessions, personalRecords } = state;
        const startTime = new Date(activeWorkout.startTime);
        const now = new Date();
        const durationMin = Math.round((now.getTime() - startTime.getTime()) / 60000);

        const sessionId = uid();
        const session: WorkoutSession = {
          id: sessionId,
          name: activeWorkout.name,
          date: now.toISOString(),
          durationMin,
          exercises: activeWorkout.exercises,
          notes,
          completed: true,
        };

        // ── Detect new personal records ──────────────────────────────────────
        const newPRs: PersonalRecord[] = [];

        for (const we of session.exercises) {
          const exercise = EXERCISE_MAP.get(we.exerciseId);
          if (!exercise) continue;

          const new1RM = best1RMFromSets(we.sets);
          const newMaxWeight = maxWeightInSession(we.sets);
          const newVolume = exerciseVolume(we);

          // Get existing PRs for this exercise
          const existingPRs = personalRecords.filter(pr => pr.exerciseId === we.exerciseId);
          const best1RM = Math.max(0, ...existingPRs.filter(p => p.type === 'estimated1rm').map(p => p.value));
          const bestWeight = Math.max(0, ...existingPRs.filter(p => p.type === 'weight').map(p => p.value));
          const bestVolume = Math.max(0, ...existingPRs.filter(p => p.type === 'volume').map(p => p.value));

          if (new1RM > best1RM && new1RM > 0) {
            newPRs.push({ exerciseId: we.exerciseId, type: 'estimated1rm', value: new1RM, date: now.toISOString(), sessionId });
          }
          if (newMaxWeight > bestWeight && newMaxWeight > 0) {
            newPRs.push({ exerciseId: we.exerciseId, type: 'weight', value: newMaxWeight, date: now.toISOString(), sessionId });
          }
          if (newVolume > bestVolume && newVolume > 0) {
            newPRs.push({ exerciseId: we.exerciseId, type: 'volume', value: newVolume, date: now.toISOString(), sessionId });
          }
        }

        // Keep only the best PR per exercise/type (upsert)
        const updatedPRs = [...personalRecords];
        for (const newPR of newPRs) {
          const idx = updatedPRs.findIndex(
            p => p.exerciseId === newPR.exerciseId && p.type === newPR.type
          );
          if (idx >= 0) updatedPRs[idx] = newPR;
          else updatedPRs.push(newPR);
        }

        set({
          sessions: [...sessions, session],
          personalRecords: updatedPRs,
          activeWorkout: null,
          currentPage: 'dashboard',
        });
      },

      // ── Computed selectors ────────────────────────────────────────────────

      getRecommendationFor: (exerciseId) => {
        const state = get();
        const exercise = EXERCISE_MAP.get(exerciseId);
        if (!exercise) {
          return {
            exerciseId,
            suggestedWeight: 0,
            suggestedSets: 3,
            suggestedReps: [8, 12],
            trend: 'new',
            confidence: 'insufficient',
            title: 'Exercice inconnu',
            message: '',
            sessionsAnalyzed: 0,
          } as Recommendation;
        }
        return getRecommendation({
          exercise,
          sessions: state.sessions,
          goal: state.user.goal,
          experience: state.user.experienceLevel,
        });
      },

      getExerciseProgressData: (exerciseId) => {
        const { sessions } = get();
        return sessions
          .filter(s => s.completed && s.exercises.some(we => we.exerciseId === exerciseId))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(session => {
            const we = session.exercises.find(e => e.exerciseId === exerciseId)!;
            const date = new Date(session.date);
            return {
              date: session.date,
              displayDate: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
              maxWeight: maxWeightInSession(we.sets),
              est1RM: best1RMFromSets(we.sets),
              volume: exerciseVolume(we),
              totalReps: we.sets.filter(s => s.completed).reduce((sum, s) => sum + s.reps, 0),
              sessionName: session.name,
            };
          });
      },

      getMuscleWeeklyVolume: () => {
        const { sessions } = get();
        const cutoff = Date.now() - 7 * 86400000;
        const result: Record<string, number> = {};

        sessions
          .filter(s => s.completed && new Date(s.date).getTime() >= cutoff)
          .forEach(session => {
            session.exercises.forEach(we => {
              const ex = EXERCISE_MAP.get(we.exerciseId);
              if (!ex) return;
              const vol = exerciseVolume(we);
              ex.muscles.forEach(m => {
                result[m] = (result[m] ?? 0) + vol;
              });
            });
          });

        return result;
      },

      getPersonalRecordsFor: (exerciseId) => {
        return get().personalRecords.filter(pr => pr.exerciseId === exerciseId);
      },

      getRecentPRs: (limit = 5) => {
        const { personalRecords } = get();
        return personalRecords
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit)
          .map(pr => ({
            ...pr,
            exerciseName: EXERCISE_MAP.get(pr.exerciseId)?.name ?? pr.exerciseId,
          }));
      },
    }),
    {
      name: 'fonkysport-v1',
      // Persist everything except transient activeWorkout UI state
      partialize: (state) => ({
        user: state.user,
        sessions: state.sessions,
        personalRecords: state.personalRecords,
        anthropicApiKey: state.anthropicApiKey,
      }),
    }
  )
);
