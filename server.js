const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Para manejar solicitudes CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Para manejar solicitudes JSON

// Ruta para obtener todas las recetas
app.get('/recipes', (req, res) => {
    fs.readFile(path.join(__dirname, 'public', 'recipes.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }
        res.send(data);
    });
});
// Ruta para agregar una receta
app.post('/recipes', (req, res) => {
    const newRecipe = req.body;
    const filePath = path.join(__dirname, 'public', 'recipes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading recipes.json');
        }
        const recipes = JSON.parse(data);

        // Verifica si recipes es un array
        if (!Array.isArray(recipes.recipes)) {
            return res.status(500).send('Error: recipes is not an array');
        }

        recipes.recipes.push(newRecipe);

        fs.writeFile(filePath, JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to recipes.json');
            }
            res.status(201).json(newRecipe);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;