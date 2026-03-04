// api/tryon.js
const { fal } = require('@fal-ai/client');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://app.essayageai.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        console.log("🚀 API appelée");

        const apiKey = process.env.FAL_KEY;
        fal.config({ credentials: apiKey });

        // Récupérer les images en base64 du frontend
        const { personImageBase64, garmentImageBase64 } = req.body;

        // Convertir base64 en fichiers pour Fal.ai
        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');

        // Upload automatique vers Fal.ai storage
        console.log("📤 Upload des images vers Fal.ai...");
        const personUrl = await fal.storage.upload(personBuffer, {
            contentType: 'image/jpeg'
        });
        const garmentUrl = await fal.storage.upload(garmentBuffer, {
            contentType: 'image/jpeg'
        });

        console.log("✅ Images uploadées, appel à l'API...");
        
        // Appel à l'API Virtual Try-On
        const result = await fal.subscribe("fal-ai/image-apps-v2/virtual-try-on", {
            input: {
                person_image_url: personUrl,
                clothing_image_url: garmentUrl
            }
        });

        return res.status(200).json({
            imageUrl: result.data.images[0].url
        });

    } catch (error) {
        console.error("❌ Erreur:", error);
        return res.status(500).json({ error: error.message });
    }
};