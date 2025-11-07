"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start animation after component mounts
    setTimeout(() => {
      setIsAnimating(true)
    }, 100)
  }, [])

  const handleReplay = () => {
    setIsAnimating(false)
    setTimeout(() => setIsAnimating(true), 100)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Rocket */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${isAnimating ? "animate-fly-right" : "left-[-100px]"}`}
        style={{
          animation: isAnimating ? "flyRight 10s ease-in-out forwards" : "none",
        }}
      >
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-2xl rotate-90">
            {/* Rocket body - white/cream colored */}
            <ellipse cx="50" cy="50" rx="12" ry="30" fill="#F5F5F5" stroke="#3D2817" strokeWidth="2" />

            {/* Rocket nose cone - red/orange */}
            <path d="M 50 20 L 62 35 L 38 35 Z" fill="#FF6B4A" stroke="#3D2817" strokeWidth="2" />

            {/* Window - blue circular */}
            <circle cx="50" cy="48" r="7" fill="#87CEEB" stroke="#3D2817" strokeWidth="2" />
            <circle cx="50" cy="48" r="5" fill="#B0E0E6" opacity="0.6" />

            {/* Engine section - red/orange at bottom */}
            <ellipse cx="50" cy="72" rx="8" ry="6" fill="#FF6B4A" stroke="#3D2817" strokeWidth="2" />

            {/* Left fin */}
            <path d="M 38 55 L 30 70 L 38 68 Z" fill="#FF6B4A" stroke="#3D2817" strokeWidth="2" />

            {/* Right fin */}
            <path d="M 62 55 L 70 70 L 62 68 Z" fill="#FF6B4A" stroke="#3D2817" strokeWidth="2" />

            {/* Flame effects coming from engine - yellow/orange gradient */}
            <g className="animate-pulse">
              <ellipse cx="50" cy="78" rx="6" ry="4" fill="#FFD700" opacity="0.9" />
              <ellipse cx="50" cy="82" rx="7" ry="5" fill="#FFA500" opacity="0.8" />
              <ellipse cx="50" cy="86" rx="6" ry="4" fill="#FF8C00" opacity="0.7" />
              <ellipse cx="50" cy="89" rx="5" ry="3" fill="#FF6B35" opacity="0.6" />
            </g>
          </svg>

          <div className="absolute right-[70px] top-1/2 -translate-y-1/2 w-[120px] h-[60px]">
            {/* Main flame cone - gradient from hot to cool */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[100px] h-[40px]">
              <svg width="100" height="40" viewBox="0 0 100 40" className="animate-pulse">
                {/* Hot core - white/yellow */}
                <ellipse cx="10" cy="20" rx="8" ry="12" fill="#FFFFFF" opacity="0.9" />
                <ellipse cx="20" cy="20" rx="10" ry="14" fill="#FFD700" opacity="0.8" />

                {/* Mid section - yellow/orange */}
                <ellipse cx="35" cy="20" rx="12" ry="16" fill="#FFA500" opacity="0.7" />
                <ellipse cx="50" cy="20" rx="14" ry="18" fill="#FF8C00" opacity="0.6" />

                {/* Outer section - orange/red */}
                <ellipse cx="70" cy="20" rx="16" ry="20" fill="#FF6B35" opacity="0.5" />
                <ellipse cx="90" cy="20" rx="18" ry="22" fill="#FF4500" opacity="0.3" />
              </svg>
            </div>

            {[...Array(3)].map((_, i) => {
              const width = 20 + i * 10
              const height = 4 + i
              const offsetY = (i - 1) * 15
              const offsetX = 20 + i * 25
              const delay = i * 0.2
              const duration = 0.5 + i * 0.1

              // Color based on position - hotter near rocket
              const colors = [
                "bg-gradient-to-r from-white to-yellow-300",
                "bg-gradient-to-r from-yellow-300 to-orange-400",
                "bg-gradient-to-r from-orange-400 to-red-600",
              ]
              const color = colors[i]

              return (
                <div
                  key={i}
                  className={`absolute ${color} rounded-full animate-flame-streak`}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    top: `calc(50% + ${offsetY}px)`,
                    right: `${offsetX}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    opacity: 0.8,
                    transform: "translateY(-50%)",
                  }}
                />
              )
            })}

            {/* Smoke particles at the end */}
            {[...Array(8)].map((_, i) => {
              const size = 8 + Math.random() * 12
              const offsetY = (Math.random() - 0.5) * 60
              const offsetX = 80 + Math.random() * 40
              const delay = Math.random() * 1
              const duration = 1 + Math.random() * 0.5

              return (
                <div
                  key={`smoke-${i}`}
                  className="absolute bg-gray-400 rounded-full animate-smoke-fade"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `calc(50% + ${offsetY}px)`,
                    right: `${offsetX}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    opacity: 0.3,
                    transform: "translateY(-50%)",
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">🚀 火箭动画</h1>
          <p className="text-xl text-gray-300">从左边飞往右边</p>
          <button
            onClick={handleReplay}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            重新播放
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes flyRight {
          0% {
            left: -100px;
            opacity: 1;
          }
          100% {
            left: calc(100% + 100px);
            opacity: 1;
          }
        }

        @keyframes flame-streak {
          0%, 100% {
            opacity: 0.7;
            transform: translateY(-50%) scaleX(1);
          }
          50% {
            opacity: 0.9;
            transform: translateY(-50%) scaleX(1.2);
          }
        }

        @keyframes smoke-fade {
          0% {
            opacity: 0.3;
            transform: translateY(-50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) scale(1.5);
          }
        }

        .animate-flame-streak {
          animation: flame-streak infinite ease-in-out;
        }

        .animate-smoke-fade {
          animation: smoke-fade infinite ease-out;
        }
      `}</style>
    </div>
  )
}
