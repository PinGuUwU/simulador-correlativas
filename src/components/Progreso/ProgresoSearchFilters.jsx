import React from 'react'
import { Input, Button, Badge, Popover, PopoverTrigger, PopoverContent, Checkbox, Chip } from '@heroui/react'
import { Search, ListFilter } from 'lucide-react'
import materiasUtils from '../../utils/Progreso/materiasUtils'

function ProgresoSearchFilters({ busqueda, setBusqueda, filtros, setFiltros }) {
    const estados = materiasUtils.estadosPosibles.concat(['Bloqueado', 'Cursando']);
    
    const handleToggleFiltro = (estado) => {
        if (filtros.includes(estado)) {
            setFiltros(filtros.filter(f => f !== estado));
        } else {
            setFiltros([...filtros, estado]);
        }
    };

    const clearFiltros = () => setFiltros([]);

    return (
        <div className="flex flex-col gap-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2">
                {/* Buscador */}
                <div className="flex-1">
                    <Input
                        isClearable
                        radius="xl"
                        placeholder="Buscar materia..."
                        startContent={<Search size={18} className="text-default-400" />}
                        value={busqueda}
                        onValueChange={setBusqueda}
                        onClear={() => setBusqueda("")}
                        classNames={{
                            input: "text-small",
                            inputWrapper: "h-11 bg-background border-default-200 shadow-sm hover:border-default-300 focus-within:ring-2 ring-primary/20 transition-all",
                        }}
                    />
                </div>

                {/* Botón de Filtros */}
                <Badge 
                    content={filtros.length} 
                    color="primary" 
                    isInvisible={filtros.length === 0}
                    shape="circle"
                    className="font-bold"
                >
                    <Popover placement="bottom-end" shadow="lg" showArrow offset={10}>
                        <PopoverTrigger>
                            <Button 
                                isIconOnly 
                                radius="full" 
                                variant="flat" 
                                className={`h-11 w-11 ${filtros.length > 0 ? 'bg-primary/10 text-primary' : 'bg-background border-default-200 text-default-500 border'}`}
                            >
                                <ListFilter size={20} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-4">
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center justify-between border-b border-default-100 pb-2">
                                    <span className="text-sm font-black uppercase tracking-wider">Filtrar por estado</span>
                                    {filtros.length > 0 && (
                                        <Button size="sm" variant="light" color="danger" className="h-7 px-2 font-bold min-w-unit-0" onPress={clearFiltros}>
                                            Limpiar
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {estados.map((estado) => {
                                        const estilo = materiasUtils.obtenerEstiloPorEstado(estado);
                                        const isSelected = filtros.includes(estado);
                                        
                                        return (
                                            <div 
                                                key={estado}
                                                onClick={(e) => {
                                                    // Evitar que el clic en el checkbox dispare esto dos veces
                                                    if (e.target.tagName !== 'INPUT') {
                                                        handleToggleFiltro(estado);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-default-100' : 'hover:bg-default-50'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-default-200 ${isSelected ? estilo.colorText : 'text-default-300'}`}>
                                                    <i className={`fa-solid ${estilo.icon} text-sm`}></i>
                                                </div>
                                                <span className={`text-sm font-bold flex-1 ${isSelected ? 'text-foreground' : 'text-default-500'}`}>
                                                    {estado}
                                                </span>
                                                <Checkbox 
                                                    isSelected={isSelected} 
                                                    size="sm"
                                                    onChange={() => handleToggleFiltro(estado)}
                                                    classNames={{ wrapper: "rounded-md" }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </Badge>
            </div>

            {/* Chips de filtros activos */}
            {filtros.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                    {filtros.map(f => (
                        <Chip
                            key={f}
                            size="sm"
                            variant="flat"
                            color={materiasUtils.obtenerEstiloPorEstado(f).accent}
                            onClose={() => handleToggleFiltro(f)}
                            classNames={{
                                base: "h-7 border border-default-200",
                                content: "font-bold text-[10px] uppercase"
                            }}
                        >
                            {f}
                        </Chip>
                    ))}
                    {filtros.length > 1 && (
                        <Button 
                            size="sm" 
                            variant="light" 
                            className="h-7 px-2 text-[10px] font-black uppercase text-danger"
                            onPress={clearFiltros}
                        >
                            Limpiar todo
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProgresoSearchFilters
