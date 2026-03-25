import React from 'react';
import { Input, Button } from '@heroui/react';
import { Search, CheckCircle, Clock, LayoutGrid } from 'lucide-react';

function SearchMateria({ materias, setMateriasMostradas }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Search Input - Full width on mobile */}
      <div className="w-full">
        <Input
          placeholder="Buscar materia..."
          startContent={<Search className="text-default-400" size={18} />}
          variant="flat"
          className="w-full"
          size="md"
        />
      </div>

      {/* Filter Buttons - Optimized for mobile: vertical stack on tiny screens, horizontal on medium */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 w-full">
        <Button 
          variant="flat" 
          color="primary" 
          className="w-full font-medium text-xs"
          startContent={<LayoutGrid size={16} />}
        >
          Todas
        </Button>
        <Button 
          variant="flat" 
          color="primary" 
          className="w-full font-medium text-xs"
          startContent={<CheckCircle size={16} />}
        >
          Aprobadas
        </Button>
        <Button 
          variant="flat" 
          color="primary" 
          className="w-full font-medium text-xs"
          startContent={<Clock size={16} />}
        >
          Faltantes
        </Button>
      </div>
    </div>
  );
}

export default SearchMateria;