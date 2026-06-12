import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import {
  SurveyConfig,
  fetchSurveyConfigById,
  saveSurveyData,
} from '../../services/surveyService'
import toast from 'react-hot-toast'
import SurveyLoading from '../../components/SurveyLoading'
import { DEFAULT_ACADEMIC_PERIOD } from '../../constants/academicPeriod'

type TamizajeSaludData = {
  nombresApellidos: string
  edad: string
  dni: string
  celular: string
  correoElectronico: string
  programa: string
  ciclo: string
  seccion: string
  sexo: 'F' | 'M' | ''
  pesoActual: string
  estaturaActual: string
  actividadFisica: boolean | null
  frecuenciaActividad: string
  comidasPorDia: string
  consumoFrutasVerduras: string
  alergiaIntolerancia: string
  funcionVegetales: string
  platoFavorito1: string
  platoFavorito2: string
}

function SurveyTamizajeSalud() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isSent = searchParams.get('sent') === 'true'
  const [config, setConfig] = useState<SurveyConfig | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      if (!id) return
      const cfg = await fetchSurveyConfigById(id)
      if (cfg) {
        setConfig(cfg)
      }
    }
    loadConfig()
  }, [id])

  const [form, setForm] = useState<TamizajeSaludData>({
    nombresApellidos: '',
    edad: '',
    dni: '',
    celular: '',
    correoElectronico: '',
    programa: '',
    ciclo: '',
    seccion: '',
    sexo: '',
    pesoActual: '',
    estaturaActual: '',
    actividadFisica: null,
    frecuenciaActividad: '',
    comidasPorDia: '',
    consumoFrutasVerduras: '',
    alergiaIntolerancia: '',
    funcionVegetales: '',
    platoFavorito1: '',
    platoFavorito2: '',
  })

  const handleInputChange = (key: keyof TamizajeSaludData, value: string) => {
    setForm({ ...form, [key]: value })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleToggleOption = (
    key: keyof TamizajeSaludData,
    value: string | boolean,
  ) => {
    const current = form[key]
    const nextValue = current === value ? ('' as any) : value
    setForm({
      ...form,
      [key]: nextValue,
    })
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

    const requireText = (key: keyof TamizajeSaludData, label: string) => {
      const value = form[key]
      if (typeof value !== 'string' || value.trim() === '') {
        nextErrors[key] = `${label} es requerido.`
      }
    }

    requireText('nombresApellidos', 'Nombres y Apellidos')
    requireText('correoElectronico', 'Correo Electrónico')
    requireText('edad', 'Edad')
    requireText('dni', 'Nro de DNI')
    requireText('celular', 'Nro de Celular')
    requireText('programa', 'Programa actual')
    requireText('ciclo', 'Ciclo')
    requireText('seccion', 'Sección')
    if (form.sexo !== 'F' && form.sexo !== 'M') {
      nextErrors.sexo = 'Sexo es requerido.'
    }
    const requirePositiveNumber = (
      key: keyof TamizajeSaludData,
      label: string,
    ) => {
      const value = form[key]
      if (typeof value !== 'string' || value.trim() === '') {
        nextErrors[key] = `${label} es requerido.`
        return
      }
      const parsed = Number(value)
      if (Number.isNaN(parsed) || parsed < 0) {
        nextErrors[key] =
          `${label} debe ser un número válido mayor o igual a 0.`
      }
    }

    requirePositiveNumber('pesoActual', 'Peso actual')
    requirePositiveNumber('estaturaActual', 'Estatura actual')
    if (form.actividadFisica === null) {
      nextErrors.actividadFisica = 'Selecciona SI o NO.'
    }
    requireText('frecuenciaActividad', 'Frecuencia de actividad física')
    if (!form.comidasPorDia) {
      nextErrors.comidasPorDia = 'Selecciona cuántas comidas consumes.'
    }
    if (!form.consumoFrutasVerduras) {
      nextErrors.consumoFrutasVerduras =
        'Selecciona la proporción de frutas y verduras.'
    }
    requireText('alergiaIntolerancia', 'Alergia o intolerancia alimentaria')
    if (!form.funcionVegetales) {
      nextErrors.funcionVegetales = 'Selecciona la función de los vegetales.'
    }
    requireText('platoFavorito1', 'Plato favorito 1')

    setErrors(nextErrors)

    const order: (keyof TamizajeSaludData)[] = [
      'correoElectronico',
      'nombresApellidos',
      'edad',
      'dni',
      'celular',
      'programa',
      'ciclo',
      'seccion',
      'sexo',
      'pesoActual',
      'estaturaActual',
      'actividadFisica',
      'frecuenciaActividad',
      'comidasPorDia',
      'consumoFrutasVerduras',
      'alergiaIntolerancia',
      'funcionVegetales',
      'platoFavorito1',
      'platoFavorito2',
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
    const period = config?.period ?? DEFAULT_ACADEMIC_PERIOD
    const type = config?.type ?? 'TamizajeSalud'
    try {
      await saveSurveyData(type, period, {
        ...form,
        configId: config?.id || '',
      })
      toast.success('Encuesta guardada exitosamente')
      setIsSubmitting(false)
      navigate(`/survey-tamizaje-salud/${id}?sent=true`)
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar la encuesta')
      setIsSubmitting(false)
    }
  }

  const inputField = (
    label: string,
    key: keyof TamizajeSaludData,
    placeholder: string,
    type: 'text' | 'email' | 'number' = 'text',
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <div id={`field-${key}`} className='space-y-2'>
        <label className='text-sm font-medium text-slate-700'>{label}</label>
        <input
          type={type}
          min={type === 'number' ? 0 : undefined}
          step={type === 'number' ? 'any' : undefined}
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
    key: keyof TamizajeSaludData,
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
    key: keyof TamizajeSaludData,
    label: string,
    options: Array<{ label: string; value: string | boolean }>,
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <fieldset
        id={`field-${key}`}
        className={`space-y-3 bg-white rounded-2xl p-3 border ${
          hasError ? 'border-red-300' : 'border-slate-200'
        }`}
      >
        <legend className='text-sm px-1 font-semibold text-slate-700 block'>
          {label}
        </legend>
        <div className='flex flex-wrap gap-3'>
          {options.map((option) => {
            const isSelected = form[key] === option.value
            return (
              <button
                key={option.label}
                type='button'
                onClick={() => handleToggleOption(key, option.value)}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
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

  if (!id) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
        <div className='text-center'>
          <p className='text-lg font-semibold text-slate-800'>
            Encuesta inválida
          </p>
          <p className='text-slate-600'>Por favor, intenta nuevamente.</p>
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
    return <SurveyLoading />
  }

  const displayPeriod = config.period

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/10 to-primary-5 py-8 md:px-2'>
      <div className='max-w-4xl mx-auto space-y-6'>
        <div className='bg-primary rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary/5 p-8'>
            <h1 className='text-3xl font-bold text-white '>
              EVALUACIÓN NUTRICIONAL
            </h1>
            <p className='text-white font-medium text-3xl'>{displayPeriod}</p>
          </div>
          <div className='px-8 py-4 bg-slate-50 border-t border-slate-200'>
            <p className='text-sm text-slate-600'>
              Por favor completa todos los campos con información precisa y
              verídica.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {sectionHeader('DATOS PERSONALES', true)}
            <div className='p-6 border-b border-slate-200 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {inputField(
                  'Nombres y Apellidos',
                  'nombresApellidos',
                  'Nombres y Apellidos',
                )}
                {inputField('Edad', 'edad', 'Edad', 'number')}
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {inputField('Nro de DNI', 'dni', 'Nro de DNI')}
                {inputField('Nro de Celular', 'celular', 'Nro de Celular')}
                {inputField(
                  'Correo Electrónico',
                  'correoElectronico',
                  'Correo Electrónico',
                  'email',
                )}
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {selectField(
                  'Programa actual',
                  'programa',
                  [
                    'Administración de Negocios Internacionales',
                    'Contabilidad',
                  ],
                  'Seleccionar Programa',
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
                    'Sexto Ciclo',
                  ],
                  'Seleccionar Ciclo',
                )}
                {selectField(
                  'Sección',
                  'seccion',
                  ['A', 'B', 'C', 'D'],
                  'Seleccionar Sección',
                )}
              </div>
            </div>
          </div>

          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {sectionHeader('EVALUACIÓN NUTRICIONAL', true)}
            <div className='p-6 border-b border-slate-200 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-slate-700 block mb-3'>
                    Sexo
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    {['F', 'M'].map((option) => (
                      <button
                        key={option}
                        type='button'
                        onClick={() => handleInputChange('sexo', option)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                          form.sexo === option
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary/60 hover:bg-slate-50'
                        }`}
                      >
                        {option === 'F' ? 'Femenino' : 'Masculino'}
                      </button>
                    ))}
                  </div>
                  {errors.sexo && (
                    <p className='mt-2 text-xs text-red-600'>{errors.sexo}</p>
                  )}
                </div>
                {inputField(
                  '¿Cuál es tu peso actual?',
                  'pesoActual',
                  'Peso en kg',
                  'number',
                )}
                {inputField(
                  '¿Cuál es tu estatura actual? (cm)',
                  'estaturaActual',
                  'Estatura en cm',
                  'number',
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {radioGroup(
                  'actividadFisica',
                  '¿Realiza usted alguna actividad física?',
                  [
                    { label: 'SI', value: true },
                    { label: 'NO', value: false },
                  ],
                )}
                {radioGroup(
                  'frecuenciaActividad',
                  '¿Con qué frecuencia realiza actividad física?',
                  [
                    { label: 'Nunca', value: 'NUNCA' },
                    { label: 'Casi nunca', value: 'CASI NUNCA' },
                    {
                      label: 'Una vez por semana',
                      value: 'UNA VEZ POR SEMANA',
                    },
                    {
                      label: 'Dos a tres veces por semana',
                      value: 'DOS A TRES VECES POR SEMANA',
                    },
                    { label: 'Más de tres veces', value: 'MAS DE TRES VECES' },
                  ],
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {radioGroup(
                  'comidasPorDia',
                  '¿Cuántas comidas consumes al día?',
                  [
                    { label: 'Una vez', value: 'UNA VEZ' },
                    { label: 'Dos veces', value: 'DOS VECES' },
                    { label: 'Tres veces', value: 'TRES VECES' },
                    { label: 'Más de tres veces', value: 'MAS DE TRES VECES' },
                  ],
                )}
                {radioGroup(
                  'consumoFrutasVerduras',
                  '¿Qué proporción de frutas y verduras consumes?',
                  [
                    { label: 'Nada', value: 'NADA' },
                    { label: 'Poco', value: 'POCO' },
                    { label: 'Moderado', value: 'MODERADO' },
                    { label: 'Alta', value: 'ALTA' },
                  ],
                )}
              </div>

              <div>
                {inputField(
                  '¿Tienes alguna alergia o intolerancia alimentaria?',
                  'alergiaIntolerancia',
                  'Describe tu alergia o intolerancia',
                )}
              </div>

              <div>
                {radioGroup(
                  'funcionVegetales',
                  '¿Cuál crees que es la función del consumo de los vegetales?',
                  [
                    {
                      label:
                        'Nos ayudan a que nuestro cuerpo no asimile grasas y azúcar',
                      value: 'NO ASIMILE GRASAS Y AZUCAR',
                    },
                    {
                      label: 'Favorece el crecimiento',
                      value: 'FAVORECE EL CRECIMIENTO',
                    },
                    {
                      label: 'Aportan vitaminas, aminoácidos y minerales',
                      value: 'APORTAN VITAMINAS AMINOACIDOS Y MINERALES',
                    },
                    { label: 'No conozco', value: 'NO CONOZCO' },
                  ],
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {inputField(
                  'Plato favorito 1',
                  'platoFavorito1',
                  'Plato favorito 1',
                )}
                {inputField(
                  'Plato favorito 2',
                  'platoFavorito2',
                  'Plato favorito 2',
                )}
              </div>
            </div>
          </div>

          <div className='p-6 bg-slate-50 border-t border-slate-200 flex justify-end'>
            <button
              disabled={isSubmitting}
              type='submit'
              className='max-w-64 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50'
            >
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined animate-spin text-base'>
                    autorenew
                  </span>
                  Guardando...
                </div>
              ) : (
                'Enviar Encuesta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SurveyTamizajeSalud
