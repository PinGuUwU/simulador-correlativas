/**
 * projectionUtils.js
 * Lógica para calcular la proyección dinámica de la carrera.
 */

export const calculateProjection = ({
    materias,
    historialSemestres,
    progresoBase,
    cuatriActual,
    anioActual
}) => {
    const items = {}; 
    const labels = {};
    const materiasRestantes = [...materias];
    
    // 1. Mapear materias ya aprobadas (Pasado)
    const colocadas = new Set();
    historialSemestres.forEach((semestre, index) => {
        const col = index + 1;
        labels[col] = `C${semestre.cuatri} ${semestre.anioActual}`;
        
        semestre.materiasDelSemestre.forEach(m => {
            if (semestre.progresoSnapshot[m.codigo] === 'Cursado') {
                items[m.codigo] = { 
                    columna: col, 
                    estado: 'Aprobada'
                };
                colocadas.add(m.codigo);
            }
        });
    });

    let turn = historialSemestres.length + 1;
    let currentCuatri = cuatriActual;
    let currentAnio = anioActual;

    // 2. Procesar el Cuatrimestre Actual (Presente)
    labels[turn] = `C${currentCuatri} ${currentAnio}`;
    const disponiblesAhora = new Set();

    materiasRestantes.forEach(m => {
        if (colocadas.has(m.codigo)) return;
        
        const correlativasCumplidas = (m.correlativas || []).every(c => colocadas.has(c));
        const paridadCorrecta = Number(m.cuatrimestre) % 2 === Number(currentCuatri) % 2;

        // Regla Tesina
        let cumpleTesina = true;
        if (m.tesis) {
            const otrasPendientes = materias.some(mat => !mat.tesis && !colocadas.has(mat.codigo));
            if (otrasPendientes) cumpleTesina = false;
        }

        if (correlativasCumplidas && paridadCorrecta && cumpleTesina) {
            disponiblesAhora.add(m.codigo);
            items[m.codigo] = {
                columna: turn,
                estado: 'Presente'
            };
        }
    });

    // 3. Proyectar el Futuro
    let proyectadasAprobadas = new Set([...colocadas, ...disponiblesAhora]);
    let turnFuturo = turn + 1;
    let fCuatri = currentCuatri === '1' ? '2' : '1';
    let fAnio = currentCuatri === '2' ? currentAnio + 1 : currentAnio;

    let loopSafety = 0;
    while (proyectadasAprobadas.size < materias.length && loopSafety < 50) {
        loopSafety++;
        labels[turnFuturo] = `C${fCuatri} ${fAnio}*`;
        let nuevasEnEsteTurno = [];

        materiasRestantes.forEach(m => {
            if (items[m.codigo]) return;

            const correlativasCumplidas = (m.correlativas || []).every(c => proyectadasAprobadas.has(c));
            const paridadCorrecta = Number(m.cuatrimestre) % 2 === Number(fCuatri) % 2;

            let cumpleTesina = true;
            if (m.tesis) {
                const otrasPendientes = materias.some(mat => !mat.tesis && !proyectadasAprobadas.has(mat.codigo));
                if (otrasPendientes) cumpleTesina = false;
            }

            if (correlativasCumplidas && paridadCorrecta && cumpleTesina) {
                items[m.codigo] = {
                    columna: turnFuturo,
                    estado: 'Proyectada'
                };
                nuevasEnEsteTurno.push(m.codigo);
            }
        });

        nuevasEnEsteTurno.forEach(c => proyectadasAprobadas.add(c));
        
        turnFuturo++;
        fCuatri = fCuatri === '1' ? '2' : '1';
        if (fCuatri === '1') fAnio++;
        
        if (nuevasEnEsteTurno.length === 0 && loopSafety > 20) break;
    }

    // 4. Postergadas
    materias.forEach(m => {
        if (!items[m.codigo]) {
            items[m.codigo] = {
                columna: turnFuturo,
                estado: 'Bloqueado'
            };
            labels[turnFuturo] = 'Postergado';
        }
    });

    return { items, labels, maxCol: Math.max(...Object.keys(labels).map(Number), 0) };
};
