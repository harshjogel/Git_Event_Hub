import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Clock3, Download, ExternalLink, GitBranch, MapPin, RefreshCw, UserRound, UsersRound, X } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { EventVisual } from '@/components/event-visual';
import { SiteHeader } from '@/components/site-header';
import KineticGrid from '@/components/ui/kinetic-grid';
import { getEventById, submitRegistration, type ClubEvent } from '@/lib/api';

function addToCalendar(title: string, date: string, venue: string) {
  const start = new Date(date);
  const validStart = !Number.isNaN(start.getTime()) ? start : new Date();
  const end = new Date(validStart.getTime() + 90 * 60000);
  const stamp = (value: Date) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calendar = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${stamp(validStart)}\nDTEND:${stamp(end)}\nSUMMARY:${title}\nLOCATION:${venue}\nDESCRIPTION:Git Club event — free and open to all students.\nEND:VEVENT\nEND:VCALENDAR`;
  const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replaceAll(' ', '-')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration modal and state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('CHARUSAT');
  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const fetchEvent = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getEventById(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching event details:', err);
        setError('Unable to load events. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setRegError(null);
    setSubmitting(true);

    try {
      const response = await submitRegistration({
        event_id: event.id,
        name: name.trim(),
        email: email.trim(),
        college: college.trim() || 'CHARUSAT',
      });

      setRegistered(true);
      setRegSuccessMsg(response.message || 'Registration successful!');
      setIsModalOpen(false);

      // Increment local attendee count
      setEvent((prev) => (prev ? { ...prev, attendeeCount: prev.attendeeCount + 1 } : prev));
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0d0c1b] px-6 text-center text-slate-100" data-testid="loading-event-details">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-300" />
          <p className="mt-4 text-sm font-medium text-slate-300">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !event) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0d0c1b] px-6 text-center text-slate-100" data-testid="error-event-details">
        <div className="glass-panel max-w-md rounded-2xl p-8 shadow-2xl">
          <GitBranch className="mx-auto h-10 w-10 text-indigo-300" />
          <h1 className="mt-5 font-display text-3xl font-semibold">
            {error || 'Unable to load events. Please try again.'}
          </h1>
          <p className="mt-3 text-slate-400">This event may have moved or could not be loaded from the server.</p>
          <div className="mt-7 flex justify-center gap-4">
            <button
              onClick={fetchEvent}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[.08] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[.15]"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              data-testid="link-back-not-found"
            >
              <ArrowLeft className="h-4 w-4" /> Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = event.title || event.name;
  const dateLabel = event.dateLabel || event.date;
  const isPastEvent = event.past || event.is_past === 1;

  return (
    <KineticGrid transparentBg className="relative min-h-[100dvh] overflow-x-hidden bg-[#0c0b1a] text-slate-100">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/3 top-20 h-96 w-96 rounded-full bg-indigo-600/[.08] blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-96 h-80 w-80 rounded-full bg-cyan-500/[.06] blur-3xl" />

      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
        <motion.button
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => {
            setLocation('/');
            setTimeout(() => {
              document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              window.location.hash = 'events';
            }, 100);
          }}
          className="focus-ring mb-8 flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition hover:text-indigo-200"
          data-testid="button-back-events"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all events
        </motion.button>

        {/* Hero Event Card with Framer Motion Entrance */}
        <motion.section
          initial={{ opacity: 0, y: 30, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111027]/85 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl md:grid-cols-[.92fr_1.08fr]"
        >
          <EventVisual event={event as any} />
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <span className="font-mono-app text-[10px] uppercase tracking-[.2em] text-cyan-300">
              {event.category} / git club session
            </span>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-slate-100 sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
              {event.tagline || event.description}
            </p>
            <div className="mt-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
                <span>{dateLabel}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
                <span>{event.venue}</span>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              {!isPastEvent && (
                <button
                  onClick={() => {
                    if (!registered) {
                      setIsModalOpen(true);
                    }
                  }}
                  className={`focus-ring flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                    registered
                      ? 'bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(103,232,249,0.35)]'
                      : 'bg-indigo-300 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(165,180,252,0.35)]'
                  }`}
                  data-testid="button-register"
                >
                  {registered ? <Check className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                  {registered ? 'You’re registered' : 'Register — it’s free'}
                </button>
              )}
              <button
                onClick={() => addToCalendar(title, event.date, event.venue)}
                className="focus-ring flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[.1]"
                data-testid="button-add-calendar"
              >
                <Download className="h-4 w-4" /> Add to calendar
              </button>
            </div>

            {registered && (
              <p className="mt-4 flex items-center gap-2 text-xs text-cyan-300" data-testid="status-event-registration">
                <Check className="h-3.5 w-3.5" /> {regSuccessMsg || 'Registration successful!'} You’re on the list. We’ll see you there.
              </p>
            )}
            {!registered && !isPastEvent && (
              <p className="mt-4 text-xs text-slate-500">
                Free for students · persistent SQLite backend · no password required
              </p>
            )}
          </div>
        </motion.section>

        {/* Detailed Sections with Scroll Reveal Animations */}
        <div className="mx-auto mt-16 grid max-w-6xl gap-14 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-indigo-300">About this event</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-slate-100">Come curious. Leave capable.</h2>
              <p className="mt-5 text-base leading-8 text-slate-400">
                {event.about || event.full_description || event.description}
              </p>
            </motion.section>

            {event.learn && event.learn.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55 }}
                className="mt-12"
              >
                <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-indigo-300">You’ll leave with</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {event.learn.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: idx * 0.08 }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="glass-panel rounded-2xl p-5"
                    >
                      <Check className="h-5 w-5 text-cyan-300" />
                      <p className="mt-4 text-sm font-semibold leading-6 text-slate-200">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {event.schedule && event.schedule.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55 }}
                className="mt-12"
              >
                <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-indigo-300">Run of show</p>
                <div className="mt-5 divide-y divide-white/[.08] border-y border-white/[.08]">
                  {event.schedule.map((item, index) => (
                    <motion.div
                      key={item.time + index}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      className="grid grid-cols-[4.4rem_1fr] gap-4 py-5 sm:grid-cols-[5.5rem_1fr]"
                    >
                      <span className="font-mono-app text-xs text-cyan-300">{item.time}</span>
                      <div>
                        <h3 className="font-semibold text-slate-200">{item.label}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                      </div>
                      <span className="sr-only">Step {index + 1}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          <aside className="lg:pt-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
              className="glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-app text-[10px] uppercase tracking-[.18em] text-slate-500">Event info</span>
                <span className="flex items-center gap-1.5 text-xs text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_hsl(186_77%_55%)]" /> {event.attendeeCount} going
                </span>
              </div>
              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <UsersRound className="h-4 w-4 shrink-0 text-indigo-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">A room for every level</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{event.attendance || 'Open to all students.'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-indigo-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Find your way in</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {event.venue}. Look for the Git Club sign at the entrance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-indigo-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">No hidden steps</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Capacity: {event.capacity || 100} students · Organizer: {event.organizer || 'Git Club'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-7 border-t border-white/10 pt-5">
                <a
                  href="/#events"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation('/');
                    setTimeout(() => {
                      document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
                      window.location.hash = 'events';
                    }, 100);
                  }}
                  className="flex cursor-pointer items-center justify-between text-sm font-semibold text-indigo-200 hover:text-cyan-300 transition"
                  data-testid="link-more-events"
                >
                  See more events <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.04] p-6 backdrop-blur-sm"
            >
              <p className="text-sm font-semibold text-cyan-100">New here?</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                You don’t need to know anyone or bring the right vocabulary. Just bring a question.
              </p>
            </motion.div>
          </aside>
        </div>
      </main>

      {/* Registration Modal Dialog with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reg-modal-title"
            data-testid="registration-modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#121128] p-6 shadow-2xl sm:p-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
                aria-label="Close registration modal"
              >
                <X className="h-5 w-5" />
              </button>

              <span className="font-mono-app text-[10px] uppercase tracking-[.2em] text-cyan-300">
                Registration
              </span>
              <h2 id="reg-modal-title" className="mt-2 font-display text-2xl font-bold text-slate-100">
                Register for {title}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Join this session. Your registration will be saved to the database.
              </p>

              {regError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
                  data-testid="registration-error-message"
                >
                  {regError}
                </motion.div>
              )}

              <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harsh Patel"
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-300/50"
                    data-testid="input-registration-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. harsh@example.com"
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-300/50"
                    data-testid="input-registration-email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. CHARUSAT"
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-300/50"
                    data-testid="input-registration-college"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(103,232,249,0.35)] disabled:opacity-50"
                    data-testid="button-submit-registration"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Confirm Registration'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/[.07] bg-[#0a0914]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 sm:px-8">
          <Link href="/" className="font-display text-lg font-bold text-slate-100" data-testid="link-detail-footer-logo">
            git club<span className="text-indigo-300">.</span>
          </Link>
          <span className="text-xs text-slate-600">Build. Learn. Collaborate.</span>
        </div>
      </footer>
    </KineticGrid>
  );
}