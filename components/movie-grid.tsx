"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid3X3, List, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { MovieCard } from "./movie-card"

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

interface MovieGridProps {
  movies: Movie[]
  onUpdateViews?: (movieId: string, newViews: number) => void
  onMovieSelect?: (movie: Movie) => void
}

const MOVIES_PER_PAGE = 20

export function MovieGrid({ movies, onUpdateViews, onMovieSelect }: MovieGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrar películas válidas y eliminar duplicados por URL de imagen
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

  // Obtener géneros y años únicos
  const allGenres = useMemo(() => {
    return Array.from(new Set(validMovies.flatMap((movie) => movie.generos || []))).sort()
  }, [validMovies])

  const allYears = useMemo(() => {
    return Array.from(new Set(validMovies.map((movie) => movie.anio).filter(Boolean))).sort((a, b) => b! - a!)
  }, [validMovies])

  // Filtrar películas
  const filteredMovies = useMemo(() => {
    return validMovies.filter((movie) => {
      const matchesSearch =
        movie.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.descripcion.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGenre = selectedGenre === "all" || (movie.generos && movie.generos.includes(selectedGenre))

      const matchesYear = selectedYear === "all" || movie.anio?.toString() === selectedYear

      return matchesSearch && matchesGenre && matchesYear
    })
  }, [validMovies, searchTerm, selectedGenre, selectedYear])

  // Ordenar películas
  const sortedMovies = useMemo(() => {
    return [...filteredMovies].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.anio || 0) - (a.anio || 0)
        case "oldest":
          return (a.anio || 0) - (b.anio || 0)
        case "most-viewed":
          return b.vistas - a.vistas
        case "alphabetical":
          return a.titulo.localeCompare(b.titulo)
        case "rating":
          return Math.random() - 0.5 // Simulado
        default:
          return 0
      }
    })
  }, [filteredMovies, sortBy])

  // Paginación
  const totalPages = Math.ceil(sortedMovies.length / MOVIES_PER_PAGE)
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE
  const endIndex = startIndex + MOVIES_PER_PAGE
  const currentMovies = sortedMovies.slice(startIndex, endIndex)

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedGenre("all")
    setSelectedYear("all")
    setSortBy("newest")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedGenre, selectedYear, sortBy])

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Películas</h2>
          <p className="text-muted-foreground">
            {sortedMovies.length} de {validMovies.length} películas únicas disponibles
            {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar películas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los géneros</SelectItem>
            {allGenres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los años</SelectItem>
            {allYears.map((year) => (
              <SelectItem key={year} value={year!.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguos</SelectItem>
            <SelectItem value="most-viewed">Más vistas</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
            <SelectItem value="rating">Mejor valoradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtros activos */}
      {(searchTerm || selectedGenre !== "all" || selectedYear !== "all" || sortBy !== "newest") && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {searchTerm && <Badge variant="secondary">Búsqueda: "{searchTerm}"</Badge>}
          {selectedGenre !== "all" && <Badge variant="secondary">Género: {selectedGenre}</Badge>}
          {selectedYear !== "all" && <Badge variant="secondary">Año: {selectedYear}</Badge>}
          {sortBy !== "newest" && <Badge variant="secondary">Orden: {sortBy}</Badge>}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Grid de películas */}
      {currentMovies.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No se encontraron películas</h3>
          <p className="text-muted-foreground mb-4">Intenta ajustar tus filtros o términos de búsqueda</p>
          <Button onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            }
          >
            {currentMovies.map((movie, index) => (
              <MovieCard
                key={`movie-${movie.id || movie.titulo}-${startIndex + index}`}
                movie={movie}
                onUpdateViews={onUpdateViews}
                onMovieSelect={onMovieSelect}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, sortedMovies.length)} de {sortedMovies.length} películas
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
