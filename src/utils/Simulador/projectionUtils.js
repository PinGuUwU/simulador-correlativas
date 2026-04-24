/**
 * projectionUtils.js
 * Lógica para calcular la proyección dinámica de la carrera.
 */

export const calculateProjection = ({
    materias,
    historialSemestres,
    progresoSimulado,
    cuatriActual,
    anioActual
}) => {
    const projection = {}; // codigo -> { columna, estado }
    const materiasRestantes = [...materias];
    
    // 1. Mapear materias ya aprobadas en el historial (Pasado)
    historialSemestres.forEach((semestre, index) => {
        semestre.materiasDelSemestre.forEach(m => {
            if (semestre.progresoSnapshot[m.codigo] === 'Cursado') {
                projection[m.codigo] = { 
                    columna: index + 1, 
                    estado: 'Aprobada',
                    labelCol: `C${semestre.cuatri} ${semestre.anioActual}`
                };
            }
        });
    });

    const materiasAprobadasCount = Object.keys(projection).length;
    let turn = historialSemestres.length + 1;
    let currentCuatri = cuatriActual;
    let currentAnio = anioActual;

    // Materias que el usuario ya seleccionó en el cuatrimestre actual
    const seleccionadasAhora = new Set();
    const disponiblesAhora = new Set();

    // 2. Procesar el Cuatrimestre Actual (Presente)
    const colocadas = new Set(Object.keys(projection));
    
    // Identificar qué materias PODRÍAN cursarse ahora (correlativas + paridad)
    materiasRestantes.forEach(m => {
        if (colocadas.has(m.codigo)) return;
        
        const correlativasCumplidas = (m.correlativas || []).every(c => colocadas.has(c));
        const paridadCorrecta = Number(m.cuatrimestre) % 2 === Number(currentCuatri) % 2;

        if (correlativasCumplidas && paridadCorrecta) {
            disponiblesAhora.add(m.codigo);
            const estaSeleccionada = progresoSimulado[m.codigo] === 'Cursado';
            
            projection[m.codigo] = {
                columna: turn,
                estado: estaSeleccionada ? 'Seleccionada' : 'Disponible',
                labelCol: `C${currentCuatri} ${currentAnio}`
            };
            
            if (estaSeleccionada) {
                seleccionadasAhora.add(m.codigo);
            }
        }
    });

    // 3. Proyectar el Futuro y el Resto (Gris/Bloqueado)
    // Para la proyección, asumimos que las "Seleccionadas" se aprueban
    let proyectadasAprobadas = new Set([...colocadas, ...seleccionadasAhora]);
    let turnFuturo = turn + 1;
    let fCuatri = currentCuatri === '1' ? '2' : '1';
    let fAnio = currentCuatri === '2' ? currentAnio + 1 : currentAnio;

    let loopSafety = 0;
    while (proyectadasAprobadas.size < materias.length && loopSafety < 100) {
        loopSafety++;
        let huboCambios = false;

        materiasRestantes.forEach(m => {
            if (projection[m.codigo]) return; // Ya colocada en pasado o presente

            const correlativasCumplidas = (m.correlativas || []).every(c => proyectadasAprobadas.has(c));
            const paridadCorrecta = Number(m.cuatrimestre) % 2 === Number(fCuatri) % 2;

            if (correlativasCumplidas && paridadCorrecta) {
                projection[m.codigo] = {
                    columna: turnFuturo,
                    estado: 'Proyectada',
                    labelCol: `C${fCuatri} ${fAnio}*`
                };
                huboCambios = true;
            }
        });

        // Para el siguiente paso de la proyección, asumimos que todas las proyectadas en este turno se aprueban
        let nuevasAprobadas = false;
        Object.keys(projection).forEach(codigo => {
            if (projection[codigo].columna === turnFuturo) {
                proyectadasAprobadas.add(codigo);
                nuevasAprobadas = true;
            }
        });

        turnFuturo++;
        fCuatri = fCuatri === '1' ? '2' : '1';
        if (fCuatri === '1') fAnio++;
        
        if (!nuevasAprobadas && loopSafety > 20) {
             // Si no logramos colocar nada nuevo en varios turnos, salimos para evitar bucle
             break;
        }
    }

    // 4. Asegurar que TODAS las materias tengan una posición (Incluso las que no entran en la proyección ideal)
    // Estas son materias que quedaron bloqueadas por no elegir sus correlativas en el paso actual
    materias.forEach(m => {
        if (!projection[m.codigo]) {
            projection[m.codigo] = {
                columna: turnFuturo + 1,
                estado: 'Bloqueado',
                labelCol: 'Postergado'
            };
        }
    });

    return projection;
};
