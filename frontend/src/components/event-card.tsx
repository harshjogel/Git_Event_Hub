import { ArrowUpRight, CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { EventVisual } from '@/components/event-visual';
import type { ClubEvent } from '@/lib/api';

export function EventCard({ event, index = 0 }: { event: ClubEvent; index?: number }) {
  const eventLink = `/events/${event.id || event.slug}`;
  const title = event.title || event.name;
  const dateLabel = event.dateLabel || event.date;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="glass-panel group overflow-hidden rounded-2xl transition-colors duration-300 hover:border-indigo-300/40 hover:bg-indigo-950/30"
      data-testid={`card-event-${event.slug || event.id}`}
    >
      <EventVisual event={event as any} compact />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono-app text-[10px] uppercase tracking-[.18em] text-cyan-300">{event.category}</span>
          <span className="rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-[10px] text-slate-400">{dateLabel}</span>
        </div>
        <h3 className="font-display text-xl font-semibold tracking-tight text-slate-100">{title}</h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-400">{event.description}</p>
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
          <span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-indigo-300" />{event.time}</span>
          <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-indigo-300" />{event.venue}</span>
        </div>
        <Link
          href={eventLink}
          className="focus-ring mt-5 flex items-center justify-between rounded-xl border border-indigo-300/20 bg-indigo-300/[.07] px-4 py-3 text-sm font-semibold text-indigo-100 transition hover:border-indigo-300/50 hover:bg-indigo-300/[.14]"
          data-testid={`link-view-details-${event.slug || event.id}`}
        >
          <span className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-cyan-300" />{event.attendeeCount} going</span>
          <span className="flex items-center gap-1">View details <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
        </Link>
      </div>
    </motion.article>
  );
}

export function FeaturedEventCard({ event }: { event: ClubEvent }) {
  const eventLink = `/events/${event.id || event.slug}`;
  const title = event.title || event.name;
  const dateLabel = event.dateLabel || event.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel grid overflow-hidden rounded-[1.75rem] md:grid-cols-[1.02fr_.98fr]"
      data-testid={`featured-event-${event.slug || event.id}`}
    >
      <EventVisual event={event as any} />
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-app text-[10px] uppercase tracking-[.2em] text-cyan-300">Next on the branch</span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">Featured</span>
          </div>
          <h2 className="mt-7 max-w-lg font-display text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-lg text-base leading-7 text-slate-400">{event.tagline}</p>
          <div className="mt-7 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-indigo-300" />{dateLabel} · {event.time}</div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-indigo-300" />{event.venue}</div>
          </div>
        </div>
        <Link href={eventLink} className="focus-ring mt-8 flex w-fit items-center gap-2 rounded-xl bg-indigo-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(103,232,249,0.35)]" data-testid={`link-featured-${event.slug || event.id}`}>
          See event details <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}