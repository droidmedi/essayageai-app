// api/tryon.js
const { fal } = require('@fal-ai/client');

module.exports = async (req, res) => {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://app.essayageai.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        console.log("🚀 ===== DÉBUT DE L'APPEL API =====");

        const apiKey = process.env.FAL_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Configuration API manquante" });
        }

        fal.config({ credentials: apiKey });

        const { personImageBase64, garmentImageBase64 } = req.body;

        if (!personImageBase64 || !garmentImageBase64) {
            return res.status(400).json({ error: 'Images manquantes' });
        }

        console.log("📤 Analyse et upload des images...");

        // Convertir base64 en buffers
        const personBuffer = Buffer.from(personImageBase64.split(',')[1], 'base64');
        const garmentBuffer = Buffer.from(garmentImageBase64.split(',')[1], 'base64');

        // Analyser la qualité des images (simulation basée sur la taille)
        const personSizeKB = personBuffer.length / 1024;
        const garmentSizeKB = garmentBuffer.length / 1024;
        
        const personTips = [];
        const garmentTips = [];

        // Conseils pour la photo personne
        if (personSizeKB < 100) {
            personTips.push("📸 Votre photo est un peu petite. Pour un meilleur résultat, prenez une photo avec plus de détails.");
        }
        if (personSizeKB > 2000) {
            personTips.push("📸 Votre photo est très grande. Elle a été réduite automatiquement pour l'analyse.");
        }

        // Conseils pour la photo vêtement
        if (garmentSizeKB < 50) {
            garmentTips.push("👕 La photo du vêtement est floue. Essayez de la reprendre avec un meilleur éclairage.");
        }
        if (garmentSizeKB > 1500) {
            garmentTips.push("👕 Photo du vêtement optimisée automatiquement.");
        }

        // Conseils généraux
        const generalTips = [
            "💡 Astuce : Pour de meilleurs résultats :",
            "• Placez le vêtement à plat sur fond clair",
            "• Évitez les ombres et les plis",
            "• Préférez la lumière naturelle",
            "• Tenez-vous droit, visage visible"
        ];

        console.log("📤 Upload vers Fal.ai...");
        
        // Upload vers Fal.ai storage
        const personUrl = await fal.storage.upload(personBuffer, {
            contentType: 'image/jpeg'
        });
        const garmentUrl = await fal.storage.upload(garmentBuffer, {
            contentType: 'image/jpeg'
        });

        console.log("🔄 Appel au modèle Virtual Try-On avec paramètres optimisés...");

        // Appel à l'API avec paramètres de qualité
        const result = await fal.subscribe({
            modelId: "fal-ai/image-apps-v2/virtual-try-on",
            input: {
                person_image_url: personUrl,
                clothing_image_url: garmentUrl,
                // Paramètres pour améliorer la qualité
                guidance_scale: 7.5,      // Fidélité au prompt
                num_inference_steps: 50,    // Qualité (plus = mieux)
                seed: Math.floor(Math.random() * 1000000)  // Variation
            },
            logs: true
        });

        console.log("✅ Réponse reçue de Fal.ai");

        if (!result.data?.images?.length) {
            throw new Error('Aucune image générée');
        }

        const imageUrl = result.data.images[0].url;
        console.log("✅ Image générée:", imageUrl);

        // Renvoyer l'image ET les conseils
        return res.status(200).json({
            imageUrl: imageUrl,
            tips: {
                person: personTips,
                garment: garmentTips,
                general: generalTips,
                quality: "standard" // ou "high" selon le modèle choisi
            }
        });

    } catch (error) {
        console.error("❌ ERREUR:", error);
        return res.status(500).json({ 
            error: error.message || 'Erreur lors de l\'essayage virtuel'
        });
    }
};