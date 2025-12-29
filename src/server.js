require('dotenv').config({ path: '../.env' }); 
const express = require('express');
const app = express();
const traceRoutes = require('./routes/trace');

app.use(express.json());

// Aquí conectamos los hilos de trazabilidad
app.use('/api/v1', traceRoutes);

// Ruta de prueba para ver en el navegador
app.get('/', (req, res) => {
    res.send('<h1>Sistemas de GuanaGo en línea 🚀</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n************************************`);
    console.log(`🚀 Jarvis GuanaGo activo`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`************************************\n`);
});