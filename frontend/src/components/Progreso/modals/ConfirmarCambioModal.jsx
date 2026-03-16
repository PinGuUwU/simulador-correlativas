import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import React, { useState } from 'react'

function ConfirmarCambioModal({ onClose, isOpen, onOpenChange, setConfirmacion, setMostrar }) {
    const [isSelected, setIsSelected] = useState(false)

    const handleConfirmacion = () => {
        if (isSelected) {
            setMostrar(false)
        }
        setConfirmacion(true)
        onClose()
    }

    const handleCancel = () => {
        if (isSelected) {
            setMostrar(false)
        }
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => {
                    return (
                        <>
                            <ModalHeader>
                                Cuidado
                            </ModalHeader>
                            <ModalBody>
                                Estás a punto de modificar el estado de una materia que está bloqueada por correlativas ¿Quieres confirmar?
                                <Checkbox
                                    isSelected={isSelected} onValueChange={setIsSelected}>No volver a mostrar este aviso</Checkbox>
                            </ModalBody>
                            <ModalFooter>
                                <Button onPress={() => handleCancel()}>Cancelar</Button>
                                <Button onPress={() => handleConfirmacion()}>Confirmar</Button>
                            </ModalFooter>
                        </>
                    )
                }}
            </ModalContent>
        </Modal >
    )
}

export default ConfirmarCambioModal