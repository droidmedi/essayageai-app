// api/redeem-code.js
// Version ultra-simplifiée qui fonctionne immédiatement

// Stockage temporaire des codes (en mémoire)
// Dans une vraie application, on utiliserait une base de données
const codesDB = {
  // Codes de test pour vérifier que ça marche
  "TEST-1234": { tries: 5, used: false },
  "DEMO-5678": { tries: 10, used: false }
};

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (pré-vérification CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que c'est bien une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer le code envoyé par le frontend
    const { code } = req.body;

    // Vérifier que le code est présent
    if (!code) {
      return res.status(400).json({ error: 'Code manquant' });
    }

    console.log(`🔍 Vérification du code: ${code}`);

    // Vérifier si le code existe dans notre base
    if (!codesDB[code]) {
      return res.status(400).json({ error: 'Code invalide' });
    }

    // Vérifier si le code n'a pas déjà été utilisé
    if (codesDB[code].used) {
      return res.status(400).json({ error: 'Code déjà utilisé' });
    }

    // Marquer le code comme utilisé
    codesDB[code].used = true;

    // Renvoyer le nombre d'essais
    res.status(200).json({ 
      tries: codesDB[code].tries,
      message: `${codesDB[code].tries} essais ajoutés !`
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};
