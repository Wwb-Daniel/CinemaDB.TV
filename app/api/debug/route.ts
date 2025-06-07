import { NextResponse } from "next/server"
import { supabaseAdmin, testSupabaseConnection, getTableInfo } from "@/lib/supabase"

export async function GET() {
  try {
    // Probar conexión
    const connectionTest = await testSupabaseConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          error: "Error de conexión",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Obtener información de la tabla
    const tableInfo = await getTableInfo()

    // Intentar insertar una película de prueba
    const testMovie = {
      titulo: "Película de Prueba - " + new Date().toISOString(),
      imagen_url: "https://via.placeholder.com/300x450",
      descripcion: "Esta es una película de prueba para verificar la funcionalidad",
      generos: ["Prueba", "Debug"],
      anio: 2024,
      vistas: 1,
      iframe_url: "https://ejemplo.com/test",
      duracion: "120 min",
    }

    const { data: insertData, error: insertError } = await supabaseAdmin.from("peliculas").insert([testMovie]).select()

    // Verificar si hay películas en la tabla
    const { data: existingMovies, error: moviesError } = await supabaseAdmin
      .from("peliculas")
      .select("*")
      .limit(5)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      success: true,
      tests: {
        connection: connectionTest.success,
        tableInfo,
        insertTest: !insertError,
        insertedData: insertData,
        existingMovies,
      },
      errors: {
        insertError,
        moviesError,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error en debug",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
