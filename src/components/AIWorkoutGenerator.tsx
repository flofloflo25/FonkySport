import React, { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import {
  Sparkles, Loader2, Play, RefreshCw,
  Key, Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EXERCISES, EXERCISE_MAP } from '@/data/exercises';
import { getMuscleGroupStatuses } from '@/utils/recommendations';

// ── Constants ──────────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  strength:    'Force (3–5 reps, charges max)',
  hypertrophy: 'Hypertrophie (8–12 reps, croissance musculaire)',
  endurance:   'Endurance (15+ reps, volume élevé)',
  general:     'Général (équilibre force / volume)',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner:     'Débutant',
  intermediate: 'Intermédiaire',
  advanced:     'Avancé',
};

const STATUS_LABELS: Record<string, string> = {
  fresh:    'Prêt (récupéré)',
  trained:  'En récupération',
  tired:    'Fatigué (éviter)',
  neglected:'Inactif depuis longtemps',
};

const SYSTEM_PROMPT = `Tu es FonkyCoach, un coach de musculation expert intégré à l'application FonkySport.

Ton rôle : analyser les données d'entraînement de l'utilisateur et proposer la séance optimale pour aujourd'hui, en tenant compte de sa récupération musculaire, de son objectif et de ses performances passées.

Réponds TOUJOURS en français. Sois motivant, précis et concis.

STRUCTURE TA RÉPONSE en 2 parties exactement :

1. Analyse courte (3-4 phrases max) :
   - Muscles ciblés aujourd'hui et pourquoi (récupération, équilibre, priorités)
   - Approche de progression adaptée à l'objectif
   - Un conseil clé pour optimiser la séance

2. Bloc JSON obligatoire (à la fin de ta réponse) :
\`\`\`json
{
  "sessionName": "Nom court de la séance",
  "exercises": ["exercise_id_1", "exercise_id_2"]
}
\`\`\`

RÈGLES STRICTES :
- Utilise UNIQUEMENT les IDs d'exercices de la liste fournie (respecte l'orthographe exacte)
- Débutant : 4 exercices | Intermédiaire : 5–6 | Avancé : 6–7
- Toujours commencer par les exercices composés, puis les isolations
- Évite impérativement les muscles en état "Fatigué"
- Adapte à l'objectif : force = composés lourds, hypertrophie = volume + isolation, endurance = variété`;

// ── Context builder ───────────────────────────────────────────────────────────

function buildContext(
  user: ReturnType<typeof useStore.getState>['user'],
  sessions: ReturnType<typeof useStore.getState>['sessions'],
  personalRecords: ReturnType<typeof useStore.getState>['personalRecords'],
): string {
  const muscleStatuses = getMuscleGroupStatuses(sessions, EXERCISE_MAP as Map<string, any>);
  const muscleStatusText = muscleStatuses
    .map(m => `  - ${m.label} : ${STATUS_LABELS[m.status] ?? m.status}`)
    .join('\n');

  const recentSessions = [...sessions]
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const sessionsText = recentSessions.length === 0
    ? '  (Aucune séance enregistrée — programme de départ pour débutant)'
    : recentSessions.map(sess => {
        const exLines = sess.exercises.map(we => {
          const ex = EXERCISE_MAP.get(we.exerciseId);
          const bestSet = we.sets
            .filter(s => s.completed && s.weight > 0)
            .sort((a, b) => b.weight * b.reps - a.weight * a.reps)[0];
          return bestSet
            ? `    • ${ex?.name ?? we.exerciseId} : meilleure série ${bestSet.weight}kg × ${bestSet.reps} reps`
            : `    • ${ex?.name ?? we.exerciseId}`;
        }).join('\n');
        return `  ${new Date(sess.date).toLocaleDateString('fr-FR')} – ${sess.name}\n${exLines}`;
      }).join('\n\n');

  const prsText = personalRecords.length === 0
    ? '  (Aucun record pour l\'instant)'
    : [...personalRecords]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8)
        .map(pr => {
          const ex = EXERCISE_MAP.get(pr.exerciseId);
          const typeLabel = pr.type === 'estimated1rm' ? '1RM estimé' : pr.type === 'weight' ? 'charge max' : 'volume';
          return `  • ${ex?.name ?? pr.exerciseId} : ${typeLabel} ${pr.value.toFixed(1)}kg`;
        }).join('\n');

  const exerciseList = EXERCISES
    .map(e => `  ${e.id} | ${e.name} | ${e.muscles.join(', ')} | ${e.category}`)
    .join('\n');

  return `PROFIL UTILISATEUR :
- Prénom : ${user.name || 'Athlète'}
- Objectif : ${GOAL_LABELS[user.goal] ?? user.goal}
- Niveau : ${LEVEL_LABELS[user.experienceLevel] ?? user.experienceLevel}
- Poids de corps : ${user.bodyweight ? `${user.bodyweight}kg` : 'non renseigné'}

ÉTAT MUSCULAIRE AUJOURD'HUI :
${muscleStatusText}

DERNIÈRES SÉANCES (${recentSessions.length} séances récentes) :
${sessionsText}

RECORDS PERSONNELS :
${prsText}

EXERCICES DISPONIBLES (format : id | nom | muscles | type) :
${exerciseList}

→ Propose-moi la meilleure séance pour aujourd'hui.`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ProposedPlan {
  sessionName: string;
  exercises: string[];
}

export default function AIWorkoutGenerator() {
  const { user, sessions, personalRecords, anthropicApiKey, setAnthropicApiKey, startWorkoutWithPlan } =
    useStore(s => ({
      user: s.user,
      sessions: s.sessions,
      personalRecords: s.personalRecords,
      anthropicApiKey: s.anthropicApiKey,
      setAnthropicApiKey: s.setAnthropicApiKey,
      startWorkoutWithPlan: s.startWorkoutWithPlan,
    }));

  const [loading, setLoading]             = useState(false);
  const [streamedText, setStreamedText]   = useState('');
  const [proposedPlan, setProposedPlan]   = useState<ProposedPlan | null>(null);
  const [error, setError]                 = useState('');
  const [showKeyInput, setShowKeyInput]   = useState(false);
  const [tempKey, setTempKey]             = useState('');
  const [showKey, setShowKey]             = useState(false);
  const [collapsed, setCollapsed]         = useState(false);

  // ── Key input UI ──────────────────────────────────────────────────────────

  if (showKeyInput) {
    return (
      <div className="px-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Coach IA</h2>
        <div className="bg-[#111] border border-orange-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} className="text-orange-400" />
            <span className="font-semibold text-sm">Clé API Anthropic</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Entre ta clé API Anthropic pour activer le Coach IA. Elle est stockée uniquement sur ton appareil.
          </p>
          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              autoFocus
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowKeyInput(false); setTempKey(''); }}
              className="flex-1 py-2.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                const k = tempKey.trim();
                if (k) { setAnthropicApiKey(k); setShowKeyInput(false); setTempKey(''); }
              }}
              disabled={!tempKey.trim()}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Generate handler ──────────────────────────────────────────────────────

  async function generate() {
    if (!anthropicApiKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setStreamedText('');
    setProposedPlan(null);
    setError('');
    setCollapsed(false);

    try {
      const client = new Anthropic({ apiKey: anthropicApiKey, dangerouslyAllowBrowser: true });
      const userMessage = buildContext(user, sessions, personalRecords);
      let fullText = '';

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullText += event.delta.text;
          setStreamedText(fullText);
        }
      }

      // Parse the JSON workout plan from the response
      const jsonMatch = fullText.match(/```json\n([\s\S]+?)\n```/);
      if (jsonMatch) {
        try {
          const plan = JSON.parse(jsonMatch[1]);
          if (plan.sessionName && Array.isArray(plan.exercises)) {
            const validExercises = (plan.exercises as string[]).filter(id => EXERCISE_MAP.has(id));
            if (validExercises.length > 0) {
              setProposedPlan({ sessionName: plan.sessionName, exercises: validExercises });
            }
          }
        } catch {
          // JSON parse failed; text response is still shown
        }
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Clé API invalide. Mets-la à jour dans l\'onglet Profil.');
      } else {
        setError(err?.message ?? 'Erreur lors de la génération. Réessaie.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  // Strip the JSON block from the display text
  const displayText = streamedText.replace(/```json[\s\S]*?```/g, '').trim();

  return (
    <div className="px-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Coach IA</h2>
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">

        {/* Header / Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center gap-3 p-4 hover:bg-[#181818] transition-colors disabled:opacity-70 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            {loading
              ? <Loader2 size={18} className="text-orange-400 animate-spin" />
              : streamedText
              ? <RefreshCw size={18} className="text-orange-400" />
              : <Sparkles size={18} className="text-orange-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {loading
                ? 'Analyse en cours...'
                : streamedText
                ? 'Régénérer l\'entraînement'
                : 'Générer mon entraînement'}
            </div>
            <div className="text-xs text-slate-500">
              {!anthropicApiKey
                ? 'Appuie pour configurer ta clé API'
                : loading
                ? 'Claude Opus 4.6 réfléchit...'
                : 'Claude Opus 4.6 · Personnalisé'}
            </div>
          </div>
          {streamedText && !loading && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setCollapsed(v => !v); }}
              className="p-1 text-slate-500 hover:text-slate-300 flex-shrink-0"
            >
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </button>

        {/* Streaming response text */}
        {displayText && !collapsed && (
          <div className="border-t border-[#1a1a1a] p-4">
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {displayText}
              {loading && (
                <span className="inline-block w-1.5 h-4 bg-orange-400 ml-0.5 rounded-sm animate-pulse align-middle" />
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border-t border-[#1a1a1a] px-4 py-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Proposed exercise list + start button */}
        {proposedPlan && !collapsed && (
          <div className="border-t border-[#1a1a1a] p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Programme · {proposedPlan.sessionName}
            </div>
            <div className="space-y-2 mb-4">
              {proposedPlan.exercises.map((id, i) => {
                const ex = EXERCISE_MAP.get(id);
                if (!ex) return null;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-4 flex-shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">{ex.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{ex.muscles.join(' · ')}</div>
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
              })}
            </div>
            <button
              onClick={() => startWorkoutWithPlan(proposedPlan.sessionName, proposedPlan.exercises)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl font-bold text-sm transition-colors"
            >
              <Play size={15} />
              Démarrer cette séance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
