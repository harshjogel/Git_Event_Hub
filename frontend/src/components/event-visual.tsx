import { GitBranch, GitPullRequest, Laptop2, Rocket, Terminal, Trophy, UsersRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ClubEvent } from '@/data/events';

const visualMeta = {
  branch: { className: 'from-indigo-950 via-violet-900 to-slate-950', icon: GitBranch, label: 'branch / begin' },
  terminal: { className: 'from-slate-900 via-indigo-950 to-cyan-950', icon: Terminal, label: 'open / source' },
  sprint: { className: 'from-violet-950 via-fuchsia-950 to-indigo-950', icon: Trophy, label: 'race / resolve' },
  social: { className: 'from-indigo-950 via-slate-900 to-cyan-950', icon: UsersRound, label: 'people / first' },
  rocket: { className: 'from-violet-950 via-indigo-900 to-slate-950', icon: Rocket, label: 'ship / together' },
} as const;

export function EventVisual({ event, compact = false }: { event: ClubEvent; compact?: boolean }) {
  const visualKey = (event.visual && visualMeta[event.visual]) ? event.visual : 'branch';
  const meta = visualMeta[visualKey];
  const Icon = meta.icon;
  return (
    <div
      className={`event-visual bg-gradient-to-br ${meta.className} ${compact ? 'h-44' : 'h-64'} w-full`}
      style={{ '--visual-bg': 'hsl(246 31% 12%)', '--visual-glow': visualKey === 'terminal' ? 'hsl(186 77% 55% / .5)' : 'hsl(255 91% 70% / .55)' } as CSSProperties}
      data-testid={`visual-event-${event.slug || (event as any).id}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/15 bg-white/[.07] shadow-2xl backdrop-blur-md">
          <Icon className="h-12 w-12 text-indigo-200" strokeWidth={1.35} />
          <span className="absolute -right-3 -top-3 rounded-full border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-200">
            {visualKey === 'branch' ? <GitPullRequest className="h-4 w-4" /> : visualKey === 'terminal' ? <Laptop2 className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
          </span>
        </div>
      </div>
      <div className="absolute bottom-4 left-5 font-mono-app text-[10px] uppercase tracking-[.22em] text-indigo-200/70">{meta.label}</div>
      <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_hsl(186_77%_55%)]" />
    </div>
  );
}