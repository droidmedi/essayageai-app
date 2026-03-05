// api/tryon.js - VERSION CORRIGÉE
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

        if (!personImageBase64 || !garmentImageBase64) {
            return res.status(400).json({ error: 'Images manquantes dans la requête' });
        }

        // Configurer Fal.ai
        const apiKey = process.env.FAL_KEY;
        if (!apiKey) {
            throw new Error('FAL_KEY manquante dans les variables d\'environnement');
        }
        fal.config({ credentials: apiKey });

        // Nettoyage et conversion base64 en buffers
        // On s'assure de retirer le prefixe data:image/...;base64, si présent
        const cleanBase64 = (str) => str.includes(',') ? str.split(',')[1] : str;
        
        const personBuffer = Buffer.from(cleanBase64(personImageBase64), 'base64');
        const garmentBuffer = Buffer.from(cleanBase64(garmentImageBase64), 'base64');

        // Upload vers Fal.ai
        console.log('📤 Upload des images...');
        const personUrl = await fal.storage.upload(personBuffer, { contentType: 'image/jpeg' });
        const garmentUrl = await fal.storage.upload(garmentBuffer, { contentType: 'image/jpeg' });
        console.log('✅ Images uploadées');

        // Appel à l'API Virtual Try-On
        // CORRECTION : Utilisation de la signature (modelId, config)
        console.log('🤖 Appel au modèle...');
        const result = await fal.subscribe("fal-ai/image-apps-v2/virtual-try-on", {
            input: {
                person_image_url: personUrl,
                clothing_image_url: garmentUrl
            },
            // On passe un objet d'options vide pour éviter l'erreur de déstructuration de 'webhookUrl'
            options: {} 
        });

        console.log('✅ Réponse reçue');

        // Extraction de l'URL (Vérification de plusieurs chemins possibles selon la version du SDK)
        const outputImage = result.images?.[0]?.url || result.data?.images?.[0]?.url;

        if (!outputImage) {
            console.error('Résultat complet pour debug:', JSON.stringify(result));
            throw new Error('Aucune image générée dans la réponse de Fal.ai');
        }

        // Retourner l'URL de l'image générée
        res.status(200).json({ 
            imageUrl: outputImage 
        });

    } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
};
