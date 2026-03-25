import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, ButtonGroup } from '@heroui/react';
import { Search, Filter, BookOpen, CheckCircle, Clock } from 'lucide-react';
import equivalencias from '../../data/equivalencias.json';

function SearchMateria({ setMateriasMostradas, materias, progresoViejo }) {
  const { materiasViejas, materiasNuevas } = materias;
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todas"); // todas, aprobadas, pendientes

  // Función que construye el par y aplica los filtros
  const procesarMaterias = useCallback(() => {
    // 1. Mapeamos las materias viejas a sus equivalentes nuevas
    const pares = materiasViejas.map(mVieja => {
      // Buscamos en el JSON de equivalencias qué código NUEVO contiene a este código VIEJO
      const codigoNuevo = Object.keys(equivalencias).find(nuevoKey =>
        equivalencias[nuevoKey].includes(mVieja.codigo)
      );

      // Buscamos el objeto de la materia nueva
      const materiaNueva = materiasNuevas.find(mN => mN.codigo === codigoNuevo) || {
        nombre: "Sin equivalente directo",
        codigo: "---"
      };

      return {
        materiaVieja: mVieja,
        materiaNueva: materiaNueva
      };
    });

    // 2. Filtramos por término de búsqueda (nombre o código)
    let filtradas = pares.filter(par => {
      const search = searchTerm.toLowerCase();
      return (
        par.materiaVieja.nombre.toLowerCase().includes(search) ||
        par.materiaVieja.codigo.toString().includes(search) ||
        par.materiaNueva.nombre.toLowerCase().includes(search)
      );
    });

    // 3. Filtramos por el botón de estado seleccionado
    if (filtroActivo === "aprobadas") {
      filtradas = filtradas.filter(par => progresoViejo[par.materiaVieja.codigo] === "Aprobado");
    } else if (filtroActivo === "pendientes") {
      filtradas = filtradas.filter(par => progresoViejo[par.materiaVieja.codigo] !== "Aprobado");
    }

    setMateriasMostradas(filtradas);
  }, [searchTerm, filtroActivo, materiasViejas, materiasNuevas, progresoViejo, setMateriasMostradas]);

  // Ejecutar el procesamiento cada vez que cambien los filtros o los datos base
  useEffect(() => {
    procesarMaterias();
  }, [procesarMaterias]);

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Buscador */}
        <Input
          isClearable
          className="w-full md:max-w-sm"
          placeholder="Buscar materia o código..."
          startContent={<Search size={18} className="text-default-400" />}
          value={searchTerm}
          onValueChange={setSearchTerm}
          variant="bordered"
        />

        {/* Filtros de Estado */}
        <ButtonGroup variant="flat" className="w-full md:w-auto">
          <Button
            onPress={() => setFiltroActivo("todas")}
            color={filtroActivo === "todas" ? "primary" : "default"}
            startContent={<BookOpen size={16} />}
          >
            Todas
          </Button>
          <Button
            onPress={() => setFiltroActivo("aprobadas")}
            color={filtroActivo === "aprobadas" ? "success" : "default"}
            startContent={<CheckCircle size={16} />}
          >
            Aprobadas
          </Button>
          <Button
            onPress={() => setFiltroActivo("pendientes")}
            color={filtroActivo === "pendientes" ? "warning" : "default"}
            startContent={<Clock size={16} />}
          >
            Pendientes
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex items-center gap-2 text-default-400 text-[11px] px-1 italic">
        <Filter size={12} />
        Mostrando las equivalencias del Plan 17.13 al 17.14
      </div>
    </div>
  );
}

export default SearchMateria;