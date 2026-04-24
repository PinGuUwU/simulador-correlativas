import React, { useState } from 'react';
import { Card, CardBody, Spinner, Chip } from '@heroui/react';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);

    // URL del reporte de Looker Studio
    const LOOKER_URL = "https://datastudio.google.com/embed/reporting/adf72036-79eb-499c-9554-67bcf3975dc9/page/vHJwF";

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground">Panel de Estadísticas Académicas</h1>
                        <Chip color="primary" variant="flat" size="sm" className="font-bold">ADMIN</Chip>
                    </div>
                    <p className="text-foreground/60">Análisis detallado de uso, progreso y fricción académica de los estudiantes.</p>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 flex items-center gap-3">
                    <i className="fa-solid fa-chart-line text-primary text-xl" />
                    <div>
                        <p className="text-[10px] uppercase font-black text-primary/70 leading-none">Actualizado</p>
                        <p className="text-xs font-bold text-primary">En tiempo real</p>
                    </div>
                </div>
            </header>

            <Card className="w-full h-[800px] border border-default-200 shadow-xl overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-default-50/50 backdrop-blur-sm z-10 gap-4">
                        <Spinner size="lg" color="primary" />
                        <p className="text-sm font-bold text-foreground/50 animate-pulse">Cargando reporte de Looker Studio...</p>
                    </div>
                )}
                <CardBody className="p-0">
                    <iframe
                        width="100%"
                        height="100%"
                        src={LOOKER_URL}
                        frameBorder="0"
                        style={{ border: 0 }}
                        allowFullScreen
                        onLoad={() => setLoading(false)}
                        title="Dashboard Académico"
                    />
                </CardBody>
            </Card>

            <footer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-default-100 border border-default-200 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <i className="fa-solid fa-users" />
                    </div>
                    <div>
                        <p className="text-xs text-default-500 font-bold uppercase tracking-wider">Tráfico</p>
                        <p className="text-sm font-black">Google Analytics 4</p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-default-100 border border-default-200 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <i className="fa-solid fa-database" />
                    </div>
                    <div>
                        <p className="text-xs text-default-500 font-bold uppercase tracking-wider">Base de Datos</p>
                        <p className="text-sm font-black">Firebase Firestore</p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-default-100 border border-default-200 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <i className="fa-solid fa-shield-halved" />
                    </div>
                    <div>
                        <p className="text-xs text-default-500 font-bold uppercase tracking-wider">Seguridad</p>
                        <p className="text-sm font-black">Acceso Restringido</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
