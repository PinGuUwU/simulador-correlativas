import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MateriaNode from './MateriaNode';
import { Button, ButtonGroup } from '@heroui/react';
import { ArrowRight, ArrowDown, ZoomIn, ZoomOut, Home } from 'lucide-react';

/**
 * SemesterNode: Componente para renderizar los encabezados y separadores de cuatrimestre.
 * - 'header': Muestra una etiqueta (ej. "Cuatrimestre 1").
 * - 'separator': Dibuja una línea punteada entre cuatrimestres.
 */
const SemesterNode = ({ data }) => {
  const isHorizontal = data.direction === 'LR';

  if (data.variant === 'separator') {
    return (
      <div className="pointer-events-none select-none flex items-center justify-center">
        {/* Línea divisoria principal entre cuatrimestres */}
        <div className={`border-red-300 border-dashed border-4 opacity-90 ${isHorizontal ? 'border-l h-200' : 'border-t w-300'}`} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none select-none">
      <div className="bg-default-800 font-black text-white px-3 py-1.5 rounded-lg text-md tracking-widest shadow-lg opacity-40">
        {data.label}
      </div>
    </div>
  );
};

// Definición de tipos de nodos personalizados para React Flow
const nodeTypes = {
  materia: MateriaNode,
  semester: SemesterNode,
};

/**
 * getLayoutedElements: Calcula las posiciones de los nodos en base a su año y cuatrimestre.
 * Organiza las materias en una grilla según la dirección (LR: Izquierda-Derecha o TB: Arriba-Abajo).
 */
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';

  // Agrupar materias por cuatrimestre absoluto (Año 1 C1 = 1, Año 1 C2 = 2, etc.)
  const materiasPorCuatri = {};
  nodes.forEach(node => {
    const m = node.data.materia;
    const cuatriReal = (Number(m.anio) - 1) * 2 + (Number(m.cuatrimestre) % 2 === 0 ? 2 : 1);
    if (!materiasPorCuatri[cuatriReal]) materiasPorCuatri[cuatriReal] = [];
    materiasPorCuatri[cuatriReal].push(node);
  });

  const sortedCuatris = Object.keys(materiasPorCuatri).map(Number).sort((a, b) => a - b);

  // Espaciado entre columnas (X) y filas (Y)
  const gapX = isHorizontal ? 300 : 250;
  const gapY = isHorizontal ? 150 : 220;

  const newNodes = [];

  sortedCuatris.forEach((cuatri, cuatriIdx) => {
    // 1. Crear nodo de encabezado para el cuatrimestre
    newNodes.push({
      id: `header-${cuatri}`,
      type: 'semester',
      data: { label: `Cuatrimestre ${cuatri}`, direction: direction, variant: 'header' },
      position: {
        x: isHorizontal ? cuatriIdx * gapX + 30 : -220,
        y: isHorizontal ? -100 : cuatriIdx * gapY + 35,
      },
      zIndex: -1,
      draggable: false, // Los encabezados nunca son arrastrables
    });

    // 2. Crear nodo separador (línea punteada) entre este cuatrimestre y el anterior
    if (cuatriIdx > 0) {
      newNodes.push({
        id: `sep-${cuatri}`,
        type: 'semester',
        data: { direction: direction, variant: 'separator' },
        position: {
          x: isHorizontal ? (cuatriIdx * gapX) - 40 : -220,
          y: isHorizontal ? -100 : (cuatriIdx * gapY) - 50,
        },
        zIndex: -2,
        draggable: false,
      });
    }

    // 3. Posicionar las materias dentro del cuatrimestre
    const nodesInCuatri = materiasPorCuatri[cuatri];
    nodesInCuatri.forEach((node, nodeIdx) => {
      newNodes.push({
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top', // Entrada de correlativas
        sourcePosition: isHorizontal ? 'right' : 'bottom', // Salida hacia materias siguientes
        position: {
          x: isHorizontal ? cuatriIdx * gapX : nodeIdx * gapX,
          y: isHorizontal ? (nodeIdx * gapY) : cuatriIdx * gapY,
        },
        draggable: false, // Deshabilitamos el arrastre por pedido del usuario
      });
    });
  });

  return { nodes: newNodes, edges };
};

/**
 * FlowInner: Componente interno que maneja el estado del grafo y la lógica de interacción.
 * Se encuentra dentro de un ReactFlowProvider.
 */
const FlowInner = ({ materias, progreso }) => {
  const [direction, setDirection] = useState('LR');
  const [hoveredNode, setHoveredNode] = useState(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // El nodo activo es EXCLUSIVAMENTE el que tiene el mouse encima
  const activeNodeId = hoveredNode;

  // Transformar la lista de materias en nodos iniciales para React Flow
  const initialNodes = useMemo(() => {
    return materias.map((m) => ({
      id: m.codigo,
      type: 'materia',
      data: {
        materia: m,
        estado: progreso[m.codigo] || 'Disponible'
      },
      position: { x: 0, y: 0 },
    }));
  }, [materias, progreso]);

  // Transformar las relaciones de correlatividad en conexiones (edges)
  const initialEdges = useMemo(() => {
    const edges = [];
    materias.forEach((m) => {
      if (m.correlativas && m.correlativas.length > 0) {
        m.correlativas.forEach((corrCodigo) => {
          // Solo crear la conexión si la materia de origen existe en el plan actual
          if (materias.some(mat => mat.codigo === corrCodigo)) {
            edges.push({
              id: `e-${corrCodigo}-${m.codigo}`,
              source: corrCodigo,
              target: m.codigo,
              animated: false,
              style: { strokeWidth: 2, stroke: '#94a3b8' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
              },
            });
          }
        });
      }
    });
    return edges;
  }, [materias]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 1. Efecto para actualizar los elementos del grafo (nodos y flechas)
  // Se ejecuta cada vez que cambian las materias o el progreso, pero NO mueve la cámara.
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      direction
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, direction, setNodes, setEdges]);

  // 2. Efecto para el manejo de la cámara (Centrado)
  // Se dispara al cambiar la dirección o cuando los nodos se cargan por primera vez.
  useEffect(() => {
    if (nodes.length === 0) return;

    const timer = setTimeout(() => {
      const firstSemesterNodes = nodes.filter(n =>
        n.id === 'header-1' ||
        (n.data?.materia && ((Number(n.data.materia.anio) - 1) * 2 + (Number(n.data.materia.cuatrimestre) % 2 === 0 ? 2 : 1)) === 1)
      );

      if (firstSemesterNodes.length > 0) {
        fitView({ nodes: firstSemesterNodes, padding: 0.5, duration: 800 });
      } else {
        fitView({ padding: 0.2, duration: 800 });
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, nodes.length === 0]); // Se activa al cambiar dirección o cuando pasamos de 0 a N nodos.

  // Función para volver al inicio del grafo manualmente
  const handleGoHome = () => {
    const firstSemesterNodes = nodes.filter(n =>
      n.id === 'header-1' ||
      (n.data?.materia && ((Number(n.data.materia.anio) - 1) * 2 + (Number(n.data.materia.cuatrimestre) % 2 === 0 ? 2 : 1)) === 1)
    );

    if (firstSemesterNodes.length > 0) {
      fitView({ nodes: firstSemesterNodes, padding: 0.5, duration: 800 });
    } else {
      fitView({ padding: 0.2, duration: 800 });
    }
  };

  // Manejo de hover para resaltar conexiones
  const onNodeMouseEnter = useCallback((event, node) => setHoveredNode(node.id), []);
  const onNodeMouseLeave = useCallback(() => setHoveredNode(null), []);

  const processedNodes = useMemo(() => {
    return nodes;
  }, [nodes]);

  /**
   * processedEdges: Resalta las conexiones que entran o salen del nodo activo (hover).
   * Solo son visibles cuando el mouse está sobre una materia.
   */
  const processedEdges = useMemo(() => {
    if (!activeNodeId) return [];

    return edges
      .filter(e => e.source === activeNodeId || e.target === activeNodeId)
      .map(e => {
        return {
          ...e,
          type: 'straight', // Flechas rectas por pedido del usuario
          animated: true,
          style: {
            ...e.style,
            stroke: '#3b82f6',
            strokeWidth: 3,
            opacity: 1
          },
          markerEnd: { ...e.markerEnd, color: '#3b82f6' }
        };
      });
  }, [edges, activeNodeId]);

  return (
    <div className="w-full h-[700px] bg-background/50 border border-default-200 rounded-2xl overflow-hidden relative shadow-inner">
      {/* Controles flotantes: Zoom, Home y Cambio de Dirección */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <ButtonGroup size="sm" variant="flat" className="bg-background/80 backdrop-blur-md shadow-md border border-default-200">
          <Button isIconOnly onPress={() => zoomIn()} title="Acercar"><ZoomIn size={18} /></Button>
          <Button isIconOnly onPress={() => zoomOut()} title="Alejar"><ZoomOut size={18} /></Button>
          <Button isIconOnly onPress={handleGoHome} title="Ir al Inicio"><Home size={18} /></Button>
        </ButtonGroup>

        <ButtonGroup size="sm" variant="flat" className="bg-background/80 backdrop-blur-md shadow-md border border-default-200">
          <Button
            isIconOnly
            color={direction === 'LR' ? 'primary' : 'default'}
            onPress={() => setDirection('LR')}
            title="Vista Horizontal"
          >
            <ArrowRight size={18} />
          </Button>
          <Button
            isIconOnly
            color={direction === 'TB' ? 'primary' : 'default'}
            onPress={() => setDirection('TB')}
            title="Vista Vertical"
          >
            <ArrowDown size={18} />
          </Button>
        </ButtonGroup>
      </div>

      {/* Componente principal de React Flow */}
      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        minZoom={0.05}
        maxZoom={1.5}
        nodesDraggable={false}
        elementsSelectable={false} // Desactivar selección para evitar flechas persistentes
        nodesConnectable={false}
        selectionMode="none"
      >
        <Background color="#94a3b8" variant="dots" gap={20} size={1} />
      </ReactFlow>

      {/* Leyenda interactiva */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-md p-2 rounded-lg border border-default-200 text-sm font-bold text-foreground/60 shadow-sm pointer-events-none uppercase tracking-tighter">
        Pasa el mouse para ver correlativas
      </div>
    </div>
  );
};

/**
 * MateriasGrafo: Exporta el FlowInner envuelto en un ReactFlowProvider para usar los hooks de la librería.
 */
const MateriasGrafo = (props) => (
  <ReactFlowProvider>
    <FlowInner {...props} />
  </ReactFlowProvider>
);

export default MateriasGrafo;
