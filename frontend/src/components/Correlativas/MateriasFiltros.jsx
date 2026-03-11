import { Autocomplete } from '@heroui/react'
import React from 'react'

function MateriasBuscador({ materias }) {
    const tabs = [
        {
            id: "todas",
            label: "Todas",
            content: materias
        },
        {
            id: "1",
            label: "1° Año",
            content: materias.filter(m => Number(m.anio) === 1)
        },
        {
            id: "2",
            label: "2° Año",
            content: materias.filter(m => Number(m.anio) === 2)
        },
        {
            id: "3",
            label: "3° Año",
            content: materias.filter(m => Number(m.anio) === 3)
        },
        {
            id: "4",
            label: "4° Año",
            content: materias.filter(m => Number(m.anio) === 4)
        },
        {
            id: "5",
            label: "5° Año",
            content: materias.filter(m => Number(m.anio) === 5)
        },
        {
            id: "6",
            label: "6° Año",
            content: materias.filter(m => Number(m.anio) === 6)
        },
    ]

    const materiasAnio = (anio) => {
        return materias.filter(m => Number(m.anio) === anio)
    }
    return (
        <div>
            {/* Pensar si vale la pena tener un buscador de materias */}
            {/* Qué mostraría? */}

            {/* Zona pestañas por años */}

        </div>
    )
}

export default MateriasBuscador