"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
}



export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-[#434440] rounded-xl flex items-center justify-center">
        <p className="text-[#88857E]">No images available</p>
      </div>
    )
  }

  const fullImage = (img: string) => `${process.env.NEXT_PUBLIC_API_URL}${img}`

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative w-full h-96 md:h-[500px] bg-[#434440] rounded-xl overflow-hidden mb-4 group">
        <img
          src={fullImage(images[currentIndex])}
          alt={`Property image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#8E744B]/80 hover:bg-[#8E744B] text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#8E744B]/80 hover:bg-[#8E744B] text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === currentIndex ? "border-[#8E744B]" : "border-[#434440] hover:border-[#8E744B]"
              }`}
            >
              <img
                src={fullImage(img)}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
