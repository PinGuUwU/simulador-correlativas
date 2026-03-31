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
const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const themes = [
        { key: 'light',  label: 'Claro ☀️'   },
        { key: 'dark',   label: 'Oscuro 🌙'  },
        { key: 'girlie', label: 'Girlie 🌸'  },
        { key: 'pastel', label: 'Pastel 🎨'  },
    ];

    return (
        <div className="pb-3 px-1">
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
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
            </Select>
        </div>
    );
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
            // El error ya fue seteado en el contexto por signIn().
            // Si authError es null, fue una cancelación intencional → no hacemos nada.
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
                    {/* Banner de error (traducido, sin códigos técnicos) */}
                    {authError && (
                        <div className="flex items-start gap-2 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl px-3 py-2.5 text-sm">
                            <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
                            <span>{authError}</span>
                        </div>
                    )}

                    {/* Botón Google */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-default-200 bg-default-50 hover:bg-default-100 transition-all font-semibold text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <i className="fa-solid fa-spinner animate-spin text-primary" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                        )}
                        {loading ? 'Conectando…' : 'Continuar con Google'}
                    </button>

                    {/* Toggle Recordarme */}
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
    isOpen:    PropTypes.bool.isRequired,
    onClose:   PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

// ─── Panel de usuario (sección inferior del sidebar) ──────────────────────────
const UserPanel = ({ onSignInPress }) => {
    const { user, loading, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();

    // Skeleton mientras Firebase verifica la sesión
    if (loading) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-8 h-8 rounded-full bg-default-200" />
                <div className="flex flex-col gap-1 flex-1">
                    <div className="h-2.5 w-24 bg-default-200 rounded" />
                    <div className="h-2 w-16 bg-default-100 rounded" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
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
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Info usuario */}
            <div className="flex items-center gap-3 px-1 py-2">
                <Avatar
                    src={user.photoURL}
                    name={user.displayName}
                    size="sm"
                    isBordered
                    color="primary"
                    className="shrink-0"
                />
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-foreground truncate leading-tight">
                        {user.displayName?.split(' ')[0] ?? 'Usuario'}
                    </span>
                    <span className="text-[10px] text-foreground/50 truncate">{user.email}</span>
                </div>
            </div>

            {/* Acciones */}
            <Tooltip content="Configuración de la cuenta" placement="right">
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
            </Tooltip>

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
        </div>
    );
};

UserPanel.propTypes = {
    onSignInPress: PropTypes.func.isRequired,
};

// ─── Links de navegación ───────────────────────────────────────────────────────
const NavLinks = ({ onItemClick }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Progreso',                icon: 'fa-graduation-cap',  path: '/progreso',     isDeactivated: false },
        { name: 'Simulador de Avance',     icon: 'fa-route',           path: '/simulador',    isDeactivated: false },
        { name: 'Equivalencias entre planes', icon: 'fa-right-left',   path: '/equivalencias',isDeactivated: false },
        { name: 'Chat IA',                 icon: 'fa-robot',           path: '/chatbot',      isDeactivated: true  },
        { name: 'Cómo usar',               icon: 'fa-circle-question', path: '/como-usar',    isDeactivated: false, id: 'btn-como-usar' },
    ];

    const handleClick = (path) => {
        navigate(path);
        if (onItemClick) onItemClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                            id={item.id}
                            onClick={() => handleClick(item.path)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                                isActive
                                    ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/20'
                                    : 'text-foreground/80 hover:bg-default-100 hover:text-primary'
                            }`}
                        >
                            <i className={`fa-solid ${item.icon} w-5 text-lg ${isActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`} />
                            <span className="text-sm font-medium">{item.name}</span>
                            {isActive && !item.isDeactivated && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                            )}
                        </button>
                    );
                } else {
                    return (
                        <button
                            key={item.path}
                            onClick={() => addToast({ title: 'En progreso', description: 'Esta página aún no está disponible', color: 'warning' })}
                            className="flex items-center gap-3 p-3 rounded-xl transition-all group bg-default-200/50 text-foreground/60"
                        >
                            <i className={`fa-solid ${item.icon} w-5 text-lg group-hover:scale-110 transition-transform`} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </button>
                    );
                }
            })}
        </nav>
    );
};

NavLinks.propTypes = {
    onItemClick: PropTypes.func,
};

// ─── Sidebar Footer  (tema + plan + auth) ────────────────────────────────────
const SidebarFooter = ({ setPlan, plan, onSignInPress, id_prefix = 'desktop' }) => {
    const location = useLocation();

    return (
        <div className="mt-auto p-4 border-t border-divider">
            <div className="bg-default-50 rounded-2xl p-3 border border-default-200 flex flex-col gap-3">
                {/* Tema */}
                <div id={`selector-tema-${id_prefix}`}>
                    <ThemeSwitcher />
                </div>

                {/* Plan (solo en /progreso) */}
                {location.pathname === '/progreso' && (
                    <div id={`selector-plan-${id_prefix}`} className="border-t border-default-200/50 pt-3">
                        <p className="text-[12px] text-foreground/80 font-bold uppercase mb-3 px-1 tracking-wider">
                            Plan de Estudios
                        </p>
                        <div className="flex bg-default-200/50 p-1 rounded-xl gap-1">
                            {['17.14', '17.13'].map((id) => (
                                <button
                                    key={id}
                                    onClick={() => setPlan(id)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                                        plan === id
                                            ? 'bg-background text-primary shadow-sm ring-1 ring-default-200'
                                            : 'text-foreground/80 hover:text-foreground hover:bg-default-200'
                                    }`}
                                >
                                    {id}
                                </button>
                            ))}
                        </div>
                        <p className="text-[12px] text-foreground/60 mt-3 px-1 text-center italic">
                            * Cambiar el plan reseteará los filtros
                        </p>
                        <div className="mt-3">
                            <Button
                                id={`btn-ver-tutorial-${id_prefix}`}
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="w-full font-bold uppercase tracking-wider text-[10px]"
                                startContent={<i className="fa-solid fa-circle-question" />}
                                onPress={() => window.dispatchEvent(new CustomEvent('start-tutorial'))}
                            >
                                Repetir Tutorial
                            </Button>
                        </div>
                    </div>
                )}

                {/* Auth */}
                <div className="border-t border-default-200/50 pt-3">
                    <UserPanel onSignInPress={onSignInPress} />
                </div>
            </div>
        </div>
    );
};

SidebarFooter.propTypes = {
    setPlan:       PropTypes.func.isRequired,
    plan:          PropTypes.string.isRequired,
    onSignInPress: PropTypes.func.isRequired,
    id_prefix:     PropTypes.string,
};

// ─── NavBar principal ─────────────────────────────────────────────────────────
export default function NavBar({ setPlan, plan }) {
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onOpenChange: onDrawerOpenChange } = useDisclosure();
    const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
    const { signIn, firestoreWarning, clearFirestoreWarning } = useAuth();
    const navigate = useNavigate();

    const handleSignIn = async (rememberMe) => {
        try {
            await signIn(rememberMe);
            // signIn solo llega acá si el login fue exitoso
            addToast({ title: '¡Bienvenido!', description: 'Sesión iniciada correctamente', color: 'success' });
            // firestoreWarning ya está seteado en el contexto si Firestore falló
            if (firestoreWarning) {
                addToast({
                    title: 'Aviso de sincronización',
                    description: firestoreWarning,
                    color: 'warning',
                });
                clearFirestoreWarning();
            }
        } catch {
            // El error (si no es cancelación) ya está en authError
            // El LoginModal lo muestra inline → no duplicamos con toast
        }
    };

    return (
        <>
            {/* Modal de login */}
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
            <aside className="hidden lg:flex flex-col w-64 h-screen sticky left-0 top-0 bg-background border-r border-default-200 z-40 overflow-y-auto">
                <div className="p-6 mb-2 flex items-center gap-3">
                    <div
                        className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <i className="fa-solid fa-graduation-cap text-white text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground text-xl tracking-tight leading-none">UNLu</span>
                        <span className="text-primary font-bold text-[10px] tracking-widest uppercase">Simulador</span>
                    </div>
                </div>

                <NavLinks />

                <SidebarFooter
                    setPlan={setPlan}
                    plan={plan}
                    onSignInPress={onLoginOpen}
                    id_prefix="desktop"
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
                                <NavLinks onItemClick={onClose} />
                            </DrawerBody>

                            <DrawerFooter className="p-0 block">
                                <SidebarFooter
                                    setPlan={setPlan}
                                    plan={plan}
                                    onSignInPress={() => { onClose(); onLoginOpen(); }}
                                    id_prefix="mobile"
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
    setPlan: PropTypes.func.isRequired,
    plan:    PropTypes.string.isRequired,
};