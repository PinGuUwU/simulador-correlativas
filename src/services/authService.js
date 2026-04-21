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
    createdAt:      serverTimestamp(),
    schemaVersion:  SCHEMA_VERSION,
});

/**
 * Extrae progreso local significativo del localStorage para subir a la nube
 * cuando un usuario nuevo se registra (migración de invitado a cuenta).
 */
const getMeaningfulLocalProgress = () => {
    const localData = {};
    let hasMeaningfulData = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('progreso+')) {
            const plan = key.split('+')[1];
            const data = JSON.parse(localStorage.getItem(key));
            localData[plan] = data;
            if (Object.values(data).some(s => ['Aprobado', 'Regular', 'Cursando', 'Promocionado'].includes(s))) {
                hasMeaningfulData = true;
            }
        }
    }
    return hasMeaningfulData ? localData : null;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Abre el popup de Google OAuth y autentica al usuario en Firebase Auth.
 * Si es la primera vez que ingresa, crea su documento en Firestore.
 *
 * @returns {Promise<{ user: import("firebase/auth").User, firestoreWarning: string | null }>}
 * @throws {import("../utils/errorCodes").AppError} Si falla el paso de Auth
 */
export const loginConGoogle = async () => {
    let result;
    try {
        result = await signInWithPopup(auth, provider);
    } catch (authError) {
        const appError = mapFirebaseError(authError);
        throw appError ?? { code: authError?.code, message: null, originalError: authError };
    }

    const user = result.user;

    if (!user?.uid) {
        return { user, firestoreWarning: 'No se recibió un UID válido del proveedor.' };
    }

    let firestoreWarning = null;
    try {
        const userRef  = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const newUserDoc = buildUserDoc(user);

            const localProgress = getMeaningfulLocalProgress();
            if (localProgress) {
                newUserDoc.progreso = {};
                newUserDoc.progresoDetalles = {};
                for (const [plan, prog] of Object.entries(localProgress)) {
                    newUserDoc.progreso[plan] = prog;
                    const detalles = JSON.parse(localStorage.getItem(`detalles_progreso+${plan}`));
                    if (detalles) {
                        newUserDoc.progresoDetalles[plan] = detalles;
                    }
                }
            }

            await setDoc(userRef, newUserDoc);
        }
    } catch (firestoreError) {
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