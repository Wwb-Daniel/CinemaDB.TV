"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Clock, User, LogOut, Activity } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  onAuthSuccess?: () => void
}

const ADMIN_PASSWORD = "AnuelAA13"
const MAX_ATTEMPTS = 5
const BLOCK_DURATION = 60000 // 1 minuto en milisegundos
const SESSION_DURATION = 3600000 // 1 hora en milisegundos

export function AuthGuard({ children, onAuthSuccess }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0)
  const [loginTime, setLoginTime] = useState<Date | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar fortaleza de la contraseña mientras se escribe
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 6) strength += 20
    if (password.length >= 8) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20

    setPasswordStrength(strength)
  }, [password])

  // Verificar autenticación existente y tiempo de sesión
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated")
    const loginTimeStr = sessionStorage.getItem("admin_login_time")
    const attemptsStr = localStorage.getItem("admin_attempts")
    const lastAttemptStr = localStorage.getItem("admin_last_attempt")

    // Restaurar intentos fallidos
    if (attemptsStr && lastAttemptStr) {
      const lastAttempt = Number.parseInt(lastAttemptStr)
      const timeSinceLastAttempt = Date.now() - lastAttempt

      if (timeSinceLastAttempt < BLOCK_DURATION) {
        setAttempts(Number.parseInt(attemptsStr))
        if (Number.parseInt(attemptsStr) >= MAX_ATTEMPTS) {
          setIsBlocked(true)
          setBlockTimeRemaining(BLOCK_DURATION - timeSinceLastAttempt)
        }
      } else {
        // Limpiar intentos si ha pasado el tiempo de bloqueo
        localStorage.removeItem("admin_attempts")
        localStorage.removeItem("admin_last_attempt")
      }
    }

    // Verificar sesión activa
    if (authStatus === "true" && loginTimeStr) {
      const loginTime = new Date(loginTimeStr)
      const timeSinceLogin = Date.now() - loginTime.getTime()

      if (timeSinceLogin < SESSION_DURATION) {
        setIsAuthenticated(true)
        setLoginTime(loginTime)
        setSessionTimeRemaining(SESSION_DURATION - timeSinceLogin)
        onAuthSuccess?.()
      } else {
        // Sesión expirada
        handleLogout()
      }
    }
  }, [onAuthSuccess])

  // Timer para el bloqueo temporal
  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1000) {
            setIsBlocked(false)
            setAttempts(0)
            setError("")
            localStorage.removeItem("admin_attempts")
            localStorage.removeItem("admin_last_attempt")
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isBlocked, blockTimeRemaining])

  // Timer para la sesión
  useEffect(() => {
    if (isAuthenticated && sessionTimeRemaining > 0) {
      const timer = setInterval(() => {
        setSessionTimeRemaining((prev) => {
          if (prev <= 1000) {
            handleLogout()
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isAuthenticated, sessionTimeRemaining])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular delay de autenticación para mayor realismo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (isBlocked) {
      setError("Cuenta bloqueada temporalmente. Espera antes de intentar nuevamente.")
      setIsLoading(false)
      return
    }

    if (password === ADMIN_PASSWORD) {
      const now = new Date()
      setIsAuthenticated(true)
      setLoginTime(now)
      setError("")
      setAttempts(0)
      setSessionTimeRemaining(SESSION_DURATION)

      // Guardar en sessionStorage y limpiar localStorage
      sessionStorage.setItem("admin_authenticated", "true")
      sessionStorage.setItem("admin_login_time", now.toISOString())
      localStorage.removeItem("admin_attempts")
      localStorage.removeItem("admin_last_attempt")

      onAuthSuccess?.()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(`Contraseña incorrecta. Intento ${newAttempts} de ${MAX_ATTEMPTS}`)
      setPassword("")

      // Guardar intentos en localStorage
      localStorage.setItem("admin_attempts", newAttempts.toString())
      localStorage.setItem("admin_last_attempt", Date.now().toString())

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true)
        setBlockTimeRemaining(BLOCK_DURATION)
        setError("Demasiados intentos fallidos. Cuenta bloqueada temporalmente.")
      }
    }

    setIsLoading(false)
  }

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setLoginTime(null)
    setSessionTimeRemaining(0)
    sessionStorage.removeItem("admin_authenticated")
    sessionStorage.removeItem("admin_login_time")
    setPassword("")
    setError("")
    setAttempts(0)
  }, [])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Débil"
    if (passwordStrength < 80) return "Media"
    return "Fuerte"
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        {/* Header de sesión administrativa */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      Sesión Administrativa Activa
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      En línea
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-green-700 dark:text-green-300 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Administrador
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Conectado: {loginTime?.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">
                    Tiempo restante: {formatTime(sessionTimeRemaining)}
                  </div>
                  <Progress value={(sessionTimeRemaining / SESSION_DURATION) * 100} className="w-32 h-2 mt-1" />
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {children}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Acceso Administrativo</CardTitle>
            <CardDescription className="mt-2">
              Esta sección requiere autenticación de administrador para acceder a funciones avanzadas
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña de Administrador
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  disabled={isBlocked || isLoading}
                  className="pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Fortaleza de contraseña:</span>
                    <span
                      className={
                        passwordStrength >= 80
                          ? "text-green-600"
                          : passwordStrength >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alertas de error y estado */}
            {error && (
              <Alert
                className={
                  isBlocked
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription
                  className={isBlocked ? "text-red-800 dark:text-red-200" : "text-orange-800 dark:text-orange-200"}
                >
                  {error}
                  {isBlocked && blockTimeRemaining > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">Tiempo restante: {formatTime(blockTimeRemaining)}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Información de intentos */}
            {attempts > 0 && !isBlocked && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Intentos fallidos: {attempts} de {MAX_ATTEMPTS}
                  <div className="mt-1">
                    <Progress value={(attempts / MAX_ATTEMPTS) * 100} className="h-2" />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={!password.trim() || isBlocked || isLoading} size="lg">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : isBlocked ? (
                "Bloqueado"
              ) : (
                "Acceder"
              )}
            </Button>
          </form>

          {/* Información de seguridad */}
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Características de seguridad:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Máximo {MAX_ATTEMPTS} intentos de acceso</li>
                    <li>• Bloqueo temporal de {BLOCK_DURATION / 60000} minuto(s)</li>
                    <li>• Sesión válida por {SESSION_DURATION / 3600000} hora(s)</li>
                    <li>• Cierre automático de sesión</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                <strong>Aviso:</strong> Esta sesión se registra por motivos de seguridad. Solo personal autorizado debe
                acceder a estas funciones administrativas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
