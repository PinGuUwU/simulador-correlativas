import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, addToast } from '@heroui/react'

/**
 * Modal de confirmación para sobrescribir una simulación guardada.
 */
function GuardarSimulacion({ isOpen, onOpenChange, onClose, plan, historialSemestres, progresoSimulado, progresoBase, anioActual, cuatri, simulacionTerminada }) {
    const handleSobrescribir = () => {
        localStorage.setItem(`simulacion+${plan}`, JSON.stringify({
            historialSemestres, progresoSimulado, progresoBase, anioActual, cuatri, simulacionTerminada
        }))
        try { addToast({ title: 'Éxito', description: 'Simulación sobrescrita exitosamente.', color: 'success' }) } catch (_) { }
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onModalClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Sobrescribir Simulación</ModalHeader>
                        <ModalBody>
                            <p className="text-foreground/80">
                                Ya tienes una simulación guardada para este plan. Si guardas ahora, tu simulación anterior será reemplazada permanentemente. ¿Deseas continuar?
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onModalClose}>
                                Cancelar
                            </Button>
                            <Button color="primary" onPress={handleSobrescribir}>
                                Sobrescribir
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default GuardarSimulacion
