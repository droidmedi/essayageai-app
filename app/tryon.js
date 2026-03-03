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
    // Initialiser Fal.ai avec la clé API
    fal.config({
      credentials: process.env.FAL_KEY
    });

    // Récupérer les fichiers uploadés (attention: le format est différent)
    const { personImage, garmentImage } = req.body;

    if (!personImage || !garmentImage) {
      return res.status(400).json({ error: 'Photos manquantes' });
    }

    // Convertir les images en buffers pour l'upload
    const personBuffer = Buffer.from(personImage.split(',')[1], 'base64');
    const garmentBuffer = Buffer.from(garmentImage.split(',')[1], 'base64');

    // Uploader vers Fal.ai storage
    const personUrl = await fal.storage.upload(personBuffer, {
      contentType: 'image/jpeg'
    });
    const garmentUrl = await fal.storage.upload(garmentBuffer, {
      contentType: 'image/jpeg'
    });

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
    return res.status(200).json({
      imageUrl: result.data.images[0].url
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'essayage virtuel'
    });
  }
};
