// api/tryon.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { personImageBase64, garmentImageBase64 } = req.body;

        // Convertir base64 en buffers
        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');

        // Upload vers Fal.ai
        const fal = require('@fal-ai/client');
        fal.config({ credentials: process.env.FAL_KEY });

        const personUrl = await fal.storage.upload(personBuffer, { contentType: 'image/jpeg' });
        const garmentUrl = await fal.storage.upload(garmentBuffer, { contentType: 'image/jpeg' });

        // Appel DIRECT à l'API (contourne le bug)
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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erreur API');
        }

        if (!result.images?.length) {
            throw new Error('Aucune image générée');
        }

        res.status(200).json({ imageUrl: result.images[0].url });

    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ error: error.message });
    }
};
