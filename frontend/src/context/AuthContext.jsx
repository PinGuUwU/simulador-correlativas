import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginConGoogle, logout } from '../services/authService';
import { isIntentionalAuthCancel } from '../utils/errorCodes';
import { logError } from '../services/logService';
import { trackLogin, trackLogout } from '../services/analyticsService';
import { getUserData } from '../services/dbService';
import { syncProgreso } from '../services/syncService';

// ─── Constantes de persistencia ────────────────────────────────────────────────
const SESSION_KEY = 'auth_session';
const EXPIRY_SHORT = 24 * 60 * 60 * 1000;      // 24 h  (sin "Recordarme")
const EXPIRY_LONG = 7 * 24 * 60 * 60 * 1000; //  7 d  (con "Recordarme")

// ─── Helpers de localStorage ────────────────────────────────────────────────────
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

const getLocalProgress = () => {
    const localData = {};
    let hasMeaningfulData = false;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('progreso+')) {
            const plan = key.split('+')[1];
            try {
                const data = JSON.parse(localStorage.getItem(key));
                localData[plan] = data;
                
                const values = Object.values(data || {});
                if (values.some(v => ['Aprobado', 'Regular', 'Cursado'].includes(v))) {
                    hasMeaningfulData = true;
                }
            } catch {
                // Ignore parse errors
            }
        }
    }

    return hasMeaningfulData ? localData : null;
};

const hydrateLocalData = (cloudData) => {
    if (cloudData?.progreso) {
        for (const [plan, progreso] of Object.entries(cloudData.progreso)) {
            localStorage.setItem(`progreso+${plan}`, JSON.stringify(progreso));
        }
    }
    
    if (cloudData?.config?.tema) {
        localStorage.setItem('theme', cloudData.config.tema);
        window.dispatchEvent(new Event('storage'));
    }
    
    window.dispatchEvent(new Event('progress-hydrated'));
};

// ─── Contexto ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Para guardar config, alias, etc.
    const [loading, setLoading] = useState(true);
    /**
     * authError: mensaje legible para mostrar al usuario (no un código técnico).
     * null = sin error activo.
     */
    const [authError, setAuthError] = useState(null);
    /**
     * firestoreWarning: aviso no-intrusivo cuando Firestore falla pero Auth ok.
     * null = sin aviso activo.
     */
    const [firestoreWarning, setFirestoreWarning] = useState(null);

    const [showSyncModal, setShowSyncModal] = useState(false);
    const [pendingSyncData, setPendingSyncData] = useState(null);

    // Helper para limpiar errores (útil para que la UI los descarte)
    const clearAuthError = useCallback(() => setAuthError(null), []);
    const clearFirestoreWarning = useCallback(() => setFirestoreWarning(null), []);

    // Funciones globales para evitar el asiduo uso disperso de localStorage
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
    }, []);

    // ─── Observer de Firebase ─────────────────────────────────────────────────
    useEffect(() => {
        if (isSessionExpired()) {
            logout().catch(() => { });
            clearSession();
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                if (isSessionExpired()) {
                    logout().catch(() => { });
                    clearSession();
                    setUser(null);
                    setLoading(false);
                } else {
                    setUser(firebaseUser);
                    
                    try {
                        const cloudData = await getUserData(firebaseUser.uid);
                        if (cloudData) setUserData(cloudData);

                        const localProgress = getLocalProgress();
                        const hasCloudProgress = cloudData?.progreso && Object.keys(cloudData.progreso).length > 0;

                        if (localProgress && hasCloudProgress) {
                            setPendingSyncData({ local: localProgress, cloud: cloudData });
                            setShowSyncModal(true);
                        } else if (localProgress && !hasCloudProgress) {
                            for (const [plan, prog] of Object.entries(localProgress)) {
                                syncProgreso(firebaseUser.uid, plan, prog);
                            }
                            if (cloudData?.config) hydrateLocalData({ config: cloudData.config });
                        } else if (!localProgress && hasCloudProgress) {
                            hydrateLocalData(cloudData);
                        } else {
                            if (cloudData?.config) hydrateLocalData({ config: cloudData.config });
                        }
                    } catch (err) {
                        logError(err, { route: 'auth/hydration' });
                    }
                    
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // ─── Acciones expuestas ───────────────────────────────────────────────────

    /**
     * Inicia sesión con Google OAuth (popup).
     *
     * ⚠️  saveSession se llama ANTES del popup para evitar la race condition
     * con onAuthStateChanged (ver comentario en authService).
     *
     * Manejo de errores:
     * - Cancelación intencional (popup cerrado) → silencioso, sin toast
     * - Error de Auth                           → setAuthError con mensaje humano
     * - Error de Firestore                      → setFirestoreWarning (no-intrusivo)
     *
     * @param {boolean} rememberMe - true → sesión de 7 días, false → 24 horas
     * @returns {Promise<void>}
     */
    const signIn = useCallback(async (rememberMe = false) => {
        setAuthError(null);
        setFirestoreWarning(null);

        // Guardar sesión ANTES del popup (fix race condition con onAuthStateChanged)
        saveSession(rememberMe);

        try {
            const { user: loggedUser, firestoreWarning: warning } = await loginConGoogle();

            trackLogin({ userId: loggedUser.uid });

            if (warning) setFirestoreWarning(warning);

            return loggedUser;

        } catch (err) {
            clearSession(); // revertimos el saveSession preventivo

            // Cancelación intencional: no mostrar error al usuario
            if (isIntentionalAuthCancel(err)) return null;

            // Loguea en Firestore (fire-and-forget, nunca rompe la app)
            logError(err, { route: window?.location?.pathname });

            // Error real: exponemos un mensaje legible
            setAuthError(
                err?.message ?? 'No se pudo iniciar sesión. Intentá de nuevo.'
            );

            throw err; // re-lanzamos para que el NavBar pueda resetear su loading
        }
    }, []);

    /**
     * Cierra la sesión del usuario.
     *
     * @returns {Promise<void>}
     */
    const signOut = useCallback(async () => {
        setAuthError(null);
        setFirestoreWarning(null);
        try {
            await logout();
            trackLogout();
        } catch {
            // El signOut raramente falla; si lo hace simplemente limpiamos local
        } finally {
            clearSession();
            setUser(null);
        }
    }, []);

    const resolveSync = useCallback((choice) => {
        if (!pendingSyncData || !user) return;
        
        if (choice === 'upload') {
            for (const [plan, data] of Object.entries(pendingSyncData.local)) {
                syncProgreso(user.uid, plan, data);
            }
        } else if (choice === 'download') {
            hydrateLocalData(pendingSyncData.cloud);
        }
        
        setShowSyncModal(false);
        setPendingSyncData(null);
    }, [pendingSyncData, user]);

    const updateAuthProgreso = useCallback((plan, nuevoProgreso, progresoDetalles = null) => {
        localStorage.setItem(`progreso+${plan}`, JSON.stringify(nuevoProgreso));
        if (progresoDetalles) {
            localStorage.setItem(`detalles_progreso+${plan}`, JSON.stringify(progresoDetalles));
        }
        
        if (user) {
            syncProgreso(user.uid, plan, nuevoProgreso); // Nota: idealmente también sincronizaríamos detalles
        }
    }, [user]);

    // Setter para forzar en refresco de configuraciones
    const refetchUserData = useCallback(async () => {
        if (!user) return;
        try {
            const cloudData = await getUserData(user.uid);
            if (cloudData) setUserData(cloudData);
        } catch {}
    }, [user]);

    const value = {
        user,
        userData,
        loading,
        isAuthenticated: !!user,
        showSyncModal,
        setShowSyncModal,
        resolveSync,
        updateAuthProgreso,
        getProgresoLocal,
        getProgresoDetallesLocal,
        getSimulacionLocal,
        setSimulacionLocal,
        refetchUserData,
        authError,
        firestoreWarning,
        clearAuthError,
        clearFirestoreWarning,
        signIn,
        signOut,
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

// ─── Hook público ────────────────────────────────────────────────────────────────
/**
 * Consume el AuthContext. Debe usarse dentro de <AuthProvider>.
 *
 * @returns {{
 *   user: import("firebase/auth").User | null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   authError: string | null,
 *   firestoreWarning: string | null,
 *   clearAuthError: () => void,
 *   clearFirestoreWarning: () => void,
 *   signIn: (rememberMe?: boolean) => Promise<void>,
 *   signOut: () => Promise<void>,
 *   showSyncModal: boolean,
 *   setShowSyncModal: (show: boolean) => void,
 *   resolveSync: (choice: 'upload' | 'download') => void,
 *   updateAuthProgreso: (plan: string, nuevoProgreso: object, progresoDetalles?: object) => void,
 *   getProgresoLocal: (plan: string) => object | null,
 *   getProgresoDetallesLocal: (plan: string) => object | null,
 *   getSimulacionLocal: (plan: string) => object | null,
 *   setSimulacionLocal: (plan: string, data: object) => void,
 *   userData: object | null,
 *   refetchUserData: () => Promise<void>
 * }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    }
    return ctx;
}