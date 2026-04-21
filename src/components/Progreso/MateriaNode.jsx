import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";
import estadoUtils from "../../utils/Progreso/estadoUtils";

const MateriaNode = ({ data }) => {
    const { materia, estado, isHighlighted, isDimmed, onNodeClick } = data;
    const config = estadoUtils.ESTADO_CONFIG[estado] || estadoUtils.ESTADO_CONFIG["Disponible"];

    const opacity = isDimmed ? 'opacity-30' : 'opacity-100';
    const borderEffect = isHighlighted ? 'ring-2 ring-primary ring-offset-2 scale-105' : '';

    return (
        <div className={`transition-all duration-300 ${opacity} ${borderEffect}`} onClick={() => onNodeClick(materia)}>
            {/* Handle para conexiones de entrada (correlativas previas) */}
            <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
            
            <Card className={`w-[200px] border shadow-sm ${config.estilo} ${estado === 'Bloqueado' ? 'grayscale-[0.5]' : ''}`}>
                <CardHeader className="p-2 flex justify-between items-center gap-1">
                    <Chip size="sm" color={config.color} variant="flat" className="min-w-6 h-6 p-0 flex items-center justify-center">
                        <i className={`${config.icono} text-[10px]`} />
                    </Chip>
                    <div className="text-[10px] font-black truncate flex-1 text-right uppercase opacity-70">
                        {materia.codigo}
                    </div>
                </CardHeader>
                <CardBody className="p-2 pt-0">
                    <div className="text-[11px] font-black leading-tight line-clamp-2 min-h-[2rem]" title={materia.nombre}>
                        {materia.nombre}
                    </div>
                    <div className="mt-1 flex justify-between items-end">
                        <span className="text-[9px] font-bold opacity-60">
                            {materia.anio}° Año • C{materia.cuatrimestre}
                        </span>
                    </div>
                </CardBody>
            </Card>

            {/* Handle para conexiones de salida (correlativas posteriores) */}
            <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        </div>
    );
};

export default memo(MateriaNode);
