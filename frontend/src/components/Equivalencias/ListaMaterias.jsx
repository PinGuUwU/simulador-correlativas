import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { ArrowRight, Info, ChevronDown, Repeat } from 'lucide-react';
import MateriaCard from '../Equivalencias/MateriaCard';

function ListaMaterias({ materiasFiltradas, progresoSimulado, onToggleEstado }) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encabezados (Solo Desktop) */}
      <div className="hidden lg:grid lg:grid-cols-11 gap-4 px-6 py-2 items-center">
        <div className="col-span-5 text-[10px] font-bold uppercase text-default-400 text-center tracking-widest flex items-center justify-center gap-2">
          <Repeat size={12} /> Plan 17.13 (Origen)
        </div>
        <div className="col-span-1"></div>
        <div className="col-span-5 text-[10px] font-bold uppercase text-primary text-center tracking-widest flex items-center justify-center gap-2">
          <ArrowRight size={12} /> Plan 17.14 (Destino)
        </div>
      </div>

      {/* Lista de Pares */}
      <div className="flex flex-col gap-4">
        {materiasFiltradas.map((par) => (
          <Card
            key={par.id}
            shadow="none"
            className="border border-default-100 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <CardBody className="p-3 md:p-4">
              <div className="flex flex-col lg:grid lg:grid-cols-11 gap-3 lg:gap-6 items-stretch">
                {/* Lado Viejo (Origen) */}
                <div className="w-full lg:col-span-5">
                  <MateriaCard
                    materia={par.materiaVieja}
                    estado={progresoSimulado[par.materiaVieja.codigo]}
                    onClick={() => onToggleEstado(par.materiaVieja.codigo)}
                  />
                </div>

                {/* Conector Visual */}
                <div className="flex lg:col-span-1 justify-center items-center">
                  <div className="h-6 w-[1px] bg-default-100 lg:hidden" />
                  <ArrowRight className="hidden lg:block text-primary/30" size={24} strokeWidth={1.5} />
                  <ChevronDown className="lg:hidden text-default-300" size={20} />
                </div>

                {/* Lado Nuevo (Destino) */}
                <div className="w-full lg:col-span-5">
                  <MateriaCard
                    isNewPlan
                    materia={par.materiaNueva}
                    estado={par.esEquivalente ? "Pendiente" : "Sin equivalencia"}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}

        {/* Empty State */}
        {materiasFiltradas.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-default-400 bg-default-50 rounded-3xl border-2 border-dashed border-default-200">
            <Info size={48} strokeWidth={1} className="mb-4 text-default-300" />
            <p className="text-sm font-bold uppercase tracking-widest">No se encontraron resultados</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaMaterias;
