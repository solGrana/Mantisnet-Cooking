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

//Ruta para obtener receta especifica
app.get('/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    const filePath = path.join(__dirname, 'public', 'recipes.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer recipes.json');
        }
        const recipes = JSON.parse(data).recipes;
        
        // Encuentra la receta por ID
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) {
            return res.status(404).send('Receta no encontrada');
        }
        res.json(recipe);  // Envío la receta en formato JSON
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

// Ruta para eliminar una receta
app.delete('/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    const filePath = path.join(__dirname, 'public', 'recipes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading recipes.json');
        }
        let recipes = JSON.parse(data);

        // Verifica si recipes es un array
        if (!Array.isArray(recipes.recipes)) {
            return res.status(500).send('Error: recipes is not an array');
        }

        // Filtra la receta que no se quiere eliminar
        recipes.recipes = recipes.recipes.filter(recipe => recipe.id !== recipeId);

        fs.writeFile(filePath, JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to recipes.json');
            }
            res.status(200).send('Recipe deleted successfully');
        });
    });
});

// Ruta para editar una receta existente
app.put('/recipes/:id', (req, res) => {
    const recipeId = req.params.id; // ID de la receta a editar
    const updatedRecipe = req.body; // Datos actualizados de la receta
    const filePath = path.join(__dirname, 'public', 'recipes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading recipes.json');
        }
        let recipes = JSON.parse(data);

        // Verifica si recipes es un array
        if (!Array.isArray(recipes.recipes)) {
            return res.status(500).send('Error: recipes is not an array');
        }

        // Encuentra la receta por ID y actualiza sus datos
        const recipeIndex = recipes.recipes.findIndex(recipe => recipe.id === recipeId);
        if (recipeIndex === -1) {
            return res.status(404).send('Recipe not found');
        }

        // Actualiza solo los campos que se reciben del cuerpo de la solicitud
        recipes.recipes[recipeIndex] = {
            ...recipes.recipes[recipeIndex],
            ...updatedRecipe
        };

        // Escribe las recetas actualizadas en el archivo
        fs.writeFile(filePath, JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to recipes.json');
            }
            res.status(200).json(recipes.recipes[recipeIndex]); // Devuelve la receta actualizada
        });
    });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;