const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ruta: https://guanago-backend.onrender.com/api/v1/locations.geojson
router.get('/locations.geojson', async (req, res) => {
    try {
        // 1. Llamada a Airtable - Tabla: Directorio_Mapa
        const response = await axios.get(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Directorio_Mapa`, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
        });

        // 2. Mapeo al formato GeoJSON con tus 4 planes y Categoria
        const features = response.data.records
            .map(record => {
                const fields = record.fields;
                const latRaw = fields["Latitud"];
                const lngRaw = fields["Longitud"];

                // SI NO HAY COORDENADAS, IGNORAMOS ESTE PUNTO
                if (!latRaw || !lngRaw) return null;

                const lat = parseFloat(latRaw.toString().replace(',', '.'));
                const lng = parseFloat(lngRaw.toString().replace(',', '.'));

                return {
                    "type": "Feature",
                    "properties": {
                        "storeName": fields["Nombre"],
                        // Convertimos a minúsculas y quitamos espacios extras para que sea más fácil de reconocer
                        "categoria": (fields["Categoria"] || "Otros").trim()
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat] // Longitud primero siempre
                    }
                };
            })
            .filter(f => f !== null); // Elimina los registros que no tenían coordenadas

        const geojson = {
            "type": "FeatureCollection",
            "features": features
        };

        res.json(geojson);
    } catch (error) {
        console.error("Error cargando el Directorio:", error.message);
        res.status(500).json({ error: "No se pudo sincronizar el mapa con Airtable" });
    }
});

module.exports = router;