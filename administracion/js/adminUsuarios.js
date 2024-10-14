const API_URL = 'http://localhost/08-php-api/controllers/usuarios.php';

/**
 * 
 * @param {*} str string
 * @returns string limpio caracteres html
 * Limpia una cadena de texto convirtiendo ciertos caracteres potencialmente peligrosos en sus equivalentes html seguros
 * [^...] coincide con cualquier caracter que no esté en el conjunto
 * \w caracteres de palabras, letras, numeros, guiones 
 * . @- admite punto, espacio, arroba y guion medio
 * /gi Flags para que la busqueda de caracteres sea global(g) e insensible a mayúsculas y minúsculas(i)
 * 
 * funcion(c){return '&#'+caches.charCodeAt(0) + ';';} crea para cada carácter su codigo en ASCII 
 * devuelve la entidad html numérica correspondiente por ejemplo &#60; para <
 * Esta función se utiliza para prever ataques xss(cross-site-scripting)
 */
function limpiarHTML(str) {
    return str.replace(/[^\w.@-]/gi, function (e) {
        return '&#' + e.charCodeAt(0) + ';';
    });
}

function validarEmail(email) {
    return email;
}

function validarNombre(nombre) {
    return nombre.length >= 2 && nombre.length <=50;
}

function esEntero(str){
    return /^\d+$/.test(str);
}

function getUsers(){
    fetch(API_URL)
        .then(response=>response.json())
        .then(users => {
            const tableBody = document.querySelector('#userTable tbody');
            tableBody.innerHTML = '';
            users.forEach(user => {
                const sanitizedNombre = limpiarHTML(user.nombre);
                const sanitizedEmail = limpiarHTML(user.email);

                tableBody.innerHTML+=`
                    <tr data-id="${user.id}" class="view-mode">
                        <td>
                            ${user.id}
                        </td>
                        <td>
                            <span class="listado">${sanitizedNombre}</span>
                            <input class="edicion" type="text" value="${sanitizedNombre}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedEmail}</span>
                            <input class="edicion" type="email" value="${sanitizedEmail}">
                        </td>     
                        <td>
                            <button class="listado" onclick="editMode(${user.id})">Editar</button>
                            <button class="listado" onclick="deleteUser(${user.id})">Eliminar</button>
                            <button class="edicion" onclick="updateUser(${user.id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${user.id})">Cancelar</button>
                        </td>                   
                    </tr>
                `
            });
        })
        .catch(error=> console.log('Error:', error))
}

function createUser(event){
    event.preventDefault();
    const nombre = document.getElementById('createNombre').value.trim();
    const email = document.getElementById('createEmail').value.trim();
    const error = document.getElementById('createError');

    if(!validarNombre(nombre)){
        error.textContent = 'El nombre debe tener entre 2 y 50 caracteres';
        return
    }

    if(!validarEmail(email)){
        error.textContent = 'El email no es válido';
        return
    }

    error.textContent = '';

    // Envio al controlador los datos del usuario nuevo
    fetch(API_URL,{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({nombre,email})
    })
    .then(response => response.json())
    .then(result => {
        console.log('Usuario creado ',result)
        if(!esEntero(result['id'])){
            error.textContent = result['id'];
        }
        getUsers();
        event.target.reset();
    })
    .catch(er=>{
        console.log('Error: ', er)
        error.textContent = 'Error al crear el usuario, inténtelo de nuevo'
    })

}

function updateUser(id){
    const row = document.querySelector(`tr[data-id="${id}"]`)
    const newNombre = row.querySelector('td:nth-child(2) input').value.trim();
    const newEmail = row.querySelector('td:nth-child(3) input').value.trim();

    if(!validarNombre(newNombre)){
        alert('El nombre debe tener entre 2 y 50 caracteres')
        return
    }

    if(!validarEmail(newEmail)){
        alert('El email no es válido');
        return
    }

    if(confirm('¿Estás seguro de que quieres modificar este usuario?')){
        fetch(`${API_URL}/?id=${id}`,{
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({nombre: newNombre, email: newEmail})
        })
        .then(response => response.json())
        .then(result => {
            console.log('Usuario modificado ',result)
            if(!esEntero(result['id'])){
                error.textContent = result['affected'];
            }else{
                getUsers();
            }

        })
        .catch(er=>{
            alert('Error al actualizar el usuario')
        })
    }

}

function editMode(id){
    const row = document.querySelector(`tr[data-id="${id}"]`)
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'inline-block';
    })

    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'none';
    })
}

function cancelEdit(id){
    const row = document.querySelector(`tr[data-id="${id}"]`)
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'none';
    })

    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'inline-block';
    })
}

function deleteUser(id){
    if(confirm('¿Estás seguro de que quieres eliminar este usuario?')){
        fetch(`${API_URL}/?id=${id}`,{
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(result => {
            console.log('Usuario eliminado: ',result)
            getUsers();
        })
        .catch(error => console.error('Error: ',error))
    }
}

document.getElementById('createForm').addEventListener('submit', createUser)

getUsers();