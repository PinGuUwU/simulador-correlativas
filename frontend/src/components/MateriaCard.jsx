import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react";

// 1. Movemos la configuración fuera del componente. 
// De esta forma evitamos que estos objetos se vuelvan a crear en cada render.
const ESTADO_CONFIG = {
    Bloqueado: {
        estilo: "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-400",
        color: "default",
        icono: "fa-solid fa-lock",
    },
    Disponible: {
        estilo: "bg-blue-100 border-blue-300 hover:bg-blue-200 hover:border-blue-400",
        color: "primary",
        icono: "fa-solid fa-lock-open",
    },
    Regular: {
        estilo: "bg-yellow-50 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-400",
        color: "warning",
        icono: "fa-regular fa-clock",
    },
    Aprobado: {
        estilo: "bg-green-100 border-green-500 hover:bg-green-200 hover:border-green-400",
        color: "success",
        icono: "fa-regular fa-circle-check",
    },
};

function MateriaCard({ materia, estado, actualizarEstados, modo, abrirInfo }) {
    // 2. Desestructuramos las propiedades de "materia" para un código más limpio en el JSX
    const { codigo, correlativas, nombre, anio, cuatrimestre } = materia;

    // 3. Obtenemos la configuración según el estado, con un fallback (por seguridad)
    const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG.Bloqueado;

    // 4. Renombramos la función usando convenciones estándar de React (handleAction)
    const handlePress = () => {
        if (modo) {
            actualizarEstados(codigo, correlativas);
        } else {
            abrirInfo(materia);
        }
    };

    return (
        // 5. Eliminamos el <div className=''> innecesario que envolvía a la Card
        <Card
            isPressable
            onPress={handlePress}
            className={`w-full hover border-3 transition-colors duration-300 hover:font-bold font-medium ${config.estilo}`}
        >
            <CardHeader className="flex justify-between">
                <Chip color={config.color} variant="flat">
                    <i className={config.icono} />
                </Chip>
                <Chip color={config.color} variant="flat">
                    <span className="font-bold">{estado}</span>
                </Chip>
            </CardHeader>

            <CardBody>
                <div>{codigo}</div>
                {/* Agregamos el atributo "title" para que el usuario pueda leer el nombre completo al pasar el mouse si se trunca */}
                <div className="truncate" title={nombre}>
                    {nombre}
                </div>
            </CardBody>

            <CardFooter>
                {anio}° Año • C{Number(cuatrimestre)}
            </CardFooter>
        </Card>
    );
}

export default MateriaCard;