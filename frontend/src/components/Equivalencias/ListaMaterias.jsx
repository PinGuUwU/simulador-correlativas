import React from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { ArrowDown, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

function ListaMaterias({ materiasMostradas = [], materiasNuevas = [], materiasViejas = [] }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Column Headers (Desktop Only) */}
      <div className="hidden md:grid md:grid-cols-11 gap-4 px-6 py-3 bg-default-100/50 rounded-2xl items-center mb-2">
        <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.2em] text-default-500 text-center">Plan 17.13 (Origen)</div>
        <div className="col-span-1"></div>
        <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 text-center">Plan 17.14 (Destino)</div>
      </div>

      {/* Equivalency List Container */}
      <div className="flex flex-col gap-6 md:gap-4">
        {/* Row Container */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-2 md:gap-4 items-center group">
          {/* Old Plan Subject Card */}
          <Card shadow="sm" className="col-span-1 md:col-span-5 bg-default-50/50 border-none">
            <CardBody className="p-3 flex-row justify-between items-center gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-default-400 uppercase tracking-tight">CÓD. 001</span>
                <p className="text-xs xs:text-sm font-bold text-default-700 truncate leading-tight">Análisis Matemático I</p>
              </div>
              <Chip 
                size="sm" 
                variant="flat" 
                color="success" 
                startContent={<CheckCircle2 size={10} />}
                className="shrink-0 h-6 text-[10px]"
              >
                Aprobada
              </Chip>
            </CardBody>
          </Card>

          {/* Connection Indicator - Changes icon based on screen size */}
          <div className="col-span-1 flex justify-center items-center py-1 md:py-0">
            <div className="bg-default-100 md:bg-transparent p-1.5 rounded-full">
                <ArrowDown className="text-default-400 md:hidden" size={16} />
                <ArrowRight className="text-primary hidden md:block group-hover:translate-x-1 transition-transform duration-300" size={20} />
            </div>
          </div>

          {/* New Plan Subject Card */}
          <Card shadow="sm" className="col-span-1 md:col-span-5 border-1.5 border-primary/20 bg-primary/5">
            <CardBody className="p-3 flex-row justify-between items-center gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-primary-400 uppercase tracking-tight">CÓD. 101</span>
                <p className="text-xs xs:text-sm font-bold text-primary-900 truncate leading-tight">Análisis Matemático I</p>
              </div>
              <Chip size="sm" variant="shadow" color="primary" className="h-6 text-[10px] min-w-[32px]">1:1</Chip>
            </CardBody>
          </Card>
        </div>

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