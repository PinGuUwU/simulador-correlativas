import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react"

function MateriaCard({ materia, estado, actualizarEstados }) {
    //El estado de parámetro lo uso únicamente para inicializar el estadoLocal de cada tarjeta

    const actualizar = () => {
        actualizarEstados(materia.codigo, materia.correlativas)
    }

    const estilosSegunEstado = {
        'Bloqueado': 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-400',
        'Disponible': 'bg-blue-100 border-blue-300 hover:bg-blue-200 hover:border-blue-400',
        'Regular': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-400',
        'Aprobado': 'bg-green-100 border-green-500 hover:bg-green-200 hover:border-green-400'
    }

    const estilo = estilosSegunEstado[estado]

    return (
        <div className=''>
            <Card className={`flex  h-35 w-55 hover border-6 transition-colors duration-300 ${estilo} hover:font-bold font-medium`}
                isPressable
                onPress={() => { actualizar() }}
            >
                <CardHeader className='justify-center'>{materia.codigo}</CardHeader>
                <CardBody className='text-center grow overflow-hidden'>{materia.nombre}</CardBody>
                <CardFooter className='justify-center'>{estado}</CardFooter>
            </Card>
        </div>
    )
}


export default MateriaCard