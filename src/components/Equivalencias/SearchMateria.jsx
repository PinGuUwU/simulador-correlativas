import React from 'react'
import { Input } from '@heroui/react'
import { Search, X } from 'lucide-react'

function SearchMateria({ busqueda, setBusqueda }) {
    return (
        <div className="w-full animate-in fade-in slide-in-from-left-2 duration-300">
            <Input
                isClearable
                radius="xl"
                placeholder="Buscar materia por nombre o código..."
                startContent={
                    <Search size={18} className="text-default-400 pointer-events-none flex-shrink-0 text-md" />
                }
                value={busqueda}
                onValueChange={setBusqueda}
                onClear={() => setBusqueda("")}
                classNames={{
                    input: "text-base",
                    inputWrapper: "h-11 bg-default-100 border-none shadow-none focus-within:ring-2 ring-primary/20",
                }}
            />
        </div>
    )
}

export default SearchMateria
