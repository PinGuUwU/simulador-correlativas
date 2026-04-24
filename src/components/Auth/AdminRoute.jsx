import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '@heroui/react';

const AdminRoute = ({ children }) => {
    const { user, userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner size="lg" color="primary" label="Verificando permisos..." />
            </div>
        );
    }

    if (!user || userRole !== 'admin') {
        return <Navigate to="/inicio" replace />;
    }

    return children;
};

export default AdminRoute;
