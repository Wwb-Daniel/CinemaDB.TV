-- Crear tabla de películas si no existe
CREATE TABLE IF NOT EXISTS peliculas (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    imagen_url TEXT,
    descripcion TEXT,
    generos TEXT[] DEFAULT '{}',
    anio INTEGER,
    vistas INTEGER DEFAULT 0,
    iframe_url TEXT,
    duracion INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_peliculas_titulo ON peliculas(titulo);
CREATE INDEX IF NOT EXISTS idx_peliculas_anio ON peliculas(anio);
CREATE INDEX IF NOT EXISTS idx_peliculas_generos ON peliculas USING GIN(generos);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_peliculas_updated_at ON peliculas;
CREATE TRIGGER update_peliculas_updated_at
    BEFORE UPDATE ON peliculas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
