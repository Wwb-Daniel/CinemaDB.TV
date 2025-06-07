-- Insertar datos de ejemplo para probar la tabla
INSERT INTO peliculas (titulo, imagen_url, descripcion, generos, anio, vistas, iframe_url) VALUES
(
    'Película de Prueba 1',
    'https://via.placeholder.com/300x450/0066cc/ffffff?text=Pelicula+1',
    'Esta es una película de prueba para verificar que la base de datos funciona correctamente.',
    ARRAY['Acción', 'Drama'],
    2024,
    150,
    'https://ejemplo.com/iframe1'
),
(
    'Película de Prueba 2',
    'https://via.placeholder.com/300x450/cc6600/ffffff?text=Pelicula+2',
    'Segunda película de prueba con diferentes géneros y características.',
    ARRAY['Comedia', 'Romance'],
    2023,
    89,
    'https://ejemplo.com/iframe2'
),
(
    'Película de Prueba 3',
    'https://via.placeholder.com/300x450/009900/ffffff?text=Pelicula+3',
    'Tercera película de prueba para completar los datos de ejemplo.',
    ARRAY['Ciencia Ficción', 'Thriller'],
    2024,
    234,
    'https://ejemplo.com/iframe3'
);

-- Insertar películas de ejemplo
INSERT INTO peliculas (
    id,
    titulo,
    imagen_url,
    descripcion,
    generos,
    duracion,
    anio,
    vistas,
    iframe_url,
    created_at
) VALUES 
(
    '1ef54e74-e88b-44dd-a78d-5d5e3139a97e',
    'Spider-Man: No Way Home (Spider-Man: Sin camino a casa) (2021) online',
    'https://gnula.nu/wp-content/uploads/2021/12/Spider_Man_No_Way_Home_poster_usa.jpg',
    'Por primera vez en la historia cinematográfica de Spider-Man, nuestro héroe, vecino y amigo es desenmascarado, y por tanto, ya no es capaz de separar su vida normal de los enormes riesgos que conlleva ser un Súper Héroe. Cuando pide ayuda a Doctor Strange, los riesgos pasan a ser aún más peligrosos, obligándole a descubrir lo que realmente significa ser Spider-Man. Secuela de ''Spider-Man: Far From Home''.',
    ARRAY['Acción', 'Comedia'],
    '2:28:52',
    2024,
    11038,
    'https://filemoon.sx/e/pe8qb09na1ea',
    '2025-06-06 06:51:22.435144+00'
),
(
    '7f21814d-179e-4cca-8b69-2b550036c983',
    'Drop: Amenaza anónima (2025) online',
    'https://gnulahd.nu/wp-content/uploads/2025/04/Drop_poster_usa.webp',
    'Las primeras citas siempre son muy estresantes. ¿Ir a una primera cita mientras un desconocido te envía memes que van de molestos a homicidas?',
    ARRAY['Terror', 'Suspenso'],
    '1:35:52',
    2025,
    12136,
    'https://filemoon.sx/e/g2xoyibn55oa',
    '2025-06-06 06:55:01.36614+00'
);
