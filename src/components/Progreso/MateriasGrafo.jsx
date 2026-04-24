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
        <div className={`border-red-300 border-dashed border-4 opacity-90 ${isHorizontal ? 'border-l h-400' : 'border-t w-500'}`} />
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
const getLayoutedElements = (nodes, edges, direction = 'LR', projectionData = null) => {
  const isHorizontal = direction === 'LR';
  const { items, labels, maxCol } = projectionData || { items: {}, labels: {}, maxCol: 0 };

  // Agrupar materias por columna (proyectada o fija del plan)
  const materiasPorColumna = {};
  nodes.forEach(node => {
    const m = node.data.materia;
    let col;

    if (items && items[m.codigo]) {
      col = items[m.codigo].columna;
    } else {
      col = (Number(m.anio) - 1) * 2 + (Number(m.cuatrimestre) % 2 === 0 ? 2 : 1);
    }

    if (!materiasPorColumna[col]) materiasPorColumna[col] = [];
    materiasPorColumna[col].push(node);
  });

  // Espaciado entre columnas (X) y filas (Y)
  const gapX = isHorizontal ? 300 : 250;
  const gapY = isHorizontal ? 150 : 220;

  const newNodes = [];

  // Determinamos el rango de columnas a dibujar
  const startCol = 1;
  const endCol = maxCol || Math.max(...Object.keys(materiasPorColumna).map(Number), 0);

  // Iteramos por TODAS las columnas del rango para no saltarnos las vacías
  for (let col = startCol; col <= endCol; col++) {
    const colIdx = col - startCol;

    // 1. Crear nodo de encabezado para el cuatrimestre/columna
    const label = labels?.[col] || `Cuatrimestre ${col}`;

    newNodes.push({
      id: `header-${col}`,
      type: 'semester',
      data: { label, direction: direction, variant: 'header' },
      position: {
        x: isHorizontal ? colIdx * gapX + 30 : -220,
        y: isHorizontal ? -100 : colIdx * gapY + 35,
      },
      zIndex: -1,
      draggable: false,
    });

    // 2. Crear nodo separador
    if (colIdx > 0) {
      newNodes.push({
        id: `sep-${col}`,
        type: 'semester',
        data: { direction: direction, variant: 'separator' },
        position: {
          x: isHorizontal ? (colIdx * gapX) - 40 : -220,
          y: isHorizontal ? -100 : (colIdx * gapY) - 50,
        },
        zIndex: -2,
        draggable: false,
      });
    }

    // 3. Posicionar las materias dentro de la columna (si existen)
    const nodesInCol = materiasPorColumna[col] || [];
    nodesInCol.forEach((node, nodeIdx) => {
      newNodes.push({
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        position: {
          x: isHorizontal ? colIdx * gapX : nodeIdx * gapX,
          y: isHorizontal ? (nodeIdx * gapY) : colIdx * gapY,
        },
        draggable: false,
      });
    });
  }

  return { nodes: newNodes, edges };
};

/**
 * FlowInner: Componente interno que maneja el estado del grafo y la lógica de interacción.
 * Se encuentra dentro de un ReactFlowProvider.
 */
const FlowInner = ({ materias, progreso, onNodeClick, projection }) => {
  const [direction, setDirection] = useState('LR');
  const [hoveredNode, setHoveredNode] = useState(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // El nodo activo es EXCLUSIVAMENTE el que tiene el mouse encima
  const activeNodeId = hoveredNode;

  // Transformar la lista de materias en nodos iniciales para React Flow
  const initialNodes = useMemo(() => {
    const projItems = projection?.items || {};
    return materias.map((m) => {
      const proj = projItems[m.codigo];
      const prog = progreso?.[m.codigo];
      
      let estadoFinal = 'Disponible';

      if (proj) {
        if (proj.estado === 'Presente') {
          // En el cuatrimestre actual, el color depende del click (progresoSimulado)
          estadoFinal = prog === 'Cursado' ? 'Seleccionada' : 'Disponible';
        } else {
          // En pasado y futuro, usamos lo que diga la proyección
          estadoFinal = proj.estado;
        }
      }

      return {
        id: m.codigo,
        type: 'materia',
        data: {
          materia: m,
          estado: estadoFinal,
          onClick: onNodeClick
        },
        position: { x: 0, y: 0 },
      };
    });
  }, [materias, progreso, onNodeClick, projection]);

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
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      direction,
      projection
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, direction, setNodes, setEdges, projection]);

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
