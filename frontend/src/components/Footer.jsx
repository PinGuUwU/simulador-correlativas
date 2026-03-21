import { Card, CardBody, CardFooter } from '@heroui/card'
import { Chip, Button, Link } from '@heroui/react'
import React from 'react'

function Footer() {
    return (
        <footer className="w-full pb-8 pt-12 px-4 md:px-8 mt-auto">
            <Card className="max-w-2xl mx-auto shadow-sm hover:shadow-md transition-shadow duration-300 border-small border-default-200 bg-background/50 backdrop-blur-lg">
                <CardBody className='flex flex-col md:flex-row items-center justify-center gap-8 p-8'>
                    {/* Contenedor de Imagen con Efecto Reflejo/Aura */}
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-[50%] scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img 
                            src='\imgs\Priscila Redondo.jpeg' 
                            className='w-28 h-40 object-cover rounded-[50%] shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2 relative z-10 border-3 border-default-100' 
                            alt='Priscila Redondo' 
                        />
                    </div>
                    
                    {/* Información del Creador */}
                    <div className='flex flex-col items-center md:items-start gap-3 w-full'>
                        <Chip variant="flat" color="primary" size="sm" className="font-bold tracking-widest uppercase">
                            Desarrollado por
                        </Chip>
                        <h3 className="text-3xl font-black text-foreground drop-shadow-sm tracking-tight text-center md:text-left">
                            Priscila Redondo
                        </h3>
                        <p className="text-foreground/80 text-sm font-medium text-center md:text-left leading-relaxed">
                            Licenciatura en Sistemas de Información. <br className="hidden md:block"/>
                            Apasionada por crear interfaces digitales estéticas, funcionales y que aporten valor real.
                        </p>
                    </div>
                </CardBody>
                
                {/* Panel de Redes Sociales y Enlaces */}
                <CardFooter className="flex flex-wrap justify-center items-center gap-3 py-6 border-t border-default-100/60 bg-default-50/30">
                    <span className="text-default-600 font-bold text-xs uppercase tracking-wider mr-2 w-full sm:w-auto text-center mb-2 sm:mb-0">
                        Contáctame:
                    </span>
                    
                    <Button 
                        as={Link} 
                        href="https://priscila-redondo.netlify.app/" 
                        target="_blank"
                        isExternal
                        variant="flat" 
                        color="secondary" 
                        radius="full"
                        size="sm"
                        className="font-bold shadow-sm"
                        startContent={<i className="fa-solid fa-globe"></i>}
                    >
                        Portfolio
                    </Button>

                    <Button 
                        as={Link} 
                        href="https://www.linkedin.com/in/priscila-redondo/" 
                        target="_blank"
                        isExternal
                        variant="flat" 
                        color="primary" 
                        radius="full"
                        size="sm"
                        className="font-bold shadow-sm"
                        startContent={<i className="fa-brands fa-linkedin text-lg"></i>}
                    >
                        LinkedIn
                    </Button>

                    <Button 
                        as={Link} 
                        href="mailto:prisredondo29@gmail.com" 
                        variant="flat" 
                        color="warning" 
                        radius="full"
                        size="sm"
                        className="font-bold text-warning-700 shadow-sm"
                        startContent={<i className="fa-solid fa-envelope"></i>}
                    >
                        Email
                    </Button>
                </CardFooter>
            </Card>
        </footer>
    )
}

export default Footer