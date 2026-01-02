require('dotenv').config({ path: '../.env' });
const express = require('express');
const axios = require('axios');
const Groq = require('groq-sdk'); // Importamos Groq
const mapaRoutes = require('./routes/mapa');

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use('/api/v1', mapaRoutes);

// ENDPOINT DE ONBOARDING CON IA (GROQ)
app.post('/api/v1/onboarding', async (req, res) => {
    const { nombre, relato } = req.body;

    try {
        // 1. Jarvis analiza el relato usando Groq (Llama 3)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres Jarvis, el cerebro de GuanaGo. Tu misión es convertir relatos de empresarios de San Andrés en perfiles estructurados para un sistema RAG (Base de conocimientos). Enfócate en la esencia cultural Raizal, servicios y sostenibilidad."
                },
                {
                    role: "user",
                    content: `Analiza este relato: "${relato}". Extrae de forma estructurada: 
                              1. Nombre comercial. 
                              2. Servicios clave. 
                              3. Elemento de identidad Kriol/Raizal. 
                              4. Breve descripción optimizada para recomendación turística.`
                }
            ],
            model: "llama-3.3-70b-versatile", // Modelo ultra rápido y capaz
        });

        const contextoIA = chatCompletion.choices[0]?.message?.content || "";

        // 2. Guardar en Airtable (Onboarding_Aliados)
        await axios.post(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Onboarding_Aliados`, {
            fields: {
                "Nombre del Aliado": nombre,
                "Relato Original": relato,
                "Contexto_IA": contextoIA,
                "Fecha_Registro": new Date().toISOString()
            }
        }, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
        });

        res.status(200).json({ 
            success: true, 
            message: "Aliado mapeado exitosamente",
            analisis: contextoIA 
        });

    } catch (error) {
        console.error("Error en Onboarding:", error);
        res.status(500).json({ error: "Fallo en el procesamiento del aliado" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Jarvis GuanaGo con Groq activo en puerto ${PORT}`);
});