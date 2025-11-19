// src/app/page.tsx
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">

        {/* Message principal */}
        <div className="p-8 md:p-12 animate-slide-up">
          <div className="mb-6">
            <span className="inline-block bg-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
              Bientôt disponible
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Plateforme en cours de développement
          </h2>
        </div>

        {/* Footer */}
        <div className="mt-8 text-primary-200 text-sm">
          <p>&copy; 2025 Club NTIC Information et Robotique</p>
        </div>
      </div>
    </main>
  )
}
