import { Button, addToast } from '@heroui/react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ContactForm from '../components/Shared/ContactForm'

function Inicio() {
    const navigate = useNavigate()

    const buttonItems = [
        { name: 'Ver mi progreso', icon: 'fa-graduation-cap', path: '/progreso', isDeactivated: false, color: 'primary' },
        { name: 'Simulador de Avance', icon: 'fa-route', path: '/simulador', isDeactivated: false, color: 'secondary' },
        { name: 'Consultar Equivalencias', icon: 'fa-right-left', path: '/equivalencias', isDeactivated: false, color: 'success' },
    ]

    const infoItems = [
        {
            title: "Adiós al Laberinto Académico",
            description: 'Una interfaz gráfica dinámica reemplaza los PDFs estáticos, mostrando el impacto instantáneo de escenarios "What-If" en futuros semestres. Navega tu plan de estudios de forma visual e intuitiva.',
            icon: "fa-solid fa-sitemap text-primary",
            color: "bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40"
        },
        {
            title: "Automatización de Correlativas",
            description: "Un motor inteligente gestiona automáticamente la cadena compleja de requisitos previos con actualizaciones en cascada. Olvídate de verificar manualmente cada correlatividad.",
            icon: "fa-solid fa-gears text-success",
            color: "bg-success/5 hover:bg-success/10 border-success/20 hover:border-success/40"
        },
        {
            title: "Persistencia sin Logins",
            description: "Experiencia de usuario rápida usando el almacenamiento local del navegador. Tu progreso se mantiene guardado incluso si cierras la pestaña, sin necesidad de cuentas complejas.",
            icon: "fa-solid fa-floppy-disk text-warning",
            color: "bg-warning/5 hover:bg-warning/10 border-warning/20 hover:border-warning/40"
        }
    ]

    const handleClick = (item) => {
        if (item.isDeactivated) {
            addToast({ title: "En progreso", description: "Esta página aún no está disponible", color: "warning" })
        } else {
            navigate(item.path)
        }
    }

    return (
        <div className="flex flex-col gap-12 md:gap-24 py-8 md:py-16 px-4 md:px-12 max-w-7xl mx-auto animate-in fade-in duration-500 overflow-hidden">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center gap-6 md:gap-8 mt-6 md:mt-10 relative">
                {/* Decorative background blob */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground tracking-tight max-w-5xl leading-[1.1] md:leading-tight relative z-10">
                    Planificá tu carrera en Sistemas <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary bg-300% animate-gradient px-1">
                        sin errores ni sorpresas
                    </span>
                </h1>
                <p className="text-lg md:text-2xl text-foreground/70 max-w-2xl leading-relaxed relative z-10 px-2">
                    Visualizá tu progreso, simula correlatividades automáticamente y tomá decisiones informadas sobre tu futuro académico.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mt-6 w-full relative z-10">
                    {buttonItems.map((item, index) => (
                        <Button
                            key={index}
                            color={item.isDeactivated ? "default" : item.color}
                            variant={item.isDeactivated ? "flat" : "shadow"}
                            size="lg"
                            className={`font-bold rounded-full px-8 shadow-md ${item.isDeactivated ? "opacity-60" : "hover:scale-105 transition-transform"}`}
                            onPress={() => handleClick(item)}
                            startContent={<i className={`fa-solid ${item.icon}`}></i>}
                        >
                            {item.name}
                        </Button>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="flex flex-col gap-12 w-full">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        ¿Cómo te ayuda esta herramienta?
                    </h2>
                    <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
                        Resolvemos los problemas más comunes que enfrentan los estudiantes al planificar su carrera universitaria.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {infoItems.map((item, index) => (
                        <Card
                            key={index}
                            className={`bg-background/70 backdrop-blur-sm shadow-sm border border-default-200/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-xl group ${item.color}`}
                        >
                            <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 px-4 xl:px-6 pt-8">
                                <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-background/80 shadow-sm shadow-default-200 border border-default-200/60 group-hover:scale-110 transition-transform duration-300">
                                    <i className={`${item.icon} text-2xl`}></i>
                                </div>
                                <h3 className="text-lg xl:text-xl font-bold text-foreground leading-tight">
                                    {item.title}
                                </h3>
                            </CardHeader>
                            <CardBody className="px-6 pb-8 pt-2 text-default-500 font-medium leading-relaxed">
                                {item.description}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Promo CODES Section */}
            <section className="flex flex-col items-center gap-6 mb-0 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 max-w-4xl w-full shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/30 transition-colors" />
                    <div className="shrink-0 bg-white p-3 rounded-2xl shadow-sm border border-default-200 z-10 transform group-hover:scale-105 transition-transform duration-500">
                        <img src="/imgs/logo-codes.png" alt="Logo CODES" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2 z-10">
                        <h3 className="text-2xl font-bold text-foreground">Centro de Estudiantes (CODES)</h3>
                        <p className="text-foreground/80 text-md max-w-xl font-medium">
                            ¿Tenés dudas sobre correlativas, inscripciones o trámites? ¡Acercate al CODES! El centro de estudiantes de Sistemas está para ayudarte y guiarte en tu camino universitario.
                        </p>
                    </div>
                    <div className="z-10 shrink-0">
                        <Button
                            as="a"
                            href="https://www.codesunlu.tech/"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            variant="shadow"
                            className="font-bold rounded-full px-8 h-12 shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                            endContent={<i className="fa-solid fa-arrow-up-right-from-square text-xs ml-1" />}
                        >
                            Visitar Página
                        </Button>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="flex flex-col items-center gap-10 mb-10 w-full">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        ¿Dudas, sugerencias o problemas?
                    </h2>
                    <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
                        Ayudanos a mejorar la herramienta o reportá un error enviando un mensaje directo.
                    </p>
                </div>

                <ContactForm />
            </section>
        </div>
    )
}

export default Inicio