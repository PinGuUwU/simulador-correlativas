import React, { useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button, Switch } from '@heroui/react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onConfirm }) => {
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { authError, clearAuthError } = useAuth();

    const handleLogin = async () => {
        setLoading(true);
        clearAuthError();
        try {
            const success = await onConfirm(rememberMe);
            if (success) onClose();
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

export default LoginModal;