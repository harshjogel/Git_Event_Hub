import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import KineticGrid from '@/components/ui/kinetic-grid';

export default function NotFound() {
  return (
    <KineticGrid transparentBg className="flex min-h-screen w-full items-center justify-center bg-[#090814] px-4 text-slate-100">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
        <div className="mb-4 inline-flex rounded-2xl border border-indigo-300/20 bg-indigo-300/10 p-4 text-indigo-300">
          <AlertCircle className="h-8 w-8 text-cyan-300" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-100">
          404 Page Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          This branch does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
      </div>
    </KineticGrid>
  );
}
