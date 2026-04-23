import React from 'react';
import { Card, CardBody, Progress, Chip } from '@heroui/react';

function HeaderEquivalencias({ progresoViejo, progresoNuevo, totalMaterias, equivalenciasAprobadas }) {


  
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Título Principal - Mobile First sizing */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl xs:text-3xl font-black text-foreground tracking-tight leading-tight">
          Equivalencias <span className="text-primary-700 dark:text-primary-500 girlie:text-primary-800 boyie:text-primary-800">Plan 17.14</span>
        </h1>
        <p className="text-default-600 dark:text-default-500 girlie:text-default-600 boyie:text-default-500 text-xs xs:text-sm max-w-2xl leading-relaxed">
          Impacto de tu progreso del Plan 17.13 en el nuevo plan de estudios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card Plan Viejo */}
        <Card className="bg-default-50/50 border-none shadow-sm shadow-default-200/50">
          <CardBody className="gap-2 p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-default-600 dark:text-default-500">Plan 17.13</span>
              <Chip size="sm" variant="flat" color="default" className="h-5 text-xs">{progresoViejo}%</Chip>
            </div>
            <Progress 
              aria-label="Progreso Plan Viejo"
              color="default" 
              value={progresoViejo} 
              size="sm"
              className="w-full"
            />
          </CardBody>
        </Card>

        {/* Card Plan Nuevo */}
        <Card className="bg-primary-50/30 border-none shadow-sm shadow-primary-200/30">
          <CardBody className="gap-2 p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-500 girlie:text-primary-800 boyie:text-primary-800">Plan 17.14</span>
              <Chip size="sm" variant="flat" color="primary" className="h-5 text-xs">{progresoNuevo}%</Chip>
            </div>
            <Progress 
              aria-label="Progreso Plan Nuevo"
              color="primary" 
              value={progresoNuevo} 
              size="sm"
              className="w-full"
            />
          </CardBody>
        </Card>
      </div>

      {/* Resumen - Mobile optimized padding */}
      <div className="flex items-center justify-center p-3 bg-primary/5 rounded-xl border border-primary/10">
        <p className="text-xs font-semibold text-foreground text-center">
          Llevás <span className="text-primary-700 dark:text-primary-500 girlie:text-primary-800 boyie:text-primary-800 font-bold">{equivalenciasAprobadas}</span> de <span className="font-bold">{totalMaterias}</span> materias completadas.
        </p>
      </div>
    </div>
  );
}

export default HeaderEquivalencias;