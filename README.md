# 🎓 Simulador de Plan de Estudios - UNLu

Aplicación web interactiva diseñada para visualizar, gestionar y simular el progreso académico de la Licenciatura en Sistemas de Información (Plan 17.13) de la Universidad Nacional de Luján (UNLu). 

Más allá de una simple visualización en tabla, este proyecto integra un **motor de reglas y gestión de dependencias** basado en un Grafo Acíclico Dirigido (DAG). Calcula automáticamente las habilitaciones y bloqueos en cascada según el régimen estricto de correlatividades de la institución.

## 🧠 Arquitectura Lógica y Características Principales

El mayor desafío técnico del proyecto fue resolver la propagación de estados sin caer en bucles infinitos causados por el ciclo de vida de React y la naturaleza asincrónica de las actualizaciones de estado.

* **Fuente Única de Verdad (Single Source of Truth):** Se eliminó el estado local de los componentes hijos (`MateriaCard`), centralizando todo el mapa de progreso en el componente padre (`Tabla`). Esto evita condiciones de carrera y desincronización visual en la interfaz.
* **Motor de Correlatividades en Cascada:** Al aprobar o regularizar una materia, el sistema utiliza algoritmos recursivos (`bloquearDependencias`, `desbloquearDependencias`, `regularizarCorrelativas`) para buscar y actualizar automáticamente las materias conectadas en el grafo.
* **Paso de Borradores Mutables:** Las funciones recursivas no interactúan directamente con el estado de React. Operan sobre una copia en memoria (`nuevoProgreso`) pasada por referencia, realizando un único `setState` al finalizar el cálculo de toda la cascada para garantizar un alto rendimiento.
* **Rastreo de Nodos Modificados:** Se utiliza un array de referencias (`materiasModificadas`) que captura el camino exacto de la cascada, permitiendo re-evaluar dependencias posteriores de forma eficiente y controlada.

## 🛠️ Stack Tecnológico

* **Frontend:** React, Vite
* **Estilos y UI:** Tailwind CSS, HeroUI
* **Gestión de Estado:** React Hooks (`useState`, `useEffect`) con manejo estricto de inmutabilidad en el renderizado final.
* **Integración:** Fetch API para consumo asíncrono de datos desde un backend propio.

📈 Próximos Pasos (Roadmap)
* [ ] Implementar sistema de feedback visual dinámico (colores) basado en el estado actual de cada asignatura (Aprobado, Regular, Disponible, Bloqueado).
* [ ] Desarrollar soporte para requisitos de correlatividades en texto plano (ej. "Tener todas las materias regulares" para la Tesina).
* [ ] Integrar un panel lateral (Drawer) para visualizar el detalle de los requisitos faltantes de una materia bloqueada.
