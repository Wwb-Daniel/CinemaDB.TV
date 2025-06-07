"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Play, X, Eye, Calendar, Clock } from "lucide-react"

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

interface MoviePlayerProps {
  movie: Movie
  onUpdateViews?: (movieId: string, newViews: number) => void
}

export function MoviePlayer({ movie, onUpdateViews }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
    if (!hasStartedPlaying) {
      setHasStartedPlaying(true)
      // Incrementar vistas
      if (movie.id && onUpdateViews) {
        onUpdateViews(movie.id, movie.vistas + 1)
      }
    }
  }

  const handleClose = () => {
    setIsPlaying(false)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative group">
        <img
          src={movie.imagen_url || "/placeholder.svg?height=400&width=300"}
          alt={movie.titulo}
          className="w-full h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=400&width=300"
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={handlePlay}
              >
                <Play className="h-6 w-6 mr-2" />
                Reproducir
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
              <DialogHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl">{movie.titulo}</DialogTitle>
                    <DialogDescription className="flex items-center gap-4 mt-2">
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
                        <Eye className="h-4 w-4" />
                        {hasStartedPlaying ? movie.vistas + 1 : movie.vistas} vistas
                      </span>
                    </DialogDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 p-4 pt-0">
                {movie.iframe_url ? (
                  <iframe
                    src={movie.iframe_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={movie.titulo}
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No hay URL de reproducción disponible</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {movie.anio && <Badge className="absolute top-2 right-2 bg-black bg-opacity-70 text-white">{movie.anio}</Badge>}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{movie.titulo}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {movie.descripcion && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{movie.descripcion}</p>}

        {movie.generos && movie.generos.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.generos.slice(0, 3).map((genero, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {genero}
              </Badge>
            ))}
            {movie.generos.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{movie.generos.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {movie.vistas} vistas
          </span>
          {movie.duracion && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {movie.duracion}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
