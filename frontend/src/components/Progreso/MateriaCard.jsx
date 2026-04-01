import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react"
import estadoUtils from "../../utils/Progreso/estadoUtils";


function MateriaCard({ materia, estado, actualizarEstados, modo, abrirInfo, vista = 'grid' }) {
    if (!estado) return <p>Cargando Materia...</p>
    // 2. Desestructuramos las propiedades de "materia" para un código más limpio en el JSX
    const { codigo, correlativas, nombre, anio, cuatrimestre, horas_totales, horas_semanales } = materia;

    // 3. Obtenemos la configuración según el estado, con un fallback (por seguridad)
    const config = estadoUtils.ESTADO_CONFIG[estado];

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
            className={`w-full hover border-3 transition-colors duration-300 hover:font-bold font-medium ${config.estilo} ${vista === 'list' ? 'flex-row items-center justify-between p-2 h-auto' : ''}`}
        >
            <CardHeader className={`flex justify-between shrink-0 ${vista === 'list' ? 'w-auto gap-4 p-2' : ''}`}>
                <Chip color={config.color} variant="flat">
                    <i className={config.icono} />
                </Chip>
                <Chip color={config.color} variant="flat">
                    <span className="font-bold">{estado}</span>
                </Chip>
            </CardHeader>

            <CardBody className={`${vista === 'list' ? 'flex-row items-center flex-1 justify-between p-2 overflow-hidden gap-4' : ''}`}>
                <div className={`text-foreground font-extrabold ${vista === 'list' ? 'w-16 shrink-0' : ''}`}>{codigo}</div>
                {/* Agregamos el atributo "title" para que el usuario pueda leer el nombre completo al pasar el mouse si se trunca */}
                <div className={`truncate text-foreground font-black tracking-tight ${vista === 'list' ? 'flex-1 pr-4' : ''}`} title={nombre}>
                    {nombre}
                </div>
                <div className={`gap-2 flex flex-col ${vista === 'list' ? 'shrink-0' : ''}`}>
                    <Chip color={config.color} variant="dot">
                        Horas semanales: {horas_semanales}
                    </Chip>
                    <Chip color={config.color} variant="dot">
                        Horas totales: {horas_totales}
                    </Chip>
                </div>
            </CardBody>

            <CardFooter className={`shrink-0 ${vista === 'list' ? 'w-auto p-2 justify-end' : ''}`}>
                <span className={`text-foreground font-bold ${vista === 'list' ? 'text-xs' : 'text-sm'}`}>
                    {anio}° Año • C{Number(cuatrimestre)}
                </span>
            </CardFooter>
        </Card>
    );
}

export default MateriaCard;