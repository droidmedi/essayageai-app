
import { fal } from '@fal-ai/client'

export async function POST(request) {
  try {
    const { personImageBase64, garmentImageBase64, userId } = await request.json()

    if (!personImageBase64 || !garmentImageBase64) {
      return new Response(JSON.stringify({ error: 'Images manquantes' }), { status: 400 })
    }

    fal.config({
      credentials: process.env.FAL_KEY
    })

    // Convertir base64 en buffers
    const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64')
    const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64')

    // Upload vers Fal.ai
    const personUrl = await fal.storage.upload(personBuffer, {
      contentType: 'image/jpeg'
    })
    const garmentUrl = await fal.storage.upload(garmentBuffer, {
      contentType: 'image/jpeg'
    })

    // Appel à l'API Virtual Try-On
    const result = await fal.subscribe({
      modelId: "fal-ai/image-apps-v2/virtual-try-on",
      input: {
        person_image_url: personUrl,
        clothing_image_url: garmentUrl
      }
    })

    return new Response(JSON.stringify({ 
      imageUrl: result.data.images[0].url 
    }), { status: 200 })

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
