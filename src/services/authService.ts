const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyRCjslrXPxhMwTbs0TnRXEOzPI9gX-kvjoGWTAdjOyyheaYyRLXqWwWMr38pmErHGC/exec'

type AuthResponse = {
  success: boolean
  message?: string
  user?: {
    usuario: string
    nombre: string
  }
}

export const authService = {
  login: async (usuario: string, contrasena: string) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', usuario, contrasena }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = (await response.json()) as AuthResponse

    if (!result.success || !result.user) {
      throw new Error(result.message || 'Usuario o contraseña incorrectos')
    }

    return result
  },
}
