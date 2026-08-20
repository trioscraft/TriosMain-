"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

function getYouTubeId(url) {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/i
  )
  return m ? m[1] : null
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

export default function ProjectMediaSlider({ images = [], videos = [], title = "" }) {
  const slides = [
    ...images.map((src) => ({ type: "image", src })),
    ...videos.map((src) => ({ type: "video", src })),
  ]

  const [index, setIndex] = useState(0)

  if (slides.length === 0) {
    return (
      <div className="ed-project-media">
        <span className="ed-project-fallback">💼</span>
      </div>
    )
  }

  const slide = slides[Math.min(index, slides.length - 1)]
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)
  const youtubeId = slide.type === "video" ? getYouTubeId(slide.src) : null

  return (
    <div className="ed-project-slider">
      <div className="ed-project-media">
        {slide.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.src} alt={`${title} — image ${index + 1}`} />
        ) : youtubeId ? (
          <iframe
            className="ed-project-media-video"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={`${title} — video ${index + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isDirectVideo(slide.src) ? (
          <video className="ed-project-media-video" src={slide.src} controls playsInline />
        ) : (
          <a href={slide.src} target="_blank" rel="noreferrer" className="ed-project-media-video ed-project-media-video-link">
            ▶ {slide.src}
          </a>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="ed-project-slider-arrow ed-project-slider-prev"
            onClick={prev}
            aria-label="Previous media"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="ed-project-slider-arrow ed-project-slider-next"
            onClick={next}
            aria-label="Next media"
          >
            <ChevronRight size={16} />
          </button>
          <div className="ed-project-slider-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ed-project-slider-dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to media ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}