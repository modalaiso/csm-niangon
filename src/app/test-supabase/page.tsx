import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Database, CheckCircle2, XCircle } from 'lucide-react'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let isConnected = false
  let errorMessage = ''
  let todos: any[] = []

  try {
    const { data, error } = await supabase.from('User').select()

    if (error) {
      isConnected = false
      errorMessage = error.message
    } else {
      isConnected = true
      todos = data || []
    }
  } catch (error) {
    isConnected = false
    errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Supabase Connection
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vérification de l'état de la connexion à la base de données
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <Database className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                État de la connexion
              </h2>
            </div>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Connecté à Supabase
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium">
                  Erreur de connexion
                </span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Erreur:</span> {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Todos List */}
        {isConnected && todos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Données récupérées ({todos.length})
            </h3>
            <ul className="space-y-3">
              {todos.map((todo, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {JSON.stringify(todo)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isConnected && todos.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Aucune donnée trouvée dans la table todos
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Next.js • Supabase • TypeScript</p>
        </div>
      </div>
    </div>
  )
}