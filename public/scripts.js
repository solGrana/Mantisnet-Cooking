//CARGA DE RECETAS DESDE POSTGRESQL
document.addEventListener("DOMContentLoaded", function () {
    const isAdmin = localStorage.getItem('adminAccess');

    fetch('/recipes')
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Verifica la estructura de los datos recibidos

            const recipeDropdown = document.getElementById('recipe-dropdown');
            const recipesContainer = document.getElementById('recipes-container');
            const searchBar = document.getElementById('searchBar');

            function displayRecipes(filteredRecipes) {
                if (!Array.isArray(filteredRecipes)) {
                    console.error('Error: filteredRecipes no es un array:', filteredRecipes);
                    return;
                }

                recipesContainer.innerHTML = '';
                filteredRecipes.forEach(recipe => {
                    const dropdownLink = document.createElement('a');
                    dropdownLink.href = `recipeTemplate.html?id=${recipe.id}`;
                    dropdownLink.textContent = recipe.recipename;
                    recipeDropdown.appendChild(dropdownLink);

                    const recipeCardContainer = document.createElement('div');
                    recipeCardContainer.classList.add('recipe-card-container');

                    const recipeCard = document.createElement('a');
                    recipeCard.href = `recipeTemplate.html?id=${recipe.id}`;
                    recipeCard.classList.add('recipe-card');
                    recipeCard.innerHTML = `
                        <img src="${recipe.recipeimage}" alt="${recipe.recipeimage}">
                        <h2>${recipe.recipename}</h2>
                        <p>${recipe.recipedescription}</p>
                    `;

                    if (isAdmin) {
                        const deleteButton = document.createElement('button');
                        deleteButton.innerHTML = '&times;';
                        deleteButton.classList.add('delete-btn');
                        deleteButton.dataset.id = recipe.id;
                        deleteButton.dataset.recipename = recipe.recipename;
                        recipeCardContainer.appendChild(deleteButton);

                        const editButton = document.createElement('button');
                        editButton.textContent = 'Editar 🖊️';
                        editButton.classList.add('edit-btn');
                        editButton.dataset.id = recipe.id;
                        recipeCardContainer.appendChild(editButton);
                    }

                    recipeCardContainer.appendChild(recipeCard);
                    recipesContainer.appendChild(recipeCardContainer);
                });
            }

            displayRecipes(data.recipes || data);  // Maneja la posible estructura de datos

            searchBar.addEventListener('input', function () {
                const filter = this.value.toLowerCase();
                const filteredRecipes = data.recipes.filter(recipe =>
                    recipe.recipename.toLowerCase().includes(filter) ||
                    recipe.recipedescription.toLowerCase().includes(filter)
                );
                displayRecipes(filteredRecipes);
            });
        })
        .catch(error => console.error('Error fetching recipes:', error));
});
//FIN CARGA RECETAS

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
   /*  // Obtiene los datos del formulario y agrega la nueva receta al JSON
    const getData = (form) => {
        const formData = new FormData(form); // Crea un objeto FormData con los datos del formulario
        const data = {};
        formData.forEach((value, key) => {
            if (key === 'recipeImageFile') {
                // La imagen se maneja por separado
                data[key] = value;
            } else {
                data[key] = value;
            }
        });
        data.url = generateRecipeUrl(data.recipeName); // Generar URL automáticamente
        data.id = generateUniqueId(); // Generar un ID unico para la receta
        console.log(data);
        return data;
    };

    //AGREGAR NUEVAS RECETAS EN POSTGRE / Envia la nueva receta al servidor

     const postData = async () => {
        const newRecipe = getData(form);
        try {
            const response = await fetch('/recipes', {  // La ruta a tu servidor
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                 // body: JSON.stringify(newRecipe) Enviar los datos como JSON
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Recipe added:', jsonResponse);
                location.reload();  // Recargar para ver la nueva receta
            } else {
                const errorResponse = await response.text();
                console.error('Error response:', errorResponse);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };  */

    // Obtiene los datos del formulario y agrega la nueva receta
const getData = (form) => {
    const formData = new FormData(form); // Usar FormData para incluir archivos e información
    formData.append('url', generateRecipeUrl(formData.get('recipeName'))); // Generar URL automáticamente
    formData.append('id', generateUniqueId()); // Generar un ID único
    return formData; // Retorna el FormData
};

// Enviar la nueva receta al servidor
const postData = async () => {
    const form = document.querySelector('#recipeForm'); // Asegúrate de tener el ID del formulario correcto
    const formData = getData(form);

    try {
        const response = await fetch('/recipes', {  // Ruta a tu servidor
            method: 'POST',
            body: formData // Enviar el FormData, no hace falta especificar el Content-Type
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('Recipe added:', jsonResponse);
            location.reload();  // Recargar para ver la nueva receta
        } else {
            const errorResponse = await response.text();
            console.error('Error response:', errorResponse);
        }
    } catch (error) {
        console.log('Error:', error);
    }
};

    //FIN AGREGA RECETAS

    // Maneja el evento de envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Previene el envio del formulario por default
        postData(); // Envía los datos de la nueva receta al servidor
    });
});

// FUNCION PARA ELIMINAR RECETAS EN POSTGRESQL
function deleteRecipe(recipeId) {
    fetch(`/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => {
            if (response.ok) {
                const deleteButton = document.querySelector(`.delete-btn[data-id="${recipeId}"]`);
                if (deleteButton) {
                    const recipeCardContainer = deleteButton.closest('.recipe-card-container');
                    if (recipeCardContainer) {
                        recipeCardContainer.remove();  // Eliminar la tarjeta
                    }
                }
            } else {
                console.error('Error al eliminar la receta:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud de eliminación:', error);
        });
}
//FIN ELIMINAR RECETAS EN POSTGRESQL

// modal Para eliminar recetas
document.addEventListener("DOMContentLoaded", function () {

    // Obtiene los elementos del DOM para el modal
    const confirmDeleteModal = document.getElementById("confirmDeleteModal");
    const deleteMessage = document.getElementById('deleteMessage');
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const span = document.getElementById("x");
    let confirmDeleteRecipeId = null; // Variable para almacenar el ID de la receta a eliminar
    let confirmDeleteRecipeName = null; // nombre de la receta

    // Maneja el clic en el botón de eliminar receta
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-btn')) {
            const recipeId = event.target.dataset.id;
            const recipeName = event.target.dataset.recipename;
            showConfirmDeleteModal(recipeId, recipeName);
        }
        // Muestra el modal de confirmación de eliminación y almacena el ID de la receta
        function showConfirmDeleteModal(recipeId, recipeName) {
            confirmDeleteRecipeId = recipeId; // Almacena el ID de la receta a eliminar
            confirmDeleteRecipeName = recipeName;
            deleteMessage.textContent = `¿Estás seguro que querés eliminar la receta "${recipeName}"?`; // Actualiza el mensaje del modal con el nombre de la receta
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
        fetch(`/recipes/${recipeId}`)
            .then(response => response.json())
            .then(recipe => {
                // Prellena los campos del formulario con los datos de la receta
                document.getElementById("editRecipeName").value = recipe.recipename; // Ajustado aquí
                document.getElementById("editRecipeDescription").value = recipe.recipedescription; // Ajustado aquí
                document.getElementById("editRecipeIngredients").value = recipe.recipeingredients; // Ajustado aquí
                document.getElementById("editRecipeSteps").value = recipe.recipesteps; // Ajustado aquí
                document.getElementById("editRecipeImage").value = recipe.recipeimage || ''; // Asegúrate de que esta propiedad exista si la estás usando
    
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
    
    //EDITAR RECETAS EN POSTGRESQL // Manejador del envío del formulario de edición
    editRecipeForm.addEventListener("submit", function (e) {
        e.preventDefault();
    
        const updatedRecipe = {
            recipeName: document.getElementById("editRecipeName").value,
            recipeDescription: document.getElementById("editRecipeDescription").value,
            recipeIngredients: document.getElementById("editRecipeIngredients").value,
            recipeSteps: document.getElementById("editRecipeSteps").value,
            recipeImage: document.getElementById("editRecipeImage").value
        };
    
        // Enviar la receta editada al servidor
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
                    location.reload();  // Recargar la página para ver los cambios
                } else {
                    console.error('Error al actualizar la receta');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
    //FIN EDITAR RECETAS EN POSTGRESQL

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
