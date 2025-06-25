# lodbater-project

Backend de ejemplo para análisis renal usando Node.js y Python.

## Uso

1. Instala las dependencias de Node.
   ```bash
   npm install
   ```
2. Arranca el servidor Express.
   ```bash
   node server/server.js
   ```
   El servidor escucha en `http://localhost:5000`.

Los endpoints principales llaman a scripts de Python ubicados en `server/scripts`:

- `POST /api/segment` – genera automáticamente una máscara a partir de una imagen.
- `POST /api/predict` – clasifica una imagen usando su máscara asociada.
- `POST /api/process-mat` – procesa un archivo `.mat` y devuelve una máscara.
- `POST /api/generate-pdf` – crea un informe en PDF con los resultados.

Cada script es un ejemplo sencillo que puedes sustituir por tus propios modelos.
Necesitarás Python 3 y las librerías `Pillow`, `numpy`, `scipy` y `fpdf`.
