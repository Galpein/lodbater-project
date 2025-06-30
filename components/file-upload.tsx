"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, FileImage, CheckCircle } from "lucide-react"
import type { AnalysisData } from "@/app/page"
import Image from "next/image"

interface FileUploadProps {
  onNext: () => void
  onDataUpdate: (data: Partial<AnalysisData>) => void
  onError: (error: string) => void
  analysisData: AnalysisData
}

export function FileUpload({ onNext, onDataUpdate, onError, analysisData }: FileUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [maskFile, setMaskFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.type.startsWith("image/")) {
          setImageFile(file)
          const reader = new FileReader()
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string)
          }
          reader.onerror = () => {
            onError("No se pudo leer la imagen. Continuando con imagen simulada.")
            setImagePreview("/placeholder.svg?height=300&width=400&text=Imagen+Simulada")
          }
          reader.readAsDataURL(file)
        } else {
          onError("Por favor, seleccione un archivo de imagen válido (.jpg, .png)")
        }
      }
    },
    [onError],
  )

  const onMaskDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.name.endsWith(".mat") || file.type.includes("matlab")) {
          setMaskFile(file)
        } else {
          onError("Por favor, seleccione un archivo .mat válido para la máscara")
        }
      }
    },
    [onError],
  )

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: false,
  })

  const {
    getRootProps: getMaskRootProps,
    getInputProps: getMaskInputProps,
    isDragActive: isMaskDragActive,
  } = useDropzone({
    onDrop: onMaskDrop,
    accept: {
      "application/octet-stream": [".mat"],
    },
    multiple: false,
  })


  const handleNext = async () => {
    if (!imageFile && !imagePreview) {
      onError("Se requiere una imagen para continuar.");
      return;
    }

    if (!maskFile) {
      onError("Debe proporcionar una máscara en formato .mat");
      return;
    }

    onDataUpdate({
      image: imageFile,
      mask: maskFile,
      maskGenerated: false,
    });

    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subida de Archivos</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Suba la imagen de ultrasonido renal para comenzar el análisis
        </p>
      </div>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Imagen de Ultrasonido (Obligatorio)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getImageRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isImageDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              }
            `}
          >
            <input {...getImageInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {imageFile ? (
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
                <p className="text-sm font-medium text-green-600">{imageFile.name}</p>
                <p className="text-xs text-gray-500">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arrastre la imagen aquí o haga clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">Formatos soportados: JPG, PNG (máx. 10MB)</p>
              </div>
            )}
          </div>

          {imagePreview && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Vista previa:</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Vista previa de la imagen"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Máscara */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Máscara (.mat)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getMaskRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${
                isMaskDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              }
            `}
          >
            <input {...getMaskInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            {maskFile ? (
              <div className="space-y-1">
                <CheckCircle className="w-6 h-6 mx-auto text-green-600" />
                <p className="text-sm font-medium text-green-600">{maskFile.name}</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Subir archivo .mat</p>
                <p className="text-xs text-gray-500">Archivo de máscara en formato MATLAB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={isProcessing} className="medical-button-primary px-8">
          {isProcessing ? "Procesando..." : "Continuar"}
        </Button>
      </div>
    </div>
  )
}
