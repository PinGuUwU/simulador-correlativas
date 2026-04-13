import React, { useState, useEffect } from 'react';
import {
    addToast,
    Button,
    Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader,
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader,
    useDisclosure,
    Select, SelectItem,
    Switch,
    Avatar,
    Tooltip,
} from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { trackCambioTema } from '../services/analyticsService';

// ─── Selector de Temas ─────────────────────────────────────────────────────────
const ThemeSwitcher = ({ isCollapsed }) => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const themes = [
        { key: 'light', label: 'Claro', icon: 'fa-sun' },
        { key: 'dark', label: 'Oscuro', icon: 'fa-moon' },
        { key: 'girlie', label: 'Girlie', icon: 'fa-heart' },
        { key: 'pastel', label: 'Pastel', icon: 'fa-palette' },
    ];

    if (isCollapsed) {
        const currentTheme = themes.find(t => t.key === theme) || themes[0];
        return (
            <div className="flex justify-center w-full">
                <Tooltip content={`Tema: ${currentTheme.label}`} placement="right">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => {
                            const nextIndex = (themes.findIndex(t => t.key === theme) + 1) % themes.length;
                            setTheme(themes[nextIndex].key);
                            trackCambioTema({ tema: themes[nextIndex].key });
                        }}
                    >
                        <i className={`fa-solid ${currentTheme.icon}`} />
                    </Button>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="pb-3 px-1 transition-opacity duration-300">
            <Select
                label="Tema Visual"
                size="sm"
                variant="flat"
                selectedKeys={[theme]}
                disallowEmptySelection={true}
                onSelectionChange={(keys) => {
                    const selected = [...keys][0];
                    if (selected) {
                        setTheme(selected);
                        trackCambioTema({ tema: selected });
                    }
                }}
                className="w-full"
                classNames={{ trigger: 'bg-default-100 hover:bg-default-200' }}
            >
                {themes.map((t) => (
                    <SelectItem key={t.key} value={t.key} startContent={<i className={`fa-solid ${t.icon} w-4`} />}>
                        {t.label}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
};

ThemeSwitcher.propTypes = {
    isCollapsed: PropTypes.bool,
};

// ─── Modal de inicio de sesión con "Recordarme" ────────────────────────────────
const LoginModal = ({ isOpen, onClose, onConfirm }) => {
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { authError, clearAuthError } = useAuth();

    const handleLogin = async () => {
        setLoading(true);
        clearAuthError();
        try {
            await onConfirm(rememberMe);
            onClose();
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="center" backdrop="blur">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <span className="text-lg font-black">Iniciar Sesión</span>
                    <span className="text-sm text-foreground/60 font-normal">
                        Usá tu cuenta de Google para guardar tu progreso
                    </span>
                </ModalHeader>

                <ModalBody>
                    {authError && (
                        <div className="flex items-start gap-2 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl px-3 py-2.5 text-sm">
                            <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
                            <span>{authError}</span>
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-default-200 bg-default-50 hover:bg-default-100 transition-all font-semibold text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <i className="fa-solid fa-spinner animate-spin text-primary" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                        )}
                        {loading ? 'Conectando…' : 'Continuar con Google'}
                    </button>

                    <div className="flex items-center justify-between px-1 py-2 border-t border-default-200 mt-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">Recordarme</span>
                            <span className="text-xs text-foreground/50">
                                {rememberMe ? 'Sesión activa por 7 días' : 'Sesión activa por 24 horas'}
                            </span>
                        </div>
                        <Switch
                            size="sm"
                            isSelected={rememberMe}
                            onValueChange={setRememberMe}
                            color="primary"
                        />
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button variant="light" onPress={onClose} size="sm">Cancelar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

LoginModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

// ─── Panel de usuario (sección inferior del sidebar) ──────────────────────────
const UserPanel = ({ onSignInPress, isCollapsed }) => {
    const { user, userData, loading, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className={`flex items-center gap-3 p-3 rounded-xl animate-pulse ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-default-200 shrink-0" />
                {!isCollapsed && (
                    <div className="flex flex-col gap-1 flex-1">
                        <div className="h-2.5 w-24 bg-default-200 rounded" />
                        <div className="h-2 w-16 bg-default-100 rounded" />
                    </div>
                )}
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={`flex flex-col gap-2 ${isCollapsed ? 'items-center w-full' : ''}`}>
                {isCollapsed ? (
                    <Tooltip content="Iniciar Sesión" placement="right">
                        <Button
                            isIconOnly
                            color="primary"
                            variant="flat"
                            onPress={onSignInPress}
                            className="min-w-0"
                        >
                            <i className="fa-brands fa-google" />
                        </Button>
                    </Tooltip>
                ) : (
                    <Button
                        id="btn-iniciar-sesion"
                        color="primary"
                        variant="flat"
                        className="w-full font-bold"
                        startContent={<i className="fa-brands fa-google" />}
                        onPress={onSignInPress}
                    >
                        Iniciar Sesión
                    </Button>
                )}
                
                {isCollapsed ? (
                    <Tooltip content="Configuración" placement="right">
                        <Button
                            isIconOnly
                            variant="flat"
                            color="default"
                            onPress={() => navigate('/config')}
                            className="min-w-0"
                        >
                            <i className="fa-solid fa-gear" />
                        </Button>
                    </Tooltip>
                ) : (
                    <Button
                        id="btn-configuracion-guest"
                        variant="flat"
                        color="default"
                        className="w-full justify-start font-semibold text-sm"
                        startContent={<i className="fa-solid fa-gear" />}
                        onPress={() => navigate('/config')}
                    >
                        Configuración
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2 ${isCollapsed ? 'items-center w-full' : ''}`}>
            <div className={`flex items-center gap-3 px-1 py-2 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                <Tooltip content={isCollapsed ? (userData?.config?.alias || user.displayName) : ""} placement="right">
                    <Avatar
                        src={user.photoURL}
                        name={user.displayName}
                        size="sm"
                        isBordered
                        color="primary"
                        className="shrink-0"
                    />
                </Tooltip>
                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 flex-1 transition-opacity duration-300">
                        <span className="text-sm font-bold text-foreground truncate leading-tight">
                            {userData?.config?.alias || (user.displayName?.split(' ')[0] ?? 'Usuario')}
                        </span>
                        <span className="text-[10px] text-foreground/50 truncate w-full">{user.email}</span>
                    </div>
                )}
            </div>

            {isCollapsed ? (
                <>
                    <Tooltip content="Configuración" placement="right">
                        <Button isIconOnly variant="flat" onPress={() => navigate('/config')} className="min-w-0">
                            <i className="fa-solid fa-gear" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Cerrar Sesión" placement="right">
                        <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            onPress={async () => {
                                await signOut();
                                addToast({ title: 'Sesión cerrada', description: '¡Hasta la próxima!', color: 'success' });
                            }}
                            className="min-w-0"
                        >
                            <i className="fa-solid fa-right-from-bracket" />
                        </Button>
                    </Tooltip>
                </>
            ) : (
                <>
                    <Button
                        id="btn-configuracion"
                        variant="flat"
                        color="default"
                        className="w-full justify-start font-semibold text-sm"
                        startContent={<i className="fa-solid fa-gear" />}
                        onPress={() => navigate('/config')}
                    >
                        Configuración
                    </Button>

                    <Button
                        id="btn-cerrar-sesion"
                        variant="light"
                        color="danger"
                        className="w-full justify-start font-semibold text-sm"
                        startContent={<i className="fa-solid fa-right-from-bracket" />}
                        onPress={async () => {
                            await signOut();
                            addToast({ title: 'Sesión cerrada', description: '¡Hasta la próxima!', color: 'success' });
                        }}
                    >
                        Cerrar Sesión
                    </Button>
                </>
            )}
        </div>
    );
};

UserPanel.propTypes = {
    onSignInPress: PropTypes.func.isRequired,
    isCollapsed: PropTypes.bool,
};

// ─── Links de navegación ───────────────────────────────────────────────────────
const NavLinks = ({ onItemClick, isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Inicio', icon: 'fa-house', path: '/', isDeactivated: false },
        { name: 'Progreso', icon: 'fa-graduation-cap', path: '/progreso', isDeactivated: false },
        { name: 'Simulador de Avance', icon: 'fa-route', path: '/simulador', isDeactivated: false },
        { name: 'Equivalencias', icon: 'fa-right-left', path: '/equivalencias', isDeactivated: false },
        { name: 'Chat IA', icon: 'fa-robot', path: '/chatbot', isDeactivated: true },
        { name: 'Cómo usar', icon: 'fa-circle-question', path: '/como-usar', isDeactivated: false, id: 'btn-como-usar' },
        { name: 'Reportar error', icon: 'fa-bug', path: '/contacto', isDeactivated: false },
    ];

    const handleClick = (path) => {
        navigate(path);
        if (onItemClick) onItemClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className={`flex flex-col gap-2 transition-all duration-300 ${isCollapsed ? 'px-2' : 'p-4'}`}>
            {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isDisabled = !isActive && item.isDeactivated;

                const content = (
                    <button
                        key={item.path}
                        id={item.id}
                        onClick={() => isDisabled ? addToast({ title: 'En progreso', description: 'Esta página aún no está disponible', color: 'warning' }) : handleClick(item.path)}
                        className={`flex items-center gap-3 rounded-xl transition-all duration-200 group relative ${isCollapsed ? 'p-3 justify-center' : 'p-3'} ${isActive
                                ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/20 backdrop-blur-sm'
                                : isDisabled 
                                    ? 'bg-default-200/50 text-foreground/60 cursor-not-allowed'
                                    : 'text-foreground/70 hover:bg-default-100/80 hover:text-primary hover:translate-x-0.5'
                            }`}
                    >
                        <i className={`fa-solid ${item.icon} w-5 text-lg shrink-0 ${isActive ? 'text-primary drop-shadow-sm' : 'group-hover:scale-110 transition-transform'}`} />
                        {!isCollapsed && <span className="text-sm font-medium transition-opacity duration-300 whitespace-nowrap overflow-hidden">{item.name}</span>}
                        {isActive && !isCollapsed && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_2px] shadow-primary/60 animate-pulse" />
                        )}
                        {isActive && isCollapsed && (
                             <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary" />
                        )}
                    </button>
                );

                return isCollapsed ? (
                    <Tooltip key={item.path} content={item.name} placement="right">
                        {content}
                    </Tooltip>
                ) : content;
            })}
        </nav>
    );
};

NavLinks.propTypes = {
    onItemClick: PropTypes.func,
    isCollapsed: PropTypes.bool,
};

// ─── Sidebar Footer  (tema + auth) ────────────────────────────────────
const SidebarFooter = ({ onSignInPress, id_prefix = 'desktop', isCollapsed }) => {
    return (
        <div className={`mt-auto border-t border-default-200/40 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <div className={`bg-background/60 backdrop-blur-md rounded-2xl border border-default-200/50 flex flex-col gap-3 shadow-sm transition-all duration-300 ${isCollapsed ? 'p-1 py-3' : 'p-3'}`}>
                <div id={`selector-tema-${id_prefix}`}>
                    <ThemeSwitcher isCollapsed={isCollapsed} />
                </div>

                <div className={`${!isCollapsed ? 'border-t border-default-200/50 pt-3' : 'w-full flex justify-center'}`}>
                    <UserPanel onSignInPress={onSignInPress} isCollapsed={isCollapsed} />
                </div>
            </div>
        </div>
    );
};

SidebarFooter.propTypes = {
    onSignInPress: PropTypes.func.isRequired,
    id_prefix: PropTypes.string,
    isCollapsed: PropTypes.bool,
};

// ─── NavBar principal ─────────────────────────────────────────────────────────
export default function NavBar({ setPlan, plan }) {
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onOpenChange: onDrawerOpenChange } = useDisclosure();
    const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
    const { signIn, firestoreWarning, clearFirestoreWarning } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const handleSignIn = async (rememberMe) => {
        try {
            await signIn(rememberMe);
            addToast({ title: '¡Bienvenido!', description: 'Sesión iniciada correctamente', color: 'success' });
            if (firestoreWarning) {
                addToast({ title: 'Aviso de sincronización', description: firestoreWarning, color: 'warning' });
                clearFirestoreWarning();
            }
        } catch {
        }
    };

    return (
        <>
            <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} onConfirm={handleSignIn} />

            {/* Botón Hamburguesa Móvil */}
            <div className="lg:hidden fixed top-3 right-3 z-50">
                <Button
                    isIconOnly
                    radius="full"
                    variant="shadow"
                    onPress={onDrawerOpen}
                    id="btn-menu-mobile"
                    className="bg-background text-primary border border-default-200"
                    aria-label="Abrir menú principal"
                >
                    <i className="fa-solid fa-bars" />
                </Button>
            </div>

            {/* Sidebar Desktop */}
            <aside 
                className={`hidden lg:flex flex-col h-screen sticky left-0 top-0 bg-background/85 backdrop-blur-xl border-r border-default-200/60 z-40 shadow-xl shadow-black/5 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Botón Toggle - Movido fuera del overflow y con z-index más alto */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    onPress={() => setIsCollapsed(!isCollapsed)}
                    className={`hidden lg:flex absolute -right-3 top-10 -translate-y-1/2 bg-background border border-default-200 shadow-md z-[60] hover:bg-default-100 transition-all duration-300 ${isCollapsed ? 'rotate-180 -right-4' : ''}`}
                >
                    <i className="fa-solid fa-chevron-left text-[10px]" />
                </Button>

                {/* Header */}
                <div className={`p-4 mb-2 flex items-center border-b border-default-200/40 relative h-20 shrink-0 ${isCollapsed ? 'justify-center' : 'gap-3 px-6'}`}>
                    <div
                        className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 hover:shadow-primary/50 transition-all duration-300 shrink-0"
                        onClick={() => navigate('/')}
                    >
                        <i className="fa-solid fa-graduation-cap text-white text-xl" />
                    </div>
                    
                    {!isCollapsed && (
                        <div className="flex flex-col transition-opacity duration-300">
                            <span className="font-black text-foreground text-xl tracking-tight leading-none">UNLu</span>
                            <span className="text-primary font-bold text-[10px] tracking-widest uppercase">Simulador</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <NavLinks isCollapsed={isCollapsed} />
                </div>

                <SidebarFooter
                    onSignInPress={onLoginOpen}
                    id_prefix="desktop"
                    isCollapsed={isCollapsed}
                />
            </aside>

            {/* Drawer Móvil */}
            <Drawer
                isOpen={isDrawerOpen}
                onOpenChange={onDrawerOpenChange}
                placement="left"
                backdrop="blur"
                classNames={{ base: 'bg-background' }}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="p-0">
                                <div className="w-full p-6 border-b border-default-200 flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer"
                                        onClick={() => navigate('/')}
                                    >
                                        <i className="fa-solid fa-graduation-cap text-white" />
                                    </div>
                                    <span className="font-bold text-foreground text-lg">Menú</span>
                                </div>
                            </DrawerHeader>

                            <DrawerBody className="py-4">
                                <NavLinks onItemClick={onClose} isCollapsed={false} />
                            </DrawerBody>

                            <DrawerFooter className="p-0 block">
                                <SidebarFooter
                                    onSignInPress={() => { onClose(); onLoginOpen(); }}
                                    id_prefix="mobile"
                                    isCollapsed={false}
                                />
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}

NavBar.propTypes = {
    setPlan: PropTypes.func,
    plan: PropTypes.string,
};