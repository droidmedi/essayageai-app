// api/create-payment.js
module.exports = async (req, res) => {
    // Configuration CORS plus permissive pour les tests
    res.setHeader('Access-Control-Allow-Origin', '*');  // ← CHANGE ICI
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const { tries, price } = req.body;
        
        console.log("✅ Demande de paiement reçue:", { tries, price });

        const PAYPAL_EMAIL = "mehdimedi555@gmail.com";
        
        const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_EMAIL}&item_name=${tries}%20essais%20EssayageAI&amount=${price}&currency_code=EUR&return=https://essayageai-app.vercel.app/success&cancel_return=https://essayageai-app.vercel.app`;

        console.log("🔗 URL PayPal générée:", paypalUrl);

        res.status(200).json({ paypalUrl });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ error: error.message });
    }
};
