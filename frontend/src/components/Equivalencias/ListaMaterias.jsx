import React, { useMemo } from 'react';
import { Card, CardBody, Accordion, AccordionItem, Button, Chip } from '@heroui/react';
import { ArrowRight, Info, ChevronDown, Repeat, GraduationCap, ChevronUp } from 'lucide-react';
import MateriaCard from '../Equivalencias/MateriaCard';

function ListaMaterias({ materiasFiltradas, progresoSimulado, onToggleEstado }) {

  // Agrupación de las materias por año académico del Plan Viejo
  const materiasPorAnio = useMemo(() => {
    const grupos = {};
    materiasFiltradas.forEach(par => {
      const anio = par.materiaVieja.anio || "6"; // Si no tiene año, lo mandamos al final
      if (!grupos[anio]) grupos[anio] = [];
      grupos[anio].push(par);
    });
    return Object.entries(grupos).sort(([a], [b]) => parseInt(a) - parseInt(b));
  }, [materiasFiltradas]);

  if (materiasFiltradas.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-default-400 bg-default-50 rounded-3xl border-2 border-dashed border-default-200 animate-in fade-in duration-500">
        <Info size={48} strokeWidth={1} className="mb-4 text-default-300" />
        <p className="text-sm font-bold uppercase tracking-widest">No se encontraron resultados</p>
        <p className="text-xs mt-1">Prueba ajustando los filtros o la búsqueda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Encabezados Desktop */}
      <div className="hidden sm:grid sm:grid-cols-11 gap-4 px-6 py-2 items-center">
        <div className="col-span-5 text-[10px] font-black uppercase text-default-400 text-center tracking-[0.2em] flex items-center justify-center gap-2">
          <Repeat size={12} /> Plan 17.13 (Origen)
        </div>
        <div className="col-span-1"></div>
        <div className="col-span-5 text-[10px] font-black uppercase text-primary text-center tracking-[0.2em] flex items-center justify-center gap-2">
          <ArrowRight size={12} /> Plan 17.14 (Destino)
        </div>
      </div>

      {/* Acordeón por Años */}
      <Accordion
        variant="light"
        className="px-0"
        selectionMode="multiple"
        defaultExpandedKeys={["1"]} // Expandir primer año por defecto
        itemClasses={{
          base: "py-0 w-full mb-4",
          title: "font-black text-foreground text-sm uppercase tracking-widest",
          trigger: "px-4 py-4 bg-default-100/50 hover:bg-default-200/50 rounded-2xl transition-all border border-default-200/50",
          content: "pt-4 px-1",
          indicator: "text-primary font-bold"
        }}
      >
        {materiasPorAnio.map(([anio, materias]) => (
          <AccordionItem
            key={anio}
            aria-label={`Materias de ${anio}º Año`}
            startContent={
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="font-black text-xs">{anio}º</span>
              </div>
            }
            title={`${anio}º Año`}
            subtitle={
              <div className="flex gap-2 mt-0.5">
                <span className="text-[10px] text-default-400 font-bold uppercase">
                  {materias.length} equivalencias
                </span>
              </div>
            }
          >
            <div className="flex flex-col gap-10 py-2">
              {[1, 2].map((cuatri) => {
                // Agrupamos por cuatrimestre basado en la materia de origen (Plan Viejo)
                const materiasCuatri = materias.filter(
                  (par) => (Number(par.materiaVieja.cuatrimestre) % 2 === 0 ? 2 : 1) === cuatri
                );

                if (materiasCuatri.length === 0) return null;

                return (
                  <div key={cuatri} className="flex flex-col gap-6">
                    {/* Cabecera del Cuatrimestre */}
                    <div className="flex items-center justify-between bg-default-100/30 border border-default-200/50 rounded-2xl px-5 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary/40 rounded-full"></div>
                        <h3 className="text-[13px] font-black text-default-600 uppercase tracking-widest">
                          {cuatri}° Cuatrimestre
                        </h3>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-background/50 border border-default-200 text-default-500 font-bold text-[10px] uppercase px-3"
                      >
                        {materiasCuatri.length} {materiasCuatri.length === 1 ? 'materia' : 'materias'}
                      </Chip>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:gap-14">
                      {materiasCuatri.map((par, index) => {
                        const estadoActual = progresoSimulado[par.materiaVieja.codigo];
                        return (
                          <React.Fragment key={par.id}>
                            <div className="flex flex-col sm:grid sm:grid-cols-11 gap-4 sm:gap-4 items-stretch">
                              <div className="w-full sm:col-span-5">
                                <MateriaCard
                                  materia={par.materiaVieja}
                                  estado={estadoActual}
                                  onClick={() => onToggleEstado(par.materiaVieja.codigo)}
                                />
                              </div>
                              <div className="flex sm:col-span-1 justify-center items-center py-2 sm:py-0">
                                <ArrowRight className="hidden sm:block text-primary/20" size={24} strokeWidth={2.5} />
                                <ChevronDown className="sm:hidden text-default-700" size={16} />
                              </div>
                              <div className="w-full sm:col-span-5">
                                <MateriaCard
                                  isNewPlan
                                  materia={par.materiaNueva}
                                  estado={par.esEquivalente ? estadoActual : "Sin equivalencia"}
                                />
                              </div>
                            </div>

                            {/* Separador entre pares - Solo visible en mobile para mejorar la distinción */}
                            {index < materiasCuatri.length - 1 && (
                              <div className="sm:hidden flex items-center justify-center py-2">
                                <div className="w-full h-px bg-default-400" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default ListaMaterias;
