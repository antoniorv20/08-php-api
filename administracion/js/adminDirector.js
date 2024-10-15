const API_URL = 'http://localhost/08-php-api/controllers/directores.php';
const errorElement = document.getElementById('createError');

function limpiarHTML(str) {
    return str.replace(/[^\w. @-]/gi, function (e) {
        return '&#' + e.charCodeAt(0) + ';';
    });
}

function validarNombre(nombre) {
    return nombre.length >= 1 && nombre.length <= 60;
}

function validarApellido(apellido) {
    return apellido.length >= 1 && apellido.length <= 60;
}

function getDirectores() {
    fetch(API_URL)
        .then(response => response.json())
        .then(directores => {
            const tableBody = document.querySelector('#directoresTable tbody');
            tableBody.innerHTML = '';
            directores.forEach(director => {
                const sanitizedNombre = limpiarHTML(director.nombre);
                const sanitizedApellido = limpiarHTML(director.apellido);
                const sanitizedFechaNacimiento = limpiarHTML(director.fecha_nacimiento);
                const sanitizedBiografia = limpiarHTML(director.biografia);
                tableBody.innerHTML += `
                    <tr data-id="${director.id}">
                        <td>${director.id}</td>
                        <td>
                            <span class="listado">${sanitizedNombre}</span>
                            <input class="edicion" type="text" value="${sanitizedNombre}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedApellido}</span>
                            <input class="edicion" type="text" value="${sanitizedApellido}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedFechaNacimiento}</span>
                            <input class="edicion" type="date" value="${sanitizedFechaNacimiento}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedBiografia}</span>
                            <textarea class="edicion">${sanitizedBiografia}</textarea>
                        </td>
                        <td>
                            <button class="listado" onclick="editMode(${director.id})">Editar</button>
                            <button class="listado" onclick="deleteDirector(${director.id})">Eliminar</button>
                            <button class="edicion" onclick="updateDirector(${director.id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${director.id})">Cancelar</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.log('Error:', error));
}


function createDirector(event) {
    event.preventDefault();
    const nombre = document.getElementById('createNombre').value.trim();
    const apellido = document.getElementById('createApellido').value.trim();
    const fecha_nacimiento = document.getElementById('createFechaNacimiento').value.trim();
    const biografia = document.getElementById('createBiografia').value.trim();

    if (!validarNombre(nombre)) {
        errorElement.textContent = 'El nombre debe tener entre 1 y 60 caracteres.';
        return;
    }
    if (!validarApellido(apellido)) {
        errorElement.textContent = 'El apellido debe tener entre 1 y 60 caracteres.';
        return;
    }

    errorElement.textContent = '';

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellido, fecha_nacimiento, biografia })
    })
        .then(response => response.json())
        .then(result => {
            console.log('Director creado: ', result);
            if (result.id) { // Verifica si el id está presente en la respuesta
                getDirectores(); // Actualiza la tabla
                event.target.reset(); // Limpia el formulario
            } else {
                errorElement.textContent = 'Error al crear el director.';
            }
        })
        .catch(error => {
            console.log('Error: ', JSON.stringify(error));
        });
}

function updateDirector(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newNombre = row.querySelector('td:nth-child(2) input').value.trim();
    const newApellido = row.querySelector('td:nth-child(3) input').value.trim();
    const newFechaNacimiento = row.querySelector('td:nth-child(4) input').value.trim();
    const newBiografia = row.querySelector('td:nth-child(5) textarea').value.trim();

    if (!validarNombre(newNombre)) {
        alert("El nombre debe tener entre 1 y 60 caracteres.");
        return;
    }

    if (!validarApellido(newApellido)) {
        alert('El apellido debe tener entre 1 y 60 caracteres.');
        return;
    }

    // Aquí envías todos los datos necesarios para la actualización
    fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: newNombre, apellido: newApellido, fecha_nacimiento: newFechaNacimiento, biografia: newBiografia })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el director');
        }
        return response.json();
    }).then(result => {
        console.log('Director actualizado', result);
        if (result['affected'] === 0) {
            errorElement.innerHTML = 'No se pudo actualizar el director.';
        } else {
            getDirectores(); // Refrescar la lista de directores
        }
    }).catch(error => {
        alert('Error al actualizar el director. Por favor, inténtelo de nuevo.');
        console.error(error);
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

function deleteDirector(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este director?')) {
        fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(result => {
                console.log('Director eliminado: ', result);
                getDirectores();
            })
            .catch(error => console.error('Error: ', error));
    }
}

document.getElementById('createForm').addEventListener('submit', createDirector);

getDirectores();
