document.addEventListener("DOMContentLoaded", function () {
    // Realiza una petición para obtener el archivo JSON con las recetas
    fetch('recipes.json')
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => {
            // Obtiene los elementos del DOM para el dropdown y el contenedor de recetas
            const recipeDropdown = document.getElementById('recipe-dropdown');
            const recipesContainer = document.getElementById('recipes-container');
            const searchBar = document.getElementById('searchBar');

            function displayRecipes(filteredRecipes) {
                recipesContainer.innerHTML = ''; // Limpia el contenedor de recetas
                filteredRecipes.forEach(recipe => {
                    // Crea un link para el dropdown y agrega la receta al dropdown
                    const dropdownLink = document.createElement('a');
                    dropdownLink.href = `recipeTemplate.html?id=${recipe.id}`;
                    dropdownLink.textContent = recipe.recipeName;
                    recipeDropdown.appendChild(dropdownLink);

                    // Crea una tarjeta de receta y agrega la receta al contenedor de recetas
                    const recipeCard = document.createElement('a');
                    recipeCard.href = `recipeTemplate.html?id=${recipe.id}`;
                    recipeCard.classList.add('recipe-card');
                    recipeCard.innerHTML = `
                        <img src="${recipe.recipeImage}" alt="${recipe.recipeImage}">
                        <h2>${recipe.recipeName}</h2>
                        <p>${recipe.recipeDescription}</p>
                    `;
                    recipesContainer.appendChild(recipeCard);
                });
            }

            displayRecipes(data.recipes); // Muestra todas las recetas al cargar la página

            // Filtra las recetas mientras el usuario escribe en la search bar
            searchBar.addEventListener('input', function () {
                const filter = this.value.toLowerCase();
                const filteredRecipes = data.recipes.filter(recipe =>
                    recipe.recipeName.toLowerCase().includes(filter) ||
                    recipe.recipeDescription.toLowerCase().includes(filter)
                );
                displayRecipes(filteredRecipes);
            });
        })
        .catch(error => console.error('Error fetching recipes:', error));
});

// Para agregar nuevas recetas
document.addEventListener("DOMContentLoaded", function() {
    // Obtiene los elementos del DOM para el modal, botón, cerrar y formulario
    const modal = document.getElementById("recipeModal");
    const btn = document.getElementById("addRecipeBtn");
    const span = document.getElementsByClassName("close")[0];
    const form = document.getElementById("recipeForm");

    // Muestra el modal cuando se hace clic en el botón
    btn.onclick = () => {
        modal.style.display = "block";
    };

    // Cierra el modal cuando se hace clic en el span (x)
    span.onclick = () => {
        modal.style.display = "none";
    };

    // Cierra el modal cuando se hace clic fuera de él
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
    // Obtiene los datos del formulario y agrega la nueva receta al JSON
    const getData = (form) => {
        const formData = new FormData(form); // Crea un objeto FormData con los datos del formulario
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        data.url = generateRecipeUrl(data.recipeName); // Generar URL automáticamente
        data.id = generateUniqueId(); // Generar un ID único
        console.log(data);
        return data;
    };

    // Envía la nueva receta al servidor
    const postData = async () => {
        const newRecipe = getData(form);
        try {
            const response = await fetch('/recipes', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newRecipe)
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Recipe added:', jsonResponse);
                location.reload(); // Recargar para ver la nueva receta
            } else {
                const errorResponse = await response.text();
                console.error('Error response:', errorResponse);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    // Maneja el evento de envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        postData();
    });
});

function generateRecipeUrl(recipeName) {
    // Reemplaza los espacios por guiones, convierte a minúsculas y agrega la extensión .html
    return recipeName.trim().toLowerCase().replace(/\s+/g, '-') + '.html';
}
function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}


// Lógica para el modal de administrador
document.addEventListener("DOMContentLoaded", function() {
    const adminBtn = document.getElementById("adminBtn");
    const adminModal = document.getElementById("adminModal");
    const closeModalBtn = adminModal.querySelector(".close");
    const adminForm = document.getElementById("adminForm"); // Asegúrate de tener un formulario con id "adminForm"

    adminBtn.addEventListener("click", function() {
        adminModal.style.display = "block";
    });

    closeModalBtn.addEventListener("click", function() {
        adminModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == adminModal) {
            adminModal.style.display = "none";
        }
    });

    // lógica para verificar la contraseña de administrador (TEST)
    adminForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const adminPassword = document.getElementById("adminPassword").value;
        // Verificar la contraseña (hardcodeada para testing)
        const correctPassword = "s"; // NO LO INTENTES NO FUNCIONA
        if (adminPassword === correctPassword) {
            // Contraseña correcta, habilitar el botón de agregar receta
            document.getElementById('addRecipeBtn').style.display = 'block';
            adminModal.style.display = "none";
        } else {
            alert("Contraseña incorrecta. Inténtelo de nuevo.");
        }
    });
});
