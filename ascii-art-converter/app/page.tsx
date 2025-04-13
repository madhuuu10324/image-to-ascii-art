"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload } from "lucide-react"

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [asciiArt, setAsciiArt] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("image")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const img = new Image()
      img.onload = () => {
        const asciiResult = convertToAscii(img)
        setAsciiArt(asciiResult)
        setLoading(false)
      }
      img.src = event.target?.result as string
      setImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const convertToAscii = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Determine dimensions while maintaining aspect ratio
    const maxWidth = 50
    const scale = maxWidth / img.width
    const width = maxWidth
    const height = img.height * (maxWidth / img.width) * 0.5

    canvas.width = width
    canvas.height = height

    if (!ctx) return "Error creating canvas context"

    ctx.drawImage(img, 0, 0, width, height)

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // ASCII characters from darkest to lightest
    const asciiChars = "@%#*+=-:. "

    let result = ""
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        // Calculate brightness (0-255)
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        // Skip nearly white pixels (tweak threshold if needed)
        if (brightness > 240) {
          result += " "
          continue
        }
        // Map brightness to ASCII character
        const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1))
        result += asciiChars[charIndex]
      }
      result += "\n"
    }

    return result
  }

  const downloadAscii = () => {
    if (!asciiArt) return

    const element = document.createElement("a")
    const file = new Blob([asciiArt], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "ascii-art.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download complete!",
      description: "Your ASCII art has been downloaded",
    })
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-pink-100 to-purple-100">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-500 mb-2 font-display">ASCII Art Generator</h1>
          <p className="text-purple-600">Transform your images into beautiful ASCII art!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl shadow-md bg-white/80 backdrop-blur-sm border-pink-200 border-2">
            <h2 className="text-2xl font-semibold text-purple-500 mb-4">Upload Image</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-xl p-8 bg-pink-50 hover:bg-pink-100 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-pink-400 mb-2" />
                <span className="text-purple-600 font-medium">Choose an image</span>
                <span className="text-xs text-purple-400 mt-1">or drag and drop</span>
              </label>
            </div>

            {image && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-purple-500 mb-2">Preview</h3>
                <div className="rounded-lg overflow-hidden border border-pink-200">
                  <img src={image || "/placeholder.svg"} alt="Preview" className="w-full h-auto" />
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-2xl shadow-md bg-white/80 backdrop-blur-sm border-purple-200 border-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-purple-500">ASCII Result</h2>
              {asciiArt && (
                <Button
                  onClick={downloadAscii}
                  variant="outline"
                  className="border-pink-300 hover:bg-pink-100 text-pink-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : asciiArt ? (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 h-64 overflow-auto">
                <pre className="font-mono text-[0.5rem] leading-[0.5rem] text-purple-800 whitespace-pre">
                  {asciiArt}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-purple-400 bg-purple-50 rounded-lg border border-purple-200">
                <p>Upload an image to see the ASCII art</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}
