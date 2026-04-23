import React, { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react';
import { getProgresoSteps } from './tutorialSteps';
import { trackTutorial } from '../../services/analyticsService';

// ============================================================
//  TutorialTour — Tour guiado para la página /progreso
// ============================================================

export default function TutorialTour({ onComplete, onCancel }) {
    const [tutorialSteps] = useState(() => getProgresoSteps());
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Track inicio del tutorial
        trackTutorial({ action: 'start' });
    }, []);

    const step = tutorialSteps[currentStepIndex];

    // Trackear vista de cada paso
    useEffect(() => {
        if (step) {
            trackTutorial({
                action: 'step_view',
                stepIndex: currentStepIndex + 1,
                stepTitle: step.title
            });
        }
    }, [currentStepIndex, step]);

    // Obtiene el rect del elemento objetivo y lo actualiza reactivamente
    const updateRect = useCallback(() => {
        if (!step) return;
        const el = document.getElementById(step.targetId);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        } else {
            setTargetRect(null);
        }
    }, [step]);

    // Cada vez que cambia el paso: scroll hacia el elemento y actualizar rect
    useEffect(() => {
        if (!step) return;

        // Limpiamos el rect inmediatamente para que el anillo no se quede "flotando"
        // en la posición anterior mientras el scroll se desplaza al nuevo destino
        setTargetRect(null);

        // SCROLL: acumulamos offsetTop absoluto en el documento
        const getAbsoluteTop = (el) => {
            let y = 0;
            let current = el;
            while (current) { y += current.offsetTop; current = current.offsetParent; }
            return y;
        };

        // 1. Hacemos scroll suave al elemento objetivo
        const scrollTimeout = setTimeout(() => {
            const el = document.getElementById(step.targetId);
            if (el) {
                const margin = step.scrollMargin ?? 180;
                window.scrollTo({ top: getAbsoluteTop(el) - margin, behavior: 'smooth' });
            }
        }, 100);

        // 2. Esperamos a que el scroll termine (~600ms) antes de empezar a trackear
        //    Así el anillo aparece limpiamente en la posición correcta, sin "perseguir".
        const rectDelay = setTimeout(() => {
            updateRect();
        }, 600);

        // 3. Después de ese delay inicial, seguimos trackeando por si el DOM cambia
        const interval = setInterval(updateRect, 300);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        return () => {
            clearTimeout(scrollTimeout);
            clearTimeout(rectDelay);
            clearInterval(interval);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [step, updateRect]);

    // --- HANDLERS ---

    const handleNext = () => {
        if (currentStepIndex < tutorialSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            trackTutorial({ action: 'complete' });
            if (onComplete) onComplete();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
    };

    const handleCancel = () => {
        trackTutorial({ action: 'skip', stepIndex: currentStepIndex + 1 });
        if (onCancel) onCancel();
    };

    if (!isClient) return null;

    // ============================================================
    // VERSIÓN ESCRITORIO: tour completo si hay pasos disponibles
    // ============================================================
    if (!step) return null;

    // --- POSICIONAMIENTO DEL ANILLO ---
    const hasTarget = targetRect !== null;

    // targetOffset: desplazamiento VISUAL del anillo en px respecto al elemento detectado.
    // Configurar por paso en tutorialSteps.js: targetOffset: { x: 0, y: -20 }
    // Positivo Y = baja; negativo Y = sube. Igual para X (derecha/izquierda).
    const offsetX = step.targetOffset?.x ?? 0;
    const offsetY = step.targetOffset?.y ?? 0;

    const fixedTop = hasTarget ? targetRect.top + offsetY : window.innerHeight / 2 - 20;
    const fixedLeft = hasTarget ? targetRect.left + offsetX : window.innerWidth / 2 - 20;
    // Podés agrandar el anillo sumando px: targetRect.width + 8 y fixedLeft - 4
    const fixedWidth = hasTarget ? targetRect.width : 40;
    const fixedHeight = hasTarget ? targetRect.height : 40;

    return (
        <Popover
            isOpen={true}
            placement={step.placement || 'bottom'}
            offset={20}       // Separación en px entre el anillo y la flecha del Popover
            showArrow={true}  // Cambiá a false para ocultar la flechita
            shouldCloseOnBlur={false}
            isDismissable={false}
            classNames={{
                // "base" controla la flecha triangular del Popover
                base: 'before:bg-primary-500 before:shadow-xl',
                // "content" controla el cuadro del mensaje
                content: 'w-[340px] p-5 border-2 border-primary/50 shadow-2xl bg-default-50 z-[99999] rounded-2xl',
            }}
        >
            <PopoverTrigger>
                <div
                    style={{
                        position: 'fixed',
                        top: fixedTop,
                        left: fixedLeft,
                        width: fixedWidth,
                        height: fixedHeight,
                        pointerEvents: 'none',    // Click-through: no bloquea interacciones
                        zIndex: 9999,
                        borderRadius: '0.75rem',  // Redondeo del anillo
                        // ANILLO:
                        // 2px blanco = borde interior brillante
                        // 6px primary = anillo de color visible
                        // 9999px rgba oscuro = oscurece el resto de la pantalla (truco spotlight)
                        // Cambiá 0.65 por 0.5 para un fondo más claro, o 0.8 para más oscuro
                        boxShadow: hasTarget
                            ? '0 0 0 2px white, 0 0 0 6px var(--heroui-primary, #0070f3), 0 0 0 9999px rgba(0,0,0,0.65)'
                            : 'none',
                        transition: 'all 0.3s ease-in-out', // Animación al cambiar de paso
                    }}
                />
            </PopoverTrigger>

            <PopoverContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-primary">
                        <i className={`fa-solid ${step.icon || 'fa-flask'} text-2xl`}></i>
                        <h3 className="font-extrabold text-lg tracking-tight">{step.title}</h3>
                    </div>
                    <p className="text-foreground/80 text-[15px] leading-relaxed">
                        {step.content}
                    </p>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-default-200">
                        <span className="text-xs text-foreground/50 font-bold uppercase tracking-wider">
                            Paso {currentStepIndex + 1} de {tutorialSteps.length}
                        </span>
                        <div className="flex gap-2">
                            {currentStepIndex > 0 ? (
                                <Button size="sm" variant="light" color="default" className="font-medium" onPress={handleBack}>
                                    Atrás
                                </Button>
                            ) : (
                                <Button size="sm" variant="light" color="danger" className="font-medium" onPress={handleCancel}>
                                    Omitir
                                </Button>
                            )}
                            <Button size="sm" color="primary" variant="shadow" className="font-bold" onPress={handleNext}>
                                {currentStepIndex === tutorialSteps.length - 1 ? '¡Finalizar!' : 'Siguiente'}
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}


