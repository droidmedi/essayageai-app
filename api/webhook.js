// api/webhook.js
const crypto = require('crypto');

// Stockage simple des codes
const codesDB = {};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { item_name, payer_email } = req.body;
        
        // Extraire le nombre d'essais
        const match = item_name?.match(/(\d+)/);
        const tries = match ? parseInt(match[0]) : 0;
        
        if (!tries) throw new Error("Nombre d'essais invalide");

        // Générer un code
        const code = 'ESSAI-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        
        // Sauvegarder
        codesDB[code] = { tries, email: payer_email, used: false };

        console.log(`✅ Code: ${code} (${tries} essais)`);

        res.json({ success: true, code, tries });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export
module.exports.codesDB = codesDB;
