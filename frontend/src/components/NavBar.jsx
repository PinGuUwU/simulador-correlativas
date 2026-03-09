import React, { useState } from 'react'

import '@awesome.me/webawesome/dist/styles/webawesome.css';

import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from '@heroui/react';

function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const usuario = false

    const menuItems = [
        "Correlativas",
        "Equivalencias",
        "ChatBot",
        "Configuración",
        "Iniciar Sesión",
        "Registrarse",
    ]

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen} isBordered maxWidth="xl">
            {/* 1. SECCIÓN IZQUIERDA: Forzamos que crezca igual que la derecha */}
            <NavbarContent justify="start" className="basis-0 flex-grow">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
                    className="sm:hidden"
                />
                <NavbarBrand>
                    <p className="font-bold text-inherit">UNLu</p>
                </NavbarBrand>
            </NavbarContent>

            {/* 2. SECCIÓN CENTRAL: Ahora sí estará en el centro absoluto */}
            <NavbarContent className="hidden sm:flex gap-8" justify="center">
                <NavbarItem>
                    <Link color="foreground" href="#" className="text-sm font-medium">Correlativas</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#" className="text-sm font-medium">Equivalencias</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#" className="text-sm font-medium">ChatBot</Link>
                </NavbarItem>
            </NavbarContent>

            {/* 3. SECCIÓN DERECHA: Forzamos que crezca igual que la izquierda */}
            <NavbarContent justify="end" className="basis-0 flex-grow gap-4">
                {!usuario ? (
                    <>
                        <NavbarItem className="hidden md:flex">
                            <Link href="#" color="foreground" className="text-sm font-medium">
                                Iniciar Sesión
                            </Link>
                        </NavbarItem>
                        <NavbarItem>
                            <Button
                                as={Link}
                                href="#"
                                color="primary"
                                variant="flat"
                                size="sm"
                                className="font-bold"
                            >
                                Registrarse
                            </Button>
                        </NavbarItem>
                    </>
                ) : (
                    <NavbarItem>
                        <span className="text-sm font-medium">Hola, Usuario</span>
                    </NavbarItem>
                )}
            </NavbarContent>

            {/* Menú Móvil */}
            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={index}>
                        <Link className="w-full" color="foreground" href="#" size="lg">
                            {item}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    )
}

export default NavBar