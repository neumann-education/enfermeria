export type SurveyType = 'DatosClinicos' | 'TamizajeSalud' | 'Satisfaccion'

export type SurveyConfig = {
  id: string
  type: SurveyType
  period: string
  isOpen: boolean
  link: string // simulated link, e.g., /survey-datos-clinicos/:id
}

export type DatosClinicosData = {
  programa: string
  ciclo: string
  seccion: string
  nombresApellidos: string
  fechaNacimiento: string
  edad: string
  sexo: 'M' | 'F' | ''
  dni: string
  celular: string
  domicilio: string
  nacionalidad: string
  correoElectronico: string
  tipoSeguro: 'SIS' | 'ESSALUD' | 'FFAA' | 'OTRO' | 'NINGUNO' | ''
  // Emergency contact
  contactoNombres: string
  contactoCelular: string
  parentesco: 'CONYUGE' | 'HIJO' | 'PADRE' | 'MADRE' | 'HERMANO' | 'OTRO' | ''
  // Clinical
  padeceEnfermedad: boolean | null
  enfermedadNombre: string
  discapacidad: boolean | null
  discapacidadNombre: string
  carnetConadis: boolean | null
  tratamientoMedico: boolean | null
  tratamientoNombre: string
  alergico: boolean | null
  alergicoNombre: string
  vacunaCovid: boolean | null
  dosisCovid: string
  embarazada: boolean | null
  fpp: string
  semanasGestacion: string
}

const STORAGE_KEY_CONFIG = 'surveyConfigs'
const STORAGE_KEY_DATA = 'surveyData'

export const getSurveyConfigs = (): SurveyConfig[] => {
  const data = localStorage.getItem(STORAGE_KEY_CONFIG)
  return data ? JSON.parse(data) : []
}

export type SurveyConfigInput = Omit<SurveyConfig, 'id' | 'link'> & {
  link?: string
}

const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyRCjslrXPxhMwTbs0TnRXEOzPI9gX-kvjoGWTAdjOyyheaYyRLXqWwWMr38pmErHGC/exec'

const parseServiceResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`Error en red, status ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'Error del servicio de encuestas')
  }

  return result
}

export const formatSurveyLink = (type: SurveyType, id: string) => {
  const base =
    type === 'DatosClinicos'
      ? '#/survey-datos-clinicos'
      : type === 'TamizajeSalud'
        ? '#/survey-tamizaje-salud'
        : '#/survey-satisfaccion'
  return `${base}/${id}`
}

const normalizeConfig = (config: any): SurveyConfig => ({
  ...config,
  isOpen:
    String(config.isOpen || '')
      .trim()
      .toUpperCase() === 'SI' ||
    String(config.isOpen || '')
      .trim()
      .toUpperCase() === 'TRUE',
})

export const fetchSurveyConfigs = async (): Promise<SurveyConfig[]> => {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=listSurveyConfigs`)
    const result = await parseServiceResponse(response)
    return (result.configs || []).map(normalizeConfig)
  } catch (error) {
    console.error('fetchSurveyConfigs error:', error)
    return getSurveyConfigs()
  }
}

export const fetchSurveyConfigById = async (id: string) => {
  try {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=getSurveyConfigById&id=${encodeURIComponent(
        id,
      )}`,
    )
    const result = await parseServiceResponse(response)
    return result.config
      ? normalizeConfig(result.config)
      : getSurveyConfigById(id)
  } catch (error) {
    console.error('fetchSurveyConfigById error:', error)
    return getSurveyConfigById(id)
  }
}

export const createSurveyConfig = async (config: SurveyConfigInput) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'createSurveyConfig',
        ...config,
      }),
    })

    const result = await parseServiceResponse(response)
    return normalizeConfig(result.config)
  } catch (error) {
    throw error
  }
}

export const updateSurveyConfigById = async (
  id: string,
  updates: Partial<SurveyConfig>,
) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateSurveyConfig',
        id,
        ...updates,
      }),
    })
    const result = await parseServiceResponse(response)
    return normalizeConfig(result.config)
  } catch (error) {
    console.error('updateSurveyConfigById error:', error)
    updateSurveyConfig(id, updates)
    return getSurveyConfigById(id)
  }
}

export const deleteSurveyConfigById = async (id: string) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'deleteSurveyConfig',
        id,
      }),
    })
    await parseServiceResponse(response)
    deleteSurveyConfig(id)
  } catch (error) {
    console.error('deleteSurveyConfigById error:', error)
    deleteSurveyConfig(id)
  }
}

export const fetchSurveyData = async (
  type: SurveyType,
  period: string,
  configId?: string,
) => {
  try {
    const query = [
      `action=listSurveyResponses`,
      `type=${encodeURIComponent(type)}`,
    ]
    if (configId) {
      query.push(`configId=${encodeURIComponent(configId)}`)
    } else {
      query.push(`period=${encodeURIComponent(period)}`)
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?${query.join('&')}`)
    const result = await parseServiceResponse(response)
    return result.responses || []
  } catch (error) {
    console.error('fetchSurveyData error:', error)
    return getSurveyData(type, period)
  }
}

export const saveSurveyData = async (
  type: SurveyType,
  period: string,
  data: any,
) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'saveSurveyResponse',
        type,
        period,
        ...data,
      }),
    })
    return await parseServiceResponse(response)
  } catch (error) {
    console.error('saveSurveyData error:', error)
    const key = `${STORAGE_KEY_DATA}_${type}_${period}`
    const existing = getSurveyData(type, period)
    existing.push(data)
    localStorage.setItem(key, JSON.stringify(existing))
    return { success: true }
  }
}

export const saveSurveyConfig = (config: SurveyConfigInput) => {
  const configs = getSurveyConfigs()
  const newConfig: SurveyConfig = {
    ...config,
    id: Date.now().toString(),
    link: '',
  }
  newConfig.link = formatSurveyLink(newConfig.type, newConfig.id)
  configs.push(newConfig)
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configs))
  return newConfig
}

export const getSurveyConfigById = (id: string) => {
  return getSurveyConfigs().find((config) => config.id === id)
}

export const updateSurveyConfig = (
  id: string,
  updates: Partial<SurveyConfig>,
) => {
  const configs = getSurveyConfigs()
  const index = configs.findIndex((c) => c.id === id)
  if (index !== -1) {
    configs[index] = { ...configs[index], ...updates }
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configs))
  }
}

export const deleteSurveyConfig = (id: string) => {
  const configs = getSurveyConfigs().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configs))
}

export const getSurveyData = (type: SurveyType, period: string): any[] => {
  const key = `${STORAGE_KEY_DATA}_${type}_${period}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}
