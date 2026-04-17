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
        <Card className="w-full max-w-xl shadow-xl border border-default-200/60 bg-background/70 backdrop-blur-xl">
            <CardBody className="p-8 md:p-10">
                <Form
                    ref={form}
                    onSubmit={onSubmit}
                    className="flex flex-col gap-6 w-full"
                    validationBehavior="native"
                >
                    <div className="w-full">
                        <Input
                            isRequired
                            name="user_name"
                            label="Nombre"
                            placeholder="Tu nombre completo"
                            labelPlacement="outside"
                            variant="faded"
                            radius="lg"
                            classNames={{ label: "font-semibold mb-1" }}
                            startContent={<i className="fa-solid fa-user text-foreground/60"></i>}
                        />
                    </div>

                    <div className="w-full">
                        <Input
                            isRequired
                            name="user_email"
                            type="email"
                            label="Email"
                            placeholder="tu@email.com"
                            labelPlacement="outside"
                            variant="faded"
                            radius="lg"
                            classNames={{ label: "font-semibold mb-1" }}
                            errorMessage="Por favor, ingresa un correo electrónico válido."
                            startContent={<i className="fa-solid fa-envelope text-foreground/60"></i>}
                        />
                    </div>

                    <div className="w-full">
                        <Textarea
                            isRequired
                            name="message"
                            label="Mensaje"
                            placeholder="Escribe tu mensaje o reporte de error detallado aquí..."
                            labelPlacement="outside"
                            variant="faded"
                            radius="lg"
                            minRows={5}
                            classNames={{ label: "font-semibold mb-1" }}
                        />
                    </div>

                    <div className="w-full pt-2 text-center">
                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full font-bold shadow-lg shadow-primary/40 text-md"
                            endContent={!isLoading && <i className="fa-solid fa-paper-plane ml-2"></i>}
                        >
                            {isLoading ? "Enviando..." : "Enviar mensaje"}
                        </Button>

                        {/* Mensaje de éxito */}
                        <div className={`min-h-[24px] mt-4 transition-opacity duration-300 ${action ? 'opacity-100' : 'opacity-0'}`}>
                            {action && (
                                <div className="text-success-600 flex items-center justify-center gap-2 font-bold text-sm bg-success-50 py-2 px-4 rounded-xl border border-success-200">
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
