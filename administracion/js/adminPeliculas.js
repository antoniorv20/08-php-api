const API_URL = 'http://localhost/08-php-api/controllers/peliculas.php';
const errorElement = document.getElementById('createError');

function limpiarHTML(str) {
    return str.replace(/[^\w. @-]/gi, function (e) {
        return '&#' + e.charCodeAt(0) + ';';
    });
}

function esEntero(valor) {
    return Number.isInteger(parseFloat(valor));
}


function validarTitulo(titulo) {
    return titulo.length >= 1 && titulo.length <= 100;
}

function validarPrecio(precio) {
    return esEntero(precio) && precio > 0;
}


function getPeliculas() {
    fetch(API_URL)
        .then(response => response.json())
        .then(peliculas => {
            const tableBody = document.querySelector('#peliculasTable tbody');
            tableBody.innerHTML = '';
            peliculas.forEach(pelicula => {
                const sanitizedTitulo = limpiarHTML(pelicula.titulo);
                const sanitizedPrecio = limpiarHTML(pelicula.precio);
                tableBody.innerHTML += `
                    <tr data-id="${pelicula.id}">
                        <td>${pelicula.id}</td>
                        <td>
                            <span class="listado">${sanitizedTitulo}</span>
                            <input class="edicion" type="text" value="${sanitizedTitulo}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedPrecio}</span>
                            <input class="edicion" type="number" value="${sanitizedPrecio}">
                        </td>
                         <td>
                            <span class="listado">${pelicula.id_director}</span>
                            <input class="edicion" type="number" value="${pelicula.id_director}">
                        </td>
                        <td>
                            <button class="listado" onclick="editMode(${pelicula.id})">Editar</button>
                            <button class="listado" onclick="deletePelicula(${pelicula.id})">Eliminar</button>
                            <button class="edicion" onclick="updatePelicula(${pelicula.id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${pelicula.id})">Cancelar</button>
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

function createPelicula(event) {
    event.preventDefault();
    const titulo = document.getElementById('createTitulo').value.trim();
    const precio = document.getElementById('createPrecio').value.trim();
    const id_director = document.getElementById('createDirector').value.trim();


    if (!validarTitulo(titulo)) {
        errorElement.textContent = 'El título debe tener entre 1 y 100 caracteres.';
        return;
    }
    if (!validarPrecio(precio)) {
        errorElement.textContent = 'El precio debe ser un número entero positivo.';
        return;
    }


    errorElement.textContent = '';

    //envio al controlador los datos
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo, precio, id_director })
    })
        .then(response => response.json())
        .then(result => {
            console.log('Pelicula creada: ', result);
            if (!esEntero(result['id'])) {
                mostrarErrores(result['id']);
            } else {
                getPeliculas();
            }
            event.target.reset();
        })
        .catch(error => {
            console.log('Error: ', JSON.stringify(error));
        })
}


function updatePelicula(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newTitulo = row.querySelector('td:nth-child(2) input').value.trim();
    const newPrecio = row.querySelector('td:nth-child(3) input').value.trim();
    const newDirector = row.querySelector('td:nth-child(4) input').value.trim();


    if (!validarTitulo(newTitulo)) {
        alert("El título debe tener entre 1 y 100 caracteres.");
        return;
    }

    if (!validarPrecio(newPrecio)) {
        alert('La duración debe ser un número entero positivo.');
        return;
    }

    fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo: newTitulo, precio: newPrecio, id_director: newDirector })
    }).then(response => response.json())
        .then(result => {
            console.log('Película actualizada', result);
            if (!esEntero(result['affected'])) {
                errorElement.innerHTML = result['affected'];
            } else {
                getPeliculas();
            }
        })
        .catch(error => {
            alert('Error al actualizar la película. Por favor, inténtelo de nuevo.');
        });
}

function editMode(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'inline-block';
    });
    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'none';
    });
}

function cancelEdit(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'none';
    });
    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'inline-block';
    });
}

function deletePelicula(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta película?')) {
        fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(result => {
                console.log('Película eliminada: ', result);
                getPeliculas();
            })
            .catch(error => console.error('Error: ', error));
    }
}

document.getElementById('createForm').addEventListener('submit', createPelicula);

getPeliculas();
