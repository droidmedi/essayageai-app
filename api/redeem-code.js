// api/redeem-code.js
// Importer la base de données partagée
const { codesDB } = require('./paypal-webhook');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { code } = req.body;
    
    if (!code) return res.status(400).json({ error: 'Code manquant' });

    // Vérifier le code
    if (!codesDB[code]) return res.status(400).json({ error: 'Code invalide' });
    if (codesDB[code].used) return res.status(400).json({ error: 'Code déjà utilisé' });

    // Marquer comme utilisé
    codesDB[code].used = true;

    res.json({ 
      tries: codesDB[code].tries, 
      message: `${codesDB[code].tries} essais ajoutés !` 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
