import { Timeline } from "@/components/timeline/Timeline";
import { PlanningProvider } from "@/context/PlanningContext";
import { ModeToggle } from "@/components/mode-toggle";
import { Plane, Tractor, Droplets, FlaskConical, Search, Calendar, ChevronLeft, ChevronRight, Menu, Beaker, Sprout } from 'lucide-react';

export default function Home() {
  return (
    <PlanningProvider>
      <main className="flex h-screen w-full flex-col bg-background overflow-hidden relative">
        {/* Background Effects */}
        {/* Background Effects */}
        {/* Background Effects */}
        <div className="absolute inset-0 bg-background dark:bg-slate-950 dark:bg-noise pointer-events-none" />
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-agri-green-950/40 dark:via-slate-950/80 dark:to-slate-950 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col p-6 h-full">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground dark:text-white mb-1">
                Planejamento <span className="text-primary font-black">2026</span> <Sprout size={14} className="text-agri-green-700 dark:text-green-500" />
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Fazenda Santa Fé • Soja Safra 25/26</p>
            </div>

            <div className="flex gap-4 items-center">
              <ModeToggle />
              {/* Placeholder for future actions */}
              <div className="h-10 w-10 rounded-full bg-secondary/50 border border-border dark:border-white/10" />
            </div>
          </header>

          <div className="flex-1 w-full min-h-0 bg-card dark:bg-card/10 rounded-2xl border border-border dark:border-white/5 overflow-hidden shadow-sm dark:shadow-2xl">
            <Timeline />
          </div>
        </div>
      </main>
    </PlanningProvider>
  );
}
