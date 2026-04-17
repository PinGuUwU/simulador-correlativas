import React, { useMemo } from 'react';
import { Card, CardBody, Accordion, AccordionItem, Button, Chip } from '@heroui/react';
import { ArrowRight, Info, ChevronDown, Repeat, GraduationCap, ChevronUp } from 'lucide-react';
import MateriaCard from '../Equivalencias/MateriaCard';

function ListaMaterias({ materiasFiltradas, progresoSimulado, onToggleEstado }) {

  // Agrupación de las materias por año académico
  const materiasPorAnio = useMemo(() => {
    const grupos = {};
    materiasFiltradas.forEach(grupo => {
      const anio = grupo.anio || "6"; // Usamos la propiedad anio del grupo
      if (!grupos[anio]) grupos[anio] = [];
      grupos[anio].push(grupo);
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
        <div className="col-span-5 text-[10px] font-black uppercase text-default-600 dark:text-default-400 text-center tracking-[0.2em] flex items-center justify-center gap-2">
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
                <span className="text-[10px] text-default-600 dark:text-default-400 font-black uppercase">
                  {materias.length} equivalencias
                </span>
              </div>
            }
          >
            <div className="flex flex-col gap-10 py-2">
              {[1, 2].map((cuatri) => {
                // Agrupamos por cuatrimestre usando el año/cuatri definido en el hook
                const gruposCuatri = materias.filter(
                  (grupo) => (Number(grupo.cuatrimestre) % 2 === 0 ? 2 : 1) === cuatri
                );

                if (gruposCuatri.length === 0) return null;

                return (
                  <div key={cuatri} className="flex flex-col gap-8">
                    {/* Cabecera del Cuatrimestre */}
                    <div className="flex items-center justify-between bg-default-100/30 border border-default-200/50 rounded-2xl px-5 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary/40 rounded-full"></div>
                        <h3 className="text-[13px] font-black text-default-800 dark:text-default-400 uppercase tracking-widest">
                          {cuatri}° Cuatrimestre
                        </h3>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-background/80 border border-default-300 text-default-700 dark:text-foreground font-black text-[10px] uppercase px-3"
                      >
                        {gruposCuatri.length} {gruposCuatri.length === 1 ? 'grupo' : 'grupos'}
                      </Chip>
                    </div>

                    <div className="grid grid-cols-1 gap-12 sm:gap-16">
                      {gruposCuatri.map((grupo, index) => {
                        // Un grupo está aprobado si TODAS sus materias viejas lo están
                        const todasAprobadas = grupo.materiasViejas.length > 0 &&
                          grupo.materiasViejas.every(m => progresoSimulado[m.codigo] === "Aprobado");

                        const estadoNuevo = grupo.esEquivalente
                          ? (todasAprobadas ? "Aprobado" : "Disponible")
                          : "Sin equivalencia";

                        return (
                          <React.Fragment key={grupo.id}>
                            <div className="flex flex-col sm:grid sm:grid-cols-11 gap-4 sm:gap-6 items-center">

                              {/* Lado Izquierdo: Materias Viejas (Origen) */}
                              <div className="w-full sm:col-span-5 flex flex-col gap-3">
                                {grupo.materiasViejas.map((mVieja) => (
                                  <MateriaCard
                                    key={mVieja.codigo}
                                    materia={mVieja}
                                    estado={progresoSimulado[mVieja.codigo]}
                                    onClick={() => onToggleEstado(mVieja.codigo)}
                                  />
                                ))}
                                {grupo.materiasViejas.length === 0 && (
                                  <div className="p-8 rounded-2xl border-2 border-dashed border-default-200 flex items-center justify-center text-default-400 text-xs font-bold uppercase tracking-widest bg-default-50/50">
                                    Sin origen (Materia nueva pura)
                                  </div>
                                )}
                              </div>

                              {/* Centro: Flecha / Conector */}
                              <div className="flex sm:col-span-1 justify-center items-center py-2 sm:py-0">
                                <ArrowRight className="hidden sm:block text-primary/20" size={32} strokeWidth={2.5} />
                                <ChevronDown className="sm:hidden text-default-400" size={20} />
                              </div>

                              {/* Lado Derecho: Materia Nueva (Destino) */}
                              <div className="w-full sm:col-span-5">
                                <MateriaCard
                                  isNewPlan
                                  materia={grupo.materiaNueva}
                                  estado={estadoNuevo}
                                />
                              </div>
                            </div>

                            {/* Separador entre grupos - Solo visible en mobile */}
                            {index < gruposCuatri.length - 1 && (
                              <div className="sm:hidden flex items-center justify-center py-2">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-default-300/40 to-transparent" />
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
