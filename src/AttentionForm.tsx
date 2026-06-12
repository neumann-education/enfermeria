import { Dispatch, SetStateAction, useEffect } from 'react'
import { DEFAULT_ACADEMIC_PERIOD } from './constants/academicPeriod'

type AttentionFormProps = {
  programa: string
  setPrograma: Dispatch<SetStateAction<string>>
  ciclo: string
  setCiclo: Dispatch<SetStateAction<string>>
  section: string
  setSection: Dispatch<SetStateAction<string>>
  motivoAtencion: string
  setMotivoAtencion: Dispatch<SetStateAction<string>>
  periodo: string
  setPeriodo: Dispatch<SetStateAction<string>>
  horaSalida: string
  setHoraSalida: Dispatch<SetStateAction<string>>
  areaProblematica: string
  setAreaProblematica: Dispatch<SetStateAction<string>>
  customAreaProblematica: string
  setCustomAreaProblematica: Dispatch<SetStateAction<string>>
  medioContacto: string
  setMedioContacto: Dispatch<SetStateAction<string>>
  resultado: string
  setResultado: Dispatch<SetStateAction<string>>
  observaciones: string
  setObservaciones: Dispatch<SetStateAction<string>>
}

function AttentionForm({
  motivoAtencion,
  setMotivoAtencion,
  periodo,
  setPeriodo,
  horaSalida,
  setHoraSalida,
  areaProblematica,
  setAreaProblematica,
  customAreaProblematica,
  setCustomAreaProblematica,
  medioContacto,
  setMedioContacto,
  resultado,
  setResultado,
  observaciones,
  setObservaciones,
}: AttentionFormProps) {
  useEffect(() => {
    if (!medioContacto) {
      setMedioContacto('Presencial')
    }
  }, [medioContacto, setMedioContacto])

  useEffect(() => {
    if (!periodo) {
      setPeriodo(DEFAULT_ACADEMIC_PERIOD)
    }
  }, [periodo, setPeriodo])

  useEffect(() => {
    if (!horaSalida) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setHoraSalida(`${hours}:${minutes}`)
    }
  }, [horaSalida, setHoraSalida])

  const formatPeriodoInput = (value: string) => {
    const normalized = value.toUpperCase().replace(/[^0-9IVXLCDM\- ]/g, '')
    const digits = normalized.replace(/[^0-9]/g, '').slice(0, 4)
    const hasExplicitSeparator = normalized.includes('-')

    let romanPart = ''
    if (hasExplicitSeparator) {
      const afterSeparator = normalized.split('-').slice(1).join('-')
      romanPart = afterSeparator.replace(/[^IVXLCDM]/g, '').slice(0, 4)
    } else if (digits.length === 4) {
      const afterDigitsIndex = normalized.indexOf(digits) + digits.length
      const afterDigits = normalized.slice(afterDigitsIndex)
      romanPart = afterDigits.replace(/[^IVXLCDM]/g, '').slice(0, 4)
    }

    if (!digits) {
      return ''
    }

    if (digits.length < 4 && !romanPart) {
      return digits
    }

    if (digits.length === 4 && !romanPart) {
      return `${digits} - `
    }

    if (romanPart) {
      return `${digits} - ${romanPart}`
    }

    return digits
  }

  return (
    <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6 space-y-6 animate-fadeIn'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-md'>
          3
        </div>
        <h2 className='text-2xl font-extrabold tracking-tight text-primary'>
          Notas clínicas
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {/* <div className='space-y-6'>
          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-on-surface-variant ml-1'>
              Programa
            </label>
            <select
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
              className='max-w-lg w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
            >
              <option>Seleccionar...</option>
              <option>Administración de Negocios Internacionales</option>
              <option>Contabilidad</option>
            </select>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Hora de salida
              </label>
              <input
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface'
                type='time'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Ciclo
              </label>
              <select
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
                className='max-w-lg w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
              >
                <option>Seleccionar...</option>
                <option>Primer Ciclo</option>
                <option>Segundo Ciclo</option>
                <option>Tercer Ciclo</option>
                <option>Cuarto Ciclo</option>
                <option>Quinto Ciclo</option>
                <option>Sexto Ciclo</option>
              </select>
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Sección
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className='max-w-lg w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
              >
                <option>Seleccionar...</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
          </div>
        </div> */}

        <div className='space-y-1.5'>
          <label className='block text-sm font-medium text-on-surface-variant ml-1'>
            Motivo de atención <span className='text-red-500'>*</span>
          </label>
          <input
            value={motivoAtencion}
            onChange={(e) => setMotivoAtencion(e.target.value)}
            className='w-full max-w-xl px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
            placeholder='Motivo de atención'
            type='text'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-on-surface-variant ml-1'>
              Periodo <span className='text-red-500'>*</span>
            </label>
            <input
              value={periodo}
              onChange={(e) => setPeriodo(formatPeriodoInput(e.target.value))}
              className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
              placeholder={DEFAULT_ACADEMIC_PERIOD}
              type='text'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-on-surface-variant ml-1'>
              Área problemática principal{' '}
              <span className='text-red-500'>*</span>
            </label>
            <select
              value={areaProblematica}
              onChange={(e) => {
                setAreaProblematica(e.target.value)
                if (e.target.value !== 'Otro') {
                  setCustomAreaProblematica('')
                }
              }}
              className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
            >
              <option>Seleccionar categoría...</option>
              <option>Respiratorio</option>
              <option>Digestivo</option>
              <option>Traumatológico</option>
              <option>Preventivo / Vacuna</option>
              <option>Salud Mental</option>
              <option>Otro</option>
            </select>
            {areaProblematica === 'Otro' && (
              <input
                value={customAreaProblematica}
                onChange={(e) => setCustomAreaProblematica(e.target.value)}
                className='w-full mt-3 px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                placeholder='Especifique el área problemática'
                type='text'
              />
            )}
          </div>

          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-on-surface-variant ml-1'>
              Medio de contacto <span className='text-red-500'>*</span>
            </label>
            <select
              value={medioContacto}
              onChange={(e) => setMedioContacto(e.target.value)}
              className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
            >
              <option>Seleccionar...</option>
              <option>Teléfono</option>
              <option>Correo</option>
              <option>WhatsApp</option>
              <option>Presencial</option>
              <option>Otro</option>
            </select>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-1.5 mt-4 w-full max-w-lg'>
            <label className='block text-sm font-medium text-on-surface-variant ml-1'>
              Resultado <span className='text-red-500'>*</span>
            </label>
            <select
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
            >
              <option>Seleccionar...</option>
              <option>Finalizado</option>
              <option>En Seguimiento</option>
              <option>Derivado</option>
              <option>No concluyente</option>
            </select>
          </div>
          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-on-surface-variant ml-1'>
              Hora de salida
            </label>
            <input
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className='w-full max-w-xs px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface'
              type='time'
            />
          </div>
        </div>
        <div className='space-y-1.5'>
          <label className='block text-sm font-medium text-on-surface-variant ml-1'>
            Observaciones <span className='text-red-500'>*</span>
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface resize-none placeholder:text-outline-variant'
            rows={4}
            placeholder='Observaciones generales de la atención'
          ></textarea>
        </div>
      </div>
    </div>
  )
}

export default AttentionForm
