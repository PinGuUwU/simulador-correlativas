import { useEffect, useState } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Tabla from './Tabla';

function Dashboard() {
    const [escala, setEscala] = useState(1);
    const zoomIn = () => setEscala((prev) => Math.min(prev + 0.1, 2))
    const zoomOut = () => setEscala((prev) => Math.max(prev - 0.1, 0.2))

    const resetZoom = () => {
        if (window.innerWidth < 768) setEscala(0.4)
        else setEscala(1)
    };

    // Este useEffect se ejecuta una sola vez cuando el usuario entra a la página
    useEffect(() => {
        // Si la pantalla es de celular (menos de 768px de ancho), arrancamos alejados (40%)
        if (window.innerWidth < 768) {
            setEscala(0.4)
        }
    }, []);

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">

            {/* LA BARRA DE HERRAMIENTAS */}
            <div className="flex gap-2 p-2 bg-white shadow-sm border-b z-10 justify-center items-center">
                <button onClick={zoomOut} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold">
                    ➖
                </button>
                <span className="font-semibold text-gray-600 min-w-[60px] text-center">
                    {Math.round(escala * 100)}%
                </span>
                <button onClick={zoomIn} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold">
                    ➕
                </button>
                <button onClick={resetZoom} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold ml-4">
                    🏠 Restablecer
                </button>
            </div>

            <ScrollContainer
                className="flex-1 cursor-grab active:cursor-grabbing"
                hideScrollbars={false} // Para que se siga viendo la barrita al costado
            >
                <div className='min-w-full min-h-full w-max p-8 md:p-16'>
                    {/* LA TABLA QUE SE ESCALA */}
                    <div
                        className="origin-top mx-auto transition-transform duration-200 ease-out"
                        style={{ zoom: escala, width: 'max-content' }}
                    >
                        <Tabla />
                    </div>
                </div>

            </ScrollContainer>

        </div>
    );
}

export default Dashboard;