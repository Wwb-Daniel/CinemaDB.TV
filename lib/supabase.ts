import { createClient } from "@supabase/supabase-js"

// Configuración del cliente de Supabase
const supabaseUrl = "https://gcqkujyyoaeymjqapecc.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWt1anl5b2FleW1qcWFwZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE3ODAxNSwiZXhwIjoyMDY0NzU0MDE1fQ.mKUZ89op72Ld33smi6k9tgNvcnDR_A0VUmnP-sb88aA"

// Cliente con service role key para operaciones administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Función para probar la conexión
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin.from("peliculas").select("count(*)").limit(1)

    if (error) {
      console.error("Error de conexión:", error)
      return { success: false, error }
    }

    console.log("Conexión exitosa:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error de conexión:", error)
    return { success: false, error }
  }
}

// Función para obtener información sobre la tabla
export async function getTableInfo() {
  try {
    // Verificar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "peliculas")
      .eq("table_schema", "public")

    if (tableError) {
      console.error("Error al verificar tabla:", tableError)
      return { success: false, error: tableError }
    }

    // Obtener estructura de la tabla
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", "peliculas")
      .eq("table_schema", "public")

    if (columnsError) {
      console.error("Error al obtener columnas:", columnsError)
      return { success: false, error: columnsError }
    }

    // Obtener políticas RLS
    const { data: policies, error: policiesError } = await supabaseAdmin.rpc("get_policies", {
      table_name: "peliculas",
    })

    return {
      success: true,
      tableExists: tableInfo && tableInfo.length > 0,
      columns,
      policies,
    }
  } catch (error) {
    console.error("Error al obtener información de la tabla:", error)
    return { success: false, error }
  }
}
