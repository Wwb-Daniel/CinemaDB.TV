import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = "https://gcqkujyyoaeymjqapecc.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWt1anl5b2FleW1qcWFwZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE3ODAxNSwiZXhwIjoyMDY0NzU0MDE1fQ.mKUZ89op72Ld33smi6k9tgNvcnDR_A0VUmnP-sb88aA"

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { views } = await request.json()
    const movieId = params.id

    if (!movieId) {
      return NextResponse.json({ error: "ID de película requerido" }, { status: 400 })
    }

    if (typeof views !== "number" || views < 0) {
      return NextResponse.json({ error: "Número de vistas inválido" }, { status: 400 })
    }

    const { data, error } = await supabase.from("peliculas").update({ vistas: views }).eq("id", movieId).select()

    if (error) {
      console.error("Error al actualizar vistas:", error)
      return NextResponse.json(
        {
          error: "Error al actualizar vistas",
          details: {
            code: error.code,
            message: error.message,
            hint: error.hint,
          },
        },
        { status: 500 },
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Película no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Vistas actualizadas exitosamente",
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
