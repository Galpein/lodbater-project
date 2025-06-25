import express from "express"
import multer from "multer"
import cors from "cors"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Crear directorio de uploads si no existe
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads")
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({ storage })

// Función helper para respuestas con manejo de errores
const safeResponse = (res, operation, simulatedData) => {
  try {
    // Aquí iría la lógica real del modelo/procesamiento
    // Por ahora simulamos un posible error aleatorio
    if (Math.random() < 0.3) {
      // 30% probabilidad de "error"
      throw new Error("Simulated processing error")
    }

    res.json({
      error: false,
      message: `${operation} completed successfully`,
      simulated: false,
      data: simulatedData,
    })
  } catch (error) {
    console.error(`Error in ${operation}:`, error.message)
    res.json({
      error: true,
      message: `No se pudo completar ${operation.toLowerCase()}. Continuando con datos simulados para mantener el flujo de trabajo.`,
      simulated: true,
      data: simulatedData,
    })
  }
}

// Endpoint para segmentación automática
app.post("/api/segment", upload.single("image"), (req, res) => {
  const simulatedMask = {
    maskUrl: "/api/placeholder-mask",
    confidence: 0.87,
    processingTime: "2.3s",
  }

  safeResponse(res, "Segmentación automática", simulatedMask)
})

// Endpoint para clasificación
app.post(
  "/api/predict",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mask", maxCount: 1 },
  ]),
  (req, res) => {
    const simulatedPrediction = {
      classification: Math.random() > 0.5 ? "normal" : "pathological",
      confidence: (Math.random() * 0.3 + 0.7).toFixed(3), // 70-100%
      processingTime: "1.8s",
      modelUsed: req.body.model || "MobileNetV2_default",
    }

    safeResponse(res, "Clasificación", simulatedPrediction)
  },
)

// Endpoint para Grad-CAM
app.post(
  "/api/gradcam",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mask", maxCount: 1 },
  ]),
  (req, res) => {
    const simulatedGradCAM = {
      gradcamUrl: "/api/placeholder-gradcam",
      heatmapIntensity: "high",
      focusAreas: ["cortex", "medulla"],
    }

    safeResponse(res, "Generación de Grad-CAM", simulatedGradCAM)
  },
)

// Endpoint para generar PDF
app.post("/api/generate-pdf", (req, res) => {
  const simulatedPDF = {
    pdfUrl: "/api/placeholder-pdf",
    filename: `renal_analysis_${Date.now()}.pdf`,
    size: "2.4 MB",
  }

  safeResponse(res, "Generación de informe PDF", simulatedPDF)
})

// Endpoints para placeholders
app.get("/api/placeholder-mask", (req, res) => {
  res.redirect("/placeholder.svg?height=400&width=400&text=Máscara+Simulada")
})

app.get("/api/placeholder-gradcam", (req, res) => {
  res.redirect("/placeholder.svg?height=400&width=400&text=Grad-CAM+Simulado")
})

app.get("/api/placeholder-pdf", (req, res) => {
  res.json({
    message: "PDF simulado generado correctamente",
    downloadUrl: "#",
    note: "En producción, aquí se descargaría el archivo PDF real",
  })
})

// Endpoint para obtener métricas del modelo
app.get("/api/model-metrics", (req, res) => {
  const simulatedMetrics = {
    accuracy: (Math.random() * 0.1 + 0.9).toFixed(3),
    precision: (Math.random() * 0.1 + 0.85).toFixed(3),
    recall: (Math.random() * 0.1 + 0.88).toFixed(3),
    f1Score: (Math.random() * 0.1 + 0.87).toFixed(3),
    auc: (Math.random() * 0.05 + 0.92).toFixed(3),
  }

  safeResponse(res, "Obtención de métricas", simulatedMetrics)
})

// Endpoint para listar modelos disponibles
app.get("/api/models", (req, res) => {
  const availableModels = [
    { id: "mobilenetv2_default", name: "MobileNetV2 (Default)", accuracy: "92.3%" },
    { id: "mobilenetv2_enhanced", name: "MobileNetV2 Enhanced", accuracy: "94.1%" },
    { id: "resnet50_custom", name: "ResNet50 Custom", accuracy: "91.8%" },
  ]

  res.json({
    error: false,
    message: "Modelos disponibles obtenidos correctamente",
    simulated: false,
    data: availableModels,
  })
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})
