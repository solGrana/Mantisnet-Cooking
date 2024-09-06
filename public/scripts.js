document.addEventListener("DOMContentLoaded", function () {
    const isAdmin = localStorage.getItem('adminAccess');
    // Realiza una petición para obtener el archivo JSON con las recetas
    fetch('recipes.json')
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => {
            // Obtiene los elementos del DOM para el dropdown y el contenedor de recetas
            const recipeDropdown = document.getElementById('recipe-dropdown');
            const recipesContainer = document.getElementById('recipes-container');
            const searchBar = document.getElementById('searchBar');

            // Función para mostrar las recetas en el dropdown y en tarjetas en la pagina
            function displayRecipes(filteredRecipes) {
                recipesContainer.innerHTML = ''; // Limpia el contenedor de recetas
                filteredRecipes.forEach(recipe => {
                    // Crea un link para el dropdown y agrega la receta al dropdown
                    const dropdownLink = document.createElement('a');
                    dropdownLink.href = `recipeTemplate.html?id=${recipe.id}`;
                    dropdownLink.textContent = recipe.recipeName;
                    recipeDropdown.appendChild(dropdownLink);

                    // Crea un container para la card y el deleteBTN
                    const recipeCardContainer = document.createElement('div');
                    recipeCardContainer.classList.add('recipe-card-container');

                    // Crea una tarjeta de receta y agrega la receta al contenedor de recetas
                    const recipeCard = document.createElement('a');
                    recipeCard.href = `recipeTemplate.html?id=${recipe.id}`;
                    recipeCard.classList.add('recipe-card');
                    recipeCard.innerHTML = `
                <img src="${recipe.recipeImage}" alt="${recipe.recipeImage}">
                <h2>${recipe.recipeName}</h2>
                <p>${recipe.recipeDescription}</p>
                `;
                    // Agrega el boton de eliminar y editar solo si el usuario está autenticado como administrador
                    if (isAdmin) {
                        const deleteButton = document.createElement('button');
                        deleteButton.innerHTML = '&times;';
                        deleteButton.classList.add('delete-btn');
                        deleteButton.dataset.id = recipe.id; // Asocia el ID de la receta al botón

                        // Añadir el botón al contenedor
                        recipeCardContainer.appendChild(deleteButton);

                        const editButton = document.createElement('button');
                        editButton.textContent = 'Editar 🖊️';
                        editButton.classList.add('edit-btn');
                        editButton.dataset.id = recipe.id; // Asocia el ID de la receta al botón

                        // Añadir el botón al contenedor
                        recipeCardContainer.appendChild(editButton);

                    }
                    // Añadir la tarjeta al contenedor
                    recipeCardContainer.appendChild(recipeCard);
                    // Añadir el contenedor de la card al contenedor  principal de recetas
                    recipesContainer.appendChild(recipeCardContainer);
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
                displayRecipes(filteredRecipes); // Muestra solo las recetas que coinciden con el filtro
            });
        })
        .catch(error => console.error('Error fetching recipes:', error));
});

function changeUserImage(image) {
    const admiBtn = document.getElementById('adminBtn');
    const adminImg = adminBtn.querySelector('img');

    adminImg.src = image;
}
function generateRecipeUrl(recipeName) {
    // Reemplaza los espacios por guiones, convierte a minúsculas y agrega la extensión .html
    return recipeName.trim().toLowerCase().replace(/\s+/g, '-') + '.html';
}

// Genera un ID único para cada receta
function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
// Función para mostrar un modal
function showModal(modal) {
    modal.classList.add('show');
}

// Función para ocultar un modal
function hideModal(modal) {
    modal.classList.remove('show');
}

// Para agregar nuevas recetas
document.addEventListener("DOMContentLoaded", function () {
    //recuperar el estado de adminAccess del localStorage
    const adminAccess = localStorage.getItem('adminAccess');

    if (adminAccess === 'true') {
        document.getElementById('addRecipeBtn').style.display = 'block'; // Muestra el botón de agregar receta si el usuario es administrador
        //Mostrar el logo de admin verified
        changeUserImage('images/verifiedUs2.png');
    }

    // Obtiene los elementos del DOM para el modal, botón, cerrar y formulario
    const modal = document.getElementById("recipeModal");
    const btn = document.getElementById("addRecipeBtn");
    const span = document.getElementsByClassName("close")[0];
    const form = document.getElementById("recipeForm");

    // Muestra el modal cuando se hace clic en el botón
    btn.onclick = () => {
        modal.style.display = "block";
        modal.classList.add('show');
    };

    // Cierra el modal cuando se hace clic en el span (x)
    span.onclick = () => {
        modal.style.display = "none";
        modal.classList.remove('show');
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
        data.id = generateUniqueId(); // Generar un ID unico para la receta
        console.log(data);
        return data;
    };

    // Envia la nueva receta al servidor (asume que tenes un servidor que acepta estas peticiones)
    const postData = async () => {
        const newRecipe = getData(form);
        try {
            const response = await fetch('/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecipe)
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Recipe added:', jsonResponse);
                location.reload(); // Recargar para ver la nueva receta
            } else {
                const errorResponse = await response.text();
                console.error('Error response:', errorResponse); // Muestra errores en la consola si falla
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    // Maneja el evento de envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Previene el envio del formulario por default
        postData(); // Envía los datos de la nueva receta al servidor
    });
});

function deleteRecipe(recipeId) {
    fetch(`/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => {
            if (response.ok) {
                // Encuentra el botón de eliminar en el DOM
                const deleteButton = document.querySelector(`.delete-btn[data-id="${recipeId}"]`);
                if (deleteButton) {
                    // Encuentra el contenedor de la tarjeta o la tarjeta misma
                    const recipeCardContainer = deleteButton.closest('.recipe-card-container');
                    if (recipeCardContainer) {
                        recipeCardContainer.remove(); // Elimina el contenedor de la tarjeta
                    } else {
                        console.error('Contenedor de la tarjeta no encontrado');
                    }
                } else {
                    console.error('Botón de eliminar no encontrado');
                }
            } else {
                console.error('Error al eliminar la receta', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud de eliminación:', error);
            alert('Error al eliminar la receta');
        });
}


// modal Para eliminar recetas
document.addEventListener("DOMContentLoaded", function () {

    // Obtiene los elementos del DOM para el modal
    const confirmDeleteModal = document.getElementById("confirmDeleteModal");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const span = document.getElementById("x");
    let confirmDeleteRecipeId = null; // Variable para almacenar el ID de la receta a eliminar

    // Maneja el clic en el botón de eliminar receta
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-btn')) {
            const recipeId = event.target.dataset.id;
            showConfirmDeleteModal(recipeId);
        }
        // Muestra el modal de confirmación de eliminación y almacena el ID de la receta
        function showConfirmDeleteModal(recipeId) {
            confirmDeleteRecipeId = recipeId; // Almacena el ID de la receta a eliminar
            showModal(confirmDeleteModal);
        }
    });
    // Maneja la confirmación de eliminación
    confirmDeleteBtn.addEventListener('click', function () {
        if (confirmDeleteRecipeId) {
            deleteRecipe(confirmDeleteRecipeId);
            hideModal(confirmDeleteModal);
            confirmDeleteRecipeId = null; // Limpia el ID de la receta a eliminar
        }
    });
    // Maneja el cancelamiento de la eliminación
    cancelDeleteBtn.addEventListener('click', function () {
        hideModal(confirmDeleteModal);
        confirmDeleteRecipeId = null; // Limpia el ID de la receta a eliminar
    });
    // Cierra el modal cuando se hace clic en el span (x)
    span.onclick = () => {
        hideModal(confirmDeleteModal);
        confirmDeleteRecipeId = null; // Limpia el ID de la receta a eliminar
    };

    // Cierra el modal cuando se hace clic fuera de él
    window.onclick = (event) => {
        if (event.target == confirmDeleteModal) {
            hideModal(confirmDeleteModal);
            confirmDeleteRecipeId = null; // Limpia el ID de la receta a eliminar
        }
    };
});

// Modal para editar recetas
document.addEventListener("DOMContentLoaded", function () {

    // Obtiene los elementos del DOM para el modal
    const editRecipeModal = document.getElementById("editRecipeModal");
    const closeEditModalBtn = document.getElementById("closeEdit");
    const editRecipeForm = document.getElementById("editRecipeForm");
    let editingRecipeId = null;

    // Maneja el clic en el botón de editar receta
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('edit-btn')) {
            const recipeId = event.target.dataset.id;
            fetchRecipeData(recipeId); 
        }
    });

    // Función para obtener los datos de la receta
    function fetchRecipeData(recipeId) {
        fetch(`/recipes/${recipeId}`)  // Asegúrate de que la ruta sea correcta
            .then(response => response.json())
            .then(recipe => {
                // Prellena los campos del formulario con los datos de la receta
                document.getElementById("editRecipeName").value = recipe.recipeName;
                document.getElementById("editRecipeDescription").value = recipe.recipeDescription;
                document.getElementById("editRecipeIngredients").value = recipe.recipeIngredients;
                document.getElementById("editRecipeSteps").value = recipe.recipeSteps;
                document.getElementById("editRecipeImage").value = recipe.recipeImage;

                // Muestra el modal
                showModal(editRecipeModal);
                editingRecipeId = recipeId;  // Guarda el ID de la receta que estamos editando
            })
            .catch(error => {
                console.error('Error al obtener los datos de la receta:', error);
            });
    }

    // Maneja el cierre del modal
    closeEditModalBtn.addEventListener('click', function () {
        hideModal(editRecipeModal);
        editingRecipeId = null;
    });

    // Manejador del envío del formulario de edición
    editRecipeForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedRecipe = {
            recipeName: document.getElementById("editRecipeName").value,
            recipeDescription: document.getElementById("editRecipeDescription").value,
            recipeIngredients: document.getElementById("editRecipeIngredients").value,
            recipeSteps: document.getElementById("editRecipeSteps").value,
            recipeImage: document.getElementById("editRecipeImage").value
        };

        // Actualiza la receta en el servidor
        fetch(`/recipes/${editingRecipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedRecipe)
        })
            .then(response => {
                if (response.ok) {
                    hideModal(editRecipeModal);
                    location.reload();  // Recarga la página para reflejar los cambios
                } else {
                    console.error('Error al actualizar la receta');
                }
            });
    });

    // Cierra el modal cuando se hace clic fuera de él
    window.onclick = function (event) {
        if (event.target == editRecipeModal) {
            hideModal(editRecipeModal);
            editingRecipeId = null;
        }
    };
});


// Lógica para el modal de administrador

document.addEventListener("DOMContentLoaded", function () {
    const adminBtn = document.getElementById("adminBtn");
    const adminModal = document.getElementById("adminModal");
    const closeModalBtn = adminModal.querySelector(".close");
    const adminForm = document.getElementById("adminForm");

    const verifiedModal = document.getElementById("verifiedModal");
    const verifiedCloseModalBtn = verifiedModal.querySelector(".close");


    // Muestra el modal de ingreso
    function showAdminModal() {
        showModal(adminModal);
        hideModal(verifiedModal); // Oculta el modal de verified
    }

    // Muestra el modal de usuario verificado
    function showVerifiedModal() {
        hideModal(adminModal); // Oculta el modal de ingreso
        showModal(verifiedModal); // Muestra el modal de usuario verificado
    }

    // Muestra el modal de admin cuando se hace clic en el botón de administrador
    adminBtn.addEventListener("click", function () {
        const adminAccess = localStorage.getItem('adminAccess');

        if (adminAccess === 'true') {
            showVerifiedModal(); // Muestra el modal de usuario verificado
        } else {
            showAdminModal();
        }
    });

    // cerrar el modal de administrador cuando se hace clic en la "x"
    closeModalBtn.addEventListener("click", function () {
        hideModal(adminModal);
    });

    // Cerrar el modal de usuario verificado cuando se hace clic en la "x"
    verifiedCloseModalBtn.addEventListener("click", function () {
        hideModal(verifiedModal);
    });

    // Cierra el modal de administrador cuando se hace clic en cualquier otro lado
    window.addEventListener("click", function (event) {
        if (event.target == adminModal) {
            hideModal(adminModal);
        } else if (event.target == verifiedModal) {
            hideModal(verifiedModal);
        }
    });

    // lógica para verificar la contraseña de administrador (TEST)
    adminForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const adminPassword = document.getElementById("adminPassword").value;
        const correctPassword = "s"; // Verificar la contraseña (hardcodeada para testing)

        if (adminPassword === correctPassword) {
            document.getElementById('addRecipeBtn').style.display = 'block';// Contraseña correcta, habilitar el botón de agregar receta
            hideModal(adminModal); // Cierra el modal 
            showVerifiedModal() // Abre el modal de usuario verificado
            changeUserImage('images/verifiedUs2.png');
            localStorage.setItem('adminAccess', 'true'); // Guardar estado en localStorage
            window.location.reload(); // Recarga la página para reflejar los cambios
        } else {
            alert("Contraseña incorrecta. Inténtelo de nuevo.");
        }
    });

    document.getElementById("okBtn").addEventListener("click", function () {
        var modal = document.getElementById("verifiedModal");
        hideModal(verifiedModal);
    });

    // cerrar sesion
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem('adminAccess'); // Elimina el estado guardado
        document.getElementById('addRecipeBtn').style.display = 'none'; // Oculta el botón de agregar receta
        hideModal(verifiedModal);// Cierra el modal de usuario verificado
        adminForm.style.display = "block"; // Muestra el formulario de ingreso de contraseña
        showAdminModal();
        changeUserImage('images/admin.png');
        window.location.reload(); // Recarga la página para reflejar los cambios
    });
}); 
