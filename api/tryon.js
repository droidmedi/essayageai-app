// api/tryon.js - VERSION FINALE STABLE
const { fal } = require('@fal-ai/client');

module.exports = async (req, res) => {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { personImageBase64, garmentImageBase64 } = req.body;

        // Configurer Fal.ai
        const apiKey = process.env.FAL_KEY;
        if (!apiKey) {
            throw new Error('FAL_KEY manquante dans les variables d\'environnement');
        }
        fal.config({ credentials: apiKey });

        // Convertir base64 en buffers
        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');

        // Upload vers Fal.ai
        console.log('📤 Upload des images...');
        const personUrl = await fal.storage.upload(personBuffer, { contentType: 'image/jpeg' });
        const garmentUrl = await fal.storage.upload(garmentBuffer, { contentType: 'image/jpeg' });
        console.log('✅ Images uploadées');

        // Appel à l'API Virtual Try-On
        console.log('🤖 Appel au modèle...');
        const result = await fal.subscribe({
            modelId: "fal-ai/image-apps-v2/virtual-try-on",
            input: {
                person_image_url: personUrl,
                clothing_image_url: garmentUrl
            }
        });

        console.log('✅ Réponse reçue');

        if (!result.data?.images?.length) {
            throw new Error('Aucune image générée');
        }

        // Retourner l'URL de l'image générée
        res.status(200).json({ 
            imageUrl: result.data.images[0].url 
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ error: error.message });
    }
};
