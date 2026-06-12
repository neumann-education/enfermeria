import {
  CafeteriaSupervisionRecord,
  FormState,
} from '../CafeteriaSupervisionTypes'

const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyRCjslrXPxhMwTbs0TnRXEOzPI9gX-kvjoGWTAdjOyyheaYyRLXqWwWMr38pmErHGC/exec'

const parseResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`Error en red, status ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(
      result.message || 'Error al comunicarse con el servicio de cafetería',
    )
  }

  return result
}

export const cafeteriaService = {
  createSupervision: async (formData: FormState | Record<string, any>) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'registrarSupervisionCafeteria',
        ...formData,
      }),
    })

    return await parseResponse(response)
  },

  listSupervisions: async (): Promise<CafeteriaSupervisionRecord[]> => {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=listarSupervisionesCafeteria`,
    )

    const result = await parseResponse(response)
    const normalizeBoolean = (value: any) => {
      const text = String(value || '')
        .trim()
        .toUpperCase()
      if (text === 'SI') return true
      if (text === 'NO') return false
      return null
    }

    return (result.records || []).map((record: any) => ({
      ...record,
      higieneBasica: normalizeBoolean(record.higieneBasica),
      limpiezaAmbiente: normalizeBoolean(record.limpiezaAmbiente),
      signosETA: normalizeBoolean(record.signosETA),
      calidadVariado: normalizeBoolean(record.calidadVariado),
      fechaVencimiento: normalizeBoolean(record.fechaVencimiento),
      conservacionAlimentos: normalizeBoolean(record.conservacionAlimentos),
      amabilidad: normalizeBoolean(record.amabilidad),
      tiempoServicio: normalizeBoolean(record.tiempoServicio),
      calidadPrecio: normalizeBoolean(record.calidadPrecio),
      preciosCompetitivos: normalizeBoolean(record.preciosCompetitivos),
      estadoEquipamiento: normalizeBoolean(record.estadoEquipamiento),
    }))
  },

  deleteSupervision: async (id: string) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'eliminarSupervisionCafeteria',
        id,
      }),
    })

    return await parseResponse(response)
  },
}
