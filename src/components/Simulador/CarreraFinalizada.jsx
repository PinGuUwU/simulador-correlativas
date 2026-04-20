import React from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { addToast } from '@heroui/react'

/**
 * Pantalla de carrera finalizada: muestra el año de egreso estimado
 * y permite guardar o descargar el PDF del historial.
 */
function CarreraFinalizada({ anioActual, plan, historialSemestres, progresoSimulado, progresoBase, cuatri, simulacionTerminada, onGuardarOpen, handleDownloadPDF, descargandoPDF }) {
    const handleGuardar = () => {
        const existe = localStorage.getItem(`simulacion+${plan}`)
        if (existe) {
            onGuardarOpen()
        } else {
            localStorage.setItem(`simulacion+${plan}`, JSON.stringify({
                historialSemestres, progresoSimulado, progresoBase, anioActual, cuatri, simulacionTerminada
            }))
            try { addToast({ title: 'Éxito', description: 'Simulación guardada', color: 'success' }) } catch (_) { }
        }
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full mt-4">
            <Card className="bg-linear-to-r from-success to-emerald-500 text-white shadow-lg border-none rounded-2xl w-full">
                <CardBody className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-2 sm:space-y-4">
                    <div className="bg-white/20 p-4 sm:p-5 rounded-full backdrop-blur-md">
                        <i className="fa-solid fa-graduation-cap text-4xl sm:text-5xl" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">¡Carrera Finalizada!</h2>
                    <p className="text-white/90 text-xs sm:text-sm max-w-sm">
                        Has completado todas las materias.<br />
                        Según esta simulación, <strong>te egresarías en el año {anioActual}</strong>.
                    </p>
                </CardBody>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <Button
                    color="primary"
                    variant="shadow"
                    size="lg"
                    className="font-bold rounded-xl text-white w-full sm:w-auto flex items-center gap-2"
                    onPress={handleGuardar}
                >
                    <i className="fa-solid fa-floppy-disk" />
                    Guardar Simulación
                </Button>
                <Button
                    color="success"
                    variant="flat"
                    size="lg"
                    className="font-bold rounded-xl w-full sm:w-auto flex items-center gap-2"
                    onPress={handleDownloadPDF}
                    isLoading={descargandoPDF}
                >
                    {!descargandoPDF && <i className="fa-solid fa-file-pdf" />}
                    {descargandoPDF ? "Generando PDF..." : "Descargar en PDF"}
                </Button>
            </div>
        </div>
    )
}

export default CarreraFinalizada
