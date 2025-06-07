"use client"

import { useState, useEffect, useCallback } from "react"

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

interface FavoritesState {
  [key: string]: Movie
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritesState>({})

  // Cargar favoritos desde localStorage al iniciar
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("cinema_favorites")
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
  }, [])

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem("cinema_favorites", JSON.stringify(favorites))
    } catch (error) {
      console.error("Error saving favorites:", error)
    }
  }, [favorites])

  // Verificar si una película es favorita
  const isFavorite = useCallback(
    (id: string) => {
      return !!favorites[id]
    },
    [favorites],
  )

  // Alternar estado de favorito
  const toggleFavorite = useCallback((id: string, movie: Movie) => {
    setFavorites((prev) => {
      if (prev[id]) {
        const { [id]: _, ...rest } = prev
        return rest
      } else {
        return { ...prev, [id]: movie }
      }
    })
  }, [])

  // Obtener lista de películas favoritas
  const getFavoriteMovies = useCallback(() => {
    return Object.values(favorites)
  }, [favorites])

  // Obtener cantidad de favoritos
  const getFavoritesCount = useCallback(() => {
    return Object.keys(favorites).length
  }, [favorites])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoriteMovies,
    getFavoritesCount,
  }
}
