document.addEventListener("DOMContentLoaded", function () {
    // Realiza una petición para obtener el archivo JSON con las recetas
    fetch('recipes.json')
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(recipes => {
             // Obtiene los elementos del DOM para el dropdown y el contenedor de recetas
            const recipeDropdown = document.getElementById('recipe-dropdown');
            const recipesContainer = document.getElementById('recipes-container');

            recipes.recipes.forEach(recipe => {
                // Crea un link para el dropdown y agrega la receta al dropdown
                const dropdownLink = document.createElement('a');
                dropdownLink.href = `recipeTemplate.html?id=${recipe.id}`; // CAMBIE EL RECIPE.URL
                dropdownLink.textContent = recipe.recipeName;
                recipeDropdown.appendChild(dropdownLink);
            });
        })
        .catch(error => console.error('Error fetching recipes:', error));
});


// Función para obtener parámetros de la URL
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

// Función para cargar la receta
function loadRecipe(id) {
    fetch('recipes.json')
        .then(response => response.json())
        .then(recipes => {
            const recipe = recipes.recipes.find(r => r.id == id);
            if (recipe) {
                document.getElementById('recipeName').textContent = recipe.recipeName;
                document.getElementById('recipeImage').src = recipe.recipeImage;
                document.getElementById('recipeName').alt = recipe.recipeName;
                document.getElementById('recipeDescription').textContent = recipe.recipeDescription;

                const ingredientsList = document.getElementById('recipeIngredients');

                // Dividir los ingredientes por saltos de línea y agregar cada uno como un elemento de lista
                const ingredients = recipe.recipeIngredients.split('\n');
                ingredients.forEach(ingredient => {
                    const li = document.createElement('li');
                    li.textContent = ingredient.trim(); // Eliminar espacios adicionales
                    ingredientsList.appendChild(li);
                });
                // Mostrar los pasos a paso respetando los saltos de línea y tabulaciones
                const recipeSteps = document.getElementById('recipeSteps');
                recipeSteps.innerText = recipe.recipeSteps;

            } else {
                document.body.innerHTML = '<h1>Receta no encontrada</h1>';
            }
        })
        .catch(error => {
            console.error('Error fetching recipe:', error);
            document.body.innerHTML = '<h1>Error al cargar la receta</h1>';
        });
}


// Cargar la receta al cargar la página
window.onload = function() {
    const params = getQueryParams();
    if (params.id) {
        loadRecipe(params.id);
    } else {
        document.body.innerHTML = '<h1>ID de receta no proporcionado</h1>';
    }
};
