"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import type { AnalysisData } from "@/app/page"
import { Brain, Download, Sun, Moon, Monitor, Settings, Info } from "lucide-react"

interface ToolbarProps {
  selectedModel: string
  onModelChange: (model: string) => void
  analysisData: AnalysisData
}

interface ModelInfo {
  id: string
  name: string
  accuracy: string
  description?: string
}

export function Toolbar({ selectedModel, onModelChange, analysisData }: ToolbarProps) {
  const { theme, setTheme } = useTheme()
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models")
        const result = await response.json()

        if (!result.error) {
          setAvailableModels(result.data)
        } else {
          // Modelos por defecto si falla la carga
          setAvailableModels([
            { id: "mobilenetv2_default", name: "MobileNetV2 (Default)", accuracy: "92.3%" },
            { id: "mobilenetv2_enhanced", name: "MobileNetV2 Enhanced", accuracy: "94.1%" },
            { id: "resnet50_custom", name: "ResNet50 Custom", accuracy: "91.8%" },
          ])
        }
      } catch (error) {
        // Modelos por defecto en caso de error
        setAvailableModels([
          { id: "mobilenetv2_default", name: "MobileNetV2 (Default)", accuracy: "92.3%" },
          { id: "mobilenetv2_enhanced", name: "MobileNetV2 Enhanced", accuracy: "94.1%" },
          { id: "resnet50_custom", name: "ResNet50 Custom", accuracy: "91.8%" },
        ])
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModels()
  }, [])

  const handleDownloadReport = async () => {
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
        alert("Informe generado correctamente. En producción se descargaría automáticamente.")
      }
    } catch (error) {
      alert("Error al generar el informe. Funcionalidad disponible tras completar el análisis.")
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="medical-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">RenalAI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Análisis Clínico Inteligente</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4">
            {/* Selector de Modelo */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modelo:</label>
              <Select value={selectedModel} onValueChange={onModelChange} disabled={isLoadingModels}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seleccionar modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{model.accuracy}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón de Descarga */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="flex items-center gap-2"
              disabled={!analysisData.classification}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Informe</span>
            </Button>

            {/* Selector de Tema */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Oscuro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menú de Configuración */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Info className="mr-2 h-4 w-4" />
                  <span>Acerca de</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Brain className="mr-2 h-4 w-4" />
                  <span>Información del Modelo</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
