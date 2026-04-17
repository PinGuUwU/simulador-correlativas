import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { useAuth } from '../../context/AuthContext';

const ServerError = () => {
    const { enterOfflineMode } = useAuth();

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
            <Card className="max-w-md w-full shadow-2xl border border-danger-200/50 bg-background/60 backdrop-blur-xl">
                <CardBody className="p-8 text-center flex flex-col gap-6">
                    <div className="w-20 h-20 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <i className="fa-solid fa-cloud-slash text-4xl text-danger"></i>
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-foreground">Error de Sincronización</h1>
                        <p className="text-foreground/70 text-sm leading-relaxed">
                            No logramos conectar con los servidores de Google. Esto puede deberse a problemas de red o bloqueos de firewall en tu institución.
                        </p>
                    </div>

                    <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-xl border border-warning-200/50 text-left">
                        <p className="text-xs text-warning-700 dark:text-warning-400 font-medium flex items-center gap-2">
                            <i className="fa-solid fa-circle-info"></i>
                            ¿Qué significa el Modo Offline?
                        </p>
                        <p className="text-xs text-warning-600/80 dark:text-warning-300/80 mt-1">
                            Podrás usar el simulador con normalidad y los cambios se guardarán en este dispositivo. Se sincronizarán con la nube automáticamente cuando vuelva la conexión.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button 
                            color="primary" 
                            variant="solid" 
                            size="lg" 
                            className="font-bold shadow-lg shadow-primary/30"
                            onPress={handleRetry}
                        >
                            <i className="fa-solid fa-rotate-right mr-2"></i>
                            Reintentar Conexión
                        </Button>
                        
                        <Button 
                            color="default" 
                            variant="flat" 
                            size="lg" 
                            className="font-bold"
                            onPress={enterOfflineMode}
                        >
                            <i className="fa-solid fa-plug-circle-xmark mr-2"></i>
                            Continuar Offline
                        </Button>
                    </div>
                    
                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-semibold mt-2">
                        Simulador de Correlativas v2.4
                    </p>
                </CardBody>
            </Card>
        </div>
    );
};

export default ServerError;
