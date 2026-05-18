import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import {
  SurveyConfig,
  fetchSurveyConfigById,
  saveSurveyData,
} from '../../services/surveyService'
import toast from 'react-hot-toast'
import SurveyLoading from '../../components/SurveyLoading'

type SatisfaccionData = {
  nombresApellidos: string
  carreraProfesional: 'ADMINISTRACION' | 'CONTABILIDAD' | ''
  ciclo:
    | 'PRIMER CICLO'
    | 'SEGUNDO CICLO'
    | 'TERCER CICLO'
    | 'CUARTO CICLO'
    | 'QUINTO CICLO'
    | ''
  seccion: 'A' | 'B' | 'C' | ''
  infoCharla:
    | 'INSATISFECHO'
    | 'NI SATISFECHO'
    | 'SATISFECHO'
    | 'MUY SATISFECHO'
    | ''
  servicioEnfermeria:
    | 'INSATISFECHO'
    | 'NI SATISFECHO'
    | 'SATISFECHO'
    | 'MUY SATISFECHO'
    | ''
  proximoTema: string
  recomendacion: string
}

function SurveySatisfaccion() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isSent = searchParams.get('sent') === 'true'
  const [config, setConfig] = useState<SurveyConfig | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true)
      setLoadError(null)

      if (!id) {
        setLoadError('Encuesta inválida. Reintente nuevamente.')
        setIsLoading(false)
        return
      }

      const cfg = await fetchSurveyConfigById(id)
      if (!cfg || !cfg.period) {
        setLoadError('No se pudo cargar el período. Reintente nuevamente.')
        setIsLoading(false)
        return
      }

      setConfig(cfg)
      if (!cfg.isOpen) {
        setLoadError('El formulario está cerrado.')
      }
      setIsLoading(false)
    }

    loadConfig()
  }, [id])

  const [form, setForm] = useState<SatisfaccionData>({
    nombresApellidos: '',
    carreraProfesional: '',
    ciclo: '',
    seccion: '',
    infoCharla: '',
    servicioEnfermeria: '',
    proximoTema: '',
    recomendacion: '',
  })

  const handleInputChange = (key: keyof SatisfaccionData, value: string) => {
    setForm({ ...form, [key]: value })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleToggleOption = (key: keyof SatisfaccionData, value: string) => {
    const current = form[key]
    const nextValue = current === value ? '' : value
    setForm({ ...form, [key]: nextValue })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const scrollToField = (fieldId: string) => {
    const el = document.getElementById(fieldId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring', 'ring-red-300')
      window.setTimeout(() => el.classList.remove('ring', 'ring-red-300'), 1600)
    }
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    const requireText = (key: keyof SatisfaccionData, label: string) => {
      if (!form[key] || form[key].trim() === '') {
        nextErrors[key] = `${label} es requerido.`
      }
    }

    requireText('nombresApellidos', 'Nombres y Apellidos')
    if (!form.carreraProfesional) {
      nextErrors.carreraProfesional = 'Selecciona la carrera profesional.'
    }
    if (!form.ciclo) {
      nextErrors.ciclo = 'Selecciona el ciclo.'
    }
    if (!form.seccion) {
      nextErrors.seccion = 'Selecciona la sección.'
    }
    if (!form.infoCharla) {
      nextErrors.infoCharla = 'Selecciona tu nivel de satisfacción.'
    }
    if (!form.servicioEnfermeria) {
      nextErrors.servicioEnfermeria = 'Selecciona tu nivel de satisfacción.'
    }
    requireText('proximoTema', 'Próximo tema')
    if (!form.recomendacion) {
      nextErrors.recomendacion = 'Selecciona tu recomendación.'
    }

    setErrors(nextErrors)

    const order: (keyof SatisfaccionData)[] = [
      'nombresApellidos',
      'carreraProfesional',
      'ciclo',
      'seccion',
      'infoCharla',
      'servicioEnfermeria',
      'proximoTema',
      'recomendacion',
    ]

    const firstErrorField = order.find((key) => key in nextErrors)
    if (firstErrorField) {
      scrollToField(`field-${firstErrorField}`)
    }

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }
    const period = config?.period
    if (!period) {
      toast.error(
        'Configuración de encuesta inválida. No se encontró el período.',
      )
      setIsSubmitting(false)
      return
    }
    const type = config?.type ?? 'Satisfaccion'
    try {
      await saveSurveyData(type, period, {
        ...form,
        configId: config?.id || '',
      })
      toast.success('Encuesta guardada exitosamente')
      setIsSubmitting(false)
      navigate(`/survey-satisfaccion/${id}?sent=true`)
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar la encuesta')
      setIsSubmitting(false)
    }
  }

  const inputField = (
    label: string,
    key: keyof SatisfaccionData,
    placeholder: string,
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <div id={`field-${key}`} className='space-y-2'>
        <label className='text-sm font-medium text-slate-700'>{label}</label>
        <input
          type='text'
          placeholder={placeholder}
          value={form[key] as string}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200'
          }`}
        />
        {hasError && <p className='text-xs text-red-600'>{errors[key]}</p>}
      </div>
    )
  }

  const selectField = (
    label: string,
    key: keyof SatisfaccionData,
    options: string[],
    placeholder?: string,
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <div id={`field-${key}`} className='space-y-2'>
        <label className='text-sm font-medium text-slate-700'>{label}</label>
        <select
          value={form[key] as string}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200'
          }`}
        >
          <option value=''>{placeholder ?? `Seleccionar ${label}`}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {hasError && <p className='text-xs text-red-600'>{errors[key]}</p>}
      </div>
    )
  }

  const radioGroup = (
    key: keyof SatisfaccionData,
    label: string,
    options: Array<{ label: string; value: string }>,
    note?: string,
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <fieldset
        id={`field-${key}`}
        className={`space-y-3 bg-white rounded-2xl p-4 border ${
          hasError ? 'border-red-300' : 'border-slate-200'
        }`}
      >
        <legend className='text-sm px-1 font-semibold text-slate-700 block'>
          {label}
        </legend>
        <div className='flex flex-col gap-3'>
          {options.map((option) => {
            const isSelected = form[key] === option.value
            return (
              <button
                key={option.value}
                type='button'
                onClick={() => handleToggleOption(key, option.value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/60 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {note ? <p className='text-xs text-slate-500'>{note}</p> : null}
        {hasError && <p className='text-xs text-red-600'>{errors[key]}</p>}
      </fieldset>
    )
  }

  const sectionHeader = (title: string, isRequired = true) => (
    <div className='w-full flex items-center justify-between py-4 px-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200 hover:bg-slate-100 transition-colors duration-200'>
      <div className='flex items-center gap-3'>
        <h3 className='text-lg font-bold text-slate-800'>{title}</h3>
        {isRequired && (
          <span className='text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded'>
            REQUERIDO
          </span>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return <SurveyLoading />
  }

  if (loadError) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
        <div className='text-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
          <p className='text-lg font-semibold text-slate-800'>{loadError}</p>
          <p className='mt-3 text-slate-600'>
            {loadError === 'El formulario está cerrado.'
              ? 'Este formulario ya no está disponible.'
              : 'Por favor, intenta nuevamente.'}
          </p>
        </div>
      </div>
    )
  }

  if (isSent) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
        <div className='max-w-2xl w-full rounded-3xl border border-slate-200 bg-white p-10 shadow-lg'>
          <div className='text-center'>
            <span className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 mb-6'>
              <span className='material-symbols-outlined'>check</span>
            </span>
            <h1 className='text-3xl font-bold text-slate-900 mb-4'>
              Encuesta enviada
            </h1>
            <p className='text-slate-600 mb-8'>
              Gracias por tu participación. Tu respuesta fue registrada
              correctamente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
        <div className='text-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
          <p className='text-lg font-semibold text-slate-800'>
            La encuesta no es válida.
          </p>
          <p className='mt-3 text-slate-600'>
            Verifica el enlace o vuelve a intentarlo más tarde.
          </p>
        </div>
      </div>
    )
  }

  const displayPeriod = config.period

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4'>
      <div className='max-w-4xl mx-auto space-y-6'>
        <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-8'>
            <h1 className='text-3xl font-bold text-slate-900 mb-2'>
              ENCUESTA DE SATISFACCION - CHARLA DE ENFERMERIA
            </h1>
            <p className='text-slate-600 font-medium'>
              Período: {displayPeriod}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {sectionHeader('DATOS PERSONALES', true)}
            <div className='p-6 border-b border-slate-200 space-y-4'>
              {inputField(
                'Nombres y Apellidos',
                'nombresApellidos',
                'Nombres y Apellidos',
              )}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {selectField(
                  'Carrera Profesional',
                  'carreraProfesional',
                  [
                    'Administración de Negocios Internacionales',
                    'Contabilidad',
                  ],
                  'Seleccionar Carrera',
                )}
                {selectField(
                  'Ciclo',
                  'ciclo',
                  [
                    'Primer Ciclo',
                    'Segundo Ciclo',
                    'Tercer Ciclo',
                    'Cuarto Ciclo',
                    'Quinto Ciclo',
                  ],
                  'Seleccionar Ciclo',
                )}
                {selectField(
                  'Sección',
                  'seccion',
                  ['A', 'B', 'C'],
                  'Seleccionar Sección',
                )}
              </div>
            </div>
          </div>

          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {sectionHeader('SATISFACCIÓN', true)}
            <div className='p-6 space-y-6 border-b border-slate-200'>
              {radioGroup(
                'infoCharla',
                '¿Qué tan satisfecho te encuentras con la información brindada en la charla?',
                [
                  { label: 'Insatisfecho/a', value: 'INSATISFECHO' },
                  {
                    label: 'Ni satisfecho/a ni insatisfecho/a',
                    value: 'NI SATISFECHO',
                  },
                  { label: 'Satisfecho/a', value: 'SATISFECHO' },
                  { label: 'Muy satisfecho/a', value: 'MUY SATISFECHO' },
                ],
              )}

              {radioGroup(
                'servicioEnfermeria',
                '¿Qué tan satisfecho/a te encuentras con el servicio de enfermería?',
                [
                  { label: 'Insatisfecho/a', value: 'INSATISFECHO' },
                  {
                    label: 'Ni satisfecho/a ni insatisfecho/a',
                    value: 'NI SATISFECHO',
                  },
                  { label: 'Satisfecho/a', value: 'SATISFECHO' },
                  { label: 'Muy satisfecho/a', value: 'MUY SATISFECHO' },
                ],
                'Después de cada consulta',
              )}

              {inputField(
                '¿Cuál te gustaría que sea el próximo tema a tratar por el área de enfermería?',
                'proximoTema',
                'Escribe el próximo tema aquí',
              )}

              <div id='field-recomendacion' className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>
                  ¿Qué tanto recomendarías el área de enfermería con tus
                  compañeros?
                </label>
                <p className='text-xs text-slate-500'>
                  Ten en cuenta que 1 es muy poco probable y 10 es muy probable.
                </p>
                <div className='grid grid-cols-10 gap-4'>
                  {Array.from({ length: 10 }, (_, index) => index + 1).map(
                    (value) => (
                      <button
                        key={value}
                        type='button'
                        onClick={() =>
                          handleToggleOption('recomendacion', String(value))
                        }
                        className={`rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200 ${
                          form.recomendacion === String(value)
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary/60 hover:bg-slate-50'
                        }`}
                      >
                        {value}
                      </button>
                    ),
                  )}
                </div>
                {errors.recomendacion && (
                  <p className='text-xs text-red-600'>{errors.recomendacion}</p>
                )}
              </div>
            </div>
          </div>

          <div className='p-6 bg-slate-50 border-t border-slate-200 flex justify-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`max-w-64 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Encuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SurveySatisfaccion
