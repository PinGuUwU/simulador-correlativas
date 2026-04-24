import React from 'react';
import { 
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter, 
    Button,
    Card,
    CardBody
} from '@heroui/react';
import { trackSeleccionCarrera } from '../../../services/analyticsService';

export default function PlanSelectionModal({ isOpen, onSelect }) {
    const handleSelect = (plan) => {
        onSelect(plan);
        trackSeleccionCarrera({ plan, origen: 'welcome_modal' });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            hideCloseButton 
            isDismissable={false}
            backdrop="opaque"
            placement="center"
            size="2xl"
            className="m-4"
            classNames={{
                backdrop: "bg-black/50"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fa-solid fa-graduation-cap text-primary text-3xl" />
                    </div>
                    <h2 className="text-2xl font-black text-center">¡Bienvenido al Simulador!</h2>
                    <p className="text-sm font-normal text-foreground/60 text-center px-4">
                        Para comenzar, necesitamos saber qué plan de estudios estás cursando.
                    </p>
                </ModalHeader>
                <ModalBody className="pb-8 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Card 
                            isPressable 
                            className="border-2 border-transparent hover:border-primary transition-all shadow-sm"
                            onPress={() => handleSelect('17.14')}
                        >
                            <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="p-3 rounded-xl bg-default-100">
                                    <span className="font-black text-xl">17.14</span>
                                </div>
                                <div>
                                    <p className="font-bold">Plan Nuevo</p>
                                    <p className="text-xs text-foreground/50 leading-relaxed">
                                        Recomendado para ingresantes recientes y quienes migraron al nuevo diseño curricular.
                                    </p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card 
                            isPressable 
                            className="border-2 border-transparent hover:border-primary transition-all shadow-sm"
                            onPress={() => handleSelect('17.13')}
                        >
                            <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="p-3 rounded-xl bg-default-100">
                                    <span className="font-black text-xl">17.13</span>
                                </div>
                                <div>
                                    <p className="font-bold">Plan Anterior</p>
                                    <p className="text-xs text-foreground/50 leading-relaxed">
                                        Plan de estudios histórico para estudiantes que mantienen su regularidad en el diseño anterior.
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    
                    <div className="mt-8 p-4 bg-default-50 rounded-2xl border border-default-200 flex items-start gap-3">
                        <i className="fa-solid fa-circle-info text-primary mt-1" />
                        <p className="text-xs text-foreground/70 leading-relaxed">
                            <span className="font-bold block mb-1 text-foreground">¿No estás seguro?</span>
                            No te preocupes, podés cambiar tu plan en cualquier momento desde la sección de 
                            <span className="font-bold text-primary"> Configuración</span> en el menú lateral.
                        </p>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
