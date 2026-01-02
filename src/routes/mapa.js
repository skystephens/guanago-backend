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
        const geojson = {
            "type": "FeatureCollection",
            "features": response.data.records.map(record => {
                const fields = record.fields;
                
                // Función para limpiar las coordenadas de comas
                const limpiarCoordenada = (valor) => {
                    if (!valor) return 0;
                    // Convertimos a string y cambiamos la coma por punto
                    const stringLimpio = valor.toString().replace(',', '.');
                    return parseFloat(stringLimpio);
                };

                return {
                    "type": "Feature",
                    "properties": {
                        "storeName": fields["Nombre"] || "Establecimiento GuanaGo",
                        "categoria": fields["Categoria"] || "General",
                        "plan": fields["Plan"] || "Gratis",
                        "address": fields["Direccion"] || "San Andrés Isla"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            limpiarCoordenada(fields["Longitud"]), // [Longitud, Latitud]
                            limpiarCoordenada(fields["Latitud"])
                        ]
                    }
                };
            })
        };

        res.json(geojson);
    } catch (error) {
        console.error("Error cargando el Directorio:", error.message);
        res.status(500).json({ error: "No se pudo sincronizar el mapa con Airtable" });
    }
});

module.exports = router;