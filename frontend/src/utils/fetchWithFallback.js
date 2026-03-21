/**
 * Attempts to fetch from URL1, and if no response is received in the given timeout,
 * it attempts to fetch from URL2.
 * 
 * @param {string} endpoint - The API endpoint to append to the base URLs.
 * @param {RequestInit} options - Fetch options.
 * @param {number} timeoutMs - Timeout in milliseconds (default 5000).
 * @returns {Promise<Response>}
 */
export const fetchWithFallback = async (endpoint, options = {}, timeoutMs = 5000) => {
    const url1 = `${import.meta.env.VITE_BACKEND_URL1}${endpoint}`;
    const url2 = `${import.meta.env.VITE_BACKEND_URL2}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log(`Intentando fetch primario: ${url1}`);
        const response = await fetch(url1, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Si el error es un aborto (timeout) o falla la conexión, intentamos el secundario
        console.warn(`Fetch primario falló o superó el tiempo de espera (${timeoutMs}ms). Probando con backup: ${url2}`);
        
        try {
            const fallbackResponse = await fetch(url2, options);
            return fallbackResponse;
        } catch (fallbackError) {
            console.error("Ambos fetch fallaron.");
            throw fallbackError;
        }
    }
};
