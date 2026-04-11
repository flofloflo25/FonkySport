import type {
  WorkoutSession,
  Exercise,
  GoalType,
  ExperienceLevel,
  Recommendation,
  RecommendationTrend,
} from '@/types';
import {
  best1RMFromSets,
  completionRate,
  averageRPE,
  maxWeightInSession,
  suggestIncrement,
  estimate1RM,
} from './calculations';

// ── Goal → rep range mapping ──────────────────────────────────────────────────

const GOAL_REPS: Record<GoalType, [number, number]> = {
  strength:    [3, 5],
  hypertrophy: [8, 12],
  endurance:   [15, 20],
  general:     [8, 12],
};

const GOAL_SETS: Record<GoalType, number> = {
  strength:    5,
  hypertrophy: 4,
  endurance:   3,
  general:     3,
};

// ── Starting weight heuristics (kg) by experience ────────────────────────────

const STARTING_WEIGHT: Record<ExperienceLevel, Record<string, number>> = {
  beginner: {
    compound: 20,
    isolation: 8,
  },
  intermediate: {
    compound: 40,
    isolation: 12,
  },
  advanced: {
    compound: 60,
    isolation: 15,
  },
};

// ── Core recommendation function ──────────────────────────────────────────────

export interface RecommendationInput {
  exercise: Exercise;
  sessions: WorkoutSession[];   // ALL sessions, not pre-filtered
  goal: GoalType;
  experience: ExperienceLevel;
}

export function getRecommendation(input: RecommendationInput): Recommendation {
  const { exercise, sessions, goal, experience } = input;

  const suggestedSets = GOAL_SETS[goal];
  const suggestedReps = GOAL_REPS[goal];

  // Get exercise-specific history (completed sessions only, chronological)
  const history = sessions
    .filter(s => s.completed && s.exercises.some(we => we.exerciseId === exercise.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ── New exercise ────────────────────────────────────────────────────────────
  if (history.length === 0) {
    const base = STARTING_WEIGHT[experience][exercise.category];
    return {
      exerciseId: exercise.id,
      suggestedWeight: base,
      suggestedSets,
      suggestedReps,
      trend: 'new',
      confidence: 'insufficient',
      title: 'Nouvel exercice',
      message: `Commencez léger à ${base}kg pour maîtriser la technique avant d'augmenter la charge.`,
      sessionsAnalyzed: 0,
    };
  }

  // ── Collect per-session metrics ─────────────────────────────────────────────
  const metrics = history.map(session => {
    const we = session.exercises.find(e => e.exerciseId === exercise.id)!;
    return {
      date: session.date,
      sessionId: session.id,
      sets: we.sets,
      maxWeight: maxWeightInSession(we.sets),
      est1RM: best1RMFromSets(we.sets),
      completion: completionRate(we.sets),
      rpe: averageRPE(we.sets),
    };
  });

  const recent = metrics.slice(-3); // last 3 sessions for trend analysis
  const last = metrics[metrics.length - 1];
  const totalAnalyzed = metrics.length;

  const avgCompletion = recent.reduce((s, m) => s + m.completion, 0) / recent.length;
  const avgRPE = recent.reduce((s, m) => s + m.rpe, 0) / recent.length;

  // ── 1RM trend (recent slope) ────────────────────────────────────────────────
  let onermTrend: 'up' | 'flat' | 'down' = 'flat';
  if (metrics.length >= 2) {
    const prev = metrics[metrics.length - 2].est1RM;
    const curr = last.est1RM;
    if (curr > prev * 1.02) onermTrend = 'up';
    else if (curr < prev * 0.98) onermTrend = 'down';
  }

  // ── Deload detection: 3 consecutive down sessions ──────────────────────────
  let consecutiveDown = 0;
  for (let i = metrics.length - 1; i >= 1 && i >= metrics.length - 3; i--) {
    if (metrics[i].est1RM < metrics[i - 1].est1RM * 0.98) consecutiveDown++;
    else break;
  }

  if (consecutiveDown >= 2 && totalAnalyzed >= 3) {
    const deloadWeight = Math.max(
      STARTING_WEIGHT[experience][exercise.category],
      Math.round(last.maxWeight * 0.8 * 2) / 2
    );
    return {
      exerciseId: exercise.id,
      suggestedWeight: deloadWeight,
      suggestedSets: Math.max(2, suggestedSets - 1),
      suggestedReps,
      trend: 'deload',
      confidence: 'high',
      title: 'Semaine de décharge recommandée',
      message: `Vos performances ont baissé ${consecutiveDown} séances de suite. Réduisez à ${deloadWeight}kg pour récupérer, puis reprenez la progression.`,
      estimated1RM: last.est1RM,
      sessionsAnalyzed: totalAnalyzed,
    };
  }

  // ── Plateau detection: same weight ≥ 3 sessions, stagnant 1RM ─────────────
  let plateauSessions = 0;
  if (metrics.length >= 3) {
    const ref = metrics[metrics.length - 1].maxWeight;
    for (let i = metrics.length - 1; i >= 0; i--) {
      if (Math.abs(metrics[i].maxWeight - ref) < 0.5) plateauSessions++;
      else break;
    }
  }

  // ── Determine suggested weight ─────────────────────────────────────────────
  const isCompound = exercise.category === 'compound';
  let suggestedWeight = last.maxWeight;
  let trend: RecommendationTrend = 'maintain';
  let confidence: Recommendation['confidence'] = 'medium';
  let title: string;
  let message: string;

  // Progress % vs previous session 1RM
  const prev1RM = metrics.length >= 2 ? metrics[metrics.length - 2].est1RM : undefined;
  const progressPercent = prev1RM && prev1RM > 0
    ? ((last.est1RM - prev1RM) / prev1RM) * 100
    : undefined;

  if (totalAnalyzed < 3) {
    // Insufficient data — conservative
    confidence = 'insufficient';
    if (last.completion >= 1.0 && last.rpe <= 8) {
      const inc = suggestIncrement(last.maxWeight, isCompound);
      suggestedWeight = last.maxWeight + inc;
      trend = 'increase';
      title = 'Progression prudente';
      message = `Encore ${3 - totalAnalyzed} séance(s) pour des recommandations précises. En attendant, essayez ${suggestedWeight}kg si vous vous sentez bien.`;
    } else {
      trend = 'maintain';
      title = 'Consolidation en cours';
      message = `Restez à ${suggestedWeight}kg — j'ai besoin de plus de données pour personnaliser vos recommandations.`;
    }
  } else if (plateauSessions >= 3 && avgCompletion >= 0.9) {
    // Plateau buster
    const inc = suggestIncrement(last.maxWeight, isCompound) * 1.5;
    suggestedWeight = Math.round((last.maxWeight + inc) * 2) / 2;
    trend = 'increase';
    confidence = 'high';
    title = 'Plateau détecté — push !';
    message = `Même charge depuis ${plateauSessions} séances. Forcez la progression à ${suggestedWeight}kg pour briser le plateau.`;
  } else if (avgCompletion >= 1.0 && avgRPE <= 7 && onermTrend !== 'down') {
    // All sets complete, RPE comfortable → increase weight
    const inc = suggestIncrement(last.maxWeight, isCompound);
    suggestedWeight = Math.round((last.maxWeight + inc) * 2) / 2;
    trend = 'increase';
    confidence = 'high';
    title = 'Augmentation recommandée';
    message = buildIncreaseMessage(suggestedWeight, last.maxWeight, avgRPE, goal, suggestedReps);
  } else if (avgCompletion >= 0.8 && avgRPE <= 8.5) {
    // Good completion, moderate effort → maintain or micro-increase
    if (avgCompletion === 1.0) {
      const inc = suggestIncrement(last.maxWeight, isCompound) / 2;
      suggestedWeight = Math.round((last.maxWeight + inc) * 2) / 2;
      trend = 'increase';
      confidence = 'medium';
      title = 'Légère progression possible';
      message = `Bonne performance — essayez ${suggestedWeight}kg. Si c'est trop difficile, restez à ${last.maxWeight}kg.`;
    } else {
      trend = 'maintain';
      confidence = 'high';
      title = 'Maintien recommandé';
      message = `Continuez à ${suggestedWeight}kg. Votre taux de complétion est de ${Math.round(avgCompletion * 100)}% — visez 100% avant d'augmenter.`;
    }
  } else if (avgRPE > 9 || avgCompletion < 0.7) {
    // Struggling — reduce weight
    const reduction = Math.round(last.maxWeight * 0.95 * 2) / 2;
    suggestedWeight = Math.max(reduction, STARTING_WEIGHT[experience][exercise.category]);
    trend = 'decrease';
    confidence = 'high';
    title = 'Réduction conseillée';
    message = `RPE moyen de ${avgRPE.toFixed(1)}/10 — c'est trop difficile. Descendez à ${suggestedWeight}kg pour conserver une bonne technique.`;
  } else {
    trend = 'maintain';
    confidence = 'medium';
    title = 'Progression solide';
    message = `Continuez à ${suggestedWeight}kg et concentrez-vous sur la qualité des répétitions.`;
  }

  return {
    exerciseId: exercise.id,
    suggestedWeight,
    suggestedSets,
    suggestedReps,
    trend,
    confidence,
    title,
    message,
    estimated1RM: last.est1RM > 0 ? last.est1RM : undefined,
    previousBest1RM: prev1RM,
    progressPercent,
    sessionsAnalyzed: totalAnalyzed,
  };
}

// ── Message builder ───────────────────────────────────────────────────────────

function buildIncreaseMessage(
  newWeight: number,
  oldWeight: number,
  avgRPE: number,
  goal: GoalType,
  reps: [number, number]
): string {
  const rpeHint = avgRPE <= 6
    ? 'Vous semblez avoir encore beaucoup de réserve !'
    : 'Votre effort est optimal.';

  if (goal === 'hypertrophy') {
    return `Progression détectée 💪 Passez à ${newWeight}kg (${oldWeight}kg → ${newWeight}kg). ${rpeHint} Visez ${reps[0]}-${reps[1]} répétitions avec une technique parfaite.`;
  }
  if (goal === 'strength') {
    return `Excellente force ! Augmentez à ${newWeight}kg. ${rpeHint} Concentrez-vous sur des répétitions explosives.`;
  }
  return `Augmentez à ${newWeight}kg — vous êtes prêt pour la progression. ${rpeHint}`;
}

// ── Weekly muscle group recommendations ───────────────────────────────────────

export interface MuscleGroupStatus {
  muscle: string;
  label: string;
  daysSinceTraining: number | null;
  weeklyVolume: number;
  status: 'fresh' | 'trained' | 'tired' | 'neglected';
  recommendation: string;
}

export function getMuscleGroupStatuses(
  sessions: WorkoutSession[],
  exerciseMap: Map<string, { muscles: string[] }>
): MuscleGroupStatus[] {
  const muscleLabels: Record<string, string> = {
    pectoraux: 'Pectoraux',
    dos: 'Dos',
    epaules: 'Épaules',
    biceps: 'Biceps',
    triceps: 'Triceps',
    jambes: 'Jambes',
    fessiers: 'Fessiers',
    abdominaux: 'Abdominaux',
    mollets: 'Mollets',
  };

  const completed = sessions.filter(s => s.completed).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const now = Date.now();

  return Object.entries(muscleLabels).map(([muscle, label]) => {
    // Find last session that trained this muscle
    let daysSince: number | null = null;
    for (const session of completed) {
      const trained = session.exercises.some(we => {
        const ex = exerciseMap.get(we.exerciseId);
        return ex?.muscles.includes(muscle);
      });
      if (trained) {
        daysSince = (now - new Date(session.date).getTime()) / 86400000;
        break;
      }
    }

    // Weekly volume for this muscle
    const cutoff = now - 7 * 86400000;
    let weeklyVolume = 0;
    for (const session of completed) {
      if (new Date(session.date).getTime() < cutoff) break;
      for (const we of session.exercises) {
        const ex = exerciseMap.get(we.exerciseId);
        if (ex?.muscles.includes(muscle)) {
          weeklyVolume += we.sets.reduce((s, set) => s + (set.completed ? set.weight * set.reps : 0), 0);
        }
      }
    }

    let status: MuscleGroupStatus['status'];
    let recommendation: string;

    if (daysSince === null) {
      status = 'neglected';
      recommendation = 'Jamais entraîné — commencez !';
    } else if (daysSince < 1.5) {
      status = 'tired';
      recommendation = 'Récupération en cours — évitez ce groupe aujourd\'hui.';
    } else if (daysSince < 4) {
      status = 'trained';
      recommendation = `Entraîné il y a ${Math.round(daysSince)}j — bonne récupération en cours.`;
    } else {
      status = 'fresh';
      recommendation = `Prêt à être re-entraîné (${Math.round(daysSince)}j de repos).`;
    }

    if (daysSince !== null && daysSince > 7) {
      status = 'neglected';
      recommendation = `Négligé depuis ${Math.round(daysSince)}j — priorité haute !`;
    }

    return { muscle, label, daysSinceTraining: daysSince, weeklyVolume, status, recommendation };
  });
}
