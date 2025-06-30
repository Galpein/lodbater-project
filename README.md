# lodbater-project

Backend de ejemplo para análisis renal usando Node.js y Python.

## Uso

1. Instala las dependencias de Node.
   ```bash
   npm install
   ```
2. Instala las dependencias de Python necesarias.
   ```bash
   pip install pillow numpy scipy fpdf
   ```
3. Arranca el servidor Express.
   ```bash
   npm run server
   ```
   El servidor escucha en `http://localhost:5000`.

Puedes definir la variable de entorno `PYTHON` para indicar la ruta del
intérprete de Python que se utilizará al ejecutar los scripts.

Los endpoints principales llaman a scripts de Python ubicados en `server/scripts`:

- `POST /api/predict` – clasifica una imagen usando su máscara asociada.
- `POST /api/process-mat` – procesa un archivo `.mat` y devuelve una máscara.
- `POST /api/generate-pdf` – crea un informe en PDF con los resultados.

Para obtener una predicción deberás subir la imagen de ultrasonido y su máscara correspondiente en formato `.mat`. No se realiza segmentación automática.

Cada script es un ejemplo sencillo que puedes sustituir por tus propios modelos.
Necesitarás Python 3 y las librerías `Pillow`, `numpy`, `scipy` y `fpdf`.
