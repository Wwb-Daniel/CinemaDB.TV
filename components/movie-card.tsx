"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Play, Eye, Star, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
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

interface MovieCardProps {
  movie: Movie
  onUpdateViews?: (movieId: string, newViews: number) => void
  onMovieSelect?: (movie: Movie) => void
  variant?: "default" | "compact" | "featured"
}

export function MovieCard({ movie, onUpdateViews, onMovieSelect, variant = "default" }: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
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

  // Determinar si es favorito
  const isMovieFavorite = movie.id ? isFavorite(movie.id) : false

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "group overflow-hidden border-0 bg-card transition-all duration-300 hover:shadow-xl cursor-pointer",
          variant === "featured" ? "hover:scale-[1.02]" : "hover:scale-105",
          variant === "compact" ? "h-full" : "",
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            variant === "featured" ? "aspect-video" : "aspect-[2/3]",
            variant === "compact" ? "h-28" : "",
          )}
          onClick={handleClick}
        >
          <img
            src={imageError ? "/placeholder.svg?height=450&width=300" : movie.imagen_url}
            alt={movie.titulo}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-110",
              variant === "featured" ? "object-cover" : "",
            )}
            onError={() => setImageError(true)}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Info overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center text-white">
              <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="h-6 w-6 ml-1" />
              </div>
              <p className="text-sm font-medium">Ver detalles</p>
            </div>
          </div>

          {/* Favorite button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              isMovieFavorite ? "text-red-500 hover:text-red-600" : "text-white hover:text-white",
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-4 w-4", isMovieFavorite ? "fill-current" : "")} />
          </Button>

          {/* Year badge */}
          {movie.anio && <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0">{movie.anio}</Badge>}

          {/* Quality/Duration badge */}
          {movie.duracion && (
            <Badge variant="secondary" className="absolute bottom-2 left-2 bg-black/70 text-white border-0">
              {movie.duracion}
            </Badge>
          )}

          {/* Rating badge */}
          <Badge
            className="absolute bottom-2 right-2 bg-yellow-500/90 text-black border-0 flex items-center gap-1"
            variant="outline"
          >
            <Star className="h-3 w-3 fill-current" />
            {rating.toFixed(1)}
          </Badge>
        </div>

        <CardContent
          className={cn("p-4", variant === "compact" ? "p-2" : "", variant === "featured" ? "p-5" : "")}
          onClick={handleClick}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <h3
                className={cn(
                  "font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors",
                  variant === "featured" ? "text-xl" : "text-lg",
                  variant === "compact" ? "text-sm mb-1" : "",
                )}
              >
                {movie.titulo}
              </h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>{movie.titulo}</p>
            </TooltipContent>
          </Tooltip>

          {movie.descripcion && variant !== "compact" && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{movie.descripcion}</p>
          )}

          {/* Genres */}
          {movie.generos && movie.generos.length > 0 && variant !== "compact" && (
            <div className="flex flex-wrap gap-1 mb-3">
              {movie.generos.slice(0, variant === "featured" ? 4 : 2).map((genero, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {genero}
                </Badge>
              ))}
              {movie.generos.length > (variant === "featured" ? 4 : 2) && (
                <Badge variant="outline" className="text-xs">
                  +{movie.generos.length - (variant === "featured" ? 4 : 2)}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div
            className={cn(
              "flex items-center justify-between text-xs text-muted-foreground",
              variant === "compact" ? "mt-1" : "",
            )}
          >
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{movie.vistas.toLocaleString()}</span>
            </div>
            {variant !== "compact" && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
