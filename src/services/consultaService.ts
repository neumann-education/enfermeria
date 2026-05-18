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
      return users
    }

    return users.filter((user: any) => {
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
    return result.user || null
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
