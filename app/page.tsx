"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Database, Loader2, Film } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { MovieGrid } from "@/components/movie-grid"
import { MovieDetails } from "@/components/movie-details"
import { AdminPanel } from "@/components/admin-panel"
import { AuthGuard } from "@/components/auth-guard"
import { FavoritesSection } from "@/components/favorites-section"
import { FeaturedMovie } from "@/components/featured-movie"

interface Movie {
  id?: string
  titulo: string
  imagen_url: string
  descripcion: string
  generos: string[]
  anio: number | null
  vistas: number
  iframe_url: string
  duracion?: string | null
}

export default function CinemaApp() {
  const [activeTab, setActiveTab] = useState("watch")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [debugResult, setDebugResult] = useState<any>(null)
  const [fixedScript, setFixedScript] = useState<string>("")

  // Estado para el formulario de nueva película
  const [newMovie, setNewMovie] = useState<Movie>({
    titulo: "",
    imagen_url: "",
    descripcion: "",
    generos: [],
    anio: null,
    vistas: 0,
    iframe_url: "",
    duracion: "",
  })

  // Filtrar películas válidas (con iframe_url y sin duplicados por imagen)
  const validMovies = useMemo(() => {
    const seenImageUrls = new Set<string>()

    return movies.filter((movie) => {
      // Verificar que tenga iframe_url e imagen_url válidos
      const hasValidUrls =
        movie.iframe_url && movie.iframe_url.trim() !== "" && movie.imagen_url && movie.imagen_url.trim() !== ""

      if (!hasValidUrls) return false

      // Verificar si ya hemos visto esta URL de imagen
      if (seenImageUrls.has(movie.imagen_url)) {
        return false // Omitir duplicado
      }

      // Agregar la URL al set y permitir la película
      seenImageUrls.add(movie.imagen_url)
      return true
    })
  }, [movies])

  // Seleccionar película destacada (la más vista)
  const featuredMovie = useMemo(() => {
    if (validMovies.length === 0) return null
    return [...validMovies].sort((a, b) => b.vistas - a.vistas)[0]
  }, [validMovies])

  // Obtener películas relacionadas
  const getRelatedMovies = (currentMovie: Movie) => {
    if (!currentMovie.generos || currentMovie.generos.length === 0) {
      return validMovies.filter((movie) => movie.id !== currentMovie.id).slice(0, 6)
    }

    const related = validMovies.filter((movie) => {
      if (movie.id === currentMovie.id) return false

      // Buscar películas con géneros similares
      const hasCommonGenre = movie.generos?.some((genre) => currentMovie.generos.includes(genre))

      // O del mismo año
      const sameYear = movie.anio === currentMovie.anio

      return hasCommonGenre || sameYear
    })

    // Si no hay suficientes relacionadas, agregar más películas
    if (related.length < 6) {
      const additional = validMovies
        .filter((movie) => movie.id !== currentMovie.id && !related.includes(movie))
        .slice(0, 6 - related.length)

      return [...related, ...additional]
    }

    return related.slice(0, 6)
  }

  // Verificar si la pestaña requiere autenticación
  const requiresAuth = (tab: string) => {
    return ["add-movie", "manage", "admin"].includes(tab)
  }

  // Probar conexión con Supabase
  const testConnection = async () => {
    try {
      const response = await fetch("/api/test-connection")
      const result = await response.json()

      if (response.ok) {
        setConnectionStatus("connected")
        setError(null) // Limpiar cualquier error previo
      } else {
        setConnectionStatus("error")
        // Solo mostrar el error si no es un error de conexión común
        if (result.error !== "Error al conectar con Supabase") {
          setError(`Error de conexión: ${result.error}`)
        }
      }
    } catch (err) {
      setConnectionStatus("error")
      // Solo mostrar errores de red si son críticos
      if (err instanceof Error && !err.message.includes("Failed to fetch")) {
        setError(`Error de red: ${err.message}`)
      }
    }
  }

  // Cargar películas existentes
  const loadMovies = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/movies")
      const result = await response.json()

      if (response.ok) {
        setMovies(result.data || [])
        if (activeTab === "watch") {
          setSuccess(`Se cargaron ${result.data?.length || 0} películas`)
        }
      } else {
        setError(`Error al cargar películas: ${result.error}`)
      }
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar vistas de una película
  const updateMovieViews = async (movieId: string, newViews: number) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/views`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ views: newViews }),
      })

      if (response.ok) {
        setMovies((prevMovies) =>
          prevMovies.map((movie) => (movie.id === movieId ? { ...movie, vistas: newViews } : movie)),
        )

        // Actualizar también la película seleccionada si es la misma
        if (selectedMovie && selectedMovie.id === movieId) {
          setSelectedMovie({ ...selectedMovie, vistas: newViews })
        }
      }
    } catch (err) {
      console.error("Error al actualizar vistas:", err)
    }
  }

  // Manejar selección de película
  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setActiveTab("watch")
  }

  // Volver al catálogo
  const handleBackToCatalog = () => {
    setSelectedMovie(null)
  }

  // Manejar cambio de tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab !== "watch") {
      setSelectedMovie(null)
    }
  }

  // Guardar nueva película
  const saveMovie = async () => {
    if (!newMovie.titulo.trim()) {
      setError("El título es requerido")
      return
    }

    if (!newMovie.imagen_url.trim()) {
      setError("La URL de la imagen es requerida")
      return
    }

    if (!newMovie.iframe_url.trim()) {
      setError("La URL del iframe es requerida")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const movieData = {
        ...newMovie,
        generos:
          typeof newMovie.generos === "string"
            ? newMovie.generos
                .split(",")
                .map((g) => g.trim())
                .filter((g) => g.length > 0)
            : newMovie.generos,
      }

      const response = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieData),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Película guardada exitosamente")
        setNewMovie({
          titulo: "",
          imagen_url: "",
          descripcion: "",
          generos: [],
          anio: null,
          vistas: 0,
          iframe_url: "",
          duracion: "",
        })
        loadMovies()
      } else {
        setError(`Error al guardar película: ${result.error}`)
      }
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Ejecutar diagnóstico completo
  const runDebug = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setDebugResult(null)

    try {
      const response = await fetch("/api/debug")
      const result = await response.json()

      if (response.ok) {
        setDebugResult(result)
        setSuccess("Diagnóstico completado exitosamente")
      } else {
        setError(`Error en diagnóstico: ${result.error}`)
      }
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Obtener script corregido
  const getFixedScript = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/fix-script")
      const result = await response.json()

      if (response.ok) {
        setFixedScript(result.script)
        setSuccess("Script corregido generado exitosamente")
      } else {
        setError(`Error al generar script: ${result.error}`)
      }
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  useEffect(() => {
    testConnection()
    loadMovies()
  }, [])

  // Renderizar contenido con o sin autenticación
  const renderTabContent = () => {
    if (activeTab === "watch" && selectedMovie) {
      return (
        <MovieDetails
          movie={selectedMovie}
          relatedMovies={getRelatedMovies(selectedMovie)}
          onBack={handleBackToCatalog}
          onUpdateViews={updateMovieViews}
        />
      )
    }

    if (activeTab === "watch") {
      return (
        <div className="space-y-6 sm:space-y-8">
          {/* Película destacada */}
          {featuredMovie && (
            <div className="mb-8 -mx-4 sm:-mx-0">
              <FeaturedMovie movie={featuredMovie} onMovieSelect={handleMovieSelect} />
            </div>
          )}

          {/* Sección de favoritos */}
          <FavoritesSection onMovieSelect={handleMovieSelect} onUpdateViews={updateMovieViews} />

          {/* Catálogo principal */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Catálogo Completo</h2>
              <Button variant="outline" size="sm" onClick={loadMovies} disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>

            <MovieGrid movies={validMovies} onUpdateViews={updateMovieViews} onMovieSelect={handleMovieSelect} />
          </div>
        </div>
      )
    }

    // Contenido que requiere autenticación
    const protectedContent = () => {
      if (activeTab === "add-movie") {
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Nueva Película
              </CardTitle>
              <CardDescription>Completa todos los campos para agregar una nueva película al catálogo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={newMovie.titulo}
                    onChange={(e) => setNewMovie({ ...newMovie, titulo: e.target.value })}
                    placeholder="Título de la película"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    id="anio"
                    type="number"
                    value={newMovie.anio || ""}
                    onChange={(e) =>
                      setNewMovie({ ...newMovie, anio: e.target.value ? Number.parseInt(e.target.value) : null })
                    }
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagen_url">URL de Imagen *</Label>
                  <Input
                    id="imagen_url"
                    value={newMovie.imagen_url}
                    onChange={(e) => setNewMovie({ ...newMovie, imagen_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración</Label>
                  <Input
                    id="duracion"
                    value={newMovie.duracion || ""}
                    onChange={(e) => setNewMovie({ ...newMovie, duracion: e.target.value })}
                    placeholder="120 min"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="iframe_url">URL del Iframe *</Label>
                  <Input
                    id="iframe_url"
                    value={newMovie.iframe_url}
                    onChange={(e) => setNewMovie({ ...newMovie, iframe_url: e.target.value })}
                    placeholder="https://ejemplo.com/player"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generos">Géneros (separados por comas)</Label>
                  <Input
                    id="generos"
                    value={Array.isArray(newMovie.generos) ? newMovie.generos.join(", ") : newMovie.generos}
                    onChange={(e) => setNewMovie({ ...newMovie, generos: e.target.value })}
                    placeholder="Acción, Drama, Comedia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vistas">Vistas</Label>
                  <Input
                    id="vistas"
                    type="number"
                    value={newMovie.vistas}
                    onChange={(e) => setNewMovie({ ...newMovie, vistas: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newMovie.descripcion}
                  onChange={(e) => setNewMovie({ ...newMovie, descripcion: e.target.value })}
                  placeholder="Descripción de la película..."
                  rows={4}
                />
              </div>

              <Button
                onClick={saveMovie}
                disabled={
                  loading || !newMovie.titulo.trim() || !newMovie.imagen_url.trim() || !newMovie.iframe_url.trim()
                }
                className="w-full"
                size="lg"
              >
                {loading ? "Guardando..." : "Guardar Película"}
              </Button>
            </CardContent>
          </Card>
        )
      }

      if (activeTab === "manage") {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestionar Películas
              </CardTitle>
              <CardDescription>Lista completa de películas en la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Total: {movies.length} películas | Válidas: {validMovies.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{validMovies.length} con iframe</Badge>
                    <Badge variant="outline">{movies.length - validMovies.length} sin iframe</Badge>
                  </div>
                </div>
                <Button onClick={loadMovies} disabled={loading} variant="outline">
                  {loading ? "Cargando..." : "Actualizar"}
                </Button>
              </div>

              <div className="grid gap-4">
                {movies.length === 0 ? (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay películas en la base de datos</p>
                  </div>
                ) : (
                  movies.map((movie, index) => (
                    <div key={movie.id || index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h3 className="font-semibold">{movie.titulo}</h3>
                        <div className="flex flex-wrap gap-2">
                          {movie.anio && <Badge variant="secondary">{movie.anio}</Badge>}
                          {movie.iframe_url && movie.imagen_url ? (
                            <Badge className="bg-green-500">Válida</Badge>
                          ) : !movie.iframe_url ? (
                            <Badge variant="destructive">Sin iframe</Badge>
                          ) : (
                            <Badge variant="destructive">Sin imagen</Badge>
                          )}
                        </div>
                      </div>

                      {movie.descripcion && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{movie.descripcion}</p>
                      )}

                      {movie.generos && movie.generos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {movie.generos.map((genero, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {genero}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Vistas: {movie.vistas} | Duración: {movie.duracion || "No especificada"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )
      }

      if (activeTab === "admin") {
        return (
          <AdminPanel
            onRunDebug={runDebug}
            onGetFixedScript={getFixedScript}
            debugResult={debugResult}
            fixedScript={fixedScript}
            loading={loading}
            error={error}
            success={success}
            connectionStatus={connectionStatus}
            movieCount={validMovies.length}
          />
        )
      }

      return null
    }

    // Si la pestaña requiere autenticación, envolver en AuthGuard
    if (requiresAuth(activeTab)) {
      return <AuthGuard>{protectedContent()}</AuthGuard>
    }

    return protectedContent()
  }

  return (
    <div className="min-h-screen bg-background">
      {!selectedMovie && <Navbar activeTab={activeTab} onTabChange={handleTabChange} movieCount={validMovies.length} />}

      <main className={selectedMovie ? "" : "container mx-auto px-4 py-4 sm:py-8"}>
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando...</span>
            </div>
          </div>
        )}

        {/* Mostrar alertas de error/éxito solo si no estamos en una sección protegida sin autenticar */}
        {(error || success) &&
          (!requiresAuth(activeTab) || sessionStorage.getItem("admin_authenticated") === "true") && (
            <div className="mb-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}
            </div>
          )}

        {renderTabContent()}
      </main>

      {/* Footer - solo mostrar si no hay película seleccionada */}
      {!selectedMovie && (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Film className="h-5 w-5" />
                <span className="font-semibold">CinemaDB</span>
                <Badge variant="outline">v3.0</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-center md:text-right">
                © 2024 CinemaDB. Plataforma de streaming y gestión de películas.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
