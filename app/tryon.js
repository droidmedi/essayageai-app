// api/tryon.js
const { fal } = require('@fal-ai/client');

module.exports = async (req, res) => {
  // Configuration CORS pour permettre à votre site d'appeler l'API
  res.setHeader('Access-Control-Allow-Origin', 'https://app.essayageai.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer la pré-vérification CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que c'est bien une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Initialiser Fal.ai avec la clé API (depuis les variables d'environnement Vercel)
    fal.config({
      credentials: process.env.FAL_KEY
    });

    // Récupérer les fichiers uploadés
    const { personImage, garmentImage } = req.body;

    if (!personImage || !garmentImage) {
      return res.status(400).json({ error: 'Photos manquantes' });
    }

    // Uploader les fichiers vers Fal.ai storage
    const personUrl = await fal.storage.upload(personImage);
    const garmentUrl = await fal.storage.upload(garmentImage);

    // Appeler l'API Virtual Try-On
    const result = await fal.subscribe('fal-ai/image-apps-v2/virtual-try-on', {
      input: {
        person_image_url: personUrl,
        clothing_image_url: garmentUrl
      }
    });

    if (!result.data?.images?.length) {
      throw new Error('Aucune image générée');
    }

    // Renvoyer l'URL du résultat
    res.status(200).json({
      imageUrl: result.data.images[0].url
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'essayage virtuel'
    });
  }
};
