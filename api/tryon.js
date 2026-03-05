// api/tryon.js - Version avec la bonne URL d'upload
const fetch = require('node-fetch');

// Fonction pour uploader une image directement vers Fal.ai
async function uploadImage(buffer, apiKey) {
    // Créer un FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'image.jpg');

    // ✅ URL CORRECTE pour l'upload
    const response = await fetch('https://storage.fal.ai/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.url; // L'URL publique de l'image
}

module.exports = async (req, res) => {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { personImageBase64, garmentImageBase64 } = req.body;
        const apiKey = process.env.FAL_KEY;

        if (!apiKey) {
            throw new Error('FAL_KEY manquante');
        }

        // 1. Convertir base64 en buffers
        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');

        console.log('📤 Upload des images...');

        // 2. Uploader les images
        const [personUrl, garmentUrl] = await Promise.all([
            uploadImage(personBuffer, apiKey),
            uploadImage(garmentBuffer, apiKey)
        ]);

        console.log('✅ Images uploadées:', { personUrl, garmentUrl });

        // 3. Appel à l'API Virtual Try-On
        console.log('🤖 Appel au modèle...');
        const response = await fetch('https://fal.run/fal-ai/image-apps-v2/virtual-try-on', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                person_image_url: personUrl,
                clothing_image_url: garmentUrl
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Réponse Fal.ai:', data);
            throw new Error(data.error || `Erreur API: ${response.status}`);
        }

        console.log('✅ Réponse reçue');

        if (!data.images?.length) {
            throw new Error('Aucune image générée');
        }

        return res.status(200).json({ 
            imageUrl: data.images[0].url 
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        return res.status(500).json({ 
            error: error.message || 'Erreur serveur'
        });
    }
};
