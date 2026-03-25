import React from 'react';
import { Card, CardBody, Divider } from '@heroui/react';
import { ArrowRight, Info, ChevronDown } from 'lucide-react';
import MateriaCard from '../Equivalencias/MateriaCard';

function ListaMaterias({ materiasMostradas, progresoViejo, progresoNuevo }) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Encabezados (Solo Desktop) */}
      <div className="hidden md:grid md:grid-cols-11 gap-4 px-6 py-2 items-center italic">
        <div className="col-span-5 text-[10px] font-bold uppercase text-default-400 text-center tracking-widest">Origen (17.13)</div>
        <div className="col-span-1"></div>
        <div className="col-span-5 text-[10px] font-bold uppercase text-primary text-center tracking-widest">Destino (17.14)</div>
      </div>

      {/* Lista de Pares */}
      <div className="flex flex-col gap-3">
        {materiasMostradas.map((item) => (
          <Card key={item.materiaVieja.codigo} shadow="sm" className="border-none bg-white dark:bg-zinc-900">
            <CardBody className="p-2 md:p-3">
              {/* Layout Mobile: Vertical | Layout Desktop: Grid 11 */}
              <div className="flex flex-col md:grid md:grid-cols-11 gap-2 md:gap-4 items-center">

                {/* Lado Viejo */}
                <div className="w-full md:col-span-5">
                  <MateriaCard
                    materia={item.materiaVieja}
                    estado={progresoViejo[item.materiaVieja.codigo]}
                  />
                </div>

                {/* Conector Visual */}
                <div className="flex md:col-span-1 justify-center items-center">
                  <ArrowRight className="hidden md:block text-primary/40" size={20} />
                  <ChevronDown className="md:hidden text-default-300" size={16} />
                </div>

                {/* Lado Nuevo */}
                <div className="w-full md:col-span-5">
                  <MateriaCard
                    isNewPlan
                    materia={item.materiaNueva}
                    estado={progresoNuevo[item.materiaNueva.codigo]}
                  />
                </div>

              </div>
            </CardBody>
          </Card>
        ))}

        {/* Empty State */}
        {(!materiasMostradas || materiasMostradas.length === 0) && (
          <div className="py-20 flex flex-col items-center opacity-50">
            <Info size={40} className="mb-2" />
            <p className="text-sm font-medium">No se encontraron materias</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaMaterias;