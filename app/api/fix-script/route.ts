import { NextResponse } from "next/server"

export async function GET() {
  const fixedScript = `
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configuración directa de Supabase (para pruebas)
const SUPABASE_URL = 'https://gcqkujyyoaeymjqapecc.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWt1anl5b2FleW1qcWFwZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE3ODAxNSwiZXhwIjoyMDY0NzU0MDE1fQ.mKUZ89op72Ld33smi6k9tgNvcnDR_A0VUmnP-sb88aA';

// Inicializar cliente de Supabase con service_role key para acceso administrativo
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Función para limpiar texto
const cleanText = (text) => {
    return text ? text.replace(/\\s+/g, ' ').trim() : '';
};

// Función para extraer número de texto
const extractNumber = (text) => {
    if (!text) return 0;
    const match = text.match(/\\d+/);
    return match ? parseInt(match[0]) : 0;
};

// Función para obtener datos de una película individual
async function getMovieDetails(page, movieUrl) {
    try {
        console.log(\`Navegando a la página de la película: \${movieUrl}\`);
        await page.goto(movieUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        
        const movieData = await page.evaluate(() => {
            // Obtener título
            const title = document.querySelector('h2.entry-title')?.textContent.trim() || '';

            // Obtener imagen
            const img = document.querySelector('img[loading="lazy"]');
            let imageUrl = img?.src || '';
            if (imageUrl.startsWith('//')) {
                imageUrl = \`https:\${imageUrl}\`;
            }

            // Obtener enlace de la película
            const movieLink = document.querySelector('a.lnk-blk')?.href || '';

            // Obtener año
            const year = document.querySelector('span.year')?.textContent.trim() || '';

            // Obtener calidad
            const quality = document.querySelector('span.Qlty')?.textContent.trim() || '';

            // Obtener iframe de reproducción
            const iframe = document.querySelector('iframe[src*="trembed"]');
            const iframeUrl = iframe?.getAttribute('src') || iframe?.getAttribute('data-src') || '';

            // Obtener descripción
            const descElement = document.querySelector('div.entry-content');
            let description = '';
            if (descElement) {
                const paragraphs = descElement.querySelectorAll('p');
                description = Array.from(paragraphs)
                    .map(p => p.textContent.trim())
                    .filter(text => text.length > 0)
                    .join(' ');
            }

            // Obtener géneros
            const genresElement = document.querySelector('span.genres');
            const genres = genresElement ? 
                Array.from(genresElement.querySelectorAll('a'))
                    .map(a => a.textContent.trim())
                    .filter(text => text.length > 0) : [];

            // Obtener número de vistas
            const viewsElement = document.querySelector('span.views span');
            const views = viewsElement ? parseInt(viewsElement.textContent.trim()) || 0 : 0;

            return {
                titulo: title,
                imagen_url: imageUrl,
                enlace_pelicula: movieLink,
                anio: year,
                calidad: quality,
                iframe_url: iframeUrl,
                descripcion: description,
                generos: genres,
                vistas: views
            };
        });

        console.log('Datos extraídos de la película:', movieData);
        return movieData;
    } catch (error) {
        console.error(\`Error al obtener detalles de la película \${movieUrl}:\`, error);
        return null;
    }
}

// Función para extraer datos de películas
async function scrapeMovieData(url) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Configurar el viewport para asegurar que la página se cargue completamente
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Configurar el user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('Navegando a la página principal...');
        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Obtener todas las URLs de películas
        const movieUrls = await page.evaluate(() => {
            const articles = document.querySelectorAll('article');
            const urls = new Set();

            articles.forEach(article => {
                const link = article.querySelector('a.lnk-blk');
                if (link && link.href) {
                    urls.add(link.href);
                }
            });

            console.log(\`Se encontraron \${urls.size} URLs de películas en los artículos\`);
            return Array.from(urls);
        });

        console.log(\`Se encontraron \${movieUrls.length} URLs de películas\`);

        // Procesar cada película individualmente
        const movies = [];
        for (const movieUrl of movieUrls) {
            console.log(\`Procesando película: \${movieUrl}\`);
            const movieData = await getMovieDetails(page, movieUrl);
            if (movieData) {
                movies.push(movieData);
                console.log('Película procesada:', movieData);
            }
            // Esperar un poco entre cada película para no sobrecargar el servidor
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return movies;
    } catch (error) {
        console.error('Error during scraping:', error);
        return [];
    } finally {
        await browser.close();
    }
}

// Función para guardar en Supabase
async function saveToSupabase(movies) {
    console.log('Iniciando guardado de películas...');
    console.log('Número de películas a guardar:', movies.length);
    
    for (const movie of movies) {
        try {
            // Asegurar que todos los campos tengan el formato correcto según el esquema
            const dbMovie = {
                titulo: String(movie.titulo || ''),
                imagen_url: String(movie.imagen_url || ''),
                descripcion: String(movie.descripcion || ''),
                generos: Array.isArray(movie.generos) ? movie.generos : [],
                anio: movie.anio ? parseInt(movie.anio) : null,
                vistas: parseInt(movie.vistas || 0),
                iframe_url: String(movie.iframe_url || ''),
                duracion: movie.duracion || null
            };

            console.log('Intentando guardar película:', JSON.stringify(dbMovie, null, 2));

            // Intentar insertar la película
            const { data, error } = await supabase
                .from('peliculas')
                .insert([dbMovie])
                .select();

            if (error) {
                console.error(\`Error al guardar película \${dbMovie.titulo}:\`, error);
                console.error('Detalles del error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
            } else {
                console.log(\`Película guardada exitosamente:\`, data);
            }

            // Esperar un poco entre cada inserción
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(\`Error al guardar película \${movie.titulo}:\`, error);
        }
    }
}

// Función principal
async function main() {
    const url = 'https://pelicinehd.com/';
    console.log('Iniciando scraping...');
    
    try {
        // Probar la conexión con Supabase
        console.log('Probando conexión con Supabase...');
        const { data: testData, error: testError } = await supabase
            .from('peliculas')
            .select('count(*)')
            .limit(1);
            
        if (testError) {
            console.error('Error al conectar con Supabase:', testError);
            return;
        }
        
        console.log('Conexión exitosa con Supabase');
        
        const movies = await scrapeMovieData(url);
        console.log('Películas encontradas:', movies.length);
        
        if (movies.length > 0) {
            console.log('Primera película a guardar:', movies[0]);
            await saveToSupabase(movies);
            console.log('¡Scraping completado!');
        } else {
            console.log('No hay películas para guardar.');
        }
    } catch (error) {
        console.error('Error en el proceso principal:', error);
    }
}

// Ejecutar el script
main();
  `

  return NextResponse.json({
    success: true,
    script: fixedScript,
  })
}
