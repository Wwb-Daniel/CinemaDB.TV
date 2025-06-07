import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Usar credenciales directamente
    const supabaseUrl = "https://gcqkujyyoaeymjqapecc.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWt1anl5b2FleW1qcWFwZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE3ODAxNSwiZXhwIjoyMDY0NzU0MDE1fQ.mKUZ89op72Ld33smi6k9tgNvcnDR_A0VUmnP-sb88aA"

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Probar la conexión haciendo una consulta simple
    const { data, error } = await supabase.from("peliculas").select("count(*)").limit(1)

    if (error) {
      return NextResponse.json(
        {
          error: "Error al conectar con Supabase",
          details: {
            code: error.code,
            message: error.message,
            hint: error.hint,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexión exitosa con Supabase",
      tableExists: true,
    })
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
