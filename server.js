/* const express = require('express');
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

module.exports = app; */

//PARA POSTGRESQL

const express = require('express');
const path = require('path');
const cors = require('cors'); // Para manejar solicitudes CORS
const pool = require('./dbConfig'); // Importar configuración de la base de datos
const multer = require('multer');//para que los usuarios puedan subir imagenes
const fs = require('fs-extra'); // Importar fs-extra
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());


// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/images')); // Directorio de destino
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre del archivo con marca de tiempo
    }
});

// Filtrando archivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'));
    }
};

// Crear el middleware de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Para manejar solicitudes JSON

// Ruta para obtener todas las recetas
app.get('/recipes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM recipes');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener recetas:', err);
        res.status(500).send('Error al obtener recetas');
    }
});

// Ruta para obtener una receta específica
app.get('/recipes/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
        if (result.rows.length === 0) {
            return res.status(404).send('Receta no encontrada');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener receta:', err);
        res.status(500).send('Error al obtener receta');
    }
});


app.post('/recipes', upload.single('recipeImage'), async (req, res) => {
    const { recipeName, recipeDescription, recipeIngredients, recipeSteps, id } = req.body;
    const recipeImage = req.file ? `images/${req.file.filename}` : null; // Obtener el nombre del archivo subido
    try {
        const result = await pool.query(
            'INSERT INTO recipes (recipeName, recipeDescription, recipeIngredients, recipeSteps, recipeImage, id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [recipeName, recipeDescription, recipeIngredients, recipeSteps, recipeImage, id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar receta:', err);
        res.status(500).send('Error al agregar receta');
    }
});

app.delete('/recipes/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
        // Primero, obtenemos la receta para obtener el nombre del archivo de imagen
        const result = await pool.query('SELECT recipeimage FROM recipes WHERE id = $1', [recipeId]);
        if (result.rows.length === 0) {
            return res.status(404).send('Receta no encontrada');
        }

        // Obtener la imagen de la receta
        const recipeImage = result.rows[0].recipeimage;
        console.log('Image to delete:', recipeImage); // Verificar nombre de imagen

        // Eliminar la receta de la base de datos
        const deleteResult = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [recipeId]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).send('Receta no encontrada');
        }

        // Eliminar la imagen del servidor
        if (recipeImage) {
            const imagePath = path.join(__dirname, 'public', recipeImage);
            console.log('Deleting image at:', imagePath); // Verificar ruta de imagen
            try {
                await fs.remove(imagePath); // Elimina el archivo de imagen
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
                // No es crítico si falla la eliminación de la imagen
            }
        }

        res.status(200).send('Receta eliminada con éxito');
    } catch (err) {
        console.error('Error al eliminar receta:', err);
        res.status(500).send('Error al eliminar receta');
    }
});

// Ruta para editar una receta existente
app.put('/recipes/:id', async (req, res) => {
    const recipeId = req.params.id;
    const { recipeName, recipeDescription, recipeIngredients, recipeSteps, recipeImage} = req.body;
    try {
        const result = await pool.query(
            'UPDATE recipes SET recipeName = $1, recipeDescription = $2, recipeIngredients = $3, recipeSteps = $4, recipeImage = $5 WHERE id = $6 RETURNING *',
            [recipeName, recipeDescription, recipeIngredients, recipeSteps, recipeImage, recipeId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Receta no encontrada');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar receta:', err);
        res.status(500).send('Error al actualizar receta');
    }
});

// Ruta para obtener la contraseña de administrador
app.get('/admin-password', (req, res) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    res.json({ password: adminPassword });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
 