import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

const SCHEMA_VERSION = 1;


/**
 * Guarda el progreso del usuario de forma atómica.
 * Usamos updateDoc para asegurarnos de que la notación de punto (progreso.plan)
 * sea tratada como una ruta al mapa y no como un nombre de campo literal.
 */
export const saveUserProgreso = async (uid, plan, progreso, detalles = null) => {
    if (!uid || !plan || !progreso) return;

    const userRef = doc(db, 'users', uid);
    const currentUser = auth.currentUser;
    
    const updates = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        progresoUpdatedAt: serverTimestamp(),
        [`progreso.${plan}`]: progreso
    };

    if (detalles) {
        updates[`progresoDetalles.${plan}`] = detalles;
    }

    try {
        // updateDoc es ideal para actualizar mapas anidados sin destruir el resto del mapa
        await updateDoc(userRef, updates);
    } catch (err) {
        // Si el documento no existe (raro tras el login), lo creamos con setDoc
        if (err.code === 'not-found') {
            await setDoc(userRef, updates, { merge: true });
        } else {
            throw err;
        }
    }
};

/**
 * Recupera todo el documento del usuario actual
 */
export const getUserData = async (uid) => {
    if (!uid) return null;

    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("☁️ Datos recuperados de Firestore:", data);
        return data;
    }
    
    console.warn("⚠️ No existe el documento del usuario en Firestore.");
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
    
    const updates = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        configUpdatedAt: serverTimestamp(),
    };
    
    if (alias !== undefined) updates['config.alias'] = alias;
    if (planActivo !== undefined) updates['config.planActivo'] = planActivo;
    if (tema !== undefined) updates['config.tema'] = tema;
    
    try {
        await updateDoc(userRef, updates);
    } catch (err) {
        if (err.code === 'not-found') {
            await setDoc(userRef, updates, { merge: true });
        } else {
            throw err;
        }
    }
};
