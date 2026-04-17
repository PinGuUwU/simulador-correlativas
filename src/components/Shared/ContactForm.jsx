import React, { useState, useRef } from 'react';
import { Button, Input, Textarea, Form, addToast, Card, CardBody } from '@heroui/react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
    const [action, setAction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const form = useRef();

    const onSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Recolectar información de diagnóstico
        const diagnostics = {
            browser: navigator.userAgent,
            platform: navigator.platform,
            resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        // Clonar los datos del formulario para modificar el mensaje sin afectar la UI
        const formData = new FormData(form.current);
        const originalMessage = formData.get('message');
        
        const diagnosticString = `
\n\n--- Información de Diagnóstico ---
• Browser: ${diagnostics.browser}
• Plataforma: ${diagnostics.platform}
• Resolución: ${diagnostics.resolution}
• Idioma: ${diagnostics.language}
• URL: ${diagnostics.url}
• Fecha: ${diagnostics.timestamp}
----------------------------------`;

        // EmailJS sendForm usa el elemento real, por lo que para adjuntar info extra
        // sin que el usuario la vea en el campo de texto, podemos usar send()
        // enviando un objeto con los nombres de las variables del template.
        
        const templateParams = {
            user_name: formData.get('user_name'),
            user_email: formData.get('user_email'),
            message: originalMessage + diagnosticString
        };

        emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID || import.meta.env.EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID || import.meta.env.EMAILJS_TEMPLATE_ID,
            templateParams,
            { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || import.meta.env.EMAILJS_PUBLIC_KEY }
        )
            .then(
                () => {
                    setAction("¡Mensaje enviado con éxito!");
                    form.current.reset();
                    setTimeout(() => setAction(null), 3000);
                },
                (error) => {
                    console.error('EmailJS Error:', error);
                    addToast({ 
                        title: "Error", 
                        description: "Hubo un problema al enviar el mensaje. Inténtalo de nuevo más tarde.", 
                        color: "danger" 
                    });
                }
            )
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Card className="w-full max-w-xl shadow-2xl border border-default-200/60 bg-background/70 backdrop-blur-xl mx-auto">
            <CardBody className="p-5 sm:p-8 md:p-10">
                <Form
                    ref={form}
                    onSubmit={onSubmit}
                    className="flex flex-col gap-6 w-full"
                    validationBehavior="native"
                >
                    <Input
                        isRequired
                        name="user_name"
                        label="Nombre"
                        placeholder="Tu nombre completo"
                        labelPlacement="outside"
                        variant="faded"
                        radius="lg"
                        size="lg"
                        classNames={{ label: "font-semibold mb-1" }}
                        startContent={<i className="fa-solid fa-user text-foreground/60 mr-1"></i>}
                    />

                    <Input
                        isRequired
                        name="user_email"
                        type="email"
                        label="Email"
                        placeholder="tu@email.com"
                        labelPlacement="outside"
                        variant="faded"
                        radius="lg"
                        size="lg"
                        classNames={{ label: "font-semibold mb-1" }}
                        errorMessage="Por favor, ingresa un correo electrónico válido."
                        startContent={<i className="fa-solid fa-envelope text-foreground/60 mr-1"></i>}
                    />

                    <Textarea
                        isRequired
                        name="message"
                        label="Mensaje"
                        placeholder="Escribe tu mensaje o reporte de error detallado aquí..."
                        labelPlacement="outside"
                        variant="faded"
                        radius="lg"
                        size="lg"
                        minRows={4}
                        classNames={{ label: "font-semibold mb-1" }}
                    />

                    <div className="w-full pt-2 flex flex-col gap-4">
                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full font-bold shadow-lg shadow-primary/40 h-14"
                            endContent={!isLoading && <i className="fa-solid fa-paper-plane ml-2"></i>}
                        >
                            {isLoading ? "Enviando..." : "Enviar mensaje"}
                        </Button>

                        {/* Mensaje de éxito/feedback */}
                        <div className={`transition-all duration-300 ${action ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
                            {action && (
                                <div className="text-success-700 flex items-center justify-center gap-2 font-bold text-sm bg-success/10 py-3 px-4 rounded-xl border border-success/20 animate-in zoom-in duration-300">
                                    <i className="fa-solid fa-circle-check"></i>
                                    {action}
                                </div>
                            )}
                        </div>
                    </div>
                </Form>
            </CardBody>
        </Card>
    );
};

export default ContactForm;
