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
                        "categoria": fields["Categoria"],
                        "plan": fields["Plan"] || "Gratis", // Mantenlo aquí para la lógica de tamaño
                        "direccion": fields["Direccion"] || "San Andrés Isla",
                        "telefono": fields["Telefono"] || "",
                        "foto": fields["Foto_Principal"] ? fields["Foto_Principal"][0].url : "https://via.placeholder.com/150",
                        "id_slug": fields["ID_Slug"], // Un nombre corto para la URL, ej: "restaurante-capy"
                        "promo": fields["Promo_Activa"] || ""
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