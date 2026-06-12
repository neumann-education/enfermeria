import { DEFAULT_ACADEMIC_PERIOD } from './constants/academicPeriod'

export type CafeteriaSupervisionRecord = {
  id: string
  fecha: string
  hora: string
  periodo: string
  concesionario: string
  supervisor: string
  higieneBasica: boolean | null
  limpiezaAmbiente: boolean | null
  signosETA: boolean | null
  calidadVariado: boolean | null
  fechaVencimiento: boolean | null
  conservacionAlimentos: boolean | null
  amabilidad: boolean | null
  tiempoServicio: boolean | null
  calidadPrecio: boolean | null
  preciosCompetitivos: boolean | null
  estadoEquipamiento: boolean | null
  observaciones: string
  aprobado?: 'Aprobado' | 'No aprobado' | ''
  registradoEn: string
}

export type FormState = {
  fecha: string
  hora: string
  periodo: string
  concesionario: string
  supervisor: string
  higieneBasica: boolean | null
  limpiezaAmbiente: boolean | null
  signosETA: boolean | null
  calidadVariado: boolean | null
  fechaVencimiento: boolean | null
  conservacionAlimentos: boolean | null
  amabilidad: boolean | null
  tiempoServicio: boolean | null
  calidadPrecio: boolean | null
  preciosCompetitivos: boolean | null
  estadoEquipamiento: boolean | null
  observaciones: string
  aprobado: 'Aprobado' | 'No aprobado' | ''
}

export const initialFormState: FormState = {
  fecha: '',
  hora: '',
  periodo: DEFAULT_ACADEMIC_PERIOD,
  concesionario: '',
  supervisor: '',
  higieneBasica: null,
  limpiezaAmbiente: null,
  signosETA: null,
  calidadVariado: null,
  fechaVencimiento: null,
  conservacionAlimentos: null,
  amabilidad: null,
  tiempoServicio: null,
  calidadPrecio: null,
  preciosCompetitivos: null,
  estadoEquipamiento: null,
  observaciones: '',
  aprobado: '',
}
