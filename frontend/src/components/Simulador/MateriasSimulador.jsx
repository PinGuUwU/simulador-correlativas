import MateriaCard from './MateriaCard'
import GhostCard from './GhostCard'

function MateriasSimulador({ progreso, materiasCursables, materiasBloqueadas = [], cambioDeEstado }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* Materias que SÍ puede cursar */}
            {materiasCursables.map((materia, index) => (
                <MateriaCard key={`cursable-${index}`}
                    materia={materia}
                    actualizarEstados={() => cambioDeEstado(materia.codigo)}
                    estado={progreso[materia.codigo]}
                />
            ))}

            {/* Materias "Fantasma" (bloqueadas de este cuatrimestre) */}
            {materiasBloqueadas.map((materia, index) => (
                <GhostCard key={`blocked-${index}`} 
                    materia={materia} 
                />
            ))}
        </div>
    )
}

export default MateriasSimulador
