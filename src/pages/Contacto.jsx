import React from 'react';
import ContactForm from '../components/Shared/ContactForm';

const Contacto = () => {
    return (
        <div className="flex flex-col items-center gap-10 py-16 px-6 md:px-12 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-[calc(100vh-80px)]">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                    Contacto y Reporte de Errores
                </h1>
                <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
                    ¿Encontraste un error en las correlativas? ¿Tenés alguna sugerencia? 
                    Envianos un mensaje y lo revisaremos lo antes posible.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ContactForm />
            </div>
        </div>
    );
};

export default Contacto;
