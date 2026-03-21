import React, { useState, useEffect } from 'react';
import { addToast, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useDisclosure, Select, SelectItem } from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from "next-themes"; // Importamos el hook para el tema

// --- Selector de Temas ---
const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const themes = [
        { key: "light", label: "Claro ☀️" },
        { key: "dark", label: "Oscuro 🌙" },
        { key: "girlie", label: "Girlie 🌸" },
        { key: "pastel", label: "Pastel 🎨" }
    ];

    return (
        <div className="pb-3 px-1">
            <Select
                label="Tema Visual"
                size="sm"
                variant="flat"
                // Volvemos al array simple que es más fácil de leer
                selectedKeys={[theme]}

                // ¡LA MAGIA ESTÁ ACÁ! Impide que el usuario "deseleccione" el tema actual
                disallowEmptySelection={true}

                onSelectionChange={(keys) => {
                    // onSelectionChange devuelve un Set de claves, extraemos el primero
                    const selected = [...keys][0]
                    if (selected) {
                        setTheme(selected)
                    }
                }}
                className="w-full"
                classNames={{
                    trigger: "bg-default-100 hover:bg-default-200",
                }}
            >
                {themes.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                        {t.label}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
};
// -------------------------------------------

const NavLinks = ({ onItemClick }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const menuItems = [
        { name: 'Progreso', icon: 'fa-graduation-cap', path: '/progreso', isDeactivated: false },
        { name: 'Simulador de Avance', icon: 'fa-route', path: '/simulador', isDeactivated: false },
        { name: 'Equivalencias entre planes', icon: 'fa-right-left', path: '/equivalencias', isDeactivated: true },
        { name: 'Chat IA', icon: 'fa-robot', path: '/chatbot', isDeactivated: true },
    ]

    const handleClick = (path) => {
        navigate(path)
        if (onItemClick) onItemClick(); // Cierra el menú en móvil
    }

    return (
        <nav className="flex flex-col gap-2 p-4">
            <div className="text-foreground/60 font-bold text-[10px] uppercase tracking-[0.15em] mb-2 px-3">
                Menú Principal
            </div>

            {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                if (isActive || !item.isDeactivated) {
                    return (
                        <button
                            key={item.path}
                            onClick={() => handleClick(item.path)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive
                                ? "bg-primary/10 text-primary font-bold shadow-sm border border-primary/20"
                                : "text-foreground/80 hover:bg-default-100 hover:text-primary"
                                }`}
                        >
                            <i className={`fa-solid ${item.icon} w-5 text-lg ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"
                                }`}></i>
                            <span className="text-sm font-medium">{item.name}</span>

                            {isActive && !item.isDeactivated && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50"></div>
                            )}
                        </button>
                    )
                } else if (item.isDeactivated) {
                    return (
                        <button
                            key={item.path}
                            onClick={() => addToast({ title: "En progreso", description: "Esta página aún no está disponible", color: "warning" })}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all group bg-default-200/50 text-foreground/60`}
                        >
                            <i className={`fa-solid ${item.icon} w-5 text-lg group-hover:scale-110 transition-transform`}></i>
                            <span className="text-sm font-medium">{item.name}</span>
                        </button>
                    )
                }
            })}
        </nav>
    )
};

export default function NavBar({ setPlan, plan }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate()
    const redirigirInicio = () => {
        navigate("/")
    }

    return (
        <>
            {/* Botón Hamburguesa para Móvil */}
            <div className="lg:hidden fixed top-3 right-3 z-50">
                <Button
                    isIconOnly
                    radius="full"
                    variant="shadow"
                    onPress={onOpen}
                    className="bg-background text-primary border border-default-200"
                    aria-label="Abrir menú principal"
                >
                    <i className="fa-solid fa-bars"></i>
                </Button>
            </div>

            {/* Sidebar Persistente para Escritorio */}
            <aside className="hidden lg:flex flex-col w-64 h-screen sticky left-0 top-0 bg-background border-r border-default-200 z-40">
                <div className="p-6 mb-2 flex items-center gap-3">
                    <div
                        className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer"
                        onClick={() => redirigirInicio()}
                    >
                        <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground text-xl tracking-tight leading-none">UNLu</span>
                        <span className="text-primary font-bold text-[10px] tracking-widest uppercase">Simulador</span>
                    </div>
                </div>

                <NavLinks />

                {/* Footer del Sidebar */}
                <div className="mt-auto p-4 border-t border-divider">
                    <div className="bg-default-50 rounded-2xl p-3 border border-default-200">
                        {/* ACÁ PONEMOS EL SELECTOR DE TEMAS */}
                        <ThemeSwitcher />

                        {location.pathname === '/progreso' && (
                            <div className="mt-4 border-t border-default-200/50 pt-4">
                                <p className="text-[10px] text-foreground/80 font-bold uppercase mb-3 px-1 tracking-wider">
                                    Plan de Estudios
                                </p>

                                <div className="flex bg-default-200/50 p-1 rounded-xl gap-1">
                                    <button
                                        onClick={() => setPlan("17.14")}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${plan === "17.14"
                                            ? "bg-background text-primary shadow-sm ring-1 ring-default-200"
                                            : "text-foreground/80 hover:text-foreground hover:bg-default-200"
                                            }`}
                                    >
                                        17.14
                                    </button>
                                    <button
                                        onClick={() => setPlan("17.13")}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${plan === "17.13"
                                            ? "bg-background text-primary shadow-sm ring-1 ring-default-200"
                                            : "text-foreground/80 hover:text-foreground hover:bg-default-200"
                                            }`}
                                    >
                                        17.13
                                    </button>
                                </div>

                                <p className="text-[9px] text-foreground/60 mt-3 px-1 text-center italic">
                                    * Cambiar el plan reseteará los filtros
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Drawer para Versión Móvil */}
            <Drawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="left"
                backdrop="blur"
                classNames={{
                    base: "bg-background",
                }}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="p-0">
                                <div className="w-full p-6 border-b border-default-200 flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer"
                                        onClick={() => redirigirInicio()}
                                    >
                                        <i className="fa-solid fa-graduation-cap text-white"></i>
                                    </div>
                                    <span className="font-bold text-foreground text-lg">Menú</span>
                                </div>
                            </DrawerHeader>

                            <DrawerBody className="py-4">
                                <NavLinks onItemClick={onClose} />
                            </DrawerBody>

                            <DrawerFooter className="p-0 block">
                                <div className="p-4 border-t border-default-200">
                                    <div className="bg-default-50 rounded-2xl p-3 border border-default-200">
                                        {/* ACÁ PONEMOS EL SELECTOR DE TEMAS EN VERSIÓN MÓVIL */}
                                        <ThemeSwitcher />

                                        {location.pathname === '/progreso' && (
                                            <div className="mt-4 border-t border-default-200/50 pt-4">
                                                <p className="text-[10px] text-foreground/80 font-bold uppercase mb-3 px-1 tracking-wider">
                                                    Plan de Estudios
                                                </p>

                                                <div className="flex bg-default-200/50 p-1 rounded-xl gap-1">
                                                    {["17.14", "17.13"].map((id) => (
                                                        <button
                                                            key={id}
                                                            onClick={() => setPlan(id)}
                                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${plan === id
                                                                ? "bg-background text-primary shadow-sm ring-1 ring-default-200"
                                                                : "text-foreground/80 hover:text-foreground hover:bg-default-200"
                                                                }`}
                                                        >
                                                            {id}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}