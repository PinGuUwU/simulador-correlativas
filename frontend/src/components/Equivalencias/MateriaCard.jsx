import React from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { CheckCircle2, Lock, Unlock, Clock, AlertCircle, HelpCircle } from 'lucide-react';

const MateriaCard = ({ materia, estado, actualizarEstado, isNewPlan = false }) => {
    const statusConfig = {
        Aprobado: { color: "success", label: "Aprobado" },
        Regular: { color: "warning", label: "Regular" },
        Pendiente: { color: "secondary", label: "Pendiente" },
        "Sin equivalencias": { color: "default", label: "Sin equiv" }
    };

    const config = statusConfig[estado] || statusConfig["Pendiente"];

    return (
        <div
            onClick={() => actualizarEstado?.(materia.codigo)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${isNewPlan ? "bg-primary/10" : "bg-default-100/50"
                } ${actualizarEstado ? "cursor-pointer hover:bg-default-200" : ""}`}
        >
            <div className="flex flex-col min-w-0">
                <span className={`text-[8px] font-bold uppercase ${isNewPlan ? "text-primary" : "text-default-400"}`}>
                    {isNewPlan ? "Plan Nuevo" : "Plan Viejo"} • {materia.codigo}
                </span>
                <p className="text-sm font-semibold truncate text-default-700">
                    {materia.nombre}
                </p>
            </div>
            <Chip size="sm" variant="flat" color={config.color} className="h-5 text-[9px] font-bold uppercase">
                {config.label}
            </Chip>
        </div>
    );
};

export default MateriaCard;