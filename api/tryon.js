// api/tryon.js - Version avec fetch direct (sans SDK buggé)
module.exports = async (req, res) => {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { personImageBase64, garmentImageBase64 } = req.body;

        // 1. Upload des images (on garde cette partie qui fonctionne)
        const { fal } = require('@fal-ai/client');
        fal.config({ credentials: process.env.FAL_KEY });

        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');

        const personUrl = await fal.storage.upload(personBuffer, { contentType: 'image/jpeg' });
        const garmentUrl = await fal.storage.upload(garmentBuffer, { contentType: 'image/jpeg' });

        console.log('✅ Images uploadées:', { personUrl, garmentUrl });

        // 2. Appel direct à l'API REST (contourne le SDK buggé)
        const response = await fetch('https://fal.run/fal-ai/image-apps-v2/virtual-try-on', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${process.env.FAL_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                person_image_url: personUrl,
                clothing_image_url: garmentUrl
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Réponse Fal.ai non-OK:', data);
            throw new Error(data.error || `Erreur API: ${response.status}`);
        }

        console.log('✅ Réponse Fal.ai:', data);

        if (!data.images?.length) {
            throw new Error('Aucune image générée');
        }

        return res.status(200).json({ 
            imageUrl: data.images[0].url 
        });

    } catch (error) {
        console.error('❌ Erreur détaillée:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });
        
        return res.status(500).json({ 
            error: error.message || 'Erreur serveur',
            details: error.toString()
        });
    }
};
