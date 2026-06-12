import { ReporteGestante } from './types'

const normalizeSexLabel = (value?: string | null) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
  if (normalized === 'M') return 'Masculino'
  if (normalized === 'F') return 'Femenino'
  return String(value || '').trim()
}

const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyRCjslrXPxhMwTbs0TnRXEOzPI9gX-kvjoGWTAdjOyyheaYyRLXqWwWMr38pmErHGC/exec'

export const consultaService = {
  createUsuario: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'crearUsuario', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'No se pudo guardar el usuario')
    }

    return result
  },

  updateUsuario: async (formData: any) => {
    const sendUpdate = async (action: string) => {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action, ...formData }),
      })

      if (!response.ok) {
        throw new Error(`Error en red, status ${response.status}`)
      }

      return response.json()
    }

    let result = await sendUpdate('actualizarUsuario')

    // Compatibilidad con despliegues antiguos de Apps Script.
    if (
      !result.success &&
      String(result.message || '').includes(
        'Acción no soportada: actualizarUsuario',
      )
    ) {
      result = await sendUpdate('guardarDiscapacidad')
    }

    if (!result.success) {
      throw new Error(result.message || 'No se pudo actualizar el usuario')
    }

    return result
  },

  registerAttentionComplete: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'registrarAtencionCompleta',
        ...formData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo registrar la atención completa',
      )
    }

    return result
  },

  registerAttentionOnly: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'registrarAtencionSolo', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'No se pudo registrar la atención')
    }

    return result
  },

  searchUsers: async (query = '', signal?: AbortSignal) => {
    const url = `${APPS_SCRIPT_URL}?action=buscarUsuario`
    const response = await fetch(url, { signal })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'No se pudieron obtener usuarios')
    }

    const users = result.users || []
    const queryValue = String(query || '')
      .trim()
      .toLowerCase()
    if (!queryValue) {
      return users.map((user: any) => ({
        ...user,
        sexo: normalizeSexLabel(user.sexo || user.Sexo || ''),
        Sexo: normalizeSexLabel(user.Sexo || user.sexo || ''),
      }))
    }

    return users
      .filter((user: any) => {
        const searchFields = [
          user.id,
          user.nombreCompleto,
          user.dni,
          user.correoElectronico,
          user.celular,
          user.nacionalidad,
          user.rol,
          user.carrera,
          user.ciclo,
          user.seccion,
        ]
        return searchFields.some((field) =>
          String(field || '')
            .toLowerCase()
            .includes(queryValue),
        )
      })
      .map((user: any) => ({
        ...user,
        sexo: normalizeSexLabel(user.sexo || user.Sexo || ''),
        Sexo: normalizeSexLabel(user.Sexo || user.sexo || ''),
      }))
  },

  getUserById: async (userId: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=buscarUsuarioPorId&id=${encodeURIComponent(
        userId,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo obtener el usuario')
    }
    if (!result.user) {
      return null
    }

    return {
      ...result.user,
      sexo: normalizeSexLabel(result.user.sexo || ''),
      Sexo: normalizeSexLabel(result.user.Sexo || result.user.sexo || ''),
    }
  },

  getAttendancesByUserId: async (usuarioId: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=listarAtencionesPorUsuario&usuarioId=${encodeURIComponent(
        usuarioId,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudieron obtener las atenciones')
    }
    return result.attendances || []
  },

  getHistoryAttendances: async () => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=listarHistorialAtenciones`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo obtener el historial de atenciones',
      )
    }
    return result.attendances || []
  },

  getAttendanceFollowUpsByOrder: async (orderNumber: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=listarSeguimientoAtencionPorOrden&orden=${encodeURIComponent(
        orderNumber,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message ||
          'No se pudieron obtener los seguimientos de la atención',
      )
    }

    return result.followUps || []
  },

  saveAttendanceFollowUp: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'guardarSeguimientoAtencion',
        ...formData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo guardar el seguimiento de la atención',
      )
    }

    return result
  },

  updateAttendanceFollowUp: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'actualizarSeguimientoAtencion',
        ...formData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo actualizar el seguimiento de la atención',
      )
    }

    return result
  },

  deleteAttendanceFollowUp: async (idSeguimiento: string) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'eliminarSeguimientoAtencion',
        idSeguimiento,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo eliminar el seguimiento de la atención',
      )
    }

    return result
  },

  getDisabilityDetailsByPatientId: async (patientId: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=buscarDiscapacidadPorUsuarioId&usuarioId=${encodeURIComponent(
        patientId,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudieron obtener los datos de discapacidad',
      )
    }
    return result.discapacidadDetail || null
  },

  getGestanteDetailsByPatientId: async (patientId: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=buscarGestantePorUsuarioId&usuarioId=${encodeURIComponent(
        patientId,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudieron obtener los datos de gestante',
      )
    }
    return result.gestanteDetail || null
  },

  saveDisabilityDetails: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'guardarDiscapacidad', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo guardar la información de discapacidad',
      )
    }

    return result
  },

  getDisabilityFollowUpsByPatientId: async (patientId: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=listarSeguimientoDiscapacidadPorUsuarioId&usuarioId=${encodeURIComponent(
        patientId,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message ||
          'No se pudieron obtener los seguimientos de discapacidad',
      )
    }

    return result.followUps || []
  },

  saveDisabilityFollowUp: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'guardarSeguimientoDiscapacidad',
        ...formData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo guardar el seguimiento de discapacidad',
      )
    }

    return result
  },

  getPregnancyFollowUpsByPatientId: async (patientId: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=listarSeguimientoGestantePorUsuarioId&usuarioId=${encodeURIComponent(
        patientId,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudieron obtener los seguimientos de gestante',
      )
    }

    return result.followUps || []
  },

  savePregnancyFollowUp: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'guardarSeguimientoGestante',
        ...formData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo guardar el seguimiento de gestante',
      )
    }

    return result
  },

  saveGestanteDetails: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'guardarGestante', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(
        result.message || 'No se pudo guardar la información de gestante',
      )
    }

    return result
  },

  updateAttendance: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'actualizarAtencion', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo actualizar la atención')
    }

    return result
  },

  sendAttendanceReceipt: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'enviarConstanciaAtencion', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo enviar la constancia')
    }

    return result
  },

  exportAttendanceReport: async (formData: any) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'exportarReporte', ...formData }),
    })

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo obtener el reporte')
    }

    return result.data || result.report || []
  },

  getReportUsers: async (
    filters: {
      role?: 'Todos' | 'Admin' | 'Estudiantes'
      onlyStudents?: boolean
      carrera?: string
      ciclo?: string
      sexo?: string
    } = {},
  ) => {
    const params = new URLSearchParams({
      action: 'listarUsuariosReporte',
    })

    if (filters.role && filters.role !== 'Todos') {
      params.set('role', filters.role)
    } else if (filters.onlyStudents) {
      params.set('onlyStudents', 'true')
    }
    if (filters.carrera) {
      params.set('carrera', filters.carrera)
    }
    if (filters.ciclo) {
      params.set('ciclo', filters.ciclo)
    }
    if (filters.sexo) {
      params.set('sexo', filters.sexo)
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo obtener usuarios')
    }

    return (result.users || []).map((user: any) => ({
      ...user,
      sexo: normalizeSexLabel(user.sexo || user.Sexo || ''),
      Sexo: normalizeSexLabel(user.Sexo || user.sexo || ''),
    }))
  },

  getReportAttendances: async (
    filters: {
      dateRange?: string
      startDate?: string
      endDate?: string
      onlyFollowUps?: boolean
      role?: 'Todos' | 'Estudiantes' | 'Administrativos'
      ciclo?: string
      programa?: string
      periodo?: string
    } = {},
  ) => {
    const params = new URLSearchParams({
      action: 'listarConsultasReporte',
    })

    if (filters.dateRange) {
      params.set('dateRange', filters.dateRange)
    }
    if (filters.startDate) {
      params.set('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate)
    }
    if (filters.onlyFollowUps) {
      params.set('onlyFollowUps', 'true')
    }
    if (filters.role) {
      params.set('role', filters.role)
    }
    if (filters.ciclo) {
      params.set('ciclo', filters.ciclo)
    }
    if (filters.programa) {
      params.set('programa', filters.programa)
    }
    if (filters.periodo) {
      params.set('periodo', filters.periodo)
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo obtener consultas')
    }

    return result.attendances || []
  },
  getReportGestantes: async (
    filters: {
      startDate?: string
      endDate?: string
      withoutCurrentPeriodFollowUps?: boolean
    } = {},
  ): Promise<ReporteGestante> => {
    const params = new URLSearchParams({
      action: 'listarGestantesReporte',
    })

    if (filters.startDate) {
      params.set('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate)
    }
    if (filters.withoutCurrentPeriodFollowUps) {
      params.set('withoutCurrentPeriodFollowUps', 'true')
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result: ReporteGestante = await response.json()

    if (!result || !Array.isArray(result.gestantes)) {
      throw new Error('Respuesta inválida al obtener gestantes')
    }

    return result
  },
  getReportDiscapacidad: async (
    filters: {
      startDate?: string
      endDate?: string
      withoutCurrentPeriodFollowUps?: boolean
    } = {},
  ) => {
    const params = new URLSearchParams({
      action: 'listarDiscapacidadReporte',
    })

    if (filters.startDate) {
      params.set('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate)
    }
    if (filters.withoutCurrentPeriodFollowUps) {
      params.set('withoutCurrentPeriodFollowUps', 'true')
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo obtener discapacidad')
    }

    return result.discapacidad || []
  },

  getAttendanceByOrder: async (orderNumber: string) => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=buscarAtencionPorOrden&orden=${encodeURIComponent(
        orderNumber,
      )}`,
    )

    if (!response.ok) {
      throw new Error(`Error en red, status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'No se pudo obtener la atención')
    }
    return result.attendance || null
  },
}
