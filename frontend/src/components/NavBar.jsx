import React, { useState } from 'react'
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from '@heroui/react';

function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const usuario = true

    const menuItems = [
        "Correlativas",
        "Equivalencias",
        "ChatBot",
        "Configuración",
        "Iniciar Sesión",
        "Registrarse",
    ]
    return (
        <div>
            {/* TODO acá sería la barra lateral izquierda, menu hamburguesa, para quienes hayan iniciado sesión y los queno(?) */}
            <Navbar onMenuOpenChange={setIsMenuOpen}>
                {/* Menu hamburguesa */}
                <NavbarContent>
                    <NavbarMenuToggle
                        aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
                        className='sm:hidden'
                    />
                    <NavbarBrand>
                        {/* Acá iría un logo si quisiera poner uno */}
                    </NavbarBrand>
                </NavbarContent>

                {/* Items del navbar */}
                {/* correlativas -> config de usuario -> equivalencias -> chatbot -> contacto */}
                <NavbarContent className='hidden sm:flex gap-4' justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="#">
                            Correlativas
                        </Link>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent className='hidden sm:flex gap-4' justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="#">
                            Equivalencias
                        </Link>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent className='hidden sm:flex gap-4' justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="#">
                            ChatBot
                        </Link>
                    </NavbarItem>
                </NavbarContent>
                {usuario &&
                    <NavbarContent className='hidden sm:flex gap-4' justify="center">
                        <NavbarItem>
                            <Link color="foreground" href="#">
                                Configuración
                            </Link>
                        </NavbarItem>
                    </NavbarContent>
                }
                {!usuario &&
                    <NavbarContent className='hidden sm:flex gap-4' justify="center">
                        <NavbarItem>
                            <Link color="foreground" href="#">
                                Iniciar Sesión
                            </Link>
                        </NavbarItem>
                    </NavbarContent>
                    &&
                    <NavbarContent className='hidden sm:flex gap-4' justify="center">
                        <NavbarItem>
                            <Link color="foreground" href="#">
                                Registrarse
                            </Link>
                        </NavbarItem>
                    </NavbarContent>
                }
                {/* barras de menu */}
                <NavbarMenu>
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={index}>
                            <Link
                                className='w-full'
                                color={index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"}
                                href="#"
                                size="lg"
                            >
                                {item}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
        </div>
    )
}

export default NavBar