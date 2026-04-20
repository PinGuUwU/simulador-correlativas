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
    
    // Usamos un objeto anidado con setDoc merge:true. 
    // Esto es más seguro para IDs de plan que contienen puntos (ej: "17.14")
    // ya que la notación de punto en las llaves de updateDoc los interpretaría como sub-objetos.
    const updates = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        progresoUpdatedAt: serverTimestamp(),
        progreso: {
            [plan]: progreso
        }
    };

    if (detalles) {
        updates.progresoDetalles = {
            [plan]: detalles
        };
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
    
    const configData = {};
    if (alias !== undefined) configData.alias = alias;
    if (planActivo !== undefined) configData.planActivo = planActivo;
    if (tema !== undefined) configData.tema = tema;

    const updates = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        configUpdatedAt: serverTimestamp(),
        config: configData
    };
    
    await setDoc(userRef, updates, { merge: true });
};

/**
 * Guarda una simulación del usuario.
 */
export const saveUserSimulacion = async (uid, plan, simulacion) => {
    if (!uid || !plan || !simulacion) return;

    const userRef = doc(db, 'users', uid);
    const currentUser = auth.currentUser;
    
    const updates = {
        uid: uid,
        email: currentUser?.email || "",
        schemaVersion: SCHEMA_VERSION,
        simulacionUpdatedAt: serverTimestamp(),
        simulaciones: {
            [plan]: simulacion
        }
    };
    
    await setDoc(userRef, updates, { merge: true });
};
