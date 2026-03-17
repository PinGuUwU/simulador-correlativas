
import useSimuladorMaterias from '../../hooks/Simulador/useSimuladorMaterias'
import MateriaCard from './MateriaCard'

function MateriasSimulador({ progreso, materias, anio, cuatri }) {
    const { nextMaterias } = useSimuladorMaterias(materias, progreso, anio, cuatri)
    return (
        <div>
            {nextMaterias.map((materia, index) => (
                <MateriaCard key={index}
                    materia={materia}
                />
            ))}
        </div>
    )
}

export default MateriasSimulador