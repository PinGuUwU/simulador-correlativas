import React, { useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger, Spinner, addToast } from '@heroui/react';
import { useAuth } from '../../context/AuthContext';

export default function SyncCloud({ plan }) {
    const { user, uploadPlanProgress, downloadAllProgress } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState('');

    const handleUpload = async () => {
        if (!user || !plan) return;
        setIsLoading(true);
        setAction('Guardando...');
        try {
            await uploadPlanProgress(user.uid, plan);
            addToast({ title: '¡Éxito!', description: 'Tu progreso se guardó en la nube.', color: 'success' });
        } catch (err) {
            addToast({ title: 'Error', description: 'No se pudo guardar en la nube.', color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!user) return;
        setIsLoading(true);
        setAction('Cargando...');
        try {
            const success = await downloadAllProgress(user.uid);
            if (success) {
                addToast({ title: '¡Éxito!', description: 'Se cargó tu progreso desde la nube.', color: 'success' });
                // Ya no recargamos manualmente aquí, dejamos que los eventos de downloadAllProgress 
                // y los listeners en App.jsx/usePlanData hagan su trabajo de forma reactiva.
            } else {
                addToast({ title: 'Aviso', description: 'No se encontraron datos en la nube.', color: 'warning' });
            }
        } catch (err) {
            addToast({ title: 'Error', description: 'No se pudo cargar desde la nube.', color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs font-bold text-foreground/70">{action}</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1.5 rounded-xl bg-default-100 p-1 border border-default-200">
            <Popover placement="bottom" showArrow>
                <PopoverTrigger>
                    <Button isIconOnly size="sm" variant="light" className="text-foreground/50 data-[hover=true]:bg-default-200">
                        <i className="fa-solid fa-circle-info" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="px-1 py-2 max-w-xs">
                        <div className="text-sm font-bold">Sincronización Manual</div>
                        <div className="text-xs text-foreground/70 mt-1">
                            Guardá tu progreso en la nube para usarlo en otros dispositivos, o cargá la última versión guardada.
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Button
                size="sm"
                variant="light"
                onPress={handleUpload}
                startContent={<i className="fa-solid fa-cloud-arrow-up" />}
                className="font-bold data-[hover=true]:bg-default-200"
            >
                Guardar
            </Button>
            <Button
                size="sm"
                variant="light"
                onPress={handleDownload}
                startContent={<i className="fa-solid fa-cloud-arrow-down" />}
                className="font-bold data-[hover=true]:bg-default-200"
            >
                Cargar
            </Button>
        </div>
    );
}
