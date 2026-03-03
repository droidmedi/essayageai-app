// api/tryon.js
const { fal } = require('@fal-ai/client');

module.exports = async (req, res) => {
  // Configuration CORS pour permettre à votre site d'appeler l'API
  res.setHeader('Access-Control-Allow-Origin', 'https://app.essayageai.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer la pré-vérification CORS (requête OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que c'est bien une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log("✅ Début de l'appel API");
    
    // Initialiser Fal.ai avec la clé API (depuis les variables d'environnement Vercel)
    fal.config({
      credentials: process.env.FAL_KEY
    });

    // Récupérer les données envoyées par le frontend
    const { personImageUrl, garmentImageUrl } = req.body;

    if (!personImageUrl || !garmentImageUrl) {
      return res.status(400).json({ error: 'URLs des photos manquantes' });
    }

    console.log("🔄 Appel à Fal.ai avec les URLs...");
    console.log("Personne:", personImageUrl);
    console.log("Vêtement:", garmentImageUrl);
    
    // Appeler l'API Virtual Try-On
    const result = await fal.subscribe('fal-ai/image-apps-v2/virtual-try-on', {
      input: {
        person_image_url: personImageUrl,
        clothing_image_url: garmentImageUrl
      }
    });

    console.log("✅ Réponse reçue de Fal.ai");

    // Vérifier que le résultat contient bien une image
    if (!result.data?.images?.length) {
      throw new Error('Aucune image générée');
    }

    // Renvoyer l'URL de l'image générée
    return res.status(200).json({
      imageUrl: result.data.images[0].url,
      requestId: result.requestId
    });

  } catch (error) {
    console.error('❌ Erreur détaillée:', error);
    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'essayage virtuel'
    });
  }
};
