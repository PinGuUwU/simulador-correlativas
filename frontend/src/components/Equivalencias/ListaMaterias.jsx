import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { ArrowDown, ArrowRight, Info } from 'lucide-react';
import MateriaCard from './MateriaCard';

function ListaMaterias({ materiasMostradas, progresoViejo, progresoNuevo, setProgresoViejo }) {

  // Ejemplo de función para rotar estado al hacer click (opcional)
  const handleActualizarEstado = (codigo) => {
    // Aquí iría tu lógica para cambiar de Pendiente -> Regular -> Aprobado
    console.log("Actualizando materia:", codigo);
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Encabezados */}
      <div className="hidden md:grid md:grid-cols-11 gap-4 px-6 py-3 bg-default-100/50 rounded-2xl items-center mb-2">
        <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.2em] text-default-500 text-center">Plan 17.13 (Origen)</div>
        <div className="col-span-1"></div>
        <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 text-center">Plan 17.14 (Destino)</div>
      </div>

      <div className="flex flex-col gap-6 md:gap-4">
        {materiasMostradas.map((item) => (
          <div key={item.materiaVieja.codigo} className="grid grid-cols-1 md:grid-cols-11 gap-2 md:gap-4 items-center group">

            {/* Materia Plan Viejo */}
            <MateriaCard
              materia={item.materiaVieja}
              estado={progresoViejo[item.materiaVieja.codigo]}
              actualizarEstado={handleActualizarEstado}
            />

            {/* Flecha de conexión */}
            <div className="col-span-1 flex justify-center items-center py-1 md:py-0">
              <div className="bg-default-100 md:bg-transparent p-1.5 rounded-full">
                <ArrowDown className="text-default-400 md:hidden" size={16} />
                <ArrowRight className="text-primary hidden md:block group-hover:translate-x-1 transition-transform duration-300" size={20} />
              </div>
            </div>

            {/* Materia Plan Nuevo */}
            <MateriaCard
              isNewPlan
              materia={item.materiaNueva}
              estado={progresoNuevo[item.materiaNueva.codigo]}
            />
          </div>
        ))}

        {/* Empty State */}
        {(!materiasMostradas || materiasMostradas.length === 0) && (
          <Card className="bg-default-50/50 border-2 border-dashed border-default-200 shadow-none">
            <CardBody className="py-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center">
                <Info size={24} className="text-default-300" />
              </div>
              <div className="space-y-1 px-4">
                <p className="text-default-600 font-bold text-base">Sin materias para mostrar</p>
                <p className="text-default-400 text-[11px] max-w-xs mx-auto leading-relaxed">
                  Usá el buscador o los filtros para comparar las materias entre ambos planes.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ListaMaterias;