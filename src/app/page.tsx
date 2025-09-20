
'use client'

import { useState, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface ConvertedImage {
  name: string
  blob: Blob
  originalSize: number
  convertedSize: number
  originalFormat: string
  outputFormat: OutputFormat
}

type OutputFormat = 'webp' | 'png' | 'jpeg' | 'jpg'

interface FormatOption {
  value: OutputFormat
  label: string
  mimeType: string
  extension: string
  color: string
  gradient: string
}

const supportedInputFormats = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
  'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml'
]

const outputFormats: FormatOption[] = [
  {
    value: 'webp',
    label: 'WebP',
    mimeType: 'image/webp',
    extension: '.webp',
    color: 'bg-custom-gradient',
    gradient: 'bg-custom-gradient'
  },
  {
    value: 'png',
    label: 'PNG',
    mimeType: 'image/png',
    extension: '.png',
    color: 'bg-custom-gradient',
    gradient: 'bg-custom-gradient'
  },
  {
    value: 'jpeg',
    label: 'JPEG',
    mimeType: 'image/jpeg',
    extension: '.jpg',
    color: 'bg-custom-gradient',
    gradient: 'bg-custom-gradient'
  },
]

export default function ImageConverter() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileFormats, setFileFormats] = useState<OutputFormat[]>([])
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preload background image
  useEffect(() => {
    const img = new Image()
    img.src = '/background.jpg'
    img.onload = () => {
      // Add a small delay for smooth transition
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }
    img.onerror = () => {
      // If image fails to load, still show the content after a delay
      setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    }
  }, [])

  const getFileExtension = (filename: string | undefined): string => {
    if (!filename) return ''
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => supportedInputFormats.includes(file.type))
    setSelectedFiles(imageFiles)
    setFileFormats(new Array(imageFiles.length).fill('webp'))
    setConvertedImages([])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => supportedInputFormats.includes(file.type))
    setSelectedFiles(imageFiles)
    setFileFormats(new Array(imageFiles.length).fill('webp'))
    setConvertedImages([])
  }

  const convertImage = async (file: File, targetFormat: FormatOption): Promise<ConvertedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const quality = targetFormat.value === 'jpeg' ? 0.9 : targetFormat.value === 'webp' ? 0.9 : 1.0
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalExt = getFileExtension(file.name)
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
              const newName = nameWithoutExt + targetFormat.extension
              
              resolve({
                name: newName,
                blob,
                originalSize: file.size,
                convertedSize: blob.size,
                originalFormat: originalExt.toUpperCase(),
                outputFormat: targetFormat.value
              })
            } else {
              reject(new Error('Failed to convert image'))
            }
          },
          targetFormat.mimeType,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleConvertAll = async () => {
    if (selectedFiles.length === 0) return

    setIsConverting(true)
    setConversionProgress(0)
    const converted: ConvertedImage[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        const targetFormat = outputFormats.find(f => f.value === fileFormats[i])!
        const convertedImage = await convertImage(selectedFiles[i], targetFormat)
        converted.push(convertedImage)
        setConversionProgress(((i + 1) / selectedFiles.length) * 100)
      } catch (error) {
        console.error(`Failed to convert ${selectedFiles[i].name}:`, error)
      }
    }

    setConvertedImages(converted)
    setIsConverting(false)
  }

  const handleFormatChange = (index: number, format: OutputFormat) => {
    setFileFormats(prev => prev.map((currentFormat, i) =>
      i === index ? format : currentFormat
    ))
  }

  const handleSingleDownload = (image: ConvertedImage) => {
    saveAs(image.blob, image.name)
  }

  const handleBulkDownload = async () => {
    if (convertedImages.length === 0) return

    if (convertedImages.length === 1) {
      handleSingleDownload(convertedImages[0])
      return
    }

    const zip = new JSZip()
    
    convertedImages.forEach((image) => {
      zip.file(image.name, image.blob)
    })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `converted-images.zip`)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateSavings = (): number => {
    const originalTotal = convertedImages.reduce((sum, img) => sum + img.originalSize, 0)
    const convertedTotal = convertedImages.reduce((sum, img) => sum + img.convertedSize, 0)
    return originalTotal > 0 ? ((originalTotal - convertedTotal) / originalTotal) * 100 : 0
  }


  // Loading Screen Component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-custom-gradient rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-custom-gradient rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-200"></div>
          <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-custom-gradient rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-400"></div>
        </div>
        
        {/* Loading content */}
        <div className="text-center z-10">
          <div className="inline-flex items-center gap-4 mb-8">
            <img
              src="/Logo.webp"
              alt="ConvertKaro Logo"
              className="w-16 h-16 rounded-2xl shadow-lg animate-pulse"
            />
            <h1 className="text-4xl font-bold font-museo bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ConvertKaro
            </h1>
          </div>
          
          {/* Loading spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin animation-delay-200"></div>
            </div>
          </div>
          
          <p className="text-gray-300 text-lg mb-4 animate-pulse">Loading your converter...</p>
          <p className="text-gray-400 text-sm">Preparing the best image conversion experience</p>
          
          {/* Loading progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
        
        {/* Subtle loading animation styles */}
        <style jsx>{`
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-custom-gradient rounded-full mix-blend-multiply filter blur-xl animate-blob opacity-30"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-custom-gradient rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 opacity-20"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-custom-gradient rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 opacity-25"></div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(255, 49, 49, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 49, 49, 0.6), 0 0 30px rgba(255, 49, 49, 0.4);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FF3131;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #FF3131;
        }
        
        .glass-morphism {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }

        .liquid-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow:
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .button-press {
          transition: all 0.1s ease;
        }
        
        .button-press:active {
          transform: scale(0.95);
        }
        
        .neon-text {
          text-shadow:
            0 0 5px currentColor,
            0 0 10px currentColor,
            0 0 15px currentColor,
            0 0 20px currentColor;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-float,
          .animate-glow,
          .animate-gradient {
            animation: none;
          }
          
          .hover-lift,
          .button-press {
            transition: none;
          }
        }
      `}</style>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <img
                src="/Logo.webp"
                alt="ConvertKaro Logo"
                className="w-12 h-12 rounded-2xl shadow-lg"
              />
              <h1 className="text-5xl font-bold font-museo bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Convertkaro
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Transform your images with lightning speed. Convert between formats while maintaining stunning quality.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['PNG', 'JPEG', 'WebP', 'GIF', 'BMP', 'TIFF'].map((format) => (
                <span key={format} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-200 border border-white/20">
                  {format}
                </span>
              ))}
            </div>
          </div>


          {/* Upload Section */}
          <div className="liquid-glass p-8 mb-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragOver
                  ? 'border-orange-400 bg-orange-400/10 scale-105'
                  : 'border-white/30 hover:border-orange-400/50 hover:bg-white/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-custom-gradient rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-2xl font-bold font-museo text-white hover:text-orange-400 transition-colors">
                  Drop files here or click to browse
                </span>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-gray-300 text-lg mb-2">Supports all major image formats</p>
              <p className="text-gray-400">Maximum quality conversion with optimized file sizes</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="grid gap-3 max-h-64 overflow-y-auto custom-scrollbar mb-6">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-custom-gradient rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {getFileExtension(file.name)?.toUpperCase() || 'IMG'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{file.name}</p>
                            <p className="text-sm text-gray-300">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 font-medium">Convert to:</span>
                        <div className="flex gap-2">
                          {outputFormats.map((format) => (
                            <button
                              key={format.value}
                              onClick={() => handleFormatChange(index, format.value)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                                fileFormats[index] === format.value
                                  ? `${format.gradient} text-white shadow-lg`
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                              }`}
                            >
                              {format.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleConvertAll}
                  disabled={isConverting}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
                    isConverting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : `bg-custom-gradient hover:shadow-2xl hover:shadow-orange-400/25 text-white`
                  }`}
                >
                  {isConverting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Converting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Convert All Files
                    </div>
                  )}
                </button>

                {isConverting && (
                  <div className="mt-6">
                    <div className="flex justify-between text-white mb-2">
                      <span className="font-medium">Processing images...</span>
                      <span className="font-bold">{Math.round(conversionProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-custom-gradient transition-all duration-500 ease-out rounded-full`}
                        style={{ width: `${conversionProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Section */}
          {convertedImages.length > 0 && (
            <div className="backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                    <svg className="w-8 h-8 text-[#FF3131]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Conversion Complete!
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[#FF3131] font-bold text-xl">
                      Average size reduction: {calculateSavings().toFixed(1)}%
                    </p>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-[#FF3131] rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-[#FF4444] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-[#FF4444] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBulkDownload}
                  className={`bg-custom-gradient text-white py-3 px-8 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-400/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-3`}
                >
                  {convertedImages.length === 1 ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Download File
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download ZIP ({convertedImages.length} files)
                    </>
                  )}
                </button>
              </div>

              <div className="grid gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                {convertedImages.map((image, index) => (
                  <div key={index} className="group bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl hover:bg-white/15 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-red-400/20 border border-red-400/30 rounded-lg">
                            <span className="text-red-200 text-sm font-bold">
                              {image.originalFormat}
                            </span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <div className="px-3 py-1 bg-green-400/20 border border-green-400/30 rounded-lg">
                            <span className="text-green-200 text-sm font-bold">
                              {image.outputFormat.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{image.name}</p>
                          <p className="text-gray-300 text-sm">
                            {formatFileSize(image.originalSize)} → {formatFileSize(image.convertedSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">
                            -{(((image.originalSize - image.convertedSize) / image.originalSize) * 100).toFixed(1)}%
                          </p>
                          <p className="text-gray-400 text-sm">compression</p>
                        </div>
                        {convertedImages.length > 1 && (
                          <button
                            onClick={() => handleSingleDownload(image)}
                            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 border border-white/20"
                            title="Download this file"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {/* <div className="mt-16 grid lg:grid-cols-3 gap-8">
            <div className="group backdrop-blur-sm bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-custom-red rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-xl mb-4 text-center">Universal Support</h3>
              <p className="text-gray-300 text-center leading-relaxed">Convert between PNG, JPEG, WebP, GIF, BMP and all popular formats with perfect quality preservation.</p>
            </div>
            
            <div className="group backdrop-blur-sm bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-custom-red rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-xl mb-4 text-center">Lightning Fast</h3>
              <p className="text-gray-300 text-center leading-relaxed">Advanced algorithms ensure rapid conversion while maintaining optimal compression and visual quality.</p>
            </div>
            
            <div className="group backdrop-blur-sm bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-custom-red rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-xl mb-4 text-center">Smart Downloads</h3>
              <p className="text-gray-300 text-center leading-relaxed">Direct download for single files, automatic ZIP creation for multiple files with intelligent file management.</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
