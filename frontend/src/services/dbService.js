import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SCHEMA_VERSION = 1;

/**
 * Guarda el progreso del usuario usando notación de punto para no sobrescribir otros planes
 * Utiliza serverTimestamp() para garantizar precisión desde el servidor y no del cliente
 */
export const saveUserProgreso = async (uid, plan, progreso) => {
    if (!uid || !plan || !progreso) return;

    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
        [`progreso.${plan}`]: progreso,
        progresoUpdatedAt: serverTimestamp(),
        schemaVersion: SCHEMA_VERSION
    });
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
    const { alias, planActivo, tema } = config;
    
    const updates = {
        configUpdatedAt: serverTimestamp(),
        schemaVersion: SCHEMA_VERSION
    };
    
    // Solo agregamos las variables si están presentes en la config
    if (alias !== undefined) updates['config.alias'] = alias;
    if (planActivo !== undefined) updates['config.planActivo'] = planActivo;
    if (tema !== undefined) updates['config.tema'] = tema;
    
    await updateDoc(userRef, updates);
};
