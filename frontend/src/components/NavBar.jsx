import React from 'react';
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useDisclosure } from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavLinks = () => {

    const location = useLocation()
    const navigate = useNavigate()

    const menuItems = [
        { name: 'Correlativas', icon: 'fa-chart-line', path: '/correlativas' },
        { name: 'Equivalencias', icon: 'fa-graduation-cap', path: '/equivalencias' },
        { name: 'Chat IA', icon: 'fa-robot', path: '/chatbot' },
    ]

    const handleClick = (path) => {
        navigate(path)
    }

    return (
        <nav className="flex flex-col gap-2 p-4">
            <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-2 px-3">
                Menú Principal
            </div>

            {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                    <button
                        key={item.path}
                        onClick={() => handleClick(item.path)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive
                            ? "bg-blue-50 text-blue-600 font-bold shadow-sm border border-blue-100"
                            : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                    >
                        <i className={`fa-solid ${item.icon} w-5 text-lg ${isActive ? "text-blue-600" : "group-hover:scale-110 transition-transform"
                            }`}></i>
                        <span className="text-sm font-medium">{item.name}</span>

                        {/* Indicador visual extra para el activo (Opcional) */}
                        {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                        )}
                    </button>
                )
            })}
        </nav>
    )
};

export default function NavBar({ setPlan, plan }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            {/* Botón Hamburguesa para Móvil (Estilizado como MateriaCard) */}
            <div className="lg:hidden fixed top-3 right-3 z-50">
                <Button
                    isIconOnly
                    radius="full"
                    variant="shadow"
                    onPress={onOpen}
                    className="bg-white text-blue-600 border border-slate-100"
                >
                    <i className="fa-solid fa-bars"></i>
                </Button>
            </div>

            {/* Sidebar Persistente para Escritorio (Estilo White/Slate) */}
            <aside className="hidden lg:flex flex-col w-64 h-screen sticky left-0 top-0 bg-white border-r border-slate-200 z-40">
                <div className="p-6 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-xl tracking-tight leading-none">UNLu</span>
                        <span className="text-blue-600 font-bold text-[10px] tracking-widest uppercase">Simulador</span>
                    </div>
                </div>

                <NavLinks />

                {/* Footer del Sidebar (Opcional, queda muy pro) */}
                <div className="mt-auto p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 px-1 tracking-wider">
                            Plan de Estudios
                        </p>

                        <div className="flex bg-slate-200/50 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setPlan("17.14")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${plan === "17.14"
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70"
                                    }`}
                            >
                                17.14
                            </button>
                            <button
                                onClick={() => setPlan("17.13")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${plan === "17.13"
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70"
                                    }`}
                            >
                                17.13
                            </button>
                        </div>

                        <p className="text-[9px] text-slate-400 mt-3 px-1 text-center italic">
                            * Cambiar el plan reseteará los filtros
                        </p>
                    </div>
                </div>
            </aside>

            {/* Drawer para Versión Móvil */}
            <Drawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="left"
                backdrop="blur"
                // Eliminamos bg-white de aquí si queremos que lo maneje el contenido
                classNames={{
                    base: "bg-white", // Forma correcta de pasar estilos al contenedor base en NextUI
                }}
            >
                <DrawerContent>
                    {(onClose) => (
                        <> {/* Usamos un fragment para no meter divs innecesarios que rompan el flex */}
                            <DrawerHeader className="p-0"> {/* Quitamos padding por defecto para control total */}
                                <div className="w-full p-6 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <i className="fa-solid fa-graduation-cap text-white"></i>
                                    </div>
                                    <span className="font-bold text-slate-800 text-lg">Menú</span>
                                </div>
                            </DrawerHeader>

                            <DrawerBody className="py-4">
                                {/* Pasamos onClose a NavLinks para que se cierre al hacer click */}
                                <NavLinks onItemClick={onClose} />
                            </DrawerBody>

                            <DrawerFooter className="p-0 block"> {/* block para que el footer no use flexbox por defecto */}
                                <div className="p-4 border-t border-slate-100">
                                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 px-1 tracking-wider">
                                            Plan de Estudios
                                        </p>

                                        <div className="flex bg-slate-200/50 p-1 rounded-xl gap-1">
                                            {["17.14", "17.13"].map((id) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setPlan(id)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${plan === id
                                                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70"
                                                        }`}
                                                >
                                                    {id}
                                                </button>
                                            ))}
                                        </div>
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