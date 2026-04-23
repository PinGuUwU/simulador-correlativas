import React, { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Card,
    CardHeader,
    CardBody,
    Divider,
    Tabs,
    Tab,
    addToast,
    Chip,
    Avatar
} from '@heroui/react';
import { useAuth } from '../context/AuthContext';
import { updateUserConfig } from '../services/dbService';
import { useTheme } from 'next-themes';

export default function SettingsPage({ plan, setPlan }) {
    const {
        user,
        userData,
        loading,
        getProgresoLocal,
        refetchUserData,
        signIn
    } = useAuth();
    const { theme, setTheme } = useTheme();

    const [alias, setAlias] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userData?.config?.alias) {
            setAlias(userData.config.alias);
        } else if (user?.displayName) {
            setAlias(user.displayName.split(' ')[0] || '');
        }
    }, [userData, user]);

    const handleSave = async () => {
        if (!user) {
            try {
                const loggedUser = await signIn();
                if (loggedUser) {
                    addToast({ title: '¡Bienvenido!', description: 'Sesión iniciada correctamente.', color: 'success' });
                }
            } catch (err) { }
            return;
        }

        setSaving(true);
        try {
            await updateUserConfig(user.uid, {
                alias,
                planActivo: plan,
                tema: theme
            });
            await refetchUserData();
            addToast({ title: 'Guardado', description: 'Tus configuraciones han sido actualizadas.', color: 'success' });
        } catch (err) {
            addToast({ title: 'Error', description: 'No se pudo guardar la configuración.', color: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        const rawProgreso = getProgresoLocal(plan);

        const minifyProgreso = (prog) => Object.fromEntries(
            Object.entries(prog || {}).filter(([_, state]) =>
                ['Aprobado', 'Regular', 'Cursado', 'Promocionado'].includes(state)
            )
        );

        const fullData = {
            plan,
            timestamp: new Date().toISOString(),
            progreso: minifyProgreso(rawProgreso),
        };

        const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progreso_unlu_${plan}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return null;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tight text-foreground">Configuración</h1>
                <p className="text-foreground/60">Gestioná tu perfil, preferencias del simulador y visualización.</p>
            </header>

            {!user && (
                <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 shadow-md">
                    <CardBody className="flex flex-col md:flex-row items-center gap-6 p-6">
                        <div className="bg-primary/20 p-4 rounded-2xl">
                            <i className="fa-solid fa-rocket text-primary text-3xl" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold mb-1">Potenciá tu Simulador</h3>
                            <p className="text-foreground/70 text-sm">Inicia sesión para guardar tu progreso en la nube y sincronizar entre dispositivos.</p>
                        </div>
                        <Button
                            color="primary"
                            variant="shadow"
                            className="font-bold px-8"
                            onPress={async () => {
                                const logged = await signIn();
                                if (logged) {
                                    addToast({ title: '¡Bienvenido!', description: 'Sesión iniciada correctamente.', color: 'success' });
                                }
                            }}
                        >
                            Comenzar Gratis
                        </Button>
                    </CardBody>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perfil Section */}
                <Card className="shadow-sm border border-default-200">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="p-2 rounded-lg bg-default-100">
                            <i className="fa-solid fa-user text-default-500 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-bold leading-none">Perfil de Usuario</p>
                            <p className="text-xs text-default-500">Información básica de tu cuenta</p>
                        </div>
                    </CardHeader>
                    <Divider className="my-2 mx-6 w-auto" />
                    <CardBody className="px-6 pb-6 pt-2 flex flex-col gap-4">
                        {user && (
                            <div className="flex items-center gap-4 mb-2 p-3 bg-default-50 rounded-xl border border-default-100">
                                <Avatar
                                    src={user.photoURL}
                                    name={user.displayName}
                                    className="w-12 h-12 text-large"
                                    isBordered
                                    color="primary"
                                    imgProps={{ referrerPolicy: "no-referrer" }}
                                />
                                <div className="flex flex-col overflow-hidden">
                                    <p className="text-md font-bold truncate">{user.displayName}</p>
                                    <p className="text-xs text-default-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Alias / Nombre"
                            placeholder="Tu nombre público"
                            labelPlacement="outside"
                            description="Se muestra en la barra de navegación."
                            value={alias}
                            onValueChange={setAlias}
                            variant="flat"
                            isDisabled={!user}
                            startContent={<i className="fa-solid fa-user text-default-400 text-md mr-2" />}
                            endContent={
                                user && (
                                    <Button
                                        size="md"
                                        color={alias !== (userData?.config?.alias || user.displayName?.split(' ')[0]) ? "primary" : "default"}
                                        variant={alias !== (userData?.config?.alias || user.displayName?.split(' ')[0]) ? "shadow" : "flat"}
                                        className="h-8 font-bold px-4"
                                        onPress={handleSave}
                                        isLoading={saving}
                                    >
                                        Actualizar
                                    </Button>
                                )
                            }
                        />

                        <Input
                            label="Correo Electrónico"
                            labelPlacement="outside"
                            value={user?.email || 'Visitante'}
                            variant="bordered"
                            isReadOnly
                            isDisabled={!user}
                            startContent={<i className="fa-solid fa-envelope text-default-400 text-md mr-2" />}
                        />
                    </CardBody>
                </Card>

                {/* Preferencias Section */}
                <Card className="shadow-sm border border-default-200">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="p-2 rounded-lg bg-default-100">
                            <i className="fa-solid fa-graduation-cap text-default-500 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-bold leading-none">Preferencias Académicas</p>
                            <p className="text-xs text-default-500">Plan de estudios y carrera</p>
                        </div>
                    </CardHeader>
                    <Divider className="my-2 mx-6 w-auto" />
                    <CardBody className="px-6 pb-6 pt-2 flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-foreground/80">Plan de Estudios Activo</label>
                            <Tabs
                                aria-label="Selección de Plan"
                                color="primary"
                                variant="bordered"
                                fullWidth
                                selectedKey={plan || '17.14'}
                                onSelectionChange={(key) => setPlan(key)}
                                classNames={{
                                    base: "w-full",
                                    tabList: "w-full bg-default-100 p-1 border-none shrink-0",
                                    cursor: "shadow-sm",
                                    tab: "h-10 px-2"
                                }}
                            >
                                <Tab
                                    key="17.14"
                                    title={
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="text-xs sm:text-sm font-bold whitespace-nowrap">Plan 17.14</span>
                                            <Chip size="sm" variant="flat" color="primary" className="hidden xs:flex h-min min-w-0 px-1 text-[10px]">Actual</Chip>
                                        </div>
                                    }
                                />
                                <Tab key="17.13" title={<span className="text-xs sm:text-sm font-bold">Plan 17.13</span>} />
                            </Tabs>
                            <p className="text-xs text-default-500 px-1 italic">
                                * Cambiar el plan afecta los datos mostrados en el Simulador y Progreso.
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Interfaz Section */}
                <Card className="shadow-sm border border-default-200">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="p-2 rounded-lg bg-default-100">
                            <i className="fa-solid fa-palette text-default-500 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-bold leading-none">Personalización</p>
                            <p className="text-xs text-default-500">Ajustá el estilo de la interfaz</p>
                        </div>
                    </CardHeader>
                    <Divider className="my-2 mx-6 w-auto" />
                    <CardBody className="px-6 pb-6 pt-2">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-bold px-1">Temas Disponibles</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'light', label: 'Claro', icon: 'fa-sun', color: 'bg-white' },
                                    { id: 'dark', label: 'Oscuro', icon: 'fa-moon', color: 'bg-slate-900' },
                                    { id: 'girlie', label: 'Girlie', icon: 'fa-wand-magic-sparkles', color: 'bg-pink-100' },
                                    { id: 'boyie', label: 'Boyie', icon: 'fa-snowflake', color: 'bg-blue-200' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${theme === t.id
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-default-100 bg-default-50 hover:border-default-200'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full ${t.color} border border-default-200 shadow-inner`} />
                                        <span className={`text-xs font-bold ${theme === t.id ? 'text-primary' : 'text-foreground/70'}`}>
                                            {t.label}
                                        </span>
                                        {theme === t.id && <i className="fa-solid fa-check ml-auto text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Próximamente Section */}
                <Card className="shadow-sm border border-dashed border-default-300 bg-default-50/30 overflow-hidden relative">
                    <div className="absolute top-2 right-2 rotate-12">
                        <Chip variant="flat" color="warning" size="sm" className="font-bold uppercase tracking-wider">Lab</Chip>
                    </div>
                    <CardHeader className="flex gap-3 px-6 pt-6 opacity-60">
                        <div className="p-2 rounded-lg bg-default-100">
                            <i className="fa-solid fa-rocket text-default-400 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-bold leading-none">Nuevas Funciones</p>
                            <p className="text-xs text-default-400 italic">En desarrollo activo</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-2 flex flex-col gap-3 opacity-60">
                        <div className="flex items-center gap-3 p-2 border border-default-100 rounded-xl">
                            <div className="p-2 rounded-lg bg-default-50">
                                <i className="fa-solid fa-file-pdf text-default-400 w-4 flex justify-center" />
                            </div>
                            <p className="text-xs font-semibold">Subida de Analítico para actualizar el Progreso</p>
                        </div>
                        <div className="flex items-center gap-3 p-2 border border-default-100 rounded-xl">
                            <div className="p-2 rounded-lg bg-default-50">
                                <i className="fa-solid fa-bell text-default-400 w-4 flex justify-center" />
                            </div>
                            <p className="text-xs font-semibold">Alertas de Inscripción y Finales</p>
                        </div>
                        <div className="flex items-center gap-3 p-2 border border-default-100 rounded-xl">
                            <div className="p-2 rounded-lg bg-default-50">
                                <i className="fa-solid fa-file-export text-default-400 w-4 flex justify-center" />
                            </div>
                            <p className="text-xs font-semibold">Exportar avance (JSON)</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
