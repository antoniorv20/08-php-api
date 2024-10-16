const API_URL = 'http://localhost/08-php-api/controllers/peliculas.php';
const DIRECTOR_API_URL = 'http://localhost/08-php-api/controllers/directores.php'; // Supongamos que este es tu endpoint para directores
const errorElement = document.getElementById('createError');

function limpiarHTML(str) {
    return str.replace(/[^\w. @-]/gi, (e) => `&#${e.charCodeAt(0)};`);
}

function validarCampos({ titulo, precio, id_director }) {
    if (titulo.length < 1 || titulo.length > 100) {
        return 'El título debe tener entre 1 y 100 caracteres.';
    }
    // Cambiar la validación de enteros a decimales
    if (isNaN(precio) || parseFloat(precio) <= 0) {
        return 'El precio debe ser un número positivo.';
    }
    if (!Number.isInteger(parseInt(id_director)) || id_director <= 0) {
        return 'El id del director debe ser un número entero positivo.';
    }
    return null;
}


function getPeliculas() {
    let directoresMap = {};

    fetch(DIRECTOR_API_URL)
        .then(response => response.json())
        .then(directores => {
            directores.forEach(director => {
                directoresMap[director.id] = director.nombre + " " + director.apellido;  // Crear un mapeo id -> nombre
            });

            // Luego, obtener las películas
            return fetch(API_URL);
        })
        .then(response => response.json())
        .then(peliculas => {
            const tableBody = document.querySelector('#peliculasTable tbody');
            tableBody.innerHTML = '';
            peliculas.forEach(pelicula => {
                const { id, titulo, precio, id_director } = pelicula;
                const sanitizedTitulo = limpiarHTML(titulo);
                const sanitizedPrecio = limpiarHTML(precio);
                const directorNombre = directoresMap[id_director] || 'Desconocido';

                // Generar el select de directores para edición
                let directorOptions = '';
                for (const directorId in directoresMap) {
                    const selected = directorId == id_director ? 'selected' : '';
                    directorOptions += `<option value="${directorId}" ${selected}>${directoresMap[directorId]}</option>`;
                }

                tableBody.innerHTML += `
                    <tr data-id="${id}">
                        <td>${id}</td>
                        <td>
                            <span class="listado">${sanitizedTitulo}</span>
                            <input class="edicion" type="text" value="${sanitizedTitulo}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedPrecio}</span>
                            <input class="edicion" type="number" value="${sanitizedPrecio}">
                        </td>
                        <td>
                            <span class="listado">${directorNombre}</span>
                            <select class="edicion">
                                ${directorOptions}
                            </select>
                        </td>
                        <td>
                            <button class="listado" onclick="editMode(${id})">Editar</button>
                            <button class="listado" onclick="deletePelicula(${id})">Eliminar</button>
                            <button class="edicion" onclick="updatePelicula(${id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${id})">Cancelar</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.log('Error:', error);
            errorElement.innerText = 'Se produjo un error al cargar las películas. Inténtalo de nuevo más tarde.';
        });
}


// Cargar directores en el desplegable
function cargarDirectores() {
    fetch(DIRECTOR_API_URL)
        .then(response => response.json())
        .then(directores => {
            const directorSelect = document.getElementById('createDirector');
            directores.forEach(director => {
                const option = document.createElement('option');
                option.value = director.id;  // El valor es el id del director
                option.textContent = director.nombre + " " + director.apellido;  // Lo que se muestra es el nombre del director
                directorSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar directores:', error));
}

// Llamar a esta función cuando se cargue la página
cargarDirectores();


function createPelicula(event) {
    event.preventDefault();
    const titulo = document.getElementById('createTitulo').value.trim();
    const precio = document.getElementById('createPrecio').value.trim();
    const id_director = document.getElementById('createDirector').value.trim();

    const error = validarCampos({ titulo, precio, id_director });
    if (error) {
        errorElement.textContent = error;
        return;
    }

    // Verificar si el director existe antes de crear la película
    verificarDirector(id_director)
        .then(directorExiste => {
            if (!directorExiste) {
                errorElement.textContent = 'El ID de director no existe.';
                return;
            }

            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, precio, id_director })
            })
            .then(response => response.json())
            .then(result => {
                console.log('Pelicula creada:', result);
                if (!Number.isInteger(parseFloat(result['id']))) {
                    mostrarErrores(result['id']);
                } else {
                    getPeliculas();
                }
                event.target.reset();
            })
            .catch(error => {
                console.log('Error:', JSON.stringify(error));
            });
        });
}

// Función para verificar si el director existe
function verificarDirector(id_director) {
    return fetch(`${DIRECTOR_API_URL}?id=${id_director}`)
        .then(response => response.json())
        .then(director => {
            // Verificar si se recibió un director válido
            return director && director.id === parseInt(id_director); 
        })
        .catch(error => {
            console.error('Error al verificar el director:', error);
            return false;
        });
}



function updatePelicula(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newTitulo = row.querySelector('td:nth-child(2) input').value.trim();
    const newPrecio = row.querySelector('td:nth-child(3) input').value.trim();
    const newDirector = row.querySelector('td:nth-child(4) select').value;  // Obtenemos el valor del select

    const error = validarCampos({ titulo: newTitulo, precio: newPrecio, id_director: newDirector });
    if (error) {
        alert(error);
        return;
    }

    // Verificar si el director existe antes de actualizar la película
    verificarDirector(newDirector)
        .then(directorExiste => {
            if (!directorExiste) {
                alert('El ID de director no existe.');
                return;
            }

            fetch(`${API_URL}?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo: newTitulo, precio: newPrecio, id_director: newDirector })
            })
            .then(response => response.json())
            .then(result => {
                console.log('Película actualizada:', result);
                getPeliculas();  // Recargar la tabla de películas tras la edición
            })
            .catch(error => {
                alert('Error al actualizar la película. Por favor, inténtelo de nuevo.');
            });
        });
}



function editMode(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(el => el.style.display = 'inline-block');
    row.querySelectorAll('.listado').forEach(el => el.style.display = 'none');
}

function cancelEdit(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(el => el.style.display = 'none');
    row.querySelectorAll('.listado').forEach(el => el.style.display = 'inline-block');
}

function deletePelicula(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta película?')) {
        fetch(`${API_URL}?id=${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(result => {
            console.log('Película eliminada:', result);
            getPeliculas();
        })
        .catch(error => console.error('Error:', error));
    }
}

document.getElementById('createForm').addEventListener('submit', createPelicula);

getPeliculas();
