"use client";

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    closestCorners
} from '@dnd-kit/core';
import { cn, formatCurrency } from '@/lib/utils';
import { usePlanning } from '@/context/PlanningContext';
import { Swimlane } from './Swimlane';
import { OperationType, OperationalEvent } from '@/lib/types';
import { EventCard } from '@/components/protocol/EventCard';
import { ChevronLeft, ChevronRight, Calendar, Tractor, ChevronDown, MapPin, Sprout, Flower2, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getStageForWeek, isFirstWeekOfStage, getStageStartingAt, getPhaseColors } from '@/lib/phenology';

const OPERATIONS: OperationType[] = [
    'PULVERIZACAO_TERRESTRE', // Maior volume
    'PULVERIZACAO_AEREA',     // Separado por custo/logística
    'PLANTIO_MECANIZADO',     // Logística de sementes/adubo base
    'COBERTURA_SOLIDA',       // Nutrição sólida
    'FERTIRRIGACAO',          // Controle via água
    'INTERVENCAO_MANUAL'
];

import { MergeConfirmationModal } from '@/components/modals/MergeConfirmationModal';
import { ManualEventModal } from '@/components/modals/ManualEventModal';
import { Plus } from 'lucide-react';
import { isOperationCompatible } from '@/lib/validation';

export function Timeline() {
    const { events, moveEvent, mergeEvents, plantingWeek } = usePlanning();
    const [activeEvent, setActiveEvent] = useState<OperationalEvent | null>(null);
    const [mergeCandidate, setMergeCandidate] = useState<{ target: OperationalEvent, source: OperationalEvent } | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<OperationalEvent | null>(null); // New state

    // Controle de Visualização de Semanas (Janela de 6 semanas)
    const [startWeek, setStartWeek] = useState(0); // 0 = W1
    const weeksToShow = 6;
    const validOperations = OPERATIONS; // Em produção filtrar as que tem uso

    // Sensores DnD
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Previne drag acidental no clique
            },
        })
    );

    const visibleWeekIndices = Array.from({ length: weeksToShow }, (_, i) => startWeek + i);

    // Handlers DnD
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const evtData = active.data.current?.event as OperationalEvent;
        setActiveEvent(evtData);
    };

    const handleConfirmMerge = () => {
        if (mergeCandidate) {
            mergeEvents(mergeCandidate.target.id, mergeCandidate.source.id);
            setMergeCandidate(null);
        }
    };

    // Handler para Editar Evento
    const handleEditEvent = (event: OperationalEvent) => {
        setEditingEvent(event);
        setIsManualModalOpen(true);
    };

    // ... (dentro do componente Timeline, antes de handleDragEnd)

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveEvent(null);

        if (!over) return;

        const overId = over.id as string;
        const draggedEventId = active.id as string;
        const sourceEvent = active.data.current?.event as OperationalEvent;

        if (!sourceEvent) return;

        // Validar Compatibilidade (Segurança Backend/Logística)
        // Se for drop em WeekColumn, over.data.current tem { operationType }

        // Caso 1: Soltou em uma Semana (Move)
        if (overId.startsWith('week-')) {
            const [_, weekStr, opType] = overId.split('-');
            const targetOpType = opType as OperationType;

            // Validação de Regra de Negócio
            if (!isOperationCompatible(sourceEvent.operationType, targetOpType)) {
                // Toast de erro ou similar seria ideal aqui
                console.warn(`Movimento inválido: ${sourceEvent.operationType} -> ${targetOpType}`);
                return; // Cancela movimento
            }

            if (weekStr) {
                const newWeekIndex = parseInt(weekStr);
                moveEvent(draggedEventId, newWeekIndex);
                // Se mudou de raia (ex: Terrestre -> Aérea), atualizar o tipo no evento?
                // O moveEvent hoje só atualiza semana. Precisa atualizar operationType também se permitido.
                // TODO: Atualizar moveEvent no Context para aceitar newOperationType opcional
            }
        }
        // Caso 2: Soltou sobre outro Evento (Merge)
        else {
            const targetEvent = events.find(e => e.id === overId);

            if (targetEvent && sourceEvent && targetEvent.id !== draggedEventId) {
                // Validar compatibilidade de fusão também
                if (!isOperationCompatible(sourceEvent.operationType, targetEvent.operationType)) {
                    return;
                }

                // Abre modal de confirmação em vez de mergear direto
                setMergeCandidate({ target: targetEvent, source: sourceEvent });
            }
        }
    };

    // Data de Início da Safra (Dinâmica: Começa no Domingo da semana atual)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const HARVEST_START_DATE = new Date(today);
    HARVEST_START_DATE.setDate(today.getDate() - dayOfWeek);
    HARVEST_START_DATE.setHours(0, 0, 0, 0);

    const getWeekLabel = (weekIdx: number) => {
        const date = new Date(HARVEST_START_DATE);
        date.setDate(HARVEST_START_DATE.getDate() + (weekIdx * 7));

        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <MergeConfirmationModal
                isOpen={!!mergeCandidate}
                onClose={() => setMergeCandidate(null)}
                onConfirm={handleConfirmMerge}
                targetEvent={mergeCandidate?.target || null}
                sourceEvent={mergeCandidate?.source || null}
            />

            <ManualEventModal
                isOpen={isManualModalOpen}
                onClose={() => {
                    setIsManualModalOpen(false);
                    setEditingEvent(null);
                }}
                editEvent={editingEvent}
            />



            {/* Timeline Header Navigation - Responsive */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between glass-panel p-3 md:p-4 rounded-xl sticky top-0 z-40 mb-2 gap-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
                    {/* Safra Selector */}
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5 ml-1">Safra</span>
                        <Button variant="ghost" className="h-8 md:h-9 px-2 md:px-3 bg-muted/50 border border-border hover:bg-muted text-foreground font-bold gap-2 group text-xs md:text-sm">
                            Safra 26/27
                            <Badge variant="outline" className="border-agri-green-500 text-agri-green-600 dark:text-agri-green-400 bg-agri-green-500/10 text-[9px] px-1 py-0 h-4">
                                ATIVA
                            </Badge>
                            <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </div>

                    <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

                    {/* Context Filters (Farm, Field, Crop) */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {/* Fazenda/Talhão */}
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5 ml-1">Local</span>
                            <Button variant="ghost" className="h-8 md:h-9 px-2 md:px-3 bg-muted/30 border border-border hover:bg-muted text-foreground font-medium gap-2 text-xs md:text-sm whitespace-nowrap">
                                <MapPin size={14} className="text-agri-gold-500" />
                                <span className="hidden sm:inline">Fazenda Santa Fé <span className="text-muted-foreground">|</span></span> Talhão 12
                                <ChevronDown size={14} className="text-muted-foreground ml-1" />
                            </Button>
                        </div>

                        {/* Cultura/GM */}
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5 ml-1">Cultura</span>
                            <Button variant="ghost" className="h-8 md:h-9 px-2 md:px-3 bg-muted/30 border border-border hover:bg-muted text-foreground font-medium gap-2 text-xs md:text-sm whitespace-nowrap">
                                <Sprout size={14} className="text-green-500" />
                                Soja GM 6.4
                                <ChevronDown size={14} className="text-muted-foreground ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    {/* Controles de Navegação */}
                    <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border flex-1 md:flex-none justify-center">
                        <Button variant="ghost" size="icon" onClick={() => setStartWeek(Math.max(0, startWeek - 1))} className="h-8 w-8 hover:bg-accent hover:text-agri-gold-500 text-muted-foreground">
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="px-3 text-xs font-mono text-muted-foreground border-x border-border mx-1 whitespace-nowrap">
                            Sem {startWeek + 1} - {startWeek + weeksToShow}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setStartWeek(startWeek + 1)} className="h-8 w-8 hover:bg-accent hover:text-agri-gold-500 text-muted-foreground">
                            <ChevronRight size={18} />
                        </Button>
                    </div>

                    {/* Botão de Adição Manual (Highlight) */}
                    <Button
                        variant="default" // Alterado para default (mais visível) ou create custom variant
                        size="sm"
                        onClick={() => setIsManualModalOpen(true)}
                        className="gap-2 bg-agri-gold-500 hover:bg-agri-gold-600 text-slate-900 font-bold shadow-[0_0_15px_-3px_rgba(234,179,8,0.4)] whitespace-nowrap"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Novo Evento</span><span className="sm:hidden">Novo</span>
                    </Button>
                </div>
            </div>

            {/* SCROLLABLE CONTAINER FOR TIMELINE */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-2 px-2 md:mx-0 md:px-0">
                <div className="min-w-[1000px] h-full flex flex-col">
                    {/* Week Headers Grid - Separado do Header Principal para alinhamento correto com colunas */}
                    <div className="grid grid-cols-6 gap-0 text-center pl-1 pr-2 mb-1">
                        {visibleWeekIndices.map((idx, i) => (
                            <div key={idx} className={cn(
                                "flex flex-col items-center justify-center border-b-2 transition-all pb-2 mx-1 rounded-t-lg",
                                i === 0 ? "border-agri-gold-500 bg-gradient-to-t from-agri-gold-500/10 to-transparent" : "border-border hover:border-accent hover:bg-accent/5"
                            )}>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mb-1",
                                    i === 0 ? "text-agri-gold-600 dark:text-agri-gold-400" : "text-muted-foreground"
                                )}>
                                    Semana {idx + 1}
                                </span>
                                <span className={cn(
                                    "text-lg font-black uppercase",
                                    i === 0 ? "text-foreground" : "text-muted-foreground/80"
                                )}>
                                    {getWeekLabel(idx)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Régua Fenológica — Connecting line + stage markers aligned with columns */}
                    <div className="relative grid grid-cols-6 gap-0 pl-1 pr-2 mb-2 py-2 bg-card/40 backdrop-blur-sm rounded-lg border border-border">
                        {/* Connecting horizontal line */}
                        <div className="absolute top-1/2 left-4 right-4 h-px bg-gradient-to-r from-green-500/30 via-green-500/20 to-amber-500/30 -translate-y-1/2" />

                        {visibleWeekIndices.map((weekIdx) => {
                            const stage = getStageForWeek(weekIdx, plantingWeek);
                            const stageStart = getStageStartingAt(weekIdx, plantingWeek);
                            const isFirst = isFirstWeekOfStage(weekIdx, plantingWeek);
                            const phase = stage?.phase || 'VEGETATIVA';
                            const colors = getPhaseColors(phase);

                            // Icon evolves through lifecycle
                            const StageIcon = !stage ? Sprout
                                : stage.phase === 'VEGETATIVA' ? Sprout
                                    : (stage.id === 'R1' || stage.id === 'R2') ? Flower2
                                        : Wheat;

                            return (
                                <div key={weekIdx} className="flex items-center justify-center relative z-10">
                                    {isFirst && stageStart ? (
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                                            colors.bgLight, colors.border,
                                            "shadow-sm"
                                        )}>
                                            {/* Stage dot on the line */}
                                            <div className={cn("w-2.5 h-2.5 rounded-full border-2 border-slate-900 shadow-lg", colors.bg)} />
                                            <StageIcon size={12} className={stageStart.color} />
                                            <span className={cn("text-[10px] font-bold tracking-wide", stageStart.color)}>
                                                {stageStart.label}
                                            </span>
                                            <span className="text-[9px] text-slate-500 hidden xl:inline" title={stageStart.fullLabel}>
                                                {stageStart.fullLabel}
                                            </span>
                                        </div>
                                    ) : stage ? (
                                        <div className="flex items-center gap-1 opacity-40">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", colors.bg)} />
                                            <span className="text-[9px] text-slate-600 font-mono">{stage.label}</span>
                                        </div>
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700/50" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex-1 overflow-y-auto pb-20 pr-2 space-y-6">
                            {validOperations.map(opType => {
                                const laneEvents = events.filter(e => e.operationType === opType);
                                return (
                                    <Swimlane
                                        key={opType}
                                        operationType={opType}
                                        events={laneEvents}
                                        visibleWeeks={visibleWeekIndices}
                                        onEdit={handleEditEvent}
                                    />
                                );
                            })}
                        </div>

                        <DragOverlay dropAnimation={null}>
                            {activeEvent ? (
                                <EventCard
                                    event={activeEvent}
                                    onEdit={() => { }}
                                    isOverlay={true}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                </div>
            </div>

            {/* Footer Fixo: Resumo de Valor e ROI - Mobile Responsive */}
            <div className="sticky bottom-0 z-50 mt-auto">
                <div className="glass-panel border-t border-border bg-background/95 backdrop-blur-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between rounded-t-xl shadow-2xl gap-3 md:gap-0">
                    <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-4 md:gap-8 overflow-x-auto pb-1 md:pb-0">
                        <div className="min-w-[120px]">
                            <span className="text-[9px] md:text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Investimento Total</span>
                            <div className="text-lg md:text-2xl font-bold text-foreground flex items-baseline gap-1">
                                {formatCurrency(
                                    events.reduce((acc, e) => acc + e.area * e.protocols.reduce((pAcc, p) => pAcc + (p.packages.find(pk => pk.isDefault)?.costPerHa || 0), 0), 0)
                                )}
                                <span className="text-[10px] md:text-xs font-normal text-muted-foreground hidden sm:inline">acumulado</span>
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-8 md:h-10 bg-border"></div>
                        <div className="min-w-[100px]">
                            <span className="text-[9px] md:text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Custo Médio/Ha</span>
                            <div className="text-base md:text-xl font-bold text-agri-gold-600 dark:text-agri-gold-400 bg-amber-500/10 dark:bg-transparent px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg inline-block">
                                {formatCurrency(
                                    events.length > 0 ?
                                        events.reduce((acc, e) => acc + e.protocols.reduce((pAcc, p) => pAcc + (p.packages.find(pk => pk.isDefault)?.costPerHa || 0), 0), 0) / events.length // Simplificado
                                        : 0
                                )}
                                <span className="text-[10px] md:text-xs font-normal text-muted-foreground ml-1">/ha</span>
                            </div>
                        </div>
                        <div className="hidden lg:block w-px h-10 bg-border"></div>
                        <div className="hidden lg:block">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">ROI Estimado</span>
                            <div className="text-xl font-bold text-agri-green-600 dark:text-agri-green-400 flex items-center gap-1 bg-agri-green-500/10 dark:bg-transparent px-2 py-1 rounded-lg">
                                +320%
                                <span className="text-[10px] bg-white/50 dark:bg-agri-green-500/20 text-agri-green-700 dark:text-agri-green-400 px-1.5 py-0.5 rounded border border-agri-green-500/20">Safra Recorde</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="hidden sm:flex border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 text-xs md:text-sm h-8 md:h-9">
                            Exportar PDF
                        </Button>
                        <Button size="sm" className="flex-1 md:flex-none bg-agri-green-600 hover:bg-agri-green-500 text-white font-bold shadow-lg shadow-agri-green-900/50 text-xs md:text-sm h-9 md:h-9 whitespace-nowrap">
                            Confirmar <span className="hidden sm:inline ml-1">Planejamento</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
