<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Cartelera de Películas</title>
    <link rel="stylesheet" href="administracion/css/index.css">
</head>

<body>
    <header class="header">
        <h1>Cartelera de Películas</h1>
    </header>

    <div class="search-container">
        <input type="text" class="search-input" placeholder="Buscar películas..." id="searchInput">
    </div>

    <div class="movies-grid" id="moviesGrid">
        <!-- Las películas se generarán dinámicamente aquí -->
    </div>

    <script>
        const API_URL = 'http://localhost/08-php-api/controllers/peliculas.php';
        const DIRECTOR_API_URL = 'http://localhost/08-php-api/controllers/directores.php';

        const moviesGrid = document.getElementById('moviesGrid');
        const searchInput = document.getElementById('searchInput');

        let peliculas = [];
        let directoresMap = {};

        // Función para crear una tarjeta de película
        function createMovieCard(pelicula) {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.style.animation = 'fadeIn 0.5s ease forwards';

            // Usamos el nombre del director en lugar de su id
            const directorNombre = directoresMap[pelicula.id_director] || 'Director desconocido';

            card.innerHTML = `
                <img src="${pelicula.portada}" alt="${pelicula.titulo}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${pelicula.titulo}</h3>
                    <span class="movie-precio">$${pelicula.precio}</span>
                    <p class="movie-director">Director: ${directorNombre}</p>
                </div>
            `;

            return card;
        }

        // Función para mostrar todas las películas
        function displayMovies(moviesToShow = peliculas) {
            moviesGrid.innerHTML = '';
            moviesToShow.forEach(movie => {
                moviesGrid.appendChild(createMovieCard(movie));
            });
        }

        // Función de búsqueda
        function searchMovies(query) {
            const filteredMovies = peliculas.filter(movie =>
                movie.titulo.toLowerCase().includes(query.toLowerCase())
            );
            displayMovies(filteredMovies);
        }

        // Función para obtener y mapear los directores
        function getDirectores() {
            return fetch(DIRECTOR_API_URL)
                .then(response => response.json())
                .then(data => {
                    data.forEach(director => {
                        directoresMap[director.id] = `${director.nombre} ${director.apellido}`;
                    });
                })
                .catch(error => {
                    console.log('Error al cargar los directores:', error);
                });
        }

        // Función para obtener las películas desde la base de datos
        function getPeliculas() {
            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    peliculas = data; // Guardar las películas en la variable global
                    displayMovies();  // Mostrar todas las películas
                })
                .catch(error => {
                    console.log('Error al cargar las películas:', error);
                    moviesGrid.innerHTML = '<p>Error al cargar las películas. Intenta de nuevo más tarde.</p>';
                });
        }

        // Event listener para la búsqueda
        searchInput.addEventListener('input', (e) => {
            searchMovies(e.target.value);
        });

        // Obtener directores y películas cuando cargue la página
        getDirectores().then(getPeliculas);
    </script>
</body>

</html>