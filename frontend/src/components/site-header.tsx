import { GitBranch, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';

const navItems = [
  { label: 'Events', id: 'events', href: '/#events' },
  { label: 'About the club', id: 'about', href: '/#about' },
  { label: 'Past events', id: 'past', href: '/#past' },
];

export function SiteHeader() {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const isHome = location === '/';

  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);

    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      setLocation('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        window.location.hash = sectionId;
      }, 100);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-[#0d0c1b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="focus-ring flex items-center gap-3" onClick={() => setOpen(false)} data-testid="link-logo">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-300 text-slate-950 shadow-[0_0_25px_hsl(255_91%_70%/.25)]">
            <GitBranch className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-100">
            git club<span className="text-indigo-300">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleNavClick(item.id, e)}
              className="focus-ring cursor-pointer text-sm text-slate-400 transition hover:text-indigo-200"
              data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Find an event button */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="font-mono-app text-[10px] uppercase tracking-[.18em] text-slate-500">Fall / 25</span>
          <a
            href="/#events"
            onClick={(e) => handleNavClick('events', e)}
            className="focus-ring cursor-pointer rounded-xl border border-indigo-300/30 bg-indigo-300/10 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-300/20"
            data-testid="link-find-event"
          >
            Find an event
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="focus-ring rounded-lg p-2 text-slate-200 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          data-testid="button-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {open && (
        <nav className="border-t border-white/[.07] bg-[#111027] px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item.id, e)}
                className="cursor-pointer rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/[.05] hover:text-white"
                data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="/#events"
              onClick={(e) => handleNavClick('events', e)}
              className="mt-2 block cursor-pointer rounded-lg bg-indigo-300 px-3 py-3 text-center text-sm font-bold text-slate-950"
              data-testid="link-mobile-find-event"
            >
              Find an event
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}