"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Eye,
  Calendar,
  Clock,
  Star,
  Share2,
  Heart,
  MoreHorizontal,
  Film,
  Flag,
  Info,
  Bookmark,
} from "lucide-react"
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

interface MovieDetailsProps {
  movie: Movie
  relatedMovies: Movie[]
  onBack: () => void
  onUpdateViews?: (movieId: string, newViews: number) => void
}

export function MovieDetails({ movie, relatedMovies, onBack, onUpdateViews }: MovieDetailsProps) {
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.titulo,
          text: movie.descripcion,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleReport = () => {
    // Implementar reporte de contenido
    alert("Función de reporte enviada. Gracias por tu feedback.")
  }

  const handleMovieInfo = () => {
    // Mostrar información adicional
    alert(`Información adicional sobre: ${movie.titulo}`)
  }

  const rating = 4.0 + Math.random() * 1.5 // Simulado
  const currentViews = hasStartedPlaying ? movie.vistas + 1 : movie.vistas

  // Incrementar vistas cuando se carga la página de detalles
  useEffect(() => {
    if (!hasStartedPlaying && movie.id && onUpdateViews) {
      setHasStartedPlaying(true)
      onUpdateViews(movie.id, movie.vistas + 1)
    }
  }, [movie.id, movie.vistas, hasStartedPlaying, onUpdateViews])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al catálogo</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsFavorite(!isFavorite)}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    {isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMovieInfo}>
                    <Info className="h-4 w-4 mr-2" />
                    Información adicional
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReport} className="text-red-600">
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar contenido
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
          {/* Información de la película - En móvil primero el título y luego la imagen */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6 order-2 lg:order-1">
            {/* Título visible solo en móvil */}
            <div className="block lg:hidden">
              <h1 className="text-3xl font-bold mb-2">{movie.titulo}</h1>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-4">
                {movie.anio && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {movie.anio}
                  </span>
                )}
                {movie.duracion && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {movie.duracion}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Poster */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={imageError ? "/placeholder.svg?height=600&width=400" : movie.imagen_url}
                alt={movie.titulo}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Rating badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-black font-bold">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {rating.toFixed(1)}
                </Badge>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button variant="outline" onClick={() => setIsFavorite(!isFavorite)} className="w-full">
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "En Favoritos" : "Agregar a Favoritos"}
              </Button>
            </div>

            {/* Estadísticas */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Estadísticas</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{currentViews.toLocaleString()} vistas</span>
                  </div>

                  {movie.anio && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{movie.anio}</span>
                    </div>
                  )}

                  {movie.duracion && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{movie.duracion}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{rating.toFixed(1)}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Géneros */}
            {movie.generos && movie.generos.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Géneros</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.generos.map((genero, i) => (
                      <Badge key={i} variant="secondary">
                        {genero}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-1 lg:order-2">
            {/* Título y descripción - visible solo en desktop */}
            <div className="hidden lg:block space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{movie.titulo}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  {movie.anio && <span>{movie.anio}</span>}
                  {movie.duracion && (
                    <>
                      <span>•</span>
                      <span>{movie.duracion}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {movie.descripcion && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Sinopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">{movie.descripcion}</p>
                </div>
              )}
            </div>

            {/* Sinopsis en móvil */}
            {movie.descripcion && (
              <div className="block lg:hidden">
                <h2 className="text-xl font-semibold mb-2">Sinopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{movie.descripcion}</p>
              </div>
            )}

            <Separator className="hidden lg:block" />

            {/* Reproductor */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Reproductor</h2>

              {/* Player container */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {movie.iframe_url ? (
                  <iframe
                    src={movie.iframe_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={movie.titulo}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto mb-4 opacity-50 bg-gray-600 rounded-full flex items-center justify-center">
                        <Film className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-lg">No hay contenido disponible</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional del reproductor */}
              <div className="flex flex-wrap justify-between text-sm text-muted-foreground gap-2">
                <span>Calidad: HD</span>
                <span>Idioma: Español</span>
                <span>Subtítulos: Disponibles</span>
              </div>
            </div>

            <Separator />

            {/* Películas relacionadas */}
            {relatedMovies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Películas relacionadas</h2>

                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {relatedMovies.slice(0, 6).map((relatedMovie, index) => (
                      <div key={relatedMovie.id || index} className="flex-shrink-0 w-36 sm:w-48">
                        <MovieCard movie={relatedMovie} onUpdateViews={onUpdateViews} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Información técnica */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold mb-4">Información técnica</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Formato:</span>
                    <span className="ml-2 text-muted-foreground">MP4</span>
                  </div>

                  <div>
                    <span className="font-medium">Resolución:</span>
                    <span className="ml-2 text-muted-foreground">1080p HD</span>
                  </div>

                  <div>
                    <span className="font-medium">Audio:</span>
                    <span className="ml-2 text-muted-foreground">Estéreo</span>
                  </div>

                  <div>
                    <span className="font-medium">Subtítulos:</span>
                    <span className="ml-2 text-muted-foreground">Español, Inglés</span>
                  </div>

                  {movie.anio && (
                    <div>
                      <span className="font-medium">Año:</span>
                      <span className="ml-2 text-muted-foreground">{movie.anio}</span>
                    </div>
                  )}

                  {movie.duracion && (
                    <div>
                      <span className="font-medium">Duración:</span>
                      <span className="ml-2 text-muted-foreground">{movie.duracion}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
