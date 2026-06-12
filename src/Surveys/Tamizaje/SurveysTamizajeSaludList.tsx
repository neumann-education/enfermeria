import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import Layout from '../../Layout'
import { ENFERMERIA_LINK } from '../DatosClinicos/SurveysDatosClinicosList'
import CopyButton from '../../components/CopyButton'
import {
  SurveyConfig,
  fetchSurveyConfigs,
  updateSurveyConfigById,
  createSurveyConfig,
} from '../../services/surveyService'
import toast from 'react-hot-toast'
import { DEFAULT_ACADEMIC_PERIOD } from '../../constants/academicPeriod'

function SurveysTamizajeSaludList() {
  const [configs, setConfigs] = useState<SurveyConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPeriod, setNewPeriod] = useState(DEFAULT_ACADEMIC_PERIOD)
  const [periodError, setPeriodError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [pendingToggleConfig, setPendingToggleConfig] =
    useState<SurveyConfig | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const navigate = useNavigate()

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

  const validatePeriodFormat = (period: string) => {
    const periodRegex = /^\d{4}\s*-\s*[IVXLCDM]+$/i
    return periodRegex.test(period.trim())
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    setIsLoading(true)
    setConfigs(
      (await fetchSurveyConfigs()).filter((c) => c.type === 'TamizajeSalud'),
    )
    setIsLoading(false)
  }

  const requestToggle = (id: string) => {
    const config = configs.find((c) => c.id === id)
    if (config) setPendingToggleConfig(config)
  }

  const handleToggle = async () => {
    if (!pendingToggleConfig) return
    setIsToggling(true)
    try {
      const res = await updateSurveyConfigById(pendingToggleConfig.id, {
        isOpen: !pendingToggleConfig.isOpen,
      })
      if (res) {
        await loadConfigs()
        toast.success('Estado actualizado')
      } else {
        toast.error('No se pudo actualizar el estado')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error actualizando el estado')
    } finally {
      setIsToggling(false)
      setPendingToggleConfig(null)
    }
  }

  const handleCancelToggle = () => setPendingToggleConfig(null)

  const handleCreate = async () => {
    if (!newPeriod) {
      setPeriodError('El período es obligatorio')
      return
    }
    if (!validatePeriodFormat(newPeriod)) {
      setPeriodError('El formato de periodo invalido')
      return
    }

    setPeriodError('')
    setIsSubmitting(true)

    try {
      const savedConfig = await createSurveyConfig({
        type: 'TamizajeSalud',
        period: newPeriod,
        isOpen: true,
      })
      await loadConfigs()
      setNewPeriod(DEFAULT_ACADEMIC_PERIOD)
      setShowModal(false)
      toast.success('Encuesta creada exitosamente')
      return savedConfig
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear la encuesta'
      setPeriodError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewDetail = (config: SurveyConfig) => {
    navigate(
      `/surveys-tamizaje-salud/${config.id}?period=${encodeURIComponent(config.period)}`,
    )
  }

  return (
    <Layout title='TAMIZAJE DE SALUD NUTRICIONAL' activeView='surveys'>
      <div className='space-y-8'>
        <section className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
          <div className='rounded-[32px] border border-outline-variant/20 bg-gradient-to-br from-secondary/10 via-white to-primary/10 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.05)]'>
            <div className='inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-secondary shadow-sm'>
              <span className='material-symbols-outlined text-xl'>
                health_and_safety
              </span>
              Tamizaje nutricional
            </div>
            <h1 className='mt-6 text-4xl font-extrabold tracking-tight text-on-surface'>
              Encuestas de salud y nutrición para estudiantes
            </h1>
            <p className='mt-4 max-w-2xl text-base leading-7 text-on-surface-variant'>
              Crea y gestiona evaluaciones nutricionales de manera sencilla y
              clara.
            </p>
            <div className='mt-8 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-3xl bg-white/90 border border-outline-variant/20 p-6 shadow-sm'>
                <p className='text-sm font-semibold text-on-surface-variant uppercase tracking-[0.24em]'>
                  Encuestas activas
                </p>
                <p className='mt-3 text-3xl font-bold text-secondary'>
                  {configs.filter((c) => c.isOpen).length}
                </p>
              </div>
              <div className='rounded-3xl bg-white/90 border border-outline-variant/20 p-6 shadow-sm'>
                <p className='text-sm font-semibold text-on-surface-variant uppercase tracking-[0.24em]'>
                  Encuestas totales
                </p>
                <p className='mt-3 text-3xl font-bold text-primary'>
                  {configs.length}
                </p>
              </div>
            </div>
          </div>
          <div className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                  Crear nueva encuesta
                </p>
                <h2 className='mt-2 text-2xl font-bold text-on-surface'>
                  Nueva configuración de tamizaje
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(true)
                  setNewPeriod(DEFAULT_ACADEMIC_PERIOD)
                  setPeriodError('')
                }}
                className='inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-secondary/90 transition'
              >
                <span className='material-symbols-outlined'>add</span>
                Crear
              </button>
            </div>
            <div className='mt-6 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-5'>
              <p className='text-sm text-on-surface-variant'>
                Crea un nuevo periodo para la encuesta y publícalo
                inmediatamente con un solo clic.
              </p>
            </div>
          </div>
        </section>

        {showModal &&
          createPortal(
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
              <div className='w-full max-w-xl rounded-[32px] bg-white border border-slate-200 p-6 shadow-2xl'>
                <div className='flex items-center justify-between gap-4 pb-4 border-b border-slate-200'>
                  <div>
                    <h3 className='text-xl font-bold text-on-surface'>
                      Crear nueva encuesta
                    </h3>
                    <p className='text-sm text-on-surface-variant'>
                      Agrega el período para la encuesta de tamizaje
                      nutricional.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200'
                  >
                    <span className='material-symbols-outlined'>close</span>
                  </button>
                </div>
                <div className='mt-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-semibold text-on-surface'>
                      Período
                    </label>
                  </div>
                  <input
                    type='text'
                    placeholder={DEFAULT_ACADEMIC_PERIOD}
                    value={newPeriod}
                    onChange={(e) => {
                      const formatted = formatPeriodoInput(e.target.value)
                      setNewPeriod(formatted)
                      if (formatted && !validatePeriodFormat(formatted)) {
                        setPeriodError('El formato de periodo invalido')
                      } else if (formatted && validatePeriodFormat(formatted)) {
                        setPeriodError('')
                      } else if (!formatted) {
                        setPeriodError('')
                      }
                    }}
                    className={`w-full rounded-3xl border px-4 py-3 text-on-surface outline-none focus:ring-2 ${
                      periodError
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                        : 'border-outline-variant/30 bg-surface-container-low focus:border-secondary focus:ring-secondary/10'
                    }`}
                  />
                  <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <button
                      onClick={() => setShowModal(false)}
                      className='rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-slate-100 transition'
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={handleCreate}
                      className='rounded-3xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90 transition disabled:cursor-not-allowed disabled:opacity-70'
                    >
                      {isSubmitting ? (
                        <div className='flex items-center justify-center gap-2'>
                          <span className='material-symbols-outlined animate-spin text-base'>
                            autorenew
                          </span>
                          Guardando...
                        </div>
                      ) : (
                        'Guardar encuesta'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {pendingToggleConfig &&
          createPortal(
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
              <div className='w-full max-w-lg rounded-[32px] bg-white border border-slate-200 p-6 shadow-2xl'>
                <div className='flex items-center justify-between gap-4 pb-4 border-b border-slate-200'>
                  <div>
                    <h3 className='text-xl font-bold text-on-surface'>
                      Confirmar cambio
                    </h3>
                    <p className='text-sm text-on-surface-variant'>
                      Verifica antes de abrir o cerrar la encuesta.
                    </p>
                  </div>
                  <button
                    onClick={handleCancelToggle}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200'
                  >
                    <span className='material-symbols-outlined'>close</span>
                  </button>
                </div>
                <div className='mt-6 space-y-4'>
                  <p className='text-sm text-on-surface'>
                    ¿Estás seguro de que deseas{' '}
                    {pendingToggleConfig.isOpen ? 'cerrar' : 'abrir'} la
                    encuesta del período{' '}
                    <strong>{pendingToggleConfig.period}</strong>?
                  </p>
                  <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <button
                      onClick={handleCancelToggle}
                      className='rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-slate-100 transition'
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleToggle}
                      disabled={isToggling}
                      className={`rounded-3xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90 transition ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isToggling ? (
                        <div className='flex items-center gap-2'>
                          <span className='material-symbols-outlined animate-spin'>
                            autorenew
                          </span>
                          Guardando...
                        </div>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}

        <div className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
          <div className='flex items-center justify-between gap-4 pb-4 border-b border-slate-200'>
            <div>
              <h3 className='text-xl font-bold text-on-surface'>
                Encuestas configuradas
              </h3>
              <p className='text-sm text-on-surface-variant'>
                Administra los períodos activos y la disponibilidad de cada
                encuesta.
              </p>
            </div>
            <div className='rounded-3xl bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant'>
              {configs.length} encuestas
            </div>
          </div>
          <div className='mt-6 overflow-hidden rounded-3xl border border-slate-200'>
            <table className='w-full border-collapse text-sm'>
              <thead className='bg-surface-container-lowest text-on-surface-variant'>
                <tr>
                  <th className='px-4 py-4 text-left'>Período</th>
                  <th className='px-4 py-4 text-left'>Link</th>
                  <th className='px-4 py-4 text-left'>Abierto</th>
                  <th className='px-4 py-4 text-left'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-4 py-8 text-center text-on-surface-variant'
                    >
                      CARGANDO...
                    </td>
                  </tr>
                ) : configs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-4 py-8 text-center text-on-surface-variant'
                    >
                      No hay encuestas configuradas
                    </td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr
                      key={config.id}
                      className='border-t border-slate-200 hover:bg-surface-container-high/50'
                    >
                      <td className='px-4 py-4 font-semibold text-on-surface'>
                        {config.period}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <a
                            href={`${ENFERMERIA_LINK}${config.link}`}
                            className='text-primary hover:underline truncate'
                            target='_blank'
                            rel='noreferrer'
                          >
                            {`${ENFERMERIA_LINK}${config.link}`}
                          </a>
                          <CopyButton
                            text={`${ENFERMERIA_LINK}${config.link}`}
                          />
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <button
                          onClick={() => requestToggle(config.id)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${config.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                        >
                          <span className='material-symbols-outlined text-base'>
                            {config.isOpen ? 'check_circle' : 'cancel'}
                          </span>
                          {config.isOpen ? 'Sí' : 'No'}
                        </button>
                      </td>
                      <td className='px-4 py-4'>
                        <button
                          onClick={() => handleViewDetail(config)}
                          className='inline-flex items-center gap-2 rounded-3xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary/90 transition'
                        >
                          <span className='material-symbols-outlined'>
                            visibility
                          </span>
                          Ver respuestas
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SurveysTamizajeSaludList
