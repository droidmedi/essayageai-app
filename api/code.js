// api/codes.js - Gestionnaire unique des codes
const crypto = require('crypto');

// Stockage des codes
const codesDB = {};

// Fonction pour générer un code
function generateCode(tries, email) {
    const code = 'ESSAI-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    codesDB[code] = { tries, email, used: false, createdAt: new Date() };
    return code;
}

// API principale
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { type } = req.query; // ?type=generate ou ?type=redeem

    try {
        // Génération de code (pour PayPal)
        if (type === 'generate') {
            const { item_name, payer_email } = req.body;
            const match = item_name?.match(/(\d+)/);
            const tries = match ? parseInt(match[0]) : 0;
            
            if (!tries) throw new Error("Nombre d'essais invalide");
            
            const code = generateCode(tries, payer_email);
            console.log(`✅ Code généré: ${code} (${tries} essais)`);
            
            return res.json({ success: true, code, tries });
        }

        // Validation de code (pour les utilisateurs)
        if (type === 'redeem') {
            const { code } = req.body;
            
            if (!code) return res.status(400).json({ error: 'Code manquant' });

            if (!codesDB[code]) return res.status(400).json({ error: 'Code invalide' });
            if (codesDB[code].used) return res.status(400).json({ error: 'Code déjà utilisé' });

            codesDB[code].used = true;

            return res.json({ 
                tries: codesDB[code].tries, 
                message: `${codesDB[code].tries} essais ajoutés !` 
            });
        }

        return res.status(400).json({ error: 'Type d\'opération manquant' });

    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ error: error.message });
    }
};
