import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
export const app = initializeApp(firebaseConfig);
if (import.meta.env.DEV) console.log("[Firebase] App inicializada. MeasurementID:", firebaseConfig.measurementId);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Lazy inicialización de analytics
export let analytics = null;
if (typeof window !== "undefined") {
    if (import.meta.env.DEV) console.log("[Firebase] Intentando cargar Analytics...");
    import("firebase/analytics")
        .then(({ getAnalytics }) => {
            if (import.meta.env.DEV) console.log("[Firebase] SDK de Analytics importado");
            analytics = getAnalytics(app);
            if (import.meta.env.DEV) console.log("[Firebase] Analytics inicializado correctamente:", analytics);
        })
        .catch((err) => {
            if (import.meta.env.DEV) console.error("[Firebase] Error cargando analytics:", err);
        });
}