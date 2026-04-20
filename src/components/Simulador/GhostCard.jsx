import { Card, CardHeader, CardBody, Chip, Tooltip } from "@heroui/react"

function GhostCard({ materia }) {
    return (
        <Card className="p-2 opacity-60 border-2 border-dashed border-default-300 bg-default-100/30 shadow-none grayscale-[0.5]">
            <CardHeader className="flex justify-between items-start pb-1">
                <div className="text-[10px] font-black text-foreground/40 tracking-wider">
                    {materia.mostrarCodigo === false ? '---' : materia.codigo}
                </div>
                <div className="text-danger-400 opacity-80">
                    <Tooltip content="Materia bloqueada por correlativas" color="danger" closeDelay={0}>
                        <i className="fa-solid fa-lock text-sm" />
                    </Tooltip>
                </div>
            </CardHeader>
            <CardBody className="py-2">
                <p className="font-bold text-foreground/40 leading-tight text-sm uppercase tracking-tight">{materia.nombre}</p>

                <div className="mt-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-danger-500/60 uppercase tracking-widest">Bloqueada por</span>
                        <div className="h-px flex-1 bg-danger-500/20"></div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {materia.correlativasFaltantes.map((f, i) => (
                            <Chip
                                key={i}
                                size="sm"
                                variant="flat"
                                color="danger"
                                className="h-5 text-[9px] font-bold border border-danger-200/30 bg-danger-100/20"
                            >
                                {f}
                            </Chip>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default GhostCard
