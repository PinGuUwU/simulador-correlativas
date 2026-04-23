import React from 'react';
import { Chip } from '@heroui/react';
import { Clock, Calendar, CheckCircle2, AlertCircle, Circle, HelpCircle, Unlock } from 'lucide-react';
import materiasUtils from '../../utils/Progreso/materiasUtils';

const MateriaCard = ({ materia, estado, isNewPlan = false, onClick }) => {

    // Configuración de estilos por estado (Respetando estados originales)
    const getStatusConfig = () => {
        switch (estado) {
            case "Aprobado":
                return {
                    border: "border-success-200",
                    shadow: "shadow-success-100",
                    sideBar: "bg-success-500",
                    bg: "bg-success-50/30",
                    accent: "text-success-600",
                    chip: "success",
                    icon: <CheckCircle2 size={12} strokeWidth={3} />,
                    label: "Aprobada"
                };
            case "Regular":
                return {
                    border: "border-warning-200",
                    shadow: "shadow-warning-100",
                    sideBar: "bg-warning-500",
                    bg: "bg-warning-50/30",
                    accent: "text-warning-600",
                    chip: "warning",
                    icon: <AlertCircle size={12} strokeWidth={3} />,
                    label: "Regular"
                };
            case "Sin equivalencia":
                return {
                    border: "border-default-100 border-dashed",
                    shadow: "shadow-none",
                    sideBar: "bg-default-200 opacity-50",
                    bg: "bg-transparent opacity-60",
                    accent: "text-default-400",
                    chip: "default",
                    icon: <HelpCircle size={12} />,
                    label: "N/A"
                };
            case "Disponible":
            default:
                return {
                    border: isNewPlan ? "border-primary-100" : "border-default-100",
                    shadow: "shadow-md",
                    sideBar: isNewPlan ? "bg-primary-500" : "bg-secondary-400",
                    bg: "bg-white dark:bg-zinc-900",
                    accent: isNewPlan ? "text-primary-600" : "text-secondary-600",
                    chip: isNewPlan ? "primary" : "secondary",
                    icon: isNewPlan ? <Unlock size={12} strokeWidth={2.5} /> : <Circle size={12} />,
                    label: isNewPlan ? "Disponible" : "Pendiente"
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            onClick={onClick}
            className={`group relative flex items-stretch overflow-hidden rounded-2xl border transition-all duration-300 ${config.border} ${config.bg} ${config.shadow} ${onClick ? "cursor-pointer hover:translate-y-[-2px] active:scale-[0.98]" : ""
                }`}
        >
            {/* Bloque de color lateral para identificación rápida */}
            <div className={`w-1.5 shrink-0 ${config.sideBar}`} />

            <div className="flex flex-col grow p-4 gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                        {/* Nombre de la materia como elemento principal */}
                        <h4 className="text-[15px] font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                            {materia.nombre}
                        </h4>

                        <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs font-black uppercase tracking-widest ${config.accent}`}>
                                {materia.mostrarCodigo === false ? '---' : materia.codigo}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-default-200" />
                            <span className="text-xs font-black text-default-700 dark:text-default-500 uppercase tracking-wider">
                                {isNewPlan ? "Plan Nuevo" : "Plan Viejo"}
                            </span>
                        </div>
                    </div>

                    <Chip
                        size="sm"
                        variant="flat"
                        color={config.chip}
                        startContent={config.icon}
                        className="h-6 text-xs font-black uppercase pl-1 shadow-sm border border-white/20 shrink-0"
                    >
                        {config.label}
                    </Chip>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-black bg-default-100 dark:bg-default-200 px-2 py-1 rounded-lg">
                        <Clock size={12} className="text-default-500 dark:text-default-400" />
                        <span>{materia.horas_totales}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-black bg-default-100 dark:bg-default-200 px-2 py-1 rounded-lg">
                        <Calendar size={12} className="text-default-500 dark:text-default-400" />
                        <span>{materia.horas_semanales}h/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MateriaCard;
