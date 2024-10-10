<?php

require_once '../data/pelicula.php';
require_once 'utilidades.php';
/**
 * Establecer el encabezado
 * La respuesta va a ser un objeto tipo JSON
 * Indica al  cliente (navegador web o aplicación que realiza  la petición HTTP) que el contenido de la respuesta será en formato JSON
 */

header('Content-Type: application/json');

$pelicula = new Pelicula();


$method = $_SERVER['REQUEST_METHOD'];

// Obtener la URI de la petición
$uri = $_SERVER['REQUEST_URI'];

$parametros = Utilidades::parseUriParameters($uri);

$id = Utilidades::getParameterValue($parametros, 'id');

switch ($method) {
    case 'GET':
        if ($id) {
            $respuesta = getPeliculaById($pelicula, $id);
        } else {
            $respuesta = getAllPeliculas($pelicula);
        }
        echo json_encode($respuesta);
        break;
    case 'POST':
        setFilm($pelicula);
        break;
    case 'PUT':
        if ($id) {
            updateFilm($pelicula, $id);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID no proporcionado']);
        }
        break;
    case 'DELETE':
        if ($id) {
            deleteUser($pelicula, $id);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID no proporcionado']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
}

function getPeliculaById($pelicula, $id)
{
    return $pelicula->getById($id);
}

function getAllPeliculas($pelicula)
{
    return $pelicula->getAll();
}

function setFilm($pelicula)
{
    // Obtiene el contenido de php://input
    $data = json_decode(file_get_contents('php://input'), true);

    // Verifica que los datos no estén vacíos
    if (!empty($data['titulo']) && !empty($data['precio']) && is_numeric($data['precio'])&& !empty($data['id_director'])) {
        // Crea la película y obtiene el ID
        $id = $pelicula->create($data['titulo'], $data['precio'], $data['id_director']);
        echo json_encode(['id' => $id]);
    } else {
        // Devuelve un error si los datos son insuficientes
        echo json_encode(['Error' => 'Datos insuficientes']);
    }
}


function updateFilm($pelicula, $id)
{
    // Obtener los datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que se han enviado datos
    if (!empty($data)) {

        // Validar que se envió un nombre y un email
        if (!empty($data['titulo']) && !empty($data['precio']) && !empty($data['id_director'])) {

            // Actualizar el usuario en la base de datos
            $affected = $pelicula->update($id, $data['titulo'], $data['precio'], $data['id_director']);
            echo json_encode(['affected' => $affected]);

        } else {
            echo json_encode(['error' => 'Titulo ,precio y id_director son obligatorios']);
        }

    }
}

function deleteUser($pelicula, $id)
{

    $affected = $pelicula->delete($id);
    echo json_encode(['affected' => $affected]);
}

