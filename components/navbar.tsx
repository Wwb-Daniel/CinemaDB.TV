"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"
import { Film, Database, Plus, Settings, Menu, X, Info, HelpCircle, Mail, Github } from "lucide-react"

interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  movieCount: number
}

export function Navbar({ activeTab, onTabChange, movieCount }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "watch", label: "Catálogo", icon: Film },
    { id: "add-movie", label: "Agregar", icon: Plus },
    { id: "manage", label: "Gestionar", icon: Database },
    { id: "admin", label: "Admin", icon: Settings },
  ]

  const handleAbout = () => {
    alert(
      "CinemaDB v2.0\n\nPlataforma de streaming y gestión de películas.\nDesarrollado con Next.js, Supabase y Tailwind CSS.",
    )
  }

  const handleHelp = () => {
    alert(
      "Ayuda:\n\n• Usa el catálogo para explorar películas\n• Filtra por género, año o busca por título\n• Haz clic en una película para ver detalles\n• Usa la paginación para navegar entre páginas",
    )
  }

  const handleContact = () => {
    alert("Contacto:\n\nPara soporte técnico o sugerencias, contacta al administrador del sistema.")
  }

  const handleGithub = () => {
    window.open("https://github.com", "_blank")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Film className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">CinemaDB</span>
              <span className="text-xs text-muted-foreground">Streaming Platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === "watch" && movieCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {movieCount}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleAbout}>
                  <Info className="h-4 w-4 mr-2" />
                  Acerca de
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHelp}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ayuda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleContact}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contacto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleGithub}>
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.id === "watch" && movieCount > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                        {movieCount}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
