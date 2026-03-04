// api/redeem-code.js
// Importer la base de données partagée (simulée ici)
// Dans une vraie application, utilise une vraie base de données
const { codesDB } = require('./paypal-webhook.js');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { code } = req.body;

    // Vérifier que le code est fourni
    if (!code) {
      return res.status(400).json({ error: 'Code manquant' });
    }

    console.log(`🔍 Vérification du code: ${code}`);

    // Vérifier si le code existe dans notre base
    if (!codesDB || !codesDB[code]) {
      console.log(`❌ Code invalide: ${code}`);
      return res.status(400).json({ error: 'Code invalide' });
    }

    // Vérifier si le code n'a pas déjà été utilisé
    if (codesDB[code].used) {
      console.log(`⚠️ Code déjà utilisé: ${code}`);
      return res.status(400).json({ error: 'Code déjà utilisé' });
    }

    // Marquer le code comme utilisé
    codesDB[code].used = true;
    codesDB[code].usedAt = new Date();

    console.log(`✅ Code ${code} validé avec succès (${codesDB[code].tries} essais)`);

    // Renvoyer le nombre d'essais au frontend
    res.status(200).json({ 
      tries: codesDB[code].tries,
      message: `${codesDB[code].tries} essais ajoutés avec succès !`,
      email: codesDB[code].email
    });

  } catch (error) {
    console.error('❌ Erreur redeem:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};