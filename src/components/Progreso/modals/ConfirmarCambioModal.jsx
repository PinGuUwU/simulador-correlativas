import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import React, { useState, useEffect } from 'react'

function ConfirmarCambioModal({ onClose, isOpen, onOpenChange, setConfirmacion, setMostrar, targetState }) {
    const [isSelected, setIsSelected] = useState(false)

    // Resetear el checkbox cuando se abre
    useEffect(() => {
        if (isOpen) setIsSelected(false)
    }, [isOpen])

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

    const getWarningText = () => {
        if (targetState === "Regular") {
            return "Se regularizarán automáticamente todas las dependencias y correlativas necesarias para esta materia. ¿Quieres confirmar?"
        } else if (targetState === "Aprobado" || targetState === "Promocionado") {
            return "Esto marcará opcionalmente como aprobadas todas las materias previas requeridas por correlatividad. ¿Quieres confirmar?"
        }
        return "Estás a punto de modificar el estado de una materia de forma que afectará sus correlativas. ¿Quieres confirmar?"
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            backdrop="opaque"
            classNames={{
                backdrop: "bg-black/50"
            }}
        >
            <ModalContent>
                {(onClose) => {
                    return (
                        <>
                            <ModalHeader>
                                Cuidado
                            </ModalHeader>
                            <ModalBody>
                                <p>{getWarningText()}</p>
                                <Checkbox
                                    isSelected={isSelected} onValueChange={setIsSelected}>No volver a mostrar este aviso</Checkbox>
                            </ModalBody>
                            <ModalFooter>
                                <Button onPress={() => handleCancel()}>Cancelar</Button>
                                <Button color="warning" className="font-bold" onPress={() => handleConfirmacion()}>Confirmar</Button>
                            </ModalFooter>
                        </>
                    )
                }}
            </ModalContent>
        </Modal >
    )
}

export default ConfirmarCambioModal