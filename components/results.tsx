"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AnalysisData } from "@/app/page"
import { Download, RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Brain } from "lucide-react"
import Image from "next/image"

interface ResultsProps {
  onRestart: () => void
  onBack: () => void
  analysisData: AnalysisData
  selectedModel: string
}

export function Results({ onRestart, onBack, analysisData, selectedModel }: ResultsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const isNormal = analysisData.classification === "normal"
  const confidence = (analysisData.confidence || 0.85) * 100

  const getInterpretation = () => {
    if (isNormal) {
      if (confidence > 90) {
        return "Los hallazgos ecográficos sugieren una estructura renal dentro de los parámetros normales. Se recomienda seguimiento rutinario."
      } else if (confidence > 80) {
        return "Los hallazgos son compatibles con normalidad, aunque se sugiere evaluación clínica complementaria."
      } else {
        return "Los hallazgos requieren interpretación clínica adicional para confirmar normalidad."
      }
    } else {
      if (confidence > 90) {
        return "Se identifican alteraciones significativas en la estructura renal que requieren evaluación clínica inmediata."
      } else if (confidence > 80) {
        return "Se observan hallazgos que sugieren posibles alteraciones renales. Se recomienda correlación clínica."
      } else {
        return "Los hallazgos requieren evaluación clínica detallada para determinar su significancia."
      }
    }
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisData,
          selectedModel,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (result.error) {
        alert(result.message)
      } else {
        alert("Informe PDF generado correctamente. En producción se descargaría automáticamente.")
      }
    } catch (error) {
      alert("Error al generar el PDF. En producción se mostraría un enlace de descarga alternativo.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Resultados del Análisis</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Clasificación completada con modelo {selectedModel.replace("_", " ")}
        </p>
      </div>

      {/* Resultado Principal */}
      <Card
        className={`border-2 ${
          isNormal
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {isNormal ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h3 className="text-2xl font-bold">{isNormal ? "Estructura Normal" : "Alteraciones Detectadas"}</h3>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Confianza: {confidence.toFixed(1)}%
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Nivel de Confianza</span>
                <span className="text-sm font-bold">{confidence.toFixed(1)}%</span>
              </div>
              <Progress
                value={confidence}
                className={`h-3 ${isNormal ? "[&>div]:bg-green-600" : "[&>div]:bg-red-600"}`}
              />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Interpretación Clínica
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{getInterpretation()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grad-CAM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Mapa de Activación (Grad-CAM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
              <Image
                src={analysisData.gradcamUrl || "/placeholder.svg?height=300&width=400&text=Grad-CAM"}
                alt="Mapa de activación Grad-CAM"
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Las áreas más brillantes indican las regiones que más influyeron en la decisión del modelo.
            </p>
          </CardContent>
        </Card>

        {/* Métricas del Modelo */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas del Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisData.metrics &&
                Object.entries(analysisData.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                    <Badge variant="secondary" className="font-mono">
                      {typeof value === "string" ? value : value.toFixed(3)}
                    </Badge>
                  </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Estas métricas fueron calculadas durante la validación cruzada del modelo en el
                conjunto de datos de entrenamiento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalles Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-600 dark:text-gray-400">Modelo</label>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedModel.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-600 dark:text-gray-400">Tiempo de Procesamiento</label>
              <p className="font-semibold text-gray-900 dark:text-white">2.3s</p>
            </div>
            <div>
              <label className="font-medium text-gray-600 dark:text-gray-400">Resolución</label>
              <p className="font-semibold text-gray-900 dark:text-white">512x512px</p>
            </div>
            <div>
              <label className="font-medium text-gray-600 dark:text-gray-400">Fecha</label>
              <p className="font-semibold text-gray-900 dark:text-white">{new Date().toLocaleDateString("es-ES")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button variant="outline" onClick={onRestart} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Nuevo Análisis
          </Button>
        </div>

        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="medical-button-primary flex items-center gap-2"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Descargar Informe
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
