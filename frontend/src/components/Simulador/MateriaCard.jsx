import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react"
import { useState } from "react"

function MateriaCard({ materia }) {
    const estados = [
        { name: "Sin Cursar", color: "warning", icon: "fa-regular fa-clock text-warning", background: "bg-warning/10 border-2 border-warning/30" },
        { name: "Regular", color: "primary", icon: "fa-regular fa-file-lines text-primary", background: "bg-primary/10 border-2 border-primary/30" },
        { name: "Aprobado", color: "success", icon: "fa-regular fa-circle-check text-success", background: "bg-success/10 border-2 border-success/30" },
    ]
    //Guardo el estado actual seleccionado
    const [selectedValue, setSelectedValue] = useState(estados[0])

    const handleClick = (estado) => {
        switch (estado) {
            case estados[0].name:
                setSelectedValue(estados[0])
                break
            case estados[1].name:
                setSelectedValue(estados[1])
                break
            case estados[2].name:
                setSelectedValue(estados[2])
                break
        }
    }
    return (
        <Card className={`p-2 ${selectedValue.background}`}>
            <CardHeader className="flex justify-between">
                <div>
                    {materia.codigo}
                </div>
                <div>
                    <i className={`${selectedValue.icon}`} />
                </div>
            </CardHeader>
            <CardBody>
                {materia.nombre}
            </CardBody>
            <CardFooter >
                <div>
                    {estados.map((estado, index) => (
                        <Chip
                            key={index}
                            variant={`${selectedValue.name === estado.name ? "shadow" : "flat"}`}
                            color={estado.color}
                            onClick={() => handleClick(estado.name)}
                            className="transition-all duration-300"
                        >
                            {estado.name}
                        </Chip>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}

export default MateriaCard