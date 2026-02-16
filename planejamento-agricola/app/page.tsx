import { Timeline } from "@/components/timeline/Timeline";
import { PlanningProvider } from "@/context/PlanningContext";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <PlanningProvider>
      <main className="flex h-screen w-full flex-col bg-background overflow-hidden relative">
        {/* Background Effects */}
        {/* Background Effects */}
        <div className="absolute inset-0 bg-background bg-noise pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col h-full bg-background/50">
          <header className="bg-white dark:bg-card border-b border-border shadow-sm px-4 py-2 md:px-8 md:py-4 flex flex-col md:flex-row md:items-center justify-between z-20 gap-2 md:gap-4 transition-all">
            {/* Left Section: Title + Context */}
            <div className="flex flex-col w-full md:w-auto">
              <div className="flex items-center justify-between">
                <h1 className="text-lg md:text-3xl font-black tracking-tight text-foreground leading-none md:leading-tight">
                  Planejamento <span className="text-primary">2026</span>
                </h1>

                {/* Mobile Toggle (Right of Title) */}
                <div className="md:hidden">
                  <ModeToggle />
                </div>
              </div>

              {/* Context Info (Subtitle) - Visible on both, styled differently */}
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] md:text-sm font-medium mt-1 md:mt-0">
                <span className="bg-agri-green-500 text-white px-1.5 py-0 md:px-2 md:py-0.5 rounded-[3px] md:rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">Safra 25/26</span>
                <span>•</span>
                <span className="truncate max-w-[150px] md:max-w-none">Fazenda Santa Fé</span>
              </div>
            </div>

            {/* Desktop Toggle (Far Right) */}
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          </header>

          <main className="flex-1 w-full min-h-0 relative p-6 max-w-[1920px] mx-auto">
            <div className="h-full w-full glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/40">
              <Timeline />
            </div>
          </main>
        </div>
      </main>
    </PlanningProvider>
  );
}
