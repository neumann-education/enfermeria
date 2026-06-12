export interface ActionResponse {
  success: boolean
  action: string
}

export interface ReporteGestante extends ActionResponse {
  gestantes: Gestante[]
}

export interface Gestante {
  'PERIODO REGISTRADO': string
  DNI: string
  NOMBRES: string
  EDAD: string
  'CONTROL PRENATAL': string
  'FECHA PROBABLE DE PARTO': string
  CELULAR: string
  CORREO: string
  'FECHA REGISTRO': string
  followUpsByPeriod: FollowUpsByPeriod
}

export type FollowUpsByPeriod = Record<string, FollowUpPeriod>

export interface FollowUpPeriod {
  'Estudiante regular': string
  Carrera: string
  Ciclo: string
  Turno: string
  Observacion: string
}
