import { useCallback } from 'react'
import { addToast } from '@heroui/react'
import { trackDescargaPDF } from '../../services/analyticsService'
import { logError } from '../../services/logService'

/**
 * Encapsula la lógica de generación de PDF del historial del simulador.
 * @param {Object} params
 * @param {Array}  params.historialSemestres
 * @param {string} params.plan - plan de estudio (se usa en el nombre del PDF)
 * @param {Set}    params.openedAccordions
 * @param {Function} params.setOpenedAccordions
 * @param {Function} params.setDescargandoPDF
 */
const useSimuladorPDF = ({ historialSemestres, plan, openedAccordions, setOpenedAccordions, setDescargandoPDF }) => {

    const handleDownloadPDF = useCallback(async () => {
        try {
            setDescargandoPDF(true)

            // Dynamic import of heavy libraries
            const [ { toPng }, { jsPDF } ] = await Promise.all([
                import('html-to-image'),
                import('jspdf')
            ]);

            // Abrir todos los acordeones para que el contenido sea visible en la captura
            const keysDeTodos = new Set(historialSemestres.map((_, i) => String(i)))
            const acordeonesPrevios = new Set(openedAccordions)
            setOpenedAccordions(keysDeTodos)

            // Esperar a que HeroUI termine de animar el slide-down
            await new Promise(r => setTimeout(r, 600))

            const element = document.getElementById('historial-container')
            if (!element) throw new Error('No se encontró el historial')

            const filterNodes = (node) => {
                if (node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) return false
                return true
            }

            const isDark = document.documentElement.className.includes('dark')
            const fallbackBg = isDark ? '#000000' : '#ffffff'

            const dataUrl = await toPng(element, {
                pixelRatio: 1.5,
                backgroundColor: fallbackBg,
                width: element.offsetWidth,
                height: element.offsetHeight,
                style: {
                    margin: '0',
                    maxWidth: 'none',
                    width: element.offsetWidth + 'px'
                },
                filter: filterNodes,
                cacheBust: true,
                skipFonts: true
            })

            const img = new Image()
            img.src = dataUrl
            await new Promise(resolve => { img.onload = resolve })

            const pdf = new jsPDF('p', 'pt', [img.width * 0.75, img.height * 0.75])
            pdf.addImage(dataUrl, 'PNG', 0, 0, img.width * 0.75, img.height * 0.75)
            pdf.save(`Simulacion_${plan}.pdf`)

            try { addToast({ title: '¡PDF Descargado!', description: 'Has guardado una copia de tu recorrido', color: 'success' }) } catch (_) { }
            trackDescargaPDF({ plan })

            setOpenedAccordions(acordeonesPrevios)
        } catch (err) {
            logError(err, { route: '/simulador', context: { plan } })
            try { addToast({ title: 'Error', description: 'Ocurrió un problema generando el documento.', color: 'danger' }) } catch (_) { }
        } finally {
            setDescargandoPDF(false)
        }
    }, [historialSemestres, plan, openedAccordions, setOpenedAccordions, setDescargandoPDF])

    return { handleDownloadPDF }
}

export default useSimuladorPDF
