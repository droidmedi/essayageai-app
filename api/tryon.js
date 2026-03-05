// api/tryon.js
const { fal } = require('@fal-ai/client');

module.exports = async (req, res) => {
    console.log('🚀 ===== DÉBUT DE L\'APPEL API =====');
    
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        console.log('✅ Requête OPTIONS');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        console.log('❌ Méthode non autorisée:', req.method);
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // 1. Vérification de la clé API
        const apiKey = process.env.FAL_KEY;
        console.log('🔑 Clé API présente:', !!apiKey);
        console.log('🔑 Longueur:', apiKey ? apiKey.length : 0);
        
        if (!apiKey) {
            console.error('❌ FAL_KEY manquante dans les variables d\'environnement');
            return res.status(500).json({ error: 'Configuration API manquante' });
        }

        // 2. Récupération des images
        const { personImageBase64, garmentImageBase64 } = req.body;
        console.log('📸 Images reçues:', {
            person: personImageBase64 ? `${personImageBase64.substring(0, 30)}...` : 'manquante',
            garment: garmentImageBase64 ? `${garmentImageBase64.substring(0, 30)}...` : 'manquante'
        });

        if (!personImageBase64 || !garmentImageBase64) {
            return res.status(400).json({ error: 'Images manquantes' });
        }

        // 3. Configuration de Fal.ai
        console.log('⚙️ Configuration de Fal.ai...');
        fal.config({ credentials: apiKey });

        // 4. Conversion des images
        console.log('🔄 Conversion base64 -> buffer...');
        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');
        console.log('✅ Buffers créés:', {
            person: `${personBuffer.length} bytes`,
            garment: `${garmentBuffer.length} bytes`
        });

        // 5. Upload vers Fal.ai
        console.log('📤 Upload des images vers Fal.ai...');
        const personUrl = await fal.storage.upload(personBuffer, { contentType: 'image/jpeg' });
        console.log('✅ Image personne uploadée:', personUrl);
        
        const garmentUrl = await fal.storage.upload(garmentBuffer, { contentType: 'image/jpeg' });
        console.log('✅ Image vêtement uploadée:', garmentUrl);

        // 6. Appel au modèle
        console.log('🤖 Appel au modèle Virtual Try-On...');
        const startTime = Date.now();
        
        const result = await fal.subscribe({
            modelId: "fal-ai/image-apps-v2/virtual-try-on",
            input: {
                person_image_url: personUrl,
                clothing_image_url: garmentUrl
            }
        });
        
        const duration = Date.now() - startTime;
        console.log(`✅ Réponse reçue en ${duration}ms`);

        // 7. Vérification du résultat
        if (!result.data?.images?.length) {
            console.error('❌ Pas d\'images dans la réponse:', result);
            throw new Error('Aucune image générée');
        }

        const imageUrl = result.data.images[0].url;
        console.log('✅ Image générée:', imageUrl);

        // 8. Réponse finale
        return res.status(200).json({ imageUrl });

    } catch (error) {
        console.error('❌ ERREUR DÉTAILLÉE:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.response) console.error('Response:', error.response);
        
        return res.status(500).json({ 
            error: error.message || 'Erreur serveur',
            details: error.toString()
        });
    }
};
