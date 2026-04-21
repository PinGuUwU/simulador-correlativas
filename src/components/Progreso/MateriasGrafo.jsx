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

const SemesterNode = ({ data }) => {
  const isHorizontal = data.direction === 'LR';
  
  if (data.variant === 'separator') {
    return (
      <div className="pointer-events-none select-none flex items-center justify-center">
        {/* Línea divisoria principal en el centro del espacio intermedio */}
        <div className={`border-red-500 border-dashed opacity-90 ${isHorizontal ? 'border-l h-150' : 'border-t w-300'}`} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none select-none">
      <div className="bg-default-800 font-black text-white px-3 py-1.5 rounded-lg text-sm tracking-widest shadow-lg opacity-40">
        {data.label}
      </div>
    </div>
  );
};

const nodeTypes = {
  materia: MateriaNode,
  semester: SemesterNode,
};

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  
  // Agrupar materias por cuatrimestre real
  const materiasPorCuatri = {};
  nodes.forEach(node => {
    const m = node.data.materia;
    const cuatriReal = (Number(m.anio) - 1) * 2 + (Number(m.cuatrimestre) % 2 === 0 ? 2 : 1);
    if (!materiasPorCuatri[cuatriReal]) materiasPorCuatri[cuatriReal] = [];
    materiasPorCuatri[cuatriReal].push(node);
  });

  const sortedCuatris = Object.keys(materiasPorCuatri).map(Number).sort((a, b) => a - b);
  
  // Aumentamos los gaps para crear el "rango intermedio"
  const gapX = isHorizontal ? 450 : 250;
  const gapY = isHorizontal ? 120 : 450;

  const newNodes = [];
  
  sortedCuatris.forEach((cuatri, cuatriIdx) => {
    // 1. Nodo de Etiqueta (C1, C2...) - Se posiciona justo sobre el grupo
    newNodes.push({
      id: `header-${cuatri}`,
      type: 'semester',
      data: { label: `Cuatrimeste ${cuatri}`, direction: direction, variant: 'header' },
      position: {
        x: isHorizontal ? cuatriIdx * gapX : -180,
        y: isHorizontal ? -100 : cuatriIdx * gapY,
      },
      zIndex: -1,
      draggable: false,
    });

    // 2. Nodo Separador (La línea en el rango intermedio)
    // Se coloca entre el cuatrimestre actual y el anterior (si no es el primero)
    if (cuatriIdx > 0) {
      newNodes.push({
        id: `sep-${cuatri}`,
        type: 'semester',
        data: { direction: direction, variant: 'separator' },
        position: {
          x: isHorizontal ? (cuatriIdx * gapX) - (gapX / 2) : -180,
          y: isHorizontal ? -100 : (cuatriIdx * gapY) - (gapY / 2),
        },
        zIndex: -2,
        draggable: false,
      });
    }

    // 3. Materias del cuatrimestre
    const nodesInCuatri = materiasPorCuatri[cuatri];
    nodesInCuatri.forEach((node, nodeIdx) => {
      newNodes.push({
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        position: {
          x: isHorizontal ? cuatriIdx * gapX : nodeIdx * gapX,
          y: isHorizontal ? (nodeIdx * gapY) : cuatriIdx * gapY,
        },
      });
    });
  });

  return { nodes: newNodes, edges };
};

const FlowInner = ({ materias, progreso, abrirInfo, selectedMateriaCode }) => {
  const [direction, setDirection] = useState('LR');
  const [hoveredNode, setHoveredNode] = useState(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // El nodo activo es el que tiene el mouse encima O el que está abierto en el modal
  const activeNodeId = hoveredNode || selectedMateriaCode;

  const initialNodes = useMemo(() => {
    return materias.map((m) => ({
      id: m.codigo,
      type: 'materia',
      data: { 
        materia: m, 
        estado: progreso[m.codigo] || 'Disponible',
        onNodeClick: abrirInfo,
        isHighlighted: false,
        isDimmed: false
      },
      position: { x: 0, y: 0 },
    }));
  }, [materias, progreso, abrirInfo]);

  const initialEdges = useMemo(() => {
    const edges = [];
    materias.forEach((m) => {
      if (m.correlativas && m.correlativas.length > 0) {
        m.correlativas.forEach((corrCodigo) => {
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

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      direction
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // Centrar en el primer cuatrimestre solo al cargar por primera vez o cambiar dirección
    const timer = setTimeout(() => {
      const firstSemesterNodes = layoutedNodes.filter(n => 
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
    // Agregamos initialNodes e initialEdges solo para que se ejecute cuando realmente cambien los datos del plan,
    // pero NO incluimos selectedMateriaCode ni fitView para evitar el reset al abrir el modal.
    // Usamos refs internos o ignoramos el warning de lint si es necesario para mantener la cámara quieta.
  }, [direction, initialNodes, initialEdges]); // Eliminado fitView y selectedMateriaCode de aquí

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

  const onNodeMouseEnter = useCallback((event, node) => setHoveredNode(node.id), []);
  const onNodeMouseLeave = useCallback(() => setHoveredNode(null), []);

  const processedNodes = useMemo(() => {
    if (!activeNodeId) return nodes;
    const connectedNodeIds = new Set([activeNodeId]);
    edges.forEach(edge => {
        if (edge.source === activeNodeId) connectedNodeIds.add(edge.target);
        if (edge.target === activeNodeId) connectedNodeIds.add(edge.source);
    });
    return nodes.map(n => ({
        ...n,
        data: { ...n.data, isHighlighted: n.id === activeNodeId, isDimmed: !connectedNodeIds.has(n.id) }
    }));
  }, [nodes, edges, activeNodeId]);

  const processedEdges = useMemo(() => {
    if (!activeNodeId) return [];

    return edges
        .filter(e => e.source === activeNodeId || e.target === activeNodeId)
        .map(e => {
            return {
                ...e,
                type: 'straight',
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

      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        minZoom={0.05}
        maxZoom={1.5}
      >
        <Background color="#94a3b8" variant="dots" gap={20} size={1} />
      </ReactFlow>
      
      <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-md p-2 rounded-lg border border-default-200 text-[10px] font-bold text-foreground/60 shadow-sm pointer-events-none uppercase tracking-tighter">
        Pasa el mouse para ver correlativas • Clic para detalles
      </div>
    </div>
  );
};

const MateriasGrafo = (props) => (
  <ReactFlowProvider>
    <FlowInner {...props} />
  </ReactFlowProvider>
);

export default MateriasGrafo;

