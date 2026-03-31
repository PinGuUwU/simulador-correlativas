import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginConGoogle, logout } from '../services/authService';
import { isIntentionalAuthCancel } from '../utils/errorCodes';

// ─── Constantes de persistencia ────────────────────────────────────────────────
const SESSION_KEY  = 'auth_session';
const EXPIRY_SHORT = 24 * 60 * 60 * 1000;      // 24 h  (sin "Recordarme")
const EXPIRY_LONG  =  7 * 24 * 60 * 60 * 1000; //  7 d  (con "Recordarme")

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

// ─── Contexto ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
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

    // Helper para limpiar errores (útil para que la UI los descarte)
    const clearAuthError      = useCallback(() => setAuthError(null), []);
    const clearFirestoreWarning = useCallback(() => setFirestoreWarning(null), []);

    // ─── Observer de Firebase ─────────────────────────────────────────────────
    useEffect(() => {
        if (isSessionExpired()) {
            logout().catch(() => {});
            clearSession();
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                if (isSessionExpired()) {
                    logout().catch(() => {});
                    clearSession();
                    setUser(null);
                } else {
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
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
            const { firestoreWarning: warning } = await loginConGoogle();

            // Firestore puede haber fallado aunque Auth sea exitoso
            if (warning) setFirestoreWarning(warning);

        } catch (err) {
            clearSession(); // revertimos el saveSession preventivo

            // Cancelación intencional: no mostrar error al usuario
            if (isIntentionalAuthCancel(err)) return;

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
        } catch {
            // El signOut raramente falla; si lo hace simplemente limpiamos local
        } finally {
            clearSession();
            setUser(null);
        }
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        // Estados de error para consumo en componentes
        authError,
        firestoreWarning,
        clearAuthError,
        clearFirestoreWarning,
        // Acciones
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
 * }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    }
    return ctx;
}
