import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import materiasUtils from '../../utils/Progreso/materiasUtils'
import { Chip } from '@heroui/react'

function LeyendaEstados({ materias }) {

    // Los nombres deben coincidir exactamente con los "case" de tu switch
    const estados = [
        { name: "Aprobado", desc: "Materia completada" },
        { name: "Regular", desc: "Cursada aprobada" },
        { name: "Disponible", desc: "Lista para cursar" },
        { name: "Bloqueado", desc: "Faltan correlativas" },
    ]

    const horas_totales = materias.reduce((acumulador, materia) => {
        const horas = Number(materia.horas_totales)
        return acumulador + horas
    }, 0)

    // Mapeo para los fondos suaves basado en el "accent" semántico de HeroUI
    const bgMap = {
        success: "bg-success/20",
        primary: "bg-primary/20",
        warning: "bg-warning/20",
        danger: "bg-danger/20",
        secondary: "bg-secondary/20",
        default: "bg-default-100"
    }

    return (
        <div className='p-5 flex flex-col gap-6 w-full'>
            <Card className="shadow-sm border border-default-100">
                <CardHeader className='font-bold text-foreground px-6 pt-6 text-lg'>
                    Leyenda de Estados
                </CardHeader>
                <CardBody className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6'>
                    {estados.map((estado, index) => {
                        const estilo = materiasUtils.obtenerEstiloPorEstado(estado.name)
                        return (
                            <div key={index} className="flex items-center gap-4">
                                <div className={`${bgMap[estilo.accent]} w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105`}>
                                    <i className={`fa-solid ${estilo.icon} ${estilo.colorText} text-xl`}></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${estilo.colorText} leading-tight`}>
                                        {estado.name}
                                    </span>
                                    <span className="text-xs text-foreground/60 font-medium">
                                        {estado.desc}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </CardBody>
                <CardFooter className='flex justify-center'>
                    <Chip variant='flat' color='success'>
                        Horas totales de la carrera: {horas_totales}
                    </Chip>
                </CardFooter>
            </Card>

            <Card className="shadow-sm border border-default-100 bg-primary/5">
                <CardHeader className='font-bold text-foreground px-6 pt-6 text-lg flex flex-col items-start gap-1'>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-scale-balanced text-primary"></i>
                        <span>Estatuto UNLu</span>
                    </div>
                    <a
                        href="https://www.unlu.edu.ar/estatuto_unlu.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                        <i className="fa-solid fa-file-pdf"></i>
                        Ver Estatuto Completo (PDF)
                    </a>
                </CardHeader>
                <CardBody className='px-6 py-4 flex flex-col gap-4'>
                    <div className="flex gap-4 items-start bg-background/50 p-4 rounded-xl border border-primary/10">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="font-bold text-primary">16</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm">Vigencia de la Regularidad</span>
                            <p className="text-xs text-foreground/70 leading-relaxed">
                                Según el <b>Art. 16 del RGE</b>, la condición de regular tiene una vigencia de <b>5 cuatrimestres</b> consecutivos desde su obtención.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-background/50 p-4 rounded-xl border border-primary/10">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-shield-halved text-primary"></i>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm">Independencia de las Cursadas</span>
                            <p className="text-xs text-foreground/70 leading-relaxed">
                                Si se vence la regularidad de una materia A, la regularidad de una materia B <b>no se cae automáticamente</b>. Cada materia mantiene su propia vigencia independiente de las demás.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default LeyendaEstados