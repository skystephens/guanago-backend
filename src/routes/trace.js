const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/trace', async (req, res) => {
    const { scenario_name, status, message } = req.body;
    try {
        await axios.post(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Logs_Trazabilidad`, {
            fields: {
                "Escenario": scenario_name,
                "Estado": status,
                "Mensaje": message
            }
        }, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error Airtable:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error en el registro de trazabilidad" });
    }
});

module.exports = router;