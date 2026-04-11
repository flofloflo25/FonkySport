import React, { useMemo } from 'react';
import { Flame, Trophy, TrendingUp, Dumbbell, Plus, ChevronRight, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EXERCISES, MUSCLE_GROUPS, EXERCISE_MAP } from '@/data/exercises';
import { getMuscleGroupStatuses } from '@/utils/recommendations';
import { sessionVolume } from '@/utils/calculations';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ── Helpers ───────────────────────────────────────────────────────────────────

function greet(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Bonjour, ${name} !`;
  if (h < 18) return `Content de te voir, ${name} !`;
  return `Bonsoir, ${name} !`;
}

const TREND_COLOR: Record<string, string> = {
  increase: 'text-green-400',
  maintain: 'text-yellow-400',
  decrease: 'text-red-400',
  deload:   'text-purple-400',
  new:      'text-slate-400',
};

const TREND_BG: Record<string, string> = {
  increase: 'bg-green-500/10',
  maintain: 'bg-yellow-500/10',
  decrease: 'bg-red-500/10',
  deload:   'bg-purple-500/10',
  new:      'bg-slate-500/10',
};

const TREND_LABEL: Record<string, string> = {
  increase: '↑ Augmenter',
  maintain: '→ Maintenir',
  decrease: '↓ Réduire',
  deload:   '⟳ Décharge',
  new:      '★ Nouveau',
};

const MUSCLE_STATUS_COLOR: Record<string, string> = {
  fresh:    'bg-green-500',
  trained:  'bg-yellow-500',
  tired:    'bg-red-500',
  neglected:'bg-slate-600',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, sessions, navigate, startWorkout, getRecommendationFor, getRecentPRs, getMuscleWeeklyVolume } = useStore(s => ({
    user: s.user,
    sessions: s.sessions,
    navigate: s.navigate,
    startWorkout: s.startWorkout,
    getRecommendationFor: s.getRecommendationFor,
    getRecentPRs: s.getRecentPRs,
    getMuscleWeeklyVolume: s.getMuscleWeeklyVolume,
  }));

  const recentPRs = getRecentPRs(5);
  const weeklyVolume = getMuscleWeeklyVolume();

  // Stats
  const completedSessions = sessions.filter(s => s.completed);
  const thisWeekSessions = completedSessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return d >= monday;
  });

  const totalVolumeThisWeek = thisWeekSessions.reduce((sum, s) => sum + sessionVolume(s), 0);
  const lastSession = completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Muscle group statuses
  const muscleStatuses = useMemo(
    () => getMuscleGroupStatuses(sessions, EXERCISE_MAP as Map<string, any>),
    [sessions]
  );

  // Top recommended exercises (exercises that are due for training)
  const topRecommendations = useMemo(() => {
    const prioritized = EXERCISES
      .filter(e => e.category === 'compound')
      .slice(0, 8)
      .map(e => ({
        exercise: e,
        rec: getRecommendationFor(e.id),
      }))
      .filter(x => x.rec.trend !== 'new' || x.rec.sessionsAnalyzed > 0)
      .sort((a, b) => {
        const order = { increase: 0, maintain: 1, deload: 2, decrease: 3, new: 4 };
        return order[a.rec.trend] - order[b.rec.trend];
      })
      .slice(0, 3);
    return prioritized;
  }, [getRecommendationFor]);

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <div className="pt-12 pb-4 px-4">
        <h1 className="text-2xl font-bold">{greet(user.name)}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {completedSessions.length === 0
            ? 'Lance ta première séance pour commencer ton suivi.'
            : `${thisWeekSessions.length} séance${thisWeekSessions.length > 1 ? 's' : ''} cette semaine`}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <StatCard
          icon={<Flame size={16} className="text-orange-400" />}
          label="Séances"
          value={String(completedSessions.length)}
          sub="total"
        />
        <StatCard
          icon={<Zap size={16} className="text-yellow-400" />}
          label="Cette semaine"
          value={String(thisWeekSessions.length)}
          sub="séances"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-green-400" />}
          label="Volume"
          value={totalVolumeThisWeek >= 1000 ? `${(totalVolumeThisWeek / 1000).toFixed(1)}t` : `${Math.round(totalVolumeThisWeek)}kg`}
          sub="7 jours"
        />
      </div>

      {/* Start workout CTA */}
      <div className="px-4">
        <button
          onClick={() => {
            const name = `Séance ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}`;
            startWorkout(name);
          }}
          className="w-full flex items-center justify-between p-4 bg-orange-500 hover:bg-orange-400 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-white">Nouvelle séance</div>
              <div className="text-orange-100 text-xs">
                {lastSession
                  ? `Dernière : ${formatDistanceToNow(new Date(lastSession.date), { addSuffix: true, locale: fr })}`
                  : 'Commencer maintenant'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/70" />
        </button>
      </div>

      {/* Muscle group status */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">État musculaire</h2>
        <div className="bg-[#111] rounded-2xl p-4 border border-[#1e1e1e]">
          <div className="grid grid-cols-3 gap-2">
            {muscleStatuses.slice(0, 9).map(m => (
              <div key={m.muscle} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${MUSCLE_STATUS_COLOR[m.status]}`} />
                <span className="text-xs text-slate-300 truncate">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1e1e1e]">
            {[
              { color: 'bg-green-500', label: 'Prêt' },
              { color: 'bg-yellow-500', label: 'Récup' },
              { color: 'bg-red-500', label: 'Fatigué' },
              { color: 'bg-slate-600', label: 'Inactif' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[10px] text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart recommendations */}
      {topRecommendations.length > 0 && (
        <div className="px-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recommandations IA</h2>
          <div className="space-y-2">
            {topRecommendations.map(({ exercise, rec }) => (
              <div
                key={exercise.id}
                className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TREND_BG[rec.trend]} ${TREND_COLOR[rec.trend]}`}>
                        {TREND_LABEL[rec.trend]}
                      </span>
                    </div>
                    <div className="font-semibold text-sm truncate">{exercise.name}</div>
                    <div className="text-orange-400 text-sm font-bold mt-0.5">
                      {rec.suggestedWeight}kg × {rec.suggestedSets} séries × {rec.suggestedReps[0]}-{rec.suggestedReps[1]} reps
                    </div>
                  </div>
                  {rec.estimated1RM && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-slate-500">1RM estimé</div>
                      <div className="text-sm font-bold text-slate-200">{rec.estimated1RM}kg</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Records récents</h2>
            <button onClick={() => navigate('progress')} className="text-xs text-orange-400">Voir tout</button>
          </div>
          <div className="space-y-2">
            {recentPRs.map((pr, i) => (
              <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy size={16} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{pr.exerciseName}</div>
                  <div className="text-xs text-slate-500">
                    {pr.type === 'estimated1rm' ? `1RM estimé : ${pr.value.toFixed(1)}kg` :
                     pr.type === 'weight' ? `Charge max : ${pr.value}kg` :
                     `Volume : ${Math.round(pr.value)}kg`}
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  {new Date(pr.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {completedSessions.length === 0 && (
        <div className="px-4">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
            <Dumbbell size={40} className="text-slate-700 mx-auto mb-3" />
            <div className="font-semibold text-slate-300 mb-1">Pas encore de données</div>
            <div className="text-sm text-slate-500">Lance ta première séance pour démarrer le suivi intelligent !</div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">{icon}<span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span></div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-600">{sub}</div>
    </div>
  );
}
