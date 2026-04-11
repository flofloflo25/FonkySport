import React, { useState } from 'react';
import { Calendar, ChevronRight, Clock, Dumbbell, TrendingUp, Trophy, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EXERCISE_MAP } from '@/data/exercises';
import { sessionVolume, exerciseVolume, best1RMFromSets } from '@/utils/calculations';
import type { WorkoutSession } from '@/types';

// ── Session Detail Modal ──────────────────────────────────────────────────────

function SessionDetail({ session, onClose }: { session: WorkoutSession; onClose: () => void }) {
  const totalVol = sessionVolume(session);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e1e]">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a1a]">
          <X size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate">{session.name}</h2>
          <p className="text-xs text-slate-500">
            {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Durée" value={session.durationMin ? `${session.durationMin}min` : '–'} />
          <MiniStat label="Exercices" value={String(session.exercises.length)} />
          <MiniStat
            label="Volume total"
            value={totalVol >= 1000 ? `${(totalVol / 1000).toFixed(1)}t` : `${Math.round(totalVol)}kg`}
          />
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-1">Notes</div>
            <p className="text-sm text-slate-300">{session.notes}</p>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-3">
          {session.exercises.map((we, i) => {
            const ex = EXERCISE_MAP.get(we.exerciseId);
            if (!ex) return null;
            const vol = exerciseVolume(we);
            const best1rm = best1RMFromSets(we.sets);
            const completedSets = we.sets.filter(s => s.completed);

            return (
              <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-sm">{ex.name}</div>
                    <div className="text-xs text-slate-500">{completedSets.length} séries complétées</div>
                  </div>
                  {best1rm > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500">1RM est.</div>
                      <div className="text-sm font-bold text-orange-400">{best1rm.toFixed(1)}kg</div>
                    </div>
                  )}
                </div>

                {/* Sets table */}
                <div className="space-y-1">
                  <div className="flex text-[10px] text-slate-600 uppercase tracking-wide px-1">
                    <span className="w-8">#</span>
                    <span className="flex-1 text-center">Charge</span>
                    <span className="flex-1 text-center">Reps</span>
                    <span className="flex-1 text-center">1RM est.</span>
                    <span className="w-12 text-center">RPE</span>
                  </div>
                  {we.sets.map((set, si) => (
                    <div
                      key={si}
                      className={`flex items-center px-1 py-1 rounded-lg text-sm ${set.completed ? '' : 'opacity-40'}`}
                    >
                      <span className="w-8 text-xs text-slate-600">{si + 1}</span>
                      <span className="flex-1 text-center font-medium">{set.weight}kg</span>
                      <span className="flex-1 text-center">{set.reps}</span>
                      <span className="flex-1 text-center text-orange-400 text-xs">
                        {set.completed && set.weight > 0 && set.reps > 0
                          ? `${(set.weight * (1 + set.reps / 30) * 0.97).toFixed(1)}kg`
                          : '–'}
                      </span>
                      <span className="w-12 text-center text-xs text-slate-500">
                        {set.rpe ? `${set.rpe}/10` : '–'}
                      </span>
                    </div>
                  ))}
                </div>

                {vol > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#1e1e1e] flex justify-between text-xs text-slate-500">
                    <span>Volume total</span>
                    <span className="font-medium text-slate-300">{Math.round(vol)}kg</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session, onClick }: { session: WorkoutSession; onClick: () => void }) {
  const vol = sessionVolume(session);
  const date = new Date(session.date);

  return (
    <button onClick={onClick} className="w-full bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-2xl p-4 text-left transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-orange-400 font-bold text-sm leading-none">
              {date.toLocaleDateString('fr-FR', { day: '2-digit' })}
            </span>
            <span className="text-orange-400/60 text-[9px] uppercase">
              {date.toLocaleDateString('fr-FR', { month: 'short' })}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{session.name}</div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              {session.durationMin && (
                <>
                  <span className="flex items-center gap-1"><Clock size={10} />{session.durationMin}min</span>
                  <span className="text-slate-700">·</span>
                </>
              )}
              <span>{session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}</span>
              {vol > 0 && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>{vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)}kg`}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-600 flex-shrink-0 mt-1" />
      </div>

      {/* Exercise chips */}
      {session.exercises.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {session.exercises.slice(0, 4).map((we, i) => {
            const ex = EXERCISE_MAP.get(we.exerciseId);
            return ex ? (
              <span key={i} className="text-[10px] bg-[#1a1a1a] text-slate-400 px-2 py-0.5 rounded-full">
                {ex.name.split(' ').slice(0, 2).join(' ')}
              </span>
            ) : null;
          })}
          {session.exercises.length > 4 && (
            <span className="text-[10px] bg-[#1a1a1a] text-slate-500 px-2 py-0.5 rounded-full">
              +{session.exercises.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ── Main History Page ─────────────────────────────────────────────────────────

export default function HistoryPage() {
  const sessions = useStore(s => s.sessions);
  const [selected, setSelected] = useState<WorkoutSession | null>(null);

  const completed = sessions
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const grouped = completed.reduce<Record<string, WorkoutSession[]>>((acc, session) => {
    const key = new Date(session.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});

  return (
    <div className="flex flex-col pb-4">
      <div className="pt-12 pb-4 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historique</h1>
          <p className="text-slate-400 text-sm mt-1">{completed.length} séance{completed.length > 1 ? 's' : ''} enregistrée{completed.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {completed.length === 0 ? (
        <div className="px-4">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
            <Calendar size={40} className="text-slate-700 mx-auto mb-3" />
            <div className="font-semibold text-slate-300 mb-1">Aucune séance terminée</div>
            <div className="text-sm text-slate-500">Complète ta première séance pour la voir ici.</div>
          </div>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {Object.entries(grouped).map(([month, monthSessions]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider capitalize">{month}</span>
                <span className="text-xs text-slate-600">— {monthSessions.length} séance{monthSessions.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {monthSessions.map(session => (
                  <SessionCard key={session.id} session={session} onClick={() => setSelected(session)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <SessionDetail session={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
