
import { useState } from 'react';
import MateriasList from '../components/MateriasList';
import MateriasProgreso from '../components/MateriasProgreso';


function Dashboard() {
    //Estados para guardar las materias y para mostrar una imagen de cargando, además para contabilizar el progreso
    const [materias, setMaterias] = useState([])
    const [progreso, setProgreso] = useState([])

    return (
        <div className="overflow-hidden">
            <div>
                Simulador de Correlativas
                Gestioná tu progreso académico y planificá tu carrera universitaria
            </div>
            <div className='mx-5 md:mx-10 lg:mx-15'>
                <MateriasProgreso progreso={progreso} materias={materias} />
                <MateriasList progreso={progreso} setProgreso={setProgreso} materias={materias} setMaterias={setMaterias} />
            </div>
        </div>
    );
}

export default Dashboard;