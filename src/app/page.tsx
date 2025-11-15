// src/app/page.tsx
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full p-8 mb-6">
            <div className="text-6xl"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-heading">
             CSM Niangon
          </h1>
        </div>

        {/* Message principal */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20 animate-slide-up">
          <div className="mb-6">
            <span className="inline-block bg-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
              Bientôt disponible
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Plateforme en cours de développement
          </h2>

          {/* Info club */}
          <div className="border-t border-white/20 pt-6">
            <p className="text-primary-100 text-sm mb-2">
              Un projet du
            </p>
            <p className="text-white font-semibold text-lg">
              Club NTIC et Information
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-primary-200 text-sm">
          <p>© 2024 CSM Niangon - Tous droits réservés</p>
        </div>
      </div>
    </main>
  )
}