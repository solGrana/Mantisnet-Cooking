document.addEventListener("DOMContentLoaded", function () {
    // Realiza una petición para obtener las recetas desde el servidor
    fetch('/recipes')  // Asegúrate de que esta ruta sea la correcta para obtener todas las recetas
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(recipes => {
            // Obtiene los elementos del DOM para el dropdown y el contenedor de recetas
            const recipeDropdown = document.getElementById('recipe-dropdown');
            const recipesContainer = document.getElementById('recipes-container');

            recipes.forEach(recipe => {
                // Crea un link para el dropdown y agrega la receta al dropdown
                const dropdownLink = document.createElement('a');
                dropdownLink.href = `recipeTemplate.html?id=${recipe.id}`; // CAMBIE EL RECIPE.URL
                dropdownLink.textContent = recipe.recipename;
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
    fetch(`/recipes/${id}`)
        .then(response => response.json())
        .then(recipe => {
            if (recipe) {
                document.getElementById('recipeName').textContent = recipe.recipename || 'No name available'; // Cambia recipeName por recipename
                document.getElementById('recipeImage').src = recipe.recipeimage || '';
                document.getElementById('recipeName').alt = recipe.recipename || 'No name available'; // Cambia recipeName por recipename
                document.getElementById('recipeDescription').textContent = recipe.recipedescription || 'No description available'; // Cambia recipeDescription por recipedescription

                // Mostrar los ingredientes con checkbox
                const ingredientsList = document.getElementById('recipeIngredients');
                ingredientsList.innerHTML = '';
                
                // Verificar si recipe.recipeIngredients está definido
                if (recipe.recipeingredients) { // Cambia recipeIngredients por recipeingredients
                    recipe.recipeingredients.split(',').forEach(ingredient => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                               <input type="checkbox" class="ingredient-checkbox">
                               ${ingredient.trim()}
                           `;
                        ingredientsList.appendChild(li);
                    });
                } else {
                    ingredientsList.innerHTML = '<li>No ingredients found</li>';
                }

                const recipeSteps = document.getElementById('recipeSteps');
                recipeSteps.innerHTML = recipe.recipesteps ? recipe.recipesteps.replace(/\n/g, '<br>') : 'No steps found'; // Cambia recipeSteps por recipesteps
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
window.onload = function () {
    const params = getQueryParams();
    if (params.id) {
        loadRecipe(params.id);
    } else {
        document.body.innerHTML = '<h1>ID de receta no proporcionado</h1>';
    }
};
