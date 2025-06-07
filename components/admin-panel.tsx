"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, TestTube, Code, Download, AlertCircle, CheckCircle, Activity } from "lucide-react"

interface AdminPanelProps {
  onRunDebug: () => Promise<void>
  onGetFixedScript: () => Promise<void>
  debugResult: any
  fixedScript: string
  loading: boolean
  error: string | null
  success: string | null
  connectionStatus: "unknown" | "connected" | "error"
  movieCount: number
}

export function AdminPanel({
  onRunDebug,
  onGetFixedScript,
  debugResult,
  fixedScript,
  loading,
  error,
  success,
  connectionStatus,
  movieCount,
}: AdminPanelProps) {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Conexión</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "error"
                      ? "bg-red-500"
                      : "bg-gray-400"
                }`}
              />
              <span className="text-sm">
                {connectionStatus === "connected"
                  ? "Conectado"
                  : connectionStatus === "error"
                    ? "Desconectado"
                    : "Desconocido"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Películas Disponibles</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movieCount}</div>
            <p className="text-xs text-muted-foreground">Con iframe válido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Datos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">Supabase</div>
            <p className="text-xs text-muted-foreground">PostgreSQL</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {/* Admin Tabs */}
      <Tabs defaultValue="debug" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="debug">Diagnóstico</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
        </TabsList>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Diagnóstico del Sistema
              </CardTitle>
              <CardDescription>Ejecuta pruebas completas de la base de datos y conexiones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onRunDebug} disabled={loading} className="w-full" size="lg">
                <TestTube className="h-4 w-4 mr-2" />
                {loading ? "Ejecutando Diagnóstico..." : "Ejecutar Diagnóstico Completo"}
              </Button>

              {debugResult && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Resultados del Diagnóstico:</h3>
                  <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96 border">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{JSON.stringify(debugResult, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Información del Sistema:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• URL: https://gcqkujyyoaeymjqapecc.supabase.co</li>
                  <li>• Service Key: Configurada ✓</li>
                  <li>• RLS: Habilitado</li>
                  <li>• Tabla: peliculas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="script">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Script de Scraping
              </CardTitle>
              <CardDescription>Genera y descarga el script corregido para scraping de películas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onGetFixedScript} disabled={loading} className="w-full" size="lg">
                <Code className="h-4 w-4 mr-2" />
                {loading ? "Generando Script..." : "Generar Script Corregido"}
              </Button>

              {fixedScript && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Script Generado:</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([fixedScript], { type: "text/javascript" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "get-movie-details-fixed.js"
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96 border">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{fixedScript}</pre>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Características del Script:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Configuración automática de Supabase</li>
                  <li>• Manejo correcto de tipos de datos</li>
                  <li>• Validación de URLs de iframe</li>
                  <li>• Validación de URLs de imagen</li>
                  <li>• Filtrado de películas sin contenido o imagen</li>
                  <li>• Manejo de errores mejorado</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
