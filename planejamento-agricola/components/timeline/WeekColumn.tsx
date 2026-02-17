import React from 'react';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { OperationalEvent, OperationType } from '@/lib/types';
import { EventCard } from '@/components/protocol/EventCard';
import { cn } from '@/lib/utils';
import { Lock, Ban } from 'lucide-react';
import { isOperationCompatible } from '@/lib/validation';
import { getStageForWeek, getPhaseColors } from '@/lib/phenology';
import { usePlanning } from '@/context/PlanningContext';

interface WeekColumnProps {
    weekIndex: number;
    operationType: OperationType;
    events: OperationalEvent[];
    isOverlay?: boolean;
    onEdit: (event: OperationalEvent) => void;
    isLocked?: boolean;
}

export function WeekColumn({ weekIndex, operationType, events, isOverlay, onEdit, isLocked }: WeekColumnProps) {
    const { active } = useDndContext();
    const { plantingWeek } = usePlanning();

    const isDropValid = React.useMemo(() => {
        if (!active || !active.data.current) return false;
        const sourceEvent = active.data.current.event as OperationalEvent;
        return isOperationCompatible(sourceEvent.operationType, operationType);
    }, [active, operationType]);

    const droppableId = `week-${weekIndex}-${operationType}`;
    const { isOver, setNodeRef } = useDroppable({
        id: droppableId,
        data: { weekIndex, operationType },
        disabled: !!(isLocked || (active && !isDropValid))
    });

    // Phenological phase color for vertical indicator
    const stage = getStageForWeek(weekIndex, plantingWeek);
    const phaseColors = stage ? getPhaseColors(stage.phase) : null;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[120px] p-2 border-r border-slate-200 dark:border-white/5 transition-colors relative",
                // Alternating Column Background (Light Mode only)
                weekIndex % 2 === 0 ? "bg-slate-50/50 dark:bg-transparent" : "bg-white dark:bg-transparent",

                // Vertical phase indicator (left border)
                phaseColors && stage?.phase === 'REPRODUTIVA'
                    ? "border-l-2 border-l-amber-500/20"
                    : "border-l-[1px] border-l-slate-200 dark:border-l-white/5",
                // Valid Drop Styling
                isOver && !isLocked && isDropValid && "bg-agri-green-50 dark:bg-agri-green-500/10 border-agri-green-700/50",
                // Invalid Drop Styling
                isOver && !isLocked && !isDropValid && "bg-red-50/80 dark:bg-red-500/10 border-red-500/50 cursor-not-allowed",
                // Locked styling
                isLocked && "bg-slate-100/80 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 cursor-not-allowed",
            )}
        >
            {/* Indicador visual de Semana */}
            {/* Indicador visual de Semana - Visible & Harmonious */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center font-black text-3xl uppercase tracking-widest select-none text-slate-100 dark:text-slate-800/60 z-0">
                SEMANA {weekIndex + 1}
            </div>

            {/* Lock Indicator */}
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10 pointer-events-none">
                    <Lock size={32} className="text-muted-foreground dark:text-slate-500" />
                </div>
            )}

            {/* Invalid Drop Indicator */}
            {isOver && !isDropValid && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-in fade-in zoom-in duration-200">
                    <div className="bg-red-950/80 p-2 rounded-full border border-red-500/50 text-red-500">
                        <Ban size={24} />
                    </div>
                </div>
            )}

            <div className="relative z-10 space-y-2">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} onEdit={onEdit} />
                ))}
            </div>
        </div>
    );
}
