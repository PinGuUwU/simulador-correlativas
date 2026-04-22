# Datos del Simulador de Correlativas

Este directorio contiene los archivos de datos estáticos que alimentan toda la aplicación.

> [!IMPORTANT]
> JSON no soporta comentarios nativos. Este archivo documenta la estructura de cada `.json` para facilitar su mantenimiento.

---

## `sistemas.json`

Contiene los planes de estudio de la carrera **Licenciatura en Sistemas de Información**.

**Estructura:** Array de objetos `Plan`.

```jsonc
[
  {
    "plan_numero": "17.13",           // Identificador único del plan
    "carrera": "Licenciatura en ...",  // Nombre completo de la carrera
    "materias": [                     // Array de materias del plan
      {
        "codigo": "11071",            // Código único de la materia (usado como ID en toda la app)
        "nombre": "Introducción ...", // Nombre completo
        "anio": "1",                  // Año académico (1-6)
        "cuatrimestre": "1",          // Cuatrimestre absoluto (1-11)
        "horas_semanales": "6",       // Carga horaria semanal
        "horas_totales": "96",        // Carga horaria total
        "correlativas": ["11072"],    // Códigos de materias que son correlativas (prerequisitos)
        "notas": ["(7)"],             // Referencias a notas del plan de estudios oficial

        // --- Campos opcionales ---
        "tesis": true,                // true si es la tesina/trabajo final
        "taller": true,               // true si es un taller (no suma horas al total)
        "es_optativa": true,          // true si es una materia optativa
        "mostrarCodigo": false        // false para ocultar el código en la UI (ej: códigos internos)
      }
    ]
  }
]
```

**Planes disponibles:**
| Plan | Descripción |
|------|-------------|
| `17.13` | Plan anterior (origen para equivalencias) |
| `17.14` | Plan vigente (destino para equivalencias) |

---

## `equivalencias.json`

Define el mapeo de equivalencias **del Plan 17.14 hacia el Plan 17.13**.

**Estructura:** Objeto donde:
- **Clave** → Código de materia del **Plan 17.14** (destino)
- **Valor** → Array de códigos de materias del **Plan 17.13** (origen)

```jsonc
{
  // La materia 11271 del Plan 17.14 equivale a la materia 11071 del Plan 17.13
  "11271": ["11071"],

  // La materia 13021 del Plan 17.14 requiere AMBAS materias del Plan 17.13
  "13021": ["11072", "11073"],

  // Materias con códigos internos también se mapean
  "AO-1714": ["OP1", "OP2", "OP3"]
}
```

> [!WARNING]
> **La clave DEBE ser un código que exista en el plan 17.14 de `sistemas.json`.**
> Si la clave no coincide con ningún `codigo` del plan 17.14, la equivalencia NO aparecerá en la página.
> Los valores deben ser códigos existentes en el plan 17.13.

**Lógica de resolución:**
- Si una materia del plan 17.14 **tiene entrada** en este JSON → se muestra con sus materias origen.
- Si **no tiene entrada** → se busca coincidencia por código directo (mismo código en ambos planes).
- Si no se encuentra en ningún lado → aparece como "Sin origen (Materia nueva pura)".

---

## `optativasData.json`

Catálogo de materias optativas disponibles para la carrera.

**Estructura:** Array de objetos simples.

```jsonc
[
  {
    "codigo": "11804",                    // Código de la materia optativa
    "nombre": "Procesamiento de Imágenes" // Nombre completo
  }
]
```

> [!NOTE]
> Estas materias no pertenecen a un plan específico, son oferta complementaria que los alumnos eligen para cubrir los espacios de optativas (OP1, OP2, OP3 en plan 17.13 / AO-1714 en plan 17.14).

---

## `civil.json`

Archivo reservado para los planes de estudio de **Ingeniería Civil**. Actualmente vacío (`[]`).

Comparte la misma estructura que `sistemas.json`.

---

## `plansData.js`

Archivo JavaScript (no JSON) que centraliza la importación de todos los planes de estudio y los exporta como un único array combinado.

```js
import sistemas from './sistemas.json';
import civil from './civil.json';

const plansData = [...sistemas, ...civil];

export const careers = { Sistemas: sistemas, Civil: civil };
export default plansData;
```

> [!TIP]
> Para agregar una nueva carrera, crear su archivo `.json` con la misma estructura que `sistemas.json`, importarlo en `plansData.js` y agregarlo al spread y al objeto `careers`.
