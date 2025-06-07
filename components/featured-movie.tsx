"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/hooks/use-favorites"
import { Play, Calendar, Clock, Star, Heart, Info } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface FeaturedMovieProps {
  movie: Movie
  onMovieSelect?: (movie: Movie) => void
}

export function FeaturedMovie({ movie, onMovieSelect }: FeaturedMovieProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isMovieFavorite = movie.id ? isFavorite(movie.id) : false
  const rating = 4.0 + Math.random() * 1.0 // Simulado entre 4.0 y 5.0

  const handleClick = () => {
    if (onMovieSelect) {
      onMovieSelect(movie)
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (movie.id) {
      toggleFavorite(movie.id, movie)
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Imagen de fondo con gradiente */}
      <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden">
        <img
          src={movie.imagen_url || "/placeholder.svg"}
          alt={movie.titulo}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=600&width=1600"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Contenido superpuesto */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-lg space-y-4">
            <Badge className="bg-primary text-primary-foreground mb-2">Destacada</Badge>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{movie.titulo}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              {movie.anio && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.anio}</span>
                </div>
              )}

              {movie.duracion && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.duracion}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span>{rating.toFixed(1)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Badge variant="outline" className="border-white/20 text-white">
                  HD
                </Badge>
              </div>
            </div>

            {movie.generos && movie.generos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.generos.slice(0, 4).map((genero, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/10 text-white border-0">
                    {genero}
                  </Badge>
                ))}
              </div>
            )}

            {movie.descripcion && (
              <p className="text-sm md:text-base text-white/80 line-clamp-3">{movie.descripcion}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" onClick={handleClick} className="gap-2">
                <Play className="h-4 w-4" />
                Ver ahora
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleFavoriteClick}
                className={cn(
                  "border-white/20 text-white hover:text-white hover:bg-white/20",
                  isMovieFavorite ? "bg-white/20" : "",
                )}
              >
                <Heart className={cn("h-4 w-4 mr-2", isMovieFavorite ? "fill-red-500 text-red-500" : "")} />
                {isMovieFavorite ? "En favoritos" : "Agregar a favoritos"}
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
