import React from 'react';
import { OperationalEvent, ProtocolCategory } from '@/lib/types';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { MergedEventCard } from './MergedEventCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { Plane, Tractor, Droplets, Sprout, Bug, Zap, Eye } from 'lucide-react';
import { getDAE, getStageForWeek, getPhaseColors } from '@/lib/phenology';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { usePlanning } from '@/context/PlanningContext';

interface EventCardProps {
    event: OperationalEvent;
    onEdit?: (event: OperationalEvent) => void;
    isOverlay?: boolean;
}

export function EventCard({ event, onEdit, isOverlay = false }: EventCardProps) {
    const { plantingWeek } = usePlanning();
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: event.id,
        data: { event },
        disabled: isOverlay
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: event.id,
        data: { event },
        disabled: isOverlay
    });

    // Fix: Se estiver arrastando (isDragging) e usarmos DragOverlay, o card original deve ficar parado (sem transform)
    // servindo apenas como placeholder visual. O DragOverlay cuida do movimento fluido.
    // Se for Overlay, ignoramos o transform do hook também.
    const style = transform && !isDragging && !isOverlay ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    const isMerged = event.protocols.length > 1;

    // Se já for merged, delegar para o componente especializado
    if (isMerged) {
        return <MergedEventCard event={event} />;
    }

    const protocol = event.protocols[0];
    const mainPackage = protocol.packages.find(pkg => pkg.id === protocol.selectedPackageId) || protocol.packages[0];

    // Extrair Produto Principal (SKU)
    // Lógica: Tenta pegar o primeiro produto com dose definida
    const mainProduct = mainPackage.products.find(p => p.dose && parseFloat(p.dose) > 0.1) || mainPackage.products[0];
    const doseLabel = mainProduct ? `${mainProduct.dose} ${mainProduct.unit}` : null;
    const productSku = mainProduct ? mainProduct.name : protocol.name;

    // Custo Total
    const totalCost = mainPackage.costPerHa || 0;

    // Ícone de Aplicação
    const getApplicationIcon = () => {
        switch (event.operationType) {
            case 'PULVERIZACAO_AEREA': return (
                <span className="flex items-center gap-1">
                    <Plane size={14} className="text-sky-400" />
                    <span className="text-[8px] font-bold text-sky-500/70 tracking-tight">AIR TRACTOR</span>
                </span>
            );
            case 'PULVERIZACAO_TERRESTRE': return <Tractor size={14} className="text-amber-400" />;
            case 'PLANTIO_MECANIZADO': return <Sprout size={14} className="text-agri-green-400" />;
            case 'FERTIRRIGACAO': return <Droplets size={14} className="text-blue-400" />;
            case 'COBERTURA_SOLIDA': return <Tractor size={14} className="text-amber-600" />;
            default: return <Bug size={14} className="text-muted-foreground" />;
        }
    };

    // Cores de Categoria
    const getCategoryStyles = (category: ProtocolCategory) => {
        switch (category) {
            case 'FUNGICIDA': return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case 'INSETICIDA': return "bg-red-500/10 text-red-400 border-red-500/20";
            case 'HERBICIDA': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'ADUBACAO_FOLIAR': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case 'BIOLOGICO': return "bg-lime-500/10 text-lime-400 border-lime-500/20";
            default: return "bg-muted/10 text-muted-foreground border-border/20";
        }
    };

    // DAE and Stage from centralized phenology (reactive to plantingWeek)
    const dae = getDAE(event.weekIndex, plantingWeek);
    const stage = getStageForWeek(event.weekIndex, plantingWeek);
    const stageLabel = protocol.phenologicalStage || stage?.label || `V${Math.max(1, Math.floor(dae / 7))}`;
    const phaseFull = stage?.fullLabel || '';
    const phaseColors = stage ? getPhaseColors(stage.phase) : getPhaseColors('VEGETATIVA');

    return (
        <div ref={!isOverlay ? setDropRef : undefined} className="relative z-10 w-full">
            <div
                ref={!isOverlay ? setDragRef : undefined}
                style={style}
                {...(!isOverlay ? listeners : {})}
                {...(!isOverlay ? attributes : {})}
                className={cn(
                    "touch-none mb-2 w-full",
                    // Se for o card original sendo arrastado: Opacidade baixa (Placeholder)
                    // Se for o Overlay: Opacidade total (Card flutuando)
                    isDragging && !isOverlay && "opacity-20 grayscale border-dashed border-muted-foreground/50"
                )}
            >
                <PremiumCard
                    disableAnimation={isOverlay}
                    className={cn(
                        "p-0 overflow-hidden",
                        event.operationType === 'PLANTIO_MECANIZADO' && "border-l-4 border-l-agri-green-500",
                        isOver && "ring-2 ring-agri-green-500 scale-105"
                    )}
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onEdit?.(event);
                    }}
                >
                    {/* DAE Indicator Strip */}
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono border-b backdrop-blur-sm",
                        stage?.phase === 'REPRODUTIVA'
                            ? "bg-amber-500/10 border-amber-500/10 text-amber-200"
                            : "bg-agri-green-500/10 border-agri-green-500/10 text-agri-green-600 dark:text-agri-green-100"
                    )}>
                        <span className="font-bold tracking-wider">DAE {dae > 0 ? dae : '—'}</span>
                        <span className="opacity-30">|</span>
                        <span className={cn("font-semibold", phaseColors.text)}>{stageLabel}</span>
                        {phaseFull && <span className="opacity-50 hidden sm:inline">· {phaseFull}</span>}
                    </div>

                    <div className="p-3">
                        {/* Header: Categoria e Ícone */}
                        <div className="flex justify-between items-center mb-2">
                            <Badge
                                variant="outline"
                                className={cn("text-[9px] px-2 py-0.5 h-auto border font-medium tracking-wide rounded-md", getCategoryStyles(protocol.category))}
                            >
                                {protocol.category}
                            </Badge>

                            <div className="flex items-center gap-2">
                                {onEdit && (
                                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-accent/5 rounded"
                                        aria-label="Editar"
                                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(event); }}>
                                        <Eye size={12} />
                                    </button>
                                )}
                                <div className="bg-card/40 p-1.5 rounded-full border border-border shadow-inner">
                                    {getApplicationIcon()}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="mb-3 space-y-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground leading-tight truncate tracking-tight" title={productSku}>
                                {productSku}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                                <span className="truncate flex-1" title={protocol.target}>{protocol.target}</span>
                                {doseLabel && (
                                    <div className="flex-shrink-0 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        <span className="font-mono text-foreground/80 bg-muted/50 px-1 py-0.5 rounded text-[10px] whitespace-nowrap">{doseLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer: Custo */}
                        <div className="pt-2 border-t border-border flex justify-end items-center">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Custo</span>
                                <span className="text-sm font-bold text-gradient-gold">
                                    R$ {totalCost.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
}
