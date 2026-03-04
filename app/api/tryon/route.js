import { fal } from '@fal-ai/client'

export async function POST(request) {
  try {
    console.log("🚀 API route.js appelée")
    
    const { personImageBase64, garmentImageBase64, userId } = await request.json()

    console.log("✅ Images reçues, userId:", userId)

    if (!personImageBase64 || !garmentImageBase64) {
      return new Response(JSON.stringify({ error: 'Images manquantes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Configurer Fal.ai avec la clé API
    const apiKey = process.env.FAL_KEY
    console.log("🔑 Clé API présente:", !!apiKey)

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Configuration API manquante' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    fal.config({ credentials: apiKey })

    // Convertir base64 en buffers
    const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64')
    const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64')

    console.log("📤 Upload des images vers Fal.ai...")

    // Upload vers Fal.ai storage
    const personUrl = await fal.storage.upload(personBuffer, {
      contentType: 'image/jpeg'
    })
    const garmentUrl = await fal.storage.upload(garmentBuffer, {
      contentType: 'image/jpeg'
    })

    console.log("✅ Images uploadées, appel au modèle...")

    // Appel à l'API Virtual Try-On
    const result = await fal.subscribe({
      modelId: "fal-ai/image-apps-v2/virtual-try-on",
      input: {
        person_image_url: personUrl,
        clothing_image_url: garmentUrl
      }
    })

    console.log("✅ Réponse reçue de Fal.ai")

    if (!result.data?.images?.length) {
      throw new Error('Aucune image générée')
    }

    const imageUrl = result.data.images[0].url
    console.log("✅ Image générée:", imageUrl)

    return new Response(JSON.stringify({ 
      imageUrl: imageUrl 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("❌ Erreur:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
