import React, { useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox
} from '@heroui/react';

export default function ConsejoAvanzadosModal({ isOpen, onClose }) {
    const [noMostrarMas, setNoMostrarMas] = useState(false);

    const handleAceptar = () => {
        if (noMostrarMas) {
            localStorage.setItem('ocultar_consejo_avanzados', 'true');
        }
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onClose}
            backdrop="opaque"
            placement="center"
            classNames={{
                backdrop: "bg-black/50"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fa-solid fa-wand-magic-sparkles text-primary text-3xl" />
                    </div>
                    <h2 className="text-xl font-black text-center">¡Tip para avanzados!</h2>
                </ModalHeader>
                <ModalBody className="text-center px-6">
                    <p className="text-foreground/80 leading-relaxed">
                        Si ya estás muy avanzado en la carrera, no hace falta marcar una por una. 
                    </p>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl mt-2">
                        <p className="text-sm font-medium text-primary-700">
                            "Marcá únicamente tus <strong>últimas materias</strong> aprobadas, regulares o promocionadas y el sistema actualizará todas sus correlativas en cascada automáticamente."
                        </p>
                    </div>
                </ModalBody>
                <ModalFooter className="flex flex-col gap-4 pb-8">
                    <Checkbox 
                        isSelected={noMostrarMas} 
                        onValueChange={setNoMostrarMas}
                        size="sm"
                        classNames={{ label: "text-xs text-foreground/60" }}
                    >
                        No volver a mostrar este aviso
                    </Checkbox>
                    <Button 
                        color="primary" 
                        className="w-full font-bold h-12" 
                        onPress={handleAceptar}
                    >
                        Entendido, ¡gracias!
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
