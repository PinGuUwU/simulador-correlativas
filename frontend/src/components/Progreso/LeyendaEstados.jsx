import { Card, CardBody, CardHeader } from '@heroui/card'
import materiasUtils from '../../utils/materiasUtils'

function LeyendaEstados() {
    // Los nombres deben coincidir exactamente con los "case" de tu switch
    const estados = [
        { name: "Aprobado", desc: "Materia completada" },
        { name: "Regular", desc: "Cursada aprobada" },
        { name: "Disponible", desc: "Lista para cursar" },
        { name: "Bloqueado", desc: "Faltan correlativas" },
    ]

    // Mapeo para los fondos suaves basado en el "accent" que devuelve tu función
    const bgMap = {
        green: "bg-green-100",
        cyan: "bg-cyan-100",
        amber: "bg-amber-100",
        slate: "bg-slate-100"
    }

    return (
        <div className='p-5'>
            <Card className="shadow-sm border border-slate-100">
                <CardHeader className='font-bold text-slate-800 px-6 pt-6 text-lg'>
                    Leyenda de Estados
                </CardHeader>
                <CardBody className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6'>
                    {estados.map((estado, index) => {
                        // Invocamos tu nueva función
                        const estilo = materiasUtils.obtenerEstiloPorEstado(estado.name)

                        return (
                            <div key={index} className="flex items-center gap-4">
                                {/* Contenedor del ícono usando estilo.accent */}
                                <div className={`${bgMap[estilo.accent]} w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105`}>
                                    <i className={`fa-solid ${estilo.icon} ${estilo.colorText} text-xl`}></i>
                                </div>

                                {/* Textos */}
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${estilo.colorText} leading-tight`}>
                                        {estado.name}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {estado.desc}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </CardBody>
            </Card>
        </div>
    )
}

export default LeyendaEstados