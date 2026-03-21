import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react"
import { useState } from "react"

function MateriaCard({ materia, actualizarEstados, estado }) {
    const estados = [
        { name: "No Cursado", isCursado: false, color: "warning", icon: "fa-regular fa-clock text-warning", background: "bg-warning/10 border-2 border-warning/30" },
        { name: "Cursado", isCursado: true, color: "success", icon: "fa-regular fa-circle-check text-success", background: "bg-success/10 border-2 border-success/30" },
    ]

    // Leemos isCursado a partir de la prop "estado".
    // Esto convierte a MateriaCard en un componente "controlado".
    const isCursado = estado === "Cursado"
    const selectedState = isCursado ? estados[1] : estados[0]

    return (
        <Card className={`p-2 transition-colors duration-300 ${selectedState.background}`}>
            <CardHeader className="flex justify-between items-start pb-1">
                <div className="text-xs font-bold text-foreground/80">
                    {materia.codigo}
                </div>
                <div>
                    <i className={`${selectedState.icon} transition-colors duration-300`} />
                </div>
            </CardHeader>
            <CardBody className="py-2">
                <p className="font-semibold text-foreground/90 leading-tight">{materia.nombre}</p>
                {(materia.horas_totales || materia.horas_semanales) && (
                    <div className="flex gap-3 mt-3 text-[10px] text-foreground/60 font-medium">
                        {materia.horas_totales && <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i>{materia.horas_totales}h totales</span>}
                        {materia.horas_semanales && <span className="flex items-center gap-1"><i className="fa-solid fa-calendar-week"></i>{materia.horas_semanales}h/sem</span>}
                    </div>
                )}
            </CardBody>
            <CardFooter className="pt-2">
                <div className="flex gap-2 flex-wrap w-full">
                    {estados.map((est, index) => (
                        <Chip
                            key={index}
                            variant={isCursado === est.isCursado ? "shadow" : "flat"}
                            color={est.color}
                            onClick={() => {
                                // Solo actualizamos en el padre si hace click en el estado que NO está seleccionado
                                if (isCursado !== est.isCursado) {
                                    actualizarEstados()
                                }
                            }}
                            className="transition-all duration-300 cursor-pointer"
                        >
                            {est.name}
                        </Chip>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}

export default MateriaCard