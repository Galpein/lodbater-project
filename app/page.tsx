"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { MaskEditor } from "@/components/mask-editor"
import { Confirmation } from "@/components/confirmation"
import { Results } from "@/components/results"
import { Toolbar } from "@/components/toolbar"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export type AnalysisStep = "upload" | "mask-edit" | "confirmation" | "results"

export interface AnalysisData {
  image?: File | string
  mask?: File | string
  maskGenerated?: boolean
  classification?: string
  confidence?: number
  gradcamUrl?: string
  metrics?: any
  errors?: string[]
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("upload")
  const [analysisData, setAnalysisData] = useState<AnalysisData>({})
  const [selectedModel, setSelectedModel] = useState("mobilenetv2_default")
  const [errors, setErrors] = useState<string[]>([])

  const steps = [
    { id: "upload", name: "Subida de Archivos", completed: false },
    { id: "mask-edit", name: "Edición de Máscara", completed: false },
    { id: "confirmation", name: "Confirmación", completed: false },
    { id: "results", name: "Resultados", completed: false },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const addError = (error: string) => {
    setErrors((prev) => [...prev, error])
  }

  const clearErrors = () => {
    setErrors([])
  }

  const updateAnalysisData = (newData: Partial<AnalysisData>) => {
    setAnalysisData((prev) => ({ ...prev, ...newData }))
  }

  const goToStep = (step: AnalysisStep) => {
    setCurrentStep(step)
    clearErrors()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Toolbar selectedModel={selectedModel} onModelChange={setSelectedModel} analysisData={analysisData} />

      <main className="medical-container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Analizador de Ultrasonido Renal</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sistema de análisis clínico con inteligencia artificial
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }
                  `}
                  >
                    {index < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      index <= currentStepIndex ? "text-primary" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        index < currentStepIndex ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>

        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <div className="font-medium mb-2">Avisos del sistema:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
              <p className="text-sm mt-2 font-medium">
                El análisis continuará con datos simulados para mantener el flujo de trabajo.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="medical-card p-8">
          {currentStep === "upload" && (
            <FileUpload
              onNext={() => goToStep("mask-edit")}
              onDataUpdate={updateAnalysisData}
              onError={addError}
              analysisData={analysisData}
            />
          )}

          {currentStep === "mask-edit" && (
            <MaskEditor
              onNext={() => goToStep("confirmation")}
              onBack={() => goToStep("upload")}
              onDataUpdate={updateAnalysisData}
              onError={addError}
              analysisData={analysisData}
            />
          )}

          {currentStep === "confirmation" && (
            <Confirmation
              onNext={() => goToStep("results")}
              onBack={() => goToStep("mask-edit")}
              onDataUpdate={updateAnalysisData}
              onError={addError}
              analysisData={analysisData}
              selectedModel={selectedModel}
            />
          )}

          {currentStep === "results" && (
            <Results
              onRestart={() => {
                setCurrentStep("upload")
                setAnalysisData({})
                clearErrors()
              }}
              onBack={() => goToStep("confirmation")}
              analysisData={analysisData}
              selectedModel={selectedModel}
            />
          )}
        </div>
      </main>
    </div>
  )
}
