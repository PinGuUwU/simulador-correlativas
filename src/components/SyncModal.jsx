import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useAuth } from "../context/AuthContext";

export default function SyncModal() {
    const { showSyncModal, resolveSync } = useAuth();

    return (
        <Modal isOpen={showSyncModal} backdrop="blur" hideCloseButton isDismissable={false}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-primary font-bold">
                    <div className="flex items-center gap-2 text-xl">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        ¡Datos Encontrados!
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p className="text-foreground/80 leading-relaxed">
                        Hemos detectado que tenés progreso guardado localmente en este dispositivo, 
                        pero también tenés datos respaldados permanentemente en tu cuenta de la nube.
                    </p>
                    <p className="font-bold text-foreground mt-2">
                        ¿Qué acción deseás realizar para conciliar la información?
                    </p>
                </ModalBody>
                <ModalFooter className="flex-col gap-3 sm:flex-row sm:justify-end border-t border-divider">
                    <Button 
                        color="default" 
                        variant="solid" 
                        onPress={() => resolveSync('download')}
                        className="w-full sm:w-auto font-medium"
                        startContent={<i className="fa-solid fa-cloud-arrow-down"></i>}
                    >
                        Descargar de la Nube (Sobrescribir Local)
                    </Button>
                    <Button 
                        color="primary" 
                        variant="solid"
                        onPress={() => resolveSync('upload')}
                        className="w-full sm:w-auto font-bold"
                        startContent={<i className="fa-solid fa-cloud-arrow-up"></i>}
                    >
                        Subir Datos Locales a la Nube
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
