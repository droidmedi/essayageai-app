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
    
    // Vérification de la clé API
    const apiKey = process.env.FAL_KEY;
    console.log("🔑 Clé API présente?", !!apiKey);
    
    if (!apiKey) {
      console.error("❌ FAL_KEY n'est pas définie dans les variables d'environnement");
      return res.status(500).json({ error: 'Configuration API manquante' });
    }

    // Initialisation correcte du client Fal.ai
    fal.config({
      credentials: apiKey
    });

    const { personImageUrl, garmentImageUrl } = req.body;
    
    console.log("📸 URL personne:", personImageUrl);
    console.log("👕 URL vêtement:", garmentImageUrl);

    if (!personImageUrl || !garmentImageUrl) {
      return res.status(400).json({ error: 'URLs des photos manquantes' });
    }

    console.log("🔄 Appel à Fal.ai avec les URLs...");
    
    // Version corrigée de l'appel
    const result = await fal.subscribe({
      modelId: "fal-ai/image-apps-v2/virtual-try-on",
      input: {
        person_image_url: personImageUrl,
        clothing_image_url: garmentImageUrl
      },
      logs: true
    });

    console.log("✅ Réponse reçue de Fal.ai");

    if (!result.data?.images?.length) {
      console.error("❌ Pas d'images dans la réponse:", result);
      throw new Error('Aucune image générée');
    }

    const imageUrl = result.data.images[0].url;
    console.log("✅ Image générée:", imageUrl);

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("❌ ERREUR DÉTAILLÉE:");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Body:", error.body);
    
    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'essayage virtuel',
      status: error.status,
      details: error.body
    });
  }
};