import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUp, CalendarDays, Check, ChevronRight, Code2, GitCommitHorizontal, HeartHandshake, RefreshCw, Search, Sparkles, UsersRound, X } from 'lucide-react';
import { Link } from 'wouter';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { EventCard, FeaturedEventCard } from '@/components/event-card';
import { SiteHeader } from '@/components/site-header';
import { LiquidChrome } from '@/components/liquid-chrome';
import { categories, type EventCategory } from '@/data/events';
import { getEvents, type ClubEvent } from '@/lib/api';

function Countdown({ targetDate }: { targetDate?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parsedTarget = targetDate ? new Date(targetDate).getTime() : NaN;
  const validTarget = !Number.isNaN(parsedTarget) ? parsedTarget : Date.now() + 86400000 * 8;
  const remaining = Math.max(0, validTarget - now);

  const units = [
    Math.floor(remaining / 86400000),
    Math.floor((remaining / 3600000) % 24),
    Math.floor((remaining / 60000) % 60),
  ];
  return (
    <div className="flex items-end gap-3" data-testid="countdown-featured">
      {units.map((value, index) => (
        <div key={index} className="min-w-12">
          <div className="font-mono-app text-2xl font-medium tracking-tight text-slate-100">
            {String(value).padStart(2, '0')}
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[.18em] text-slate-500">
            {['days', 'hrs', 'min'][index]}
          </div>
        </div>
      ))}
      <span className="mb-4 text-slate-600">:</span>
      <div className="min-w-12">
        <div className="font-mono-app text-2xl font-medium tracking-tight text-cyan-300">
          {String(Math.floor((remaining / 1000) % 60)).padStart(2, '0')}
        </div>
        <div className="mt-1 text-[9px] uppercase tracking-[.18em] text-slate-500">sec</div>
      </div>
    </div>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <motion.span
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      className="font-display text-2xl font-semibold text-slate-100"
    >
      {count}{suffix}
    </motion.span>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | EventCategory>('All');
  const [eventsList, setEventsList] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll Progress Bar using Framer Motion
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchClubEvents = () => {
    setLoading(true);
    setError(null);
    getEvents()
      .then((data) => {
        setEventsList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading events:', err);
        setError('Unable to load events. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClubEvents();
  }, []);

  // Handle in-page hash scrolling smoothly after events are loaded
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    if (!loading) {
      const timer = setTimeout(scrollToHash, 150);
      return () => clearTimeout(timer);
    }

    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [loading]);

  const featuredEvent = useMemo(() => {
    return (
      eventsList.find((event) => event.featured && !event.past && !event.is_past) ||
      eventsList.find((event) => !event.past && !event.is_past) ||
      eventsList[0]
    );
  }, [eventsList]);

  const upcoming = useMemo(() => {
    return eventsList.filter((event) => {
      const isPast = event.past || event.is_past === 1;
      const isFeatured = featuredEvent && (event.id === featuredEvent.id || event.slug === featuredEvent.slug);
      return !isPast && !isFeatured;
    });
  }, [eventsList, featuredEvent]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return upcoming.filter((event) => {
      const matchesCategory = category === 'All' || event.category === category;
      const haystack = `${event.title || event.name} ${event.category} ${event.description} ${event.venue}`.toLowerCase();
      return matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [category, query, upcoming]);

  const past = useMemo(() => {
    return eventsList.filter((event) => event.past || event.is_past === 1);
  }, [eventsList]);

  const handleScrollToEvents = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('events');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '/#events');
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#090814] text-slate-100">
      {/* Top Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-400 origin-left z-[60] shadow-[0_0_12px_rgba(103,232,249,0.7)]"
      />

      <SiteHeader />
      <main>
        {/* Hero Section with Liquid Chrome WebGL Shader Animation */}
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 lg:pb-28 lg:pt-48">
          {/* Liquid Chrome Interactive Background Layer */}
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-[46rem] overflow-hidden opacity-35 [mask-image:radial-gradient(ellipse_at_top,black_45%,transparent_75%)]">
            <LiquidChrome
              baseColor={[0.18, 0.22, 0.55]}
              speed={0.24}
              amplitude={0.32}
              interactive={true}
              className="h-full w-full"
            />
          </div>

          <div className="grid-texture pointer-events-none absolute inset-x-0 top-0 h-[38rem] opacity-70" />
          <div className="absolute -right-32 top-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute -left-20 top-40 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/[.07] px-3 py-1.5 font-mono-app text-[10px] uppercase tracking-[.2em] text-indigo-200 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_hsl(186_77%_55%)]" /> student-built · campus-wide
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-7 max-w-4xl font-display text-[clamp(3.7rem,10vw,8.8rem)] font-semibold leading-[.9] tracking-[-.075em] text-slate-100"
            >
              Build.<br /><span className="text-indigo-300">Learn.</span><br />Collaborate<span className="text-cyan-300">.</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-9 flex max-w-2xl flex-col justify-between gap-8 md:flex-row md:items-end"
            >
              <p className="max-w-md text-base leading-7 text-slate-300/90 sm:text-lg">
                The student-first tech community for showing up, making useful things, and finding your people along the way.
              </p>
              <a
                href="#events"
                onClick={handleScrollToEvents}
                className="focus-ring flex w-fit shrink-0 items-center gap-2 rounded-xl bg-indigo-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(103,232,249,0.4)]"
                data-testid="link-hero-explore"
              >
                Explore events <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          {/* Liquid Chrome Floating Glass Card on Right */}
          <div className="animate-float absolute bottom-24 right-[8%] hidden h-32 w-48 rotate-6 overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#111027]/85 p-4 shadow-[0_0_35px_rgba(99,102,241,0.25)] backdrop-blur-xl lg:block">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <LiquidChrome
                baseColor={[0.25, 0.3, 0.75]}
                speed={0.32}
                amplitude={0.4}
                interactive={false}
                className="h-full w-full"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 font-mono-app text-[10px] text-cyan-200">
                <GitCommitHorizontal className="h-3.5 w-3.5 text-cyan-300" /> commit / together
              </div>
              <div className="mt-5 h-1.5 w-20 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(165,180,252,0.8)]" />
              <div className="mt-2.5 h-1 w-28 rounded-full bg-slate-700" />
              <div className="mt-2.5 h-1 w-12 rounded-full bg-cyan-300/70" />
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8" data-testid="loading-events">
            <div className="glass-panel mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-300" />
              <p className="mt-4 text-sm font-medium text-slate-300">Loading events...</p>
            </div>
          </section>
        )}

        {/* Error State */}
        {!loading && error && (
          <section className="mx-auto max-w-7xl px-5 py-12 text-center sm:px-8" data-testid="error-events">
            <div className="glass-panel mx-auto max-w-md rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center">
              <p className="font-medium text-rose-300">Unable to load events. Please try again.</p>
              <button
                onClick={fetchClubEvents}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                data-testid="button-retry-events"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try Again
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* Rest of the page below Hero */}
        {/* ========================================================================= */}
        {!loading && !error && (
          <div className="relative border-t border-white/[.07] bg-[#090814]">
            {/* Ambient subtle glow lights for depth */}
            <div className="pointer-events-none absolute left-1/4 top-32 h-96 w-96 rounded-full bg-indigo-600/[.07] blur-3xl" />
            <div className="pointer-events-none absolute right-1/4 top-[40%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/[.05] blur-3xl" />
            <div className="pointer-events-none absolute left-1/3 bottom-40 h-80 w-80 rounded-full bg-violet-600/[.06] blur-3xl" />

            <div className="relative z-10">
              {/* Featured Event Section with Framer Motion Scrolling Animation */}
              {featuredEvent && (
                <section className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8" id="next">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-6 flex items-end justify-between gap-4"
                  >
                    <div>
                      <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-cyan-300">00 / next up</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold text-slate-100 sm:text-3xl">Start with a room.</h2>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-slate-500">Doors open in</p>
                      <Countdown targetDate={featuredEvent.date} />
                    </div>
                  </motion.div>

                  <FeaturedEventCard event={featuredEvent} />

                  <div className="mt-4 flex items-center justify-between sm:hidden">
                    <span className="text-xs text-slate-500">Doors open in</span>
                    <Countdown targetDate={featuredEvent.date} />
                  </div>
                </section>
              )}

              {/* Upcoming Events Section with Framer Motion Scrolling Animation */}
              <section className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-28 sm:px-8" id="events">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55 }}
                  className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
                >
                  <div>
                    <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-indigo-300">01 / find your next</p>
                    <h2 className="mt-2 font-display text-3xl font-semibold text-slate-100 sm:text-4xl">Upcoming events</h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                      Practical sessions, friendly competition, and build nights that leave you with more than a contact card.
                    </p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search events, venues, topics..."
                      className="focus-ring h-11 w-full rounded-xl border border-white/10 bg-white/[.04] pl-10 pr-10 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-300/50 backdrop-blur-sm"
                      data-testid="input-search-events"
                    />
                    {query && (
                      <button className="absolute right-3 top-3 text-slate-500 hover:text-slate-200" onClick={() => setQuery('')} aria-label="Clear search" data-testid="button-clear-search">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Filter Pills with Motion Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="mt-7 flex gap-2 overflow-x-auto pb-2"
                  role="list"
                  aria-label="Event categories"
                >
                  {categories.map((item) => (
                    <motion.button
                      key={item}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(item)}
                      className={`focus-ring whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${category === item ? 'border-indigo-300/60 bg-indigo-300 text-slate-950 shadow-[0_0_15px_rgba(165,180,252,0.35)]' : 'border-white/10 bg-white/[.03] text-slate-400 hover:border-white/20 hover:text-slate-100 backdrop-blur-sm'}`}
                      data-testid={`button-filter-${item.toLowerCase()}`}
                    >
                      {item}
                    </motion.button>
                  ))}
                </motion.div>

                {filtered.length ? (
                  <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((event, index) => (
                      <EventCard key={event.id || event.slug} event={event} index={index} />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel mt-8 flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
                    data-testid="empty-events"
                  >
                    <div className="mb-4 rounded-2xl border border-indigo-300/20 bg-indigo-300/10 p-4 text-indigo-200"><Search className="h-6 w-6" /></div>
                    <h3 className="font-display text-xl font-semibold text-slate-100">No events on this branch.</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Try a different keyword or category. The good stuff is usually one filter away.</p>
                    <button className="mt-5 text-sm font-semibold text-cyan-300 hover:text-cyan-200" onClick={() => { setQuery(''); setCategory('All'); }} data-testid="button-reset-filters">Reset filters</button>
                  </motion.div>
                )}
              </section>

              {/* Why Git Club Section with Framer Motion Scrolling Animation */}
              <section className="scroll-mt-24 border-y border-white/[.07] bg-[#0e0d20]/75 backdrop-blur-md" id="about">
                <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:py-28">
                  <motion.div
                    initial={{ opacity: 0, x: -35 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-cyan-300">02 / why git club</p>
                    <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight text-slate-100 sm:text-5xl">You don’t need to be an expert to get in the room.</h2>
                    <p className="mt-6 max-w-lg text-base leading-8 text-slate-400">
                      Git Club is a weekly reason to put the syllabus down and make something with people who are figuring it out too. Come with a question, leave with a next step.
                    </p>
                    <a
                      href="#events"
                      onClick={handleScrollToEvents}
                      className="focus-ring mt-8 inline-flex items-center gap-2 text-sm font-bold text-indigo-200 transition hover:text-cyan-300"
                      data-testid="link-about-events"
                    >
                      Find your next step <ChevronRight className="h-4 w-4" />
                    </a>
                  </motion.div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: Code2, title: 'Practical by default', copy: 'Bring a real project. Leave with a real improvement.' },
                      { icon: HeartHandshake, title: 'Friendly on purpose', copy: 'No gatekeeping, no assumed background, no awkward first visit.' },
                      { icon: Sparkles, title: 'Momentum over polish', copy: 'We celebrate the shipped, the learned, and the tried.' },
                      { icon: UsersRound, title: 'Find your people', copy: 'Pair up, share context, and make campus feel smaller.' }
                    ].map(({ icon: Icon, title, copy }, idx) => (
                      <motion.div
                        key={title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                        whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                        className="glass-panel rounded-2xl p-5"
                      >
                        <Icon className="h-5 w-5 text-indigo-300" />
                        <h3 className="mt-5 font-display text-lg font-semibold text-slate-100">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Past Events Section with Framer Motion Scrolling Animation */}
              {past.length > 0 && (
                <section className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8" id="past">
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-end justify-between"
                  >
                    <div>
                      <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-indigo-300">03 / from the log</p>
                      <h2 className="mt-2 font-display text-3xl font-semibold text-slate-100 sm:text-4xl">Good things we’ve shipped.</h2>
                    </div>
                    <span className="hidden font-mono-app text-xs text-slate-500 sm:block">archive / past events</span>
                  </motion.div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {past.map((event, index) => (
                      <EventCard key={event.id || event.slug} event={event} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* Community Stats Banner with Animated Numbers on Scroll */}
              <section className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-panel grid overflow-hidden rounded-3xl md:grid-cols-[1.35fr_.65fr]"
                >
                  <div className="p-7 sm:p-10">
                    <p className="font-mono-app text-[10px] uppercase tracking-[.2em] text-cyan-300">04 / bring a friend</p>
                    <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-slate-100 sm:text-4xl">The fastest way to feel at home is to show up twice.</h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">Every event is free. Every skill level has a place. Every small hello makes the next event easier.</p>
                  </div>
                  <div className="flex items-center border-t border-white/10 bg-indigo-300/[.05] p-7 md:border-l md:border-t-0">
                    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 text-center sm:grid-cols-4">
                      <div>
                        <AnimatedCounter value={50} suffix="+" />
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">events organized</div>
                      </div>
                      <div>
                        <AnimatedCounter value={2000} suffix="+" />
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">students reached</div>
                      </div>
                      <div>
                        <AnimatedCounter value={35} suffix="+" />
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">industry speakers</div>
                      </div>
                      <div>
                        <AnimatedCounter value={15} suffix="+" />
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">hackathons + competitions</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/40 bg-[#121128]/90 text-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.3)] backdrop-blur-md hover:bg-cyan-300 hover:text-slate-950 transition"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/[.07] bg-[#0a0914]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="font-display text-lg font-bold text-slate-100" data-testid="link-footer-logo">git club<span className="text-indigo-300">.</span></Link>
            <p className="mt-2 text-xs text-slate-500">Make the next commit count.</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <a href="mailto:hello@gitclub.campus" className="hover:text-indigo-200" data-testid="link-footer-email">hello@gitclub.campus</a>
            <span>© 2026 Git Club</span>
          </div>
        </div>
      </footer>
    </div>
  );
}