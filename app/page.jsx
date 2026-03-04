// app/page.jsx
'use client'

import { useState } from 'react'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

export default function HomePage() {
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
      setError("Veuillez vous connecter")
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personImageBase64: personBase64, garmentImageBase64: garmentBase64, userId: user.id }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur serveur')

      setResultImage(data.imageUrl)
      if (data.tips) setTips(data.tips)
      if (data.credits !== undefined) setCredits(data.credits)
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
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold"><span className="text-blue-600">👕 Essayage</span><span className="text-gray-800">AI</span></div>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <span className="text-sm text-gray-600">Crédits: <span className="font-bold text-blue-600">{credits}</span></span>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Se connecter</button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Essayez vos vêtements <span className="text-blue-600">instantanément</span></h1>

        {!isSignedIn ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Connectez-vous pour commencer à essayer des vêtements</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Se connecter / S'inscrire</button>
            </SignInButton>
          </div>
        ) : (
          <>
            {/* Zone d'upload (simplifiée pour la brièveté - reprenez votre code complet ici) */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              {/* ... vos champs d'upload ... */}
               <div className="grid md:grid-cols-2 gap-6">
                 {/* ... previews ... */}
               </div>
              {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
              <button onClick={handleTryOn} disabled={!personFile || !garmentFile || loading} className="mt-6 w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:bg-gray-400 hover:bg-blue-700 transition">
                {loading ? 'Génération...' : '✨ Essayer ce vêtement (1 crédit)'}
              </button>
              {loading && <div className="mt-8 flex flex-col items-center"><div className="loading-spinner"></div><p className="text-gray-600 mt-4">Génération en cours...</p></div>}
            </div>
            {/* Résultat */}
            {resultImage && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">✨ Résultat ✨</h2>
                <img src={resultImage} alt="Résultat" className="max-h-[500px] mx-auto rounded-lg shadow-lg" />
                <div className="flex justify-center mt-6">
                  <button onClick={() => { setPersonFile(null); setGarmentFile(null); setPersonPreview(null); setGarmentPreview(null); setResultImage(null); }} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">🔄 Nouvel essai</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}