import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { mapFirebaseError } from "../utils/errorCodes";

const provider = new GoogleAuthProvider();

// ─── Schema del documento de usuario ─────────────────────────────────────────
// Solo almacenamos lo estrictamente necesario. Nunca guardamos tokens,
// contraseñas ni información sensible del objeto User de Firebase.
const SCHEMA_VERSION = 1;

/**
 * Construye el documento de usuario para Firestore.
 * Existe como función separada para facilitar futuras migraciones de schema.
 *
 * @param {import("firebase/auth").User} user
 * @returns {Object} Documento listo para setDoc
 */
const buildUserDoc = (user) => ({
    uid:            user.uid,
    email:          user.email,
    displayName:    user.displayName,
    photoURL:       user.photoURL,
    materiasAprobadas: [],
    // serverTimestamp() garantiza integridad del tiempo (hora del servidor,
    // no del cliente) y es inmune a relojes del dispositivo mal configurados.
    createdAt:      serverTimestamp(),
    schemaVersion:  SCHEMA_VERSION,
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Abre el popup de Google OAuth y autentica al usuario en Firebase Auth.
 * Si es la primera vez que ingresa, crea su documento en Firestore.
 *
 * La escritura en Firestore es una operación secundaria: si falla (ej: por
 * reglas de seguridad o falta de red), el login de Auth igual se completa.
 * El error de Firestore se reporta en el estado `firestoreWarning` del contexto
 * para que la UI pueda mostrar un aviso no-intrusivo.
 *
 * @returns {Promise<{ user: import("firebase/auth").User, firestoreWarning: string | null }>}
 * @throws {import("../utils/errorCodes").AppError} Si falla el paso de Auth (no el de Firestore)
 */
export const loginConGoogle = async () => {
    // ── Paso 1: Auth ─────────────────────────────────────────────────────────
    // Fail fast: si el popup falla o el usuario cancela, lanzamos AppError.
    // El contexto decide si mostrar o no el error al usuario.
    let result;
    try {
        result = await signInWithPopup(auth, provider);
    } catch (authError) {
        const appError = mapFirebaseError(authError);
        // mapFirebaseError devuelve null para cancelaciones intencionales.
        // En ese caso lanzamos un objeto con code para que el caller lo identifique.
        throw appError ?? { code: authError?.code, message: null, originalError: authError };
    }

    const user = result.user;

    // ── Paso 2: Firestore (secundario, no bloquea el login) ──────────────────
    // Fail fast: validamos que tenemos uid antes de intentar la escritura.
    if (!user?.uid) {
        return { user, firestoreWarning: 'No se recibió un UID válido del proveedor.' };
    }

    let firestoreWarning = null;
    try {
        const userRef  = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, buildUserDoc(user));
        }
    } catch (firestoreError) {
        // El login es exitoso; solo marcamos el warning para la UI.
        const mapped = mapFirebaseError(firestoreError);
        firestoreWarning = mapped?.message ?? 'No se pudo sincronizar el perfil. Seguís conectado.';
    }

    return { user, firestoreWarning };
};

/**
 * Cierra la sesión del usuario en Firebase Auth.
 *
 * @returns {Promise<void>}
 * @throws {import("../utils/errorCodes").AppError}
 */
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (err) {
        throw mapFirebaseError(err) ?? err;
    }
};