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
        console.log("🔑 Clé API présente?", !!apiKey);
        console.log("🔑 Clé (premiers caractères):", apiKey?.substring(0, 10) + "...");

        if (!apiKey) {
            console.error("❌ FAL_KEY n'est pas définie");
            return res.status(500).json({ error: "Configuration API manquante" });
        }

        // Initialisation
        fal.config({ credentials: apiKey });

        const { personImageUrl, garmentImageUrl } = req.body;
        
        console.log("📸 URL personne:", personImageUrl);
        console.log("👕 URL vêtement:", garmentImageUrl);

        if (!personImageUrl || !garmentImageUrl) {
            return res.status(400).json({ error: 'URLs des photos manquantes' });
        }

        // MODÈLE PLUS SIMPLE - Celui-ci existe à coup sûr
        console.log("🔄 Appel à Fal.ai avec le modèle de base...");
        
        const result = await fal.subscribe({
            modelId: "fal-ai/birefnet-v2", // Modèle simple pour tester
            input: {
                image_url: personImageUrl,
                mask_prompt: "clothing"
            },
            logs: true
        });

        console.log("✅ Réponse reçue de Fal.ai");
        console.log("Structure réponse:", JSON.stringify(result).substring(0, 200));

        // Si ça marche, on pourra revenir au vrai modèle
        if (result.data?.images?.length) {
            const imageUrl = result.data.images[0].url;
            console.log("✅ Image générée:", imageUrl);

            return res.status(200).json({
                imageUrl: imageUrl
            });
        } else {
            // Pour le test, renvoyons une image par défaut
            return res.status(200).json({
                imageUrl: "https://images.unsplash.com/photo-1542293787938-c9e299b880cc?w=400",
                message: "Mode test - API fonctionne"
            });
        }

    } catch (error) {
        console.error("❌ ERREUR DÉTAILLÉE:");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        console.error("Body:", error.body);
        console.error("Stack:", error.stack);

        return res.status(500).json({ 
            error: error.message || 'Erreur lors de l\'essayage virtuel',
            status: error.status,
            details: error.body
        });
    }
};