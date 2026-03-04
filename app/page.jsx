'use client'

import { useState } from 'react'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [personFile, setPersonFile] = useState(null)
  const [garmentFile, setGarmentFile] = useState(null)
  const [personPreview, setPersonPreview] = useState(null)
  const [garmentPreview, setGarmentPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [error, setError] = useState('')
  const [tips, setTips] = useState(null)
  const [credits, setCredits] = useState(10)

  const handlePersonUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setPersonPreview(e.target.result)
      setPersonFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleGarmentUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setGarmentPreview(e.target.result)
      setGarmentFile(file)
    }
    reader.readAsDataURL(file)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
    })
  }

  const handleTryOn = async () => {
    if (!personFile || !garmentFile) {
      setError("Veuillez charger les deux photos")
      return
    }

    if (!isSignedIn) {
      setError("Veuillez vous connecter pour utiliser l'essayage")
      return
    }

    setLoading(true)
    setError('')
    setTips(null)

    try {
      const personBase64 = await fileToBase64(personFile)
      const garmentBase64 = await fileToBase64(garmentFile)

      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personImageBase64: personBase64,
          garmentImageBase64: garmentBase64,
          userId: user.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError("Crédits insuffisants. Veuillez en acheter.")
        } else {
          throw new Error(data.error || 'Erreur serveur')
        }
        return
      }

      setResultImage(data.imageUrl)
      if (data.tips) {
        setTips(data.tips)
      }
      
      if (data.credits !== undefined) {
        setCredits(data.credits)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              <span className="text-blue-600">👕 Essayage</span>
              <span className="text-gray-800">AI</span>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <>
                  <span className="text-sm text-gray-600">
                    Crédits: <span className="font-bold text-blue-600">{credits}</span>
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Se connecter
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Essayez vos vêtements <span className="text-blue-600">instantanément</span>
        </h1>

        {!isSignedIn ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Connectez-vous pour commencer à essayer des vêtements
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Se connecter / S'inscrire
              </button>
            </SignInButton>
          </div>
        ) : (
          <>
            {/* Zone d'upload */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Photo personne */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center upload-zone cursor-pointer"
                  onClick={() => document.getElementById('personInput').click()}
                >
                  <input
                    type="file"
                    id="personInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePersonUpload}
                  />
                  <div className="w-full">
                    {personPreview ? (
                      <img src={personPreview} className="max-h-[250px] mx-auto rounded-lg" alt="Prévisualisation" />
                    ) : (
                      <div className="text-gray-400">
                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <p className="font-medium text-lg">Votre photo</p>
                        <p className="text-sm">Cliquez pour charger</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo vêtement */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center upload-zone cursor-pointer"
                  onClick={() => document.getElementById('garmentInput').click()}
                >
                  <input
                    type="file"
                    id="garmentInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGarmentUpload}
                  />
                  <div className="w-full">
                    {garmentPreview ? (
                      <img src={garmentPreview} className="max-h-[250px] mx-auto rounded-lg" alt="Prévisualisation" />
                    ) : (
                      <div className="text-gray-400">
                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <p className="font-medium text-lg">Le vêtement</p>
                        <p className="text-sm">Cliquez pour charger</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}

              {/* Conseils */}
              {tips && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">💡 Conseils :</h4>
                  {tips.person?.map((tip, i) => (
                    <p key={i} className="text-blue-700 text-sm">{tip}</p>
                  ))}
                  {tips.garment?.map((tip, i) => (
                    <p key={i} className="text-blue-700 text-sm">{tip}</p>
                  ))}
                </div>
              )}

              {/* Bouton d'essai */}
              <button
                onClick={handleTryOn}
                disabled={!personFile || !garmentFile || loading}
                className="mt-6 w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg 
                           disabled:bg-gray-400 hover:bg-blue-700 transition transform hover:scale-105"
              >
                {loading ? 'Génération en cours...' : '✨ Essayer ce vêtement (1 crédit)'}
              </button>

              {/* Loading spinner */}
              {loading && (
                <div className="mt-8 flex flex-col items-center">
                  <div className="loading-spinner"></div>
                  <p className="text-gray-600 mt-4">Génération en cours... (quelques secondes)</p>
                </div>
              )}
            </div>

            {/* Résultat */}
            {resultImage && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">✨ Résultat ✨</h2>
                <img src={resultImage} alt="Résultat de l'essayage" className="max-h-[500px] mx-auto rounded-lg shadow-lg" />
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    onClick={() => {
                      setPersonFile(null)
                      setGarmentFile(null)
                      setPersonPreview(null)
                      setGarmentPreview(null)
                      setResultImage(null)
                      setTips(null)
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    🔄 Nouvel essai
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
