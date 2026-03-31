import React, { useState, useEffect } from 'react';
import { Button, Input, Select, SelectItem, addToast } from '@heroui/react';
import { useAuth } from '../context/AuthContext';
import { updateUserConfig } from '../services/dbService';
import { useTheme } from 'next-themes';

export default function SettingsPage({ plan, setPlan }) {
    const { user, userData, loading, getProgresoLocal, getSimulacionLocal, refetchUserData } = useAuth();
    const { theme } = useTheme();

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
            addToast({ title: 'Error', description: 'Debes iniciar sesión para guardar configuraciones en la nube.', color: 'danger' });
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
            addToast({ title: 'Guardado', description: 'Tus configuraciones han sido actualizadas permanentemente.', color: 'success' });
        } catch (err) {
            addToast({ title: 'Error', description: 'No se pudo guardar la configuración.', color: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        const rawProgreso = getProgresoLocal(plan);
        const rawSimu = getSimulacionLocal(plan);

        // Helper para eliminar estados redundantes (No Cursado / Bloqueado)
        const minifyProgreso = (prog) => Object.fromEntries(
            Object.entries(prog || {}).filter(([_, state]) => 
                ['Aprobado', 'Regular', 'Cursado'].includes(state)
            )
        );

        const fullData = {
            plan,
            timestamp: new Date().toISOString(),
            // Guardamos solo lo que el usuario realmente marcó
            progreso: minifyProgreso(rawProgreso),
            // Limpiamos los snapshots de la simulación para evitar redundancia masiva
            simulacion: rawSimu ? {
                ...rawSimu,
                progresoSimulado: minifyProgreso(rawSimu.progresoSimulado),
                progresoBase: minifyProgreso(rawSimu.progresoBase),
                historialSemestres: (rawSimu.historialSemestres || []).map(s => ({
                    ...s,
                    // Reducimos las materias del semestre a solo sus códigos
                    materiasDelSemestre: (s.materiasDelSemestre || []).map(m => m.codigo),
                    progresoSnapshot: minifyProgreso(s.progresoSnapshot),
                    progresoBaseSnapshot: minifyProgreso(s.progresoBaseSnapshot)
                }))
            } : null
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
        <div className="p-8 max-w-3xl mx-auto flex flex-col gap-6 w-full animate-in fade-in zoom-in duration-300">
            <h1 className="text-3xl font-black mb-1">Configuración</h1>
            <p className="text-foreground/70 mb-4">Manejo de variables de entorno y utilidades en el dispositivo local.</p>

            <div className="bg-default-50 p-6 rounded-2xl border border-default-200 shadow-sm flex flex-col gap-5">
                <h2 className="text-xl font-bold border-b border-default-200 pb-2">Perfil y Visualización</h2>
                
                <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1">
                        <Input 
                            label="Alias" 
                            description="Tu nombre visible en la barra de navegación."
                            value={alias}
                            onValueChange={setAlias}
                            variant="bordered"
                            isDisabled={!user}
                        />
                    </div>
                    <div className="flex-1">
                        <Select 
                            label="Plan Activo General" 
                            selectedKeys={[plan]}
                            variant="bordered"
                            onSelectionChange={(keys) => {
                                const newPlan = [...keys][0];
                                if (newPlan) setPlan(newPlan);
                            }}
                        >
                            <SelectItem key="17.14" value="17.14">Plan 17.14</SelectItem>
                            <SelectItem key="17.13" value="17.13">Plan 17.13</SelectItem>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-start md:justify-end mt-2 animate-in fade-in duration-300">
                    <Button 
                        color="success" 
                        variant="flat"
                        className="font-bold w-full md:w-auto"
                        onPress={handleSave} 
                        isLoading={saving}
                        isDisabled={!user}
                        startContent={!saving && <i className="fa-solid fa-floppy-disk" />}
                    >
                        Guardar Preferencias
                    </Button>
                </div>
                {!user && <p className="text-xs text-foreground/50 self-center md:self-end pr-2 font-semibold">Iniciá sesión para habilitar personalización web en la nube.</p>}
            </div>

            <div className="bg-default-50 p-6 rounded-2xl border border-default-200 shadow-sm flex flex-col gap-4">
                <h2 className="text-xl font-bold border-b border-default-200 pb-2">Datos y Privacidad</h2>
                
                <p className="text-foreground/80 leading-relaxed text-sm">
                    Podés descargar una copia exacta de tu progreso local y simulaciones activas para el plan seleccionado. 
                    El reporte se brindará en formato JSON serializado para auditorías.
                </p>

                <div className="flex mt-2">
                    <Button 
                        variant="flat" 
                        color="primary"
                        className="font-bold w-full md:w-auto"
                        startContent={<i className="fa-solid fa-file-export"></i>}
                        onPress={handleExport}
                    >
                        Exportar Progreso (JSON)
                    </Button>
                </div>
            </div>
        </div>
    );
}
