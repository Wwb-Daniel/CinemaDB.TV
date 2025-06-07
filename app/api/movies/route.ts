import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Usar las variables de entorno disponibles
const supabaseUrl = "https://gcqkujyyoaeymjqapecc.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWt1anl5b2FleW1qcWFwZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE3ODAxNSwiZXhwIjoyMDY0NzU0MDE1fQ.mKUZ89op72Ld33smi6k9tgNvcnDR_A0VUmnP-sb88aA"

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET() {
  try {
    const { data, error } = await supabase.from("peliculas").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        {
          error: "Error al obtener películas",
          details: {
            code: error.code,
            message: error.message,
            hint: error.hint,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const movieData = await request.json()

    // Validar datos requeridos
    if (!movieData.titulo || movieData.titulo.trim() === "") {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }

    if (!movieData.imagen_url || movieData.imagen_url.trim() === "") {
      return NextResponse.json({ error: "La URL de la imagen es requerida" }, { status: 400 })
    }

    // Preparar datos para inserción según el esquema exacto de la tabla
    const dbMovie = {
      titulo: String(movieData.titulo || "").trim(),
      imagen_url: String(movieData.imagen_url || "").trim(),
      descripcion: String(movieData.descripcion || "").trim(),
      generos: Array.isArray(movieData.generos)
        ? movieData.generos
        : typeof movieData.generos === "string"
          ? movieData.generos
              .split(",")
              .map((g) => g.trim())
              .filter((g) => g)
          : [],
      duracion: String(movieData.duracion || "").trim(),
      anio: movieData.anio ? Number.parseInt(movieData.anio) : null,
      vistas: Number.parseInt(movieData.vistas || 0),
      iframe_url: String(movieData.iframe_url || "").trim(),
    }

    console.log("Intentando insertar película:", dbMovie)

    const { data, error } = await supabase.from("peliculas").insert([dbMovie]).select()

    if (error) {
      console.error("Error de Supabase:", error)
      return NextResponse.json(
        {
          error: "Error al guardar película",
          details: {
            code: error.code,
            message: error.message,
            hint: error.hint,
            details: error.details,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Película guardada exitosamente",
    })
  } catch (error) {
    console.error("Error interno:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
