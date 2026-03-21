import MateriaCard from './MateriaCard'

function MateriasSimulador({ progreso, materiasCursables, cambioDeEstado }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {materiasCursables.map((materia, index) => (
                <MateriaCard key={index}
                    materia={materia}
                    actualizarEstados={() => cambioDeEstado(materia.codigo)}
                    estado={progreso[materia.codigo]}
                />
            ))}
        </div>
    )
}

export default MateriasSimulador