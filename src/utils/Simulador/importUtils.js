/**
 * Utilidades para importar el progreso real del usuario al simulador.
 */

/**
 * Reconstruye el historial de semestres basándose en el progreso real y sus detalles.
 * 
 * @param {Object} progresoReal - El objeto de progreso del usuario { codigo: estado }
 * @param {Object} progresoDetalles - Detalles del progreso { codigo: { fechaRegularizacion, fechaAprobacion, ... } }
 * @param {Array} materias - Lista completa de materias del plan de estudios
 * @returns {Object} - { historial, progresoFinal, anioFinal, cuatriFinal }
 */
export const reconstruirHistorial = (progresoReal, progresoDetalles, materias) => {
    if (!progresoReal || !materias) return null;

    // 1. Filtrar materias completadas (Aprobado, Promocionado o Regular)
    const materiasCompletadas = materias.filter(m => {
        const estado = progresoReal[m.codigo];
        return estado === 'Aprobado' || estado === 'Promocionado' || estado === 'Regular';
    });

    if (materiasCompletadas.length === 0) return null;

    // 2. Intentar determinar fecha y periodo para cada materia
    const cursadas = materiasCompletadas.map(m => {
        const detalles = progresoDetalles?.[m.codigo] || {};
        const fechaStr = detalles.fechaRegularizacion || detalles.fechaAprobacion;
        
        let anio = null;
        let cuatri = null;

        if (fechaStr) {
            const fecha = new Date(fechaStr);
            if (!isNaN(fecha.getTime())) {
                anio = fecha.getFullYear();
                // Si la fecha es entre marzo (2) y agosto (7), es 1er cuatri
                // Si es entre septiembre (8) y febrero (1), es 2do cuatri
                const mes = fecha.getMonth(); // 0-indexed
                cuatri = (mes >= 2 && mes <= 7) ? '1' : '2';
                
                // Ajuste: si aprobó en Febrero (1), probablemente cursó en el 2do cuatri del año anterior
                if (mes <= 1) {
                    anio -= 1;
                    cuatri = '2';
                }
            }
        }

        return {
            ...m,
            anioReal: anio,
            cuatriReal: cuatri,
            // Guardamos el año del plan para el fallback
            anioPlan: Number(m.anio) || 1
        };
    });

    // 3. Fallback para materias sin fecha
    // Encontramos el año más antiguo registrado
    const aniosRegistrados = cursadas.filter(c => c.anioReal).map(c => c.anioReal);
    const primerAnioReal = aniosRegistrados.length > 0 ? Math.min(...aniosRegistrados) : new Date().getFullYear() - 2;

    cursadas.forEach(c => {
        if (!c.anioReal) {
            // Estimamos: Primer año real + (Año del plan - 1)
            c.anioReal = primerAnioReal + (c.anioPlan - 1);
            c.cuatriReal = '1'; // Por defecto al 1er cuatri
            c.esAproximado = true;
        }
    });

    // 4. Agrupar por Semestre (Año + Cuatri)
    const semestresMap = {};
    cursadas.forEach(c => {
        const key = `${c.anioReal}-${c.cuatriReal}`;
        if (!semestresMap[key]) {
            semestresMap[key] = {
                anioActual: c.anioReal,
                cuatri: c.cuatriReal,
                materiasDelSemestre: []
            };
        }
        semestresMap[key].materiasDelSemestre.push(c);
    });

    // 5. Ordenar semestres cronológicamente
    const llavesOrdenadas = Object.keys(semestresMap).sort((a, b) => {
        const [anioA, cuatriA] = a.split('-').map(Number);
        const [anioB, cuatriB] = b.split('-').map(Number);
        if (anioA !== anioB) return anioA - anioB;
        return cuatriA - cuatriB;
    });

    // 6. Construir historial con snapshots acumulativos
    const historial = [];
    let progresoAcumulado = {};
    // Inicializar progreso con 'No Cursado'
    materias.forEach(m => { progresoAcumulado[m.codigo] = 'No Cursado' });

    llavesOrdenadas.forEach(key => {
        const semestre = semestresMap[key];
        const progresoBaseSnapshot = { ...progresoAcumulado };
        
        // Actualizar progreso acumulado con las materias de este semestre
        semestre.materiasDelSemestre.forEach(m => {
            progresoAcumulado[m.codigo] = 'Cursado';
        });

        historial.push({
            anioActual: semestre.anioActual,
            cuatri: semestre.cuatri,
            materiasDelSemestre: semestre.materiasDelSemestre,
            progresoSnapshot: { ...progresoAcumulado },
            progresoBaseSnapshot: progresoBaseSnapshot,
            esImportado: true
        });
    });

    // 7. Calcular punto de inicio para la simulación (Siguiente cuatrimestre)
    const ultimoSemestre = historial[historial.length - 1];
    let anioFinal = ultimoSemestre.anioActual;
    let cuatriFinal = ultimoSemestre.cuatri === '1' ? '2' : '1';
    if (ultimoSemestre.cuatri === '2') {
        anioFinal += 1;
    }

    return {
        historial,
        progresoFinal: { ...progresoAcumulado },
        anioFinal,
        cuatriFinal
    };
};

export default {
    reconstruirHistorial
};
