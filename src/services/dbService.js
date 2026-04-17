import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

const SCHEMA_VERSION = 1;

/**
 * Guarda el progreso del usuario usando setDoc con merge para crear el doc si no existe.
 * Incluimos UID y Email para que las reglas de validación (isValidUserDoc) pasen en caso de creación.
 */
export const saveUserProgreso = async (uid, plan, progreso, detalles = null) => {
    if (!uid || !plan || !progreso) return;

    const userRef = doc(db, 'users', uid);
    const currentUser = auth.currentUser;
    
    // Si el documento se está creando por primera vez, necesitamos estos campos para las reglas
    const baseData = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        progresoUpdatedAt: serverTimestamp(),
    };

    const updates = {
        ...baseData,
        [`progreso.${plan}`]: progreso,
    };

    // Si hay detalles (fechas, intentos), también los guardamos en su campo correspondiente
    if (detalles) {
        updates[`progresoDetalles.${plan}`] = detalles;
    }

    await setDoc(userRef, updates, { merge: true });
};

/**
 * Recupera todo el documento del usuario actual
 */
export const getUserData = async (uid) => {
    if (!uid) return null;

    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
        return docSnap.data();
    }
    
    return null;
};

/**
 * Guarda alias, plan activo y tema en la configuración del usuario
 */
export const updateUserConfig = async (uid, config) => {
    if (!uid || !config) return;

    const userRef = doc(db, 'users', uid);
    const currentUser = auth.currentUser;
    const { alias, planActivo, tema } = config;
    
    const baseData = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        configUpdatedAt: serverTimestamp(),
    };

    const updates = { ...baseData };
    
    // Solo agregamos las variables si están presentes en la config usando notación de puntos
    if (alias !== undefined) updates['config.alias'] = alias;
    if (planActivo !== undefined) updates['config.planActivo'] = planActivo;
    if (tema !== undefined) updates['config.tema'] = tema;
    
    await setDoc(userRef, updates, { merge: true });
};
