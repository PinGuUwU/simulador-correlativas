import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';

function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Muestra el botón cuando el scroll baja más de 300px
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // Si estás a menos de 300px desde arriba, no se renderiza (esconde)
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <Button 
                isIconOnly 
                color="primary" 
                variant="shadow" 
                size="lg" 
                className="rounded-full shadow-xl w-14 h-14"
                onPress={scrollToTop}
                aria-label="Ir arriba"
                data-html2canvas-ignore // Muy importante para que no salga bugueado en el PDF
            >
                <i className="fa-solid fa-arrow-up text-xl"></i>
            </Button>
        </div>
    );
}

export default ScrollToTop;
