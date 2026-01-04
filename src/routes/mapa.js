const express = require('express');
const router = express.Router();
const axios = require('axios');

// Función auxiliar para limpiar coordenadas
const limpiarCoordenada = (valor) => {
    if (!valor) return 0;
    return parseFloat(valor.toString().replace(',', '.'));
};

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

                return {
                    "type": "Feature",
                    "properties": {
                        "storeName": fields["Nombre"],
                        "categoria": fields["Categoria"], // Esto activa los COLORES
                        "plan": fields["Plan"] || "Gratis"  // 👈 ESTA LÍNEA ACTIVA EL TAMAÑO Y EL TEXTO
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            limpiarCoordenada(fields["Longitud"]),
                            limpiarCoordenada(fields["Latitud"])
                        ]
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