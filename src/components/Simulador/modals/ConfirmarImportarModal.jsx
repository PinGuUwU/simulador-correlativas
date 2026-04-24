import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import React from 'react'

function ConfirmarImportarModal({ isOpen, onOpenChange, onConfirm }) {
    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            backdrop="blur"
            placement="center"
            className="mx-4"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-secondary">
                                <i className="fa-solid fa-cloud-arrow-down" />
                                <h3 className="text-xl font-bold">Importar Progreso Real</h3>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <p className="text-foreground/80">
                                    Se reconstruirá tu historial basándonos en tus fechas de aprobación y regularización registradas en la sección de progreso.
                                </p>
                                <div className="bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/30 p-3 rounded-xl flex gap-3">
                                    <i className="fa-solid fa-triangle-exclamation text-warning-500 mt-1" />
                                    <p className="text-xs text-warning-800 dark:text-warning-300 font-medium">
                                        Ten en cuenta que esta es una <strong>aproximación</strong> y puede no ser 100% idéntica a tu realidad académica.
                                    </p>
                                </div>
                                <p className="text-sm text-foreground/60 italic">
                                    ¿Deseas continuar con la importación? Esto reemplazará cualquier simulación actual.
                                </p>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose} className="font-bold">
                                Cancelar
                            </Button>
                            <Button color="secondary" onPress={() => { onConfirm(); onClose(); }} className="font-bold shadow-lg shadow-secondary/20">
                                Sí, Importar Avance
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default ConfirmarImportarModal
