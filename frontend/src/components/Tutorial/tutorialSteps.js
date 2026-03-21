// =====================================================================
//  PASOS DEL TUTORIAL - Solo se muestran en ESCRITORIO (desktop)
//  Cada paso apunta a un elemento por su ID en el DOM.
//
//  scrollMargin: cuántos px dejamos arriba del elemento al hacer scroll.
//    - Un valor más alto = el elemento queda más abajo en pantalla
//    - Un valor de 0 = el elemento queda pegado al borde superior
//    - Default: 180px
// =====================================================================

export const getProgresoSteps = () => [
    {
        targetId: 'progreso-total',
        title: 'Tu Progreso General',
        icon: 'fa-chart-pie',
        content: 'Aquí puedes ver el avance total de tu carrera, indicando el porcentaje de materias completadas.',
        placement: 'bottom',
        scrollMargin: 300,
    },
    {
        targetId: 'materia-card-ejemplo',
        title: 'Detalles de la Materia',
        icon: 'fa-circle-info',
        content: 'Sin estar en el modo edición, haz click sobre una materia para ver su detalle: correlativas requeridas, para cuáles te habilita, etc.',
        placement: 'right',
        scrollMargin: 400,
    },
    {
        targetId: 'wrapper-switch-modo-edicion',
        title: 'Activar Modo Edición',
        icon: 'fa-pen-to-square',
        content: 'Este switch habilita el control de tu progreso. Al activarlo, podrás marcar directamente qué materias has aprobado o regularizado mediante las tarjetas.',
        placement: 'bottom',
        scrollMargin: 250,
    },
    {
        targetId: 'wrapper-btn-mostrar-todos',
        title: 'Organización Visual',
        icon: 'fa-layer-group',
        content: 'Usa este botón para expandir u ocultar todos los años de la carrera a la vez y encontrar materias más rápido.',
        placement: 'bottom',
        scrollMargin: 250,
    },
    {
        targetId: 'tabs-filtro-anio',
        title: 'Filtrar por Año',
        icon: 'fa-filter',
        content: 'Navega entre los años de tu carrera usando estas pestañas para ver solo las materias que te interesan.',
        placement: 'bottom',
        scrollMargin: 460,
    },
    {
        targetId: 'wrapper-btn-reset-progreso',
        title: 'Reestablecer Progreso',
        icon: 'fa-rotate-left',
        content: 'Si te equivocas o quieres empezar de nuevo, puedes reestablecerlo aquí. Tu avance se guarda automáticamente en tu navegador.',
        placement: 'bottom',
        scrollMargin: 300,
    },
    {
        targetId: 'selector-plan-desktop',
        title: 'Cambiar de Plan',
        icon: 'fa-book-open',
        content: 'Desde el menú puedes cambiar entre planes de estudio disponibles (ej: 17.14 o 17.13).',
        placement: 'right',
    },
    {
        targetId: 'selector-tema-desktop',
        title: 'Personalización Visual',
        icon: 'fa-palette',
        content: 'Elige el estilo visual (tema) que más te guste para personalizar la interfaz.',
        placement: 'right',
    },
    {
        targetId: 'btn-ver-tutorial-desktop',
        title: 'Repetir el Tutorial',
        icon: 'fa-circle-question',
        content: 'Cuando quieras, podés volver a ver este tutorial desde aquí. ¡Ya sos un experto/a usando la página!',
        placement: 'right',
    },
];
