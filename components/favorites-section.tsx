"use client"

import { useFavorites } from "@/hooks/use-favorites"
import { MovieCard } from "@/components/movie-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

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

interface FavoritesSectionProps {
  onMovieSelect?: (movie: Movie) => void
  onUpdateViews?: (movieId: string, newViews: number) => void
  onViewAllFavorites?: () => void
}

export function FavoritesSection({ onMovieSelect, onUpdateViews, onViewAllFavorites }: FavoritesSectionProps) {
  const { getFavoriteMovies, getFavoritesCount } = useFavorites()
  const [expanded, setExpanded] = useState(false)

  const favoriteMovies = getFavoriteMovies()
  const favoritesCount = getFavoritesCount()

  if (favoritesCount === 0) {
    return null
  }

  const displayMovies = expanded ? favoriteMovies : favoriteMovies.slice(0, 10)

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-950/20 dark:to-red-950/20 border-pink-200 dark:border-pink-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-pink-800 dark:text-pink-200">
          <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
          Tus Favoritos
        </CardTitle>
        {favoritesCount > 10 && !expanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="text-pink-800 dark:text-pink-200"
          >
            Ver todos ({favoritesCount})
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
        {expanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className="text-pink-800 dark:text-pink-200"
          >
            Mostrar menos
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {expanded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayMovies.map((movie) => (
              <MovieCard
                key={`fav-${movie.id}`}
                movie={movie}
                onMovieSelect={onMovieSelect}
                onUpdateViews={onUpdateViews}
              />
            ))}
          </div>
        ) : (
          <ScrollArea className="w-full pb-4">
            <div className="flex space-x-4">
              {displayMovies.map((movie) => (
                <div key={`fav-${movie.id}`} className="w-[180px] flex-shrink-0">
                  <MovieCard movie={movie} onMovieSelect={onMovieSelect} onUpdateViews={onUpdateViews} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
