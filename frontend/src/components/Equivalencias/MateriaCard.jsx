import React from 'react';
import { Card, Chip } from '@heroui/react';
import { Clock, Calendar } from 'lucide-react';
import materiasUtils from '../../utils/Progreso/materiasUtils';

const MateriaCard = ({ materia, estado, isNewPlan = false, onClick }) => {
    const statusConfig = {
        [materiasUtils.estadosPosibles[2]]: { color: "success", label: "Aprobada" },
        [materiasUtils.estadosPosibles[1]]: { color: "warning", label: "Regular" },
        [materiasUtils.estadosPosibles[0]]: { color: "secondary", label: "Pendiente" },
        "Sin equivalencia": { color: "default", label: "Sin equiv" }
    };

    const config = statusConfig[estado] || statusConfig[materiasUtils.estadosPosibles[0]];

    return (
        <div
            onClick={onClick}
            className={`flex flex-col gap-1 p-3 rounded-xl transition-all h-full ${
                isNewPlan ? "bg-primary/5 border border-primary/10" : "bg-default-100/50 border border-transparent"
            } ${onClick ? "cursor-pointer hover:bg-default-200 active:scale-[0.98]" : ""}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isNewPlan ? "text-primary" : "text-default-400"}`}>
                        {materia.codigo}
                    </span>
                    <h4 className="text-xs font-bold text-default-700 leading-tight line-clamp-2">
                        {materia.nombre}
                    </h4>
                </div>
                <Chip size="sm" variant="flat" color={config.color} className="h-5 text-[8px] font-black uppercase px-1 flex-shrink-0">
                    {config.label}
                </Chip>
            </div>

            {/* Visualización de Horas - Diseño compacto */}
            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-default-200/50">
                <div className="flex items-center gap-1 text-[10px] text-default-500 font-medium">
                    <Clock size={10} strokeWidth={2.5} />
                    <span>{materia.horas_totales}h</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-default-500 font-medium">
                    <Calendar size={10} strokeWidth={2.5} />
                    <span>{materia.horas_semanales}h/sem</span>
                </div>
            </div>
        </div>
    );
};

export default MateriaCard;
