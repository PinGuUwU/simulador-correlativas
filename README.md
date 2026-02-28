mi-proyecto-mern/
├── backend/                # Lógica del servidor (Node/Express)
│   ├── config/             # Configuración de DB y variables de entorno
│   ├── controllers/        # Lógica de las funciones (qué hace cada ruta)
│   ├── models/             # Esquemas de MongoDB (Mongoose)
│   ├── routes/             # Definición de los endpoints de la API
│   ├── services/           # Se comunica con la base de datos
│   ├── middleware/         # Funciones de validación o autenticación (JWT)
│   ├── utils/              # Funciones de ayuda reutilizables
│   ├── .env                # Variables sensibles (no se sube a GitHub)
│   └── server.js           # Punto de entrada del backend
├── frontend/               # Interfaz de usuario (React)
│   ├── public/             # Archivos estáticos
│   ├── src/
│   │   ├── assets/         # Imágenes, estilos globales, fuentes
│   │   ├── components/     # Componentes reutilizables (Botones, Navbar)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Vistas completas (Home, Login, Dashboard)
│   │   ├── services/       # Llamadas a la API (Axios o Fetch)
│   │   ├── store/          # Estado global (Redux o Context API)
│   │   └── App.jsx         # Componente principal
│   └── package.json
├── .gitignore              # Para ignorar node_modules y .env
├── README.md               # Documentación del proyecto
└── package.json            # Scripts para correr ambos proyectos a la vez


## Sobre el chatbot
Cuando le hacen una consulta debe considerar si le están preguntando por un plan (numero o nombre[viejo o nuevo]), por una materia (numero o nombre)
Luego de esa consideración tenemos lo siguiente
Si consulta por un plan y dice le númerp exacto entonces ya sabe el chatbot a cuál se refiere
Si no menciona como viejo o nuevo también debería saberlo, se lo puedo indicar en su base de conocimiento de alguna manera
Si pregunta por materias en forma de nombre y por cómo mencionó la materia puede haber varias coincidencias entonces pregunta cuál de todas es, pero en forma de botones para que seleccione, dandole la opción de que no es ninguna de esas opciones, en todo caso le puede pedir que vuelva a escribir el nombre o que le diga el número,dandole la aternativa de que le diga el plan (si no se lo dijo antes) para redirigirlo a que busque el código/nombre exacto de la materia para brindarle ayuda
Si le da el código y es exacto entonces ya se resolvió
Si le da un código y no existe, le dará como opcion los códigos más cercanos (numericamente) al que mencionó
Cuando consulta por correlativas o por simultaneidad entonces debe consultar la base de datos, así como lo hace el frontend