import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";
import estadoUtils from "../../utils/Progreso/estadoUtils";

/**
 * MateriaNode: Componente personalizado para renderizar cada materia como un nodo en el grafo de React Flow.
 * Representa visualmente una materia con su nombre, código, año, cuatrimestre y estado actual.
 */
const MateriaNode = ({ data, targetPosition = Position.Left, sourcePosition = Position.Right }) => {
    const { materia, estado, onClick } = data;

    // Obtener la configuración visual (colores, íconos, estilos) según el estado de la materia (Aprobada, Cursando, etc.)
    const config = estadoUtils.ESTADO_CONFIG[estado] || estadoUtils.ESTADO_CONFIG["Disponible"];

    return (
        <div 
            className={`transition-all duration-300 hover:scale-105 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
            onClick={() => onClick && onClick(materia.codigo)}
        >
            {/* 
                Handle (Anclaje) de entrada:
                En horizontal usa Position.Left, en vertical usa Position.Top
            */}
            <Handle type="target" position={targetPosition} style={{ background: '#555' }} />

            {/* Tarjeta visual de la materia */}
            <Card className={`w-[220px] border shadow-sm ${config.estilo} ${estado === 'Bloqueado' ? 'grayscale-[0.5]' : ''}`}>
                <CardHeader className="p-2 flex justify-between items-center gap-1">
                    {/* Icono del estado actual (ej. Check para aprobada, Reloj para cursando) */}
                    <Chip size="sm" color={config.color} variant="flat" className="min-w-7 h-7 p-0 flex items-center justify-center">
                        <i className={`${config.icono} text-sm`} />
                    </Chip>
                    {/* Código de la materia en la esquina superior derecha */}
                    <div className="text-sm font-black truncate flex-1 text-right uppercase opacity-70">
                        {materia.codigo}
                    </div>
                </CardHeader>

                <CardBody className="p-2 pt-0">
                    {/* Nombre de la materia con truncado si es muy largo */}
                    <div className="text-sm font-black leading-tight line-clamp-2 min-h-[2.5rem]" title={materia.nombre}>
                        {materia.nombre}
                    </div>
                    <div className="mt-2 flex justify-between items-end">
                        {/* Información de cursado: Año y Cuatrimestre o Estado dinámico */}
                        <span className="text-sm font-bold opacity-60">
                            {estado === 'Seleccionada' ? (
                                <span className="text-primary-600 dark:text-primary-400 flex items-center gap-1.5 animate-pulse">
                                    <i className="fa-solid fa-check-circle text-[10px]" /> Seleccionada
                                </span>
                            ) : estado === 'Disponible' ? (
                                <span className="text-primary/70">Disponible</span>
                            ) : (
                                `${materia.anio}° Año • C${materia.cuatrimestre}`
                            )}
                        </span>
                    </div>
                </CardBody>
            </Card>

            {/* 
                Handle (Anclaje) de salida:
                En horizontal usa Position.Right, en vertical usa Position.Bottom
            */}
            <Handle type="source" position={sourcePosition} style={{ background: '#555' }} />
        </div>
    );
};

// Se usa memo para evitar re-renderizados innecesarios de los nodos si sus datos no cambian
export default memo(MateriaNode);
