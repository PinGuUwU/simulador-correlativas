import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginConGoogle, logout } from '../services/authService';
import { isIntentionalAuthCancel } from '../utils/errorCodes';
import { logError } from '../services/logService';
import { trackLogin, trackLogout } from '../services/analyticsService';
import { getUserData, saveUserSimulacion } from '../services/dbService';
import { uploadPlanProgress, downloadAllProgress } from '../services/syncService';
import { addToast } from '@heroui/react';

// ============================================================================
// CONSTANTES Y HELPERS
// ============================================================================

const SESSION_KEY = 'auth_session';
const EXPIRY_SHORT = 24 * 60 * 60 * 1000;  // 24 horas
const EXPIRY_LONG = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Guarda la sesión del usuario en localStorage con una fecha de expiración.
 * @param {boolean} rememberMe - Si es true, la sesión dura 7 días; si no, 24 horas.
 */
const saveSession = (rememberMe) => {
    const expiry = Date.now() + (rememberMe ? EXPIRY_LONG : EXPIRY_SHORT);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ expiry, rememberMe }));
};

const clearSession = () => localStorage.removeItem(SESSION_KEY);

const isSessionExpired = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return true;
        const { expiry } = JSON.parse(raw);
        return Date.now() > expiry;
    } catch {
        return true;
    }
};

/**
 * Sobrescribe el localStorage local con los datos de la nube.
 * Dispara un evento 'progress-hydrated' para que la UI reaccione y se actualice.
 * @param {object} cloudData - Los datos del documento del usuario en Firestore.
 */
const hydrateLocalData = (cloudData) => {
    let hasChanged = false;

    if (cloudData?.progreso) {
        for (const [plan, progreso] of Object.entries(cloudData.progreso)) {
            const key = `progreso+${plan}`;
            const current = localStorage.getItem(key);
            const next = JSON.stringify(progreso);
            if (current !== next) {
                localStorage.setItem(key, next);
                hasChanged = true;
            }
        }
    }

    if (cloudData?.progresoDetalles) {
        for (const [plan, detalles] of Object.entries(cloudData.progresoDetalles)) {
            const key = `detalles_progreso+${plan}`;
            const current = localStorage.getItem(key);
            const next = JSON.stringify(detalles);
            if (current !== next) {
                localStorage.setItem(key, next);
                hasChanged = true;
            }
        }
    }
    
    if (cloudData?.config?.tema) {
        const current = localStorage.getItem('theme');
        if (current !== cloudData.config.tema) {
            localStorage.setItem('theme', cloudData.config.tema);
            window.dispatchEvent(new Event('storage'));
        }
    }
    
    // Solo disparamos el evento si realmente hubo cambios, para evitar re-renders innecesarios.
    if (hasChanged) {
        window.dispatchEvent(new Event('progress-hydrated'));
    }
};

// ============================================================================
// CONTEXTO
// ============================================================================

const AuthContext = createContext(null);

/**
 * Hook público para consumir el AuthContext.
 * Provee acceso al estado de autenticación, datos del usuario y funciones de login/logout/sync.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
    }
    return ctx;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Datos de Firestore (config, alias, etc.)
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [firestoreWarning, setFirestoreWarning] = useState(null);
    const [isCriticalError, setIsCriticalError] = useState(false);

    // --- Efecto Principal: Observer de Autenticación ---
    useEffect(() => {
        if (isSessionExpired()) {
            logout().catch(() => {});
            clearSession();
        }

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            try {
                if (firebaseUser && !isSessionExpired()) {
                    setUser(firebaseUser);
                    
                    // Al iniciar sesión, siempre intentamos descargar el progreso de la nube.
                    const cloudData = await downloadAllProgress(firebaseUser.uid);
                    if (cloudData) {
                        setUserData(cloudData);
                    }

                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (err) {
                console.error("Error en el observer de Auth:", err);
                logError(err, { route: 'auth/observer' });
                setFirestoreWarning('Error al sincronizar datos. Podés usar la app offline.');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // --- Funciones de Autenticación ---

    const signIn = useCallback(async (rememberMe = false) => {
        clearAuthError();
        clearFirestoreWarning();
        saveSession(rememberMe);

        try {
            const { user: loggedUser, firestoreWarning: warning } = await loginConGoogle();
            trackLogin({ userId: loggedUser.uid });
            if (warning) setFirestoreWarning(warning);

            return loggedUser;
        } catch (err) {
            clearSession();
            if (isIntentionalAuthCancel(err)) return null;

            logError(err, { route: window?.location?.pathname });
            setAuthError(err?.message ?? 'No se pudo iniciar sesión. Intentá de nuevo.');
            throw err;
        }
    }, []);

    const signOut = useCallback(async () => {
        clearAuthError();
        clearFirestoreWarning();
        try {
            await logout();
            trackLogout();
        } catch {
            // No hacemos nada si el logout de Firebase falla, la limpieza local es suficiente.
        } finally {
            clearSession();
            // El onAuthStateChanged se encargará de poner el user a null.
        }
    }, []);

    // --- Funciones de Datos y Sincronización ---

    const updateAuthProgreso = useCallback((plan, nuevoProgreso, progresoDetalles = null) => {
        // Esta función ahora solo se encarga de guardar en local.
        // La subida a la nube es responsabilidad de las funciones manuales.
        localStorage.setItem(`progreso+${plan}`, JSON.stringify(nuevoProgreso));
        if (progresoDetalles) {
            localStorage.setItem(`detalles_progreso+${plan}`, JSON.stringify(progresoDetalles));
        }
    }, []);

    const refetchUserData = useCallback(async () => {
        if (!user) return;
        try {
            const cloudData = await getUserData(user.uid);
            if (cloudData) setUserData(cloudData);
        } catch (err) {
            console.error("Error refetching user data:", err);
        }
    }, [user]);

    const enterOfflineMode = useCallback(() => {
        setIsCriticalError(false);
        setLoading(false);
    }, []);

    const clearAuthError = useCallback(() => setAuthError(null), []);
    const clearFirestoreWarning = useCallback(() => setFirestoreWarning(null), []);

    // --- Helpers para acceder a localStorage (expuestos para desacoplar) ---
    const getProgresoLocal = useCallback((plan) => {
        try {
            const data = localStorage.getItem(`progreso+${plan}`);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    }, []);

    const getProgresoDetallesLocal = useCallback((plan) => {
        try {
            const data = localStorage.getItem(`detalles_progreso+${plan}`);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    }, []);

    const getSimulacionLocal = useCallback((plan) => {
        try {
            const data = localStorage.getItem(`simulacion+${plan}`);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    }, []);

    const setSimulacionLocal = useCallback((plan, data) => {
        localStorage.setItem(`simulacion+${plan}`, JSON.stringify(data));
        if (user) {
            saveUserSimulacion(user.uid, plan, data).catch(err => {
                console.error("Error al guardar simulación en la nube:", err);
            });
        }
    }, [user]);

    // --- Valor del Contexto ---
    const value = {
        user,
        userData,
        loading,
        isAuthenticated: !!user,
        authError,
        firestoreWarning,
        isCriticalError,
        
        // Acciones
        signIn,
        signOut,
        updateAuthProgreso,
        refetchUserData,
        uploadPlanProgress,
        downloadAllProgress,
        enterOfflineMode,
        clearAuthError,
        clearFirestoreWarning,
        
        // Helpers de LocalStorage
        getProgresoLocal,
        getProgresoDetallesLocal,
        getSimulacionLocal,
        setSimulacionLocal,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
