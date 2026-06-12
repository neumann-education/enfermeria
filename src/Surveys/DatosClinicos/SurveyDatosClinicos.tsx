import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import {
  DatosClinicosData,
  SurveyConfig,
  fetchSurveyConfigById,
  saveSurveyData,
} from '../../services/surveyService'
import toast from 'react-hot-toast'
import SurveyLoading from '../../components/SurveyLoading'
import { DEFAULT_ACADEMIC_PERIOD } from '../../constants/academicPeriod'

function SurveyDatosClinicos() {
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

  const [form, setForm] = useState<DatosClinicosData>({
    programa: '',
    ciclo: '',
    seccion: '',
    nombresApellidos: '',
    fechaNacimiento: '',
    edad: '',
    sexo: '',
    dni: '',
    celular: '',
    correoElectronico: '',
    domicilio: '',
    nacionalidad: '',
    tipoSeguro: '',
    contactoNombres: '',
    contactoCelular: '',
    parentesco: '',
    padeceEnfermedad: null,
    enfermedadNombre: '',
    discapacidad: null,
    discapacidadNombre: '',
    carnetConadis: null,
    tratamientoMedico: null,
    tratamientoNombre: '',
    alergico: null,
    alergicoNombre: '',
    vacunaCovid: null,
    dosisCovid: '',
    embarazada: null,
    fpp: '',
    semanasGestacion: '',
  })

  const handleInputChange = (
    key: keyof DatosClinicosData,
    value: string | boolean | null,
  ) => {
    setForm({ ...form, [key]: value })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleToggleOption = (
    key: keyof DatosClinicosData,
    value: string | boolean,
  ) => {
    const current = form[key]
    const nextValue = current === value ? null : value
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

    const requireText = (key: keyof DatosClinicosData, label: string) => {
      if (
        !form[key] ||
        (typeof form[key] === 'string' && (form[key] as string).trim() === '')
      ) {
        nextErrors[key] = `${label} es requerido.`
      }
    }

    requireText('correoElectronico', 'Correo Electrónico')
    requireText('programa', 'Programa')
    requireText('ciclo', 'Ciclo')
    requireText('seccion', 'Sección')
    requireText('nombresApellidos', 'Nombres y Apellidos')
    requireText('fechaNacimiento', 'Fecha de Nacimiento')
    requireText('edad', 'Edad')
    if (form.sexo !== 'M' && form.sexo !== 'F') {
      nextErrors.sexo = 'Sexo es requerido.'
    }
    requireText('dni', 'DNI')
    requireText('celular', 'Celular')
    requireText('domicilio', 'Domicilio')
    requireText('nacionalidad', 'Nacionalidad')
    if (!form.tipoSeguro) {
      nextErrors.tipoSeguro = 'Tipo de Seguro es requerido.'
    }
    requireText('contactoNombres', 'Contacto de Emergencia')
    requireText('contactoCelular', 'Celular de Emergencia')
    if (!form.parentesco) {
      nextErrors.parentesco = 'Parentesco es requerido.'
    }

    if (form.padeceEnfermedad === null) {
      nextErrors.padeceEnfermedad = 'Debes seleccionar SI o NO.'
    } else if (form.padeceEnfermedad && !form.enfermedadNombre.trim()) {
      nextErrors.enfermedadNombre = 'Debes especificar la enfermedad.'
    }

    if (form.discapacidad === null) {
      nextErrors.discapacidad = 'Debes seleccionar SI o NO.'
    } else if (form.discapacidad && !form.discapacidadNombre.trim()) {
      nextErrors.discapacidadNombre = 'Debes especificar la discapacidad.'
    }

    if (form.carnetConadis === null) {
      nextErrors.carnetConadis = 'Debes seleccionar SI o NO.'
    }

    if (form.tratamientoMedico === null) {
      nextErrors.tratamientoMedico = 'Debes seleccionar SI o NO.'
    } else if (form.tratamientoMedico && !form.tratamientoNombre.trim()) {
      nextErrors.tratamientoNombre = 'Debes especificar el tratamiento.'
    }

    if (form.alergico === null) {
      nextErrors.alergico = 'Debes seleccionar SI o NO.'
    } else if (form.alergico && !form.alergicoNombre.trim()) {
      nextErrors.alergicoNombre = 'Debes especificar la alergia.'
    }

    if (form.vacunaCovid === null) {
      nextErrors.vacunaCovid = 'Debes seleccionar SI o NO.'
    } else if (form.vacunaCovid && !form.dosisCovid.trim()) {
      nextErrors.dosisCovid = 'Debes indicar el número de dosis.'
    }

    if (form.embarazada === null) {
      nextErrors.embarazada = 'Debes seleccionar SI o NO.'
    } else if (form.embarazada) {
      if (!form.fpp.trim()) {
        nextErrors.fpp = 'Debes indicar la FPP.'
      }
      if (!form.semanasGestacion.trim()) {
        nextErrors.semanasGestacion = 'Debes indicar las semanas de gestación.'
      }
    }

    setErrors(nextErrors)

    const order: string[] = [
      'correoElectronico',
      'programa',
      'ciclo',
      'seccion',
      'nombresApellidos',
      'fechaNacimiento',
      'edad',
      'sexo',
      'dni',
      'celular',
      'domicilio',
      'nacionalidad',
      'tipoSeguro',
      'contactoNombres',
      'contactoCelular',
      'parentesco',
      'padeceEnfermedad',
      'enfermedadNombre',
      'discapacidad',
      'discapacidadNombre',
      'carnetConadis',
      'tratamientoMedico',
      'tratamientoNombre',
      'alergico',
      'alergicoNombre',
      'vacunaCovid',
      'dosisCovid',
      'embarazada',
      'fpp',
      'semanasGestacion',
      'confirmDeclaration',
    ]

    const firstErrorField = order.find((key) => key in nextErrors)
    if (firstErrorField) {
      scrollToField(`field-${firstErrorField}`)
    }

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true)
    e.preventDefault()
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
    const type = config?.type ?? 'DatosClinicos'
    await saveSurveyData(type, period, {
      ...form,
      configId: config?.id || '',
    })
    toast.success('Encuesta guardada exitosamente')
    setIsSubmitting(false)
    navigate(`/survey-datos-clinicos/${id}?sent=true`)
  }

  const radioGroup = (
    key: keyof DatosClinicosData,
    label: string,
    options: string[],
    spanClass = 'md:col-span-2',
    description?: string,
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <fieldset
        id={`field-${key}`}
        className={`space-y-3 ${spanClass} bg-white rounded-2xl p-3 border ${
          hasError ? 'border-red-300' : 'border-slate-200'
        }`}
      >
        <legend className={`text-sm px-1 font-semibold text-slate-700 block`}>
          {label}
        </legend>
        {description ? (
          <div className='text-sm text-slate-600'>{description}</div>
        ) : null}
        <div className='flex flex-wrap gap-3'>
          {options.map((option) => {
            const value =
              option === 'SI' ? true : option === 'NO' ? false : option
            const isChecked = form[key] === value
            return (
              <button
                key={option}
                type='button'
                onClick={() => handleToggleOption(key, value)}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                  isChecked
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                }`}
              >
                <span>{option}</span>
              </button>
            )
          })}
        </div>
        {hasError ? (
          <p className='text-xs text-red-600'>{errors[key]}</p>
        ) : null}
      </fieldset>
    )
  }

  const inputField = (
    placeholder: string,
    key: keyof DatosClinicosData,
    type: 'text' | 'number' | 'date' | 'email' = 'text',
    label?: string,
  ) => {
    const hasError = Boolean(errors[key])
    return (
      <div id={`field-${key}`} className='space-y-2'>
        {label && (
          <label className='text-sm font-medium text-slate-700'>{label}</label>
        )}
        <input
          type={type}
          min={type === 'number' ? 0 : undefined}
          placeholder={placeholder}
          value={form[key] as string}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200'
          }`}
        />
        {hasError ? (
          <p className='text-xs text-red-600'>{errors[key]}</p>
        ) : null}
      </div>
    )
  }

  const selectField = (
    label: string,
    key: keyof DatosClinicosData,
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
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
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
        {hasError ? (
          <p className='text-xs text-red-600'>{errors[key]}</p>
        ) : null}
      </div>
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

  const displayPeriod = config?.period ?? DEFAULT_ACADEMIC_PERIOD

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/10 to-primary-5 py-8 md:px-2'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='bg-primary rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary/5 p-8'>
            <h1 className='text-3xl font-bold text-white '>
              DATOS CLÍNICOS DEL ESTUDIANTE
            </h1>
            <p className='text-white font-medium text-3xl'>{displayPeriod}</p>
          </div>
          <div className='px-8 py-4 bg-slate-50 border-t border-slate-200'>
            <p className='text-sm text-slate-600'>
              Por favor completa todos los campos con información precisa y
              verídica.
            </p>
            <p className='mt-2 text-sm text-slate-600'>
              Tus datos serán tratados de forma confidencial y solo se
              utilizarán con fines clínicos y estadísticos. No compartiremos tus
              respuestas públicamente.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='bg-white rounded-xl border border-slate-200 p-4'>
            {inputField(
              'Correo Electrónico',
              'correoElectronico',
              'email',
              'Correo Electrónico',
            )}
          </div>
          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {sectionHeader('INFORMACIÓN DEL PROGRAMA', true)}
            <div className='p-6 space-y-4 border-b border-slate-200'>
              <div className='space-y-4'>
                {/* Primera fila */}
                <div className='max-w-sm'>
                  {selectField(
                    'Programa',
                    'programa',
                    [
                      'Administración de Negocios Internacionales',
                      'Contabilidad',
                    ],
                    'Seleccionar Programa',
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    'Seleccionar...',
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
          </div>

          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {/* ANTECEDENTES PERSONALES Section */}
            {sectionHeader('I) ANTECEDENTES PERSONALES', true)}
            <div className='p-6 space-y-5 border-b border-slate-200'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {inputField(
                  'Nombres y Apellidos',
                  'nombresApellidos',
                  'text',
                  'Nombres y Apellidos',
                )}
                {inputField(
                  'Fecha de Nacimiento',
                  'fechaNacimiento',
                  'date',
                  'Fecha de Nacimiento',
                )}
                {inputField('Edad', 'edad', 'number', 'Edad')}
                <div>
                  <label className='text-sm font-medium text-slate-700 block mb-3'>
                    Sexo
                  </label>
                  <div className='flex gap-3'>
                    {['M', 'F'].map((option) => (
                      <label
                        key={option}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-2 transition-all duration-200 ${
                          form.sexo === option
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        <input
                          type='radio'
                          name='sexo'
                          checked={form.sexo === option}
                          onChange={() => handleInputChange('sexo', option)}
                          className='sr-only'
                        />
                        <span>{option === 'M' ? 'Masculino' : 'Femenino'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {inputField('DNI', 'dni', 'text', 'DNI')}
                {inputField('Celular', 'celular', 'text', 'Celular')}
                {inputField('Domicilio', 'domicilio', 'text', 'Domicilio')}
                {inputField(
                  'Nacionalidad',
                  'nacionalidad',
                  'text',
                  'Nacionalidad',
                )}
              </div>
              <div className='pt-2'>
                {radioGroup(
                  'tipoSeguro',
                  'Tipo de Seguro',
                  ['SIS', 'ESSALUD', 'FFAA', 'OTRO', 'NINGUNO'],
                  'w-full',
                )}
              </div>
            </div>
          </div>

          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {/* CONTACTO DE EMERGENCIA Section */}
            {sectionHeader('II) DATOS DE CONTACTO DE EMERGENCIA', true)}
            <div className='p-6 space-y-5 border-b border-slate-200'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {inputField(
                  'Nombres y Apellidos',
                  'contactoNombres',
                  'text',
                  'Nombres y Apellidos',
                )}
                {inputField('Celular', 'contactoCelular', 'text', 'Celular')}
              </div>
              <div>
                {radioGroup(
                  'parentesco',
                  'Parentesco',
                  ['CONYUGE', 'HIJO', 'PADRE', 'MADRE', 'HERMANO', 'OTRO'],
                  'w-full',
                )}
              </div>
            </div>
          </div>

          <div className='space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            {/* ANTECEDENTES CLINICOS Section */}
            {sectionHeader('III) ANTECEDENTES CLÍNICOS', true)}
            <div className='p-6 space-y-6 border-b border-slate-200'>
              {/* Enfermedad */}
              <div className='space-y-4'>
                {radioGroup(
                  'padeceEnfermedad',
                  '¿Padeces alguna enfermedad?',
                  ['SI', 'NO'],
                  'w-full',
                )}
                {form.padeceEnfermedad && (
                  <div className='ml-4 pt-2 border-l-2 border-primary/30 pl-4'>
                    {inputField(
                      'Especifica la enfermedad',
                      'enfermedadNombre',
                      'text',
                      'Enfermedad',
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-slate-200 pt-4'></div>

              {/* Discapacidad */}
              <div className='space-y-4'>
                {radioGroup(
                  'discapacidad',
                  '¿Tienes algún tipo de discapacidad?',
                  ['SI', 'NO'],
                  'w-full',
                )}
                {form.discapacidad && (
                  <div className='ml-4 pt-2 border-l-2 border-primary/30 pl-4'>
                    {inputField(
                      'Especifica la discapacidad',
                      'discapacidadNombre',
                      'text',
                      'Discapacidad',
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-slate-200 pt-4'></div>

              {/* CONADIS */}
              <div className='space-y-4'>
                {radioGroup(
                  'carnetConadis',
                  '¿Cuentas con carnet CONADIS?',
                  ['SI', 'NO'],
                  'w-full',
                )}
              </div>

              <div className='border-t border-slate-200 pt-4'></div>

              {/* Tratamiento Médico */}
              <div className='space-y-4'>
                {radioGroup(
                  'tratamientoMedico',
                  '¿Sigues tratamiento médico?',
                  ['SI', 'NO'],
                  'w-full',
                )}
                {form.tratamientoMedico && (
                  <div className='ml-4 pt-2 border-l-2 border-primary/30 pl-4'>
                    {inputField(
                      'Especifica el tratamiento',
                      'tratamientoNombre',
                      'text',
                      'Tratamiento',
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-slate-200 pt-4'></div>

              {/* Alergias */}
              <div className='space-y-4'>
                {radioGroup(
                  'alergico',
                  '¿Eres alérgico a algún medicamento u otra sustancia?',
                  ['SI', 'NO'],
                  'w-full',
                )}
                {form.alergico && (
                  <div className='ml-4 pt-2 border-l-2 border-primary/30 pl-4'>
                    {inputField(
                      'Especifica la alergia',
                      'alergicoNombre',
                      'text',
                      'Alergia',
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-slate-200 pt-4'></div>

              {/* Vacuna COVID */}
              <div className='space-y-4'>
                {radioGroup(
                  'vacunaCovid',
                  '¿Has recibido vacuna contra la COVID-19?',
                  ['SI', 'NO'],
                  'w-full',
                )}
                {form.vacunaCovid && (
                  <div className='ml-4 pt-2 border-l-2 border-primary/30 pl-4'>
                    {inputField(
                      '¿Cuántas dosis?',
                      'dosisCovid',
                      'number',
                      'Número de Dosis',
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-slate-200 pt-4'></div>

              {/* Embarazo */}
              <div className='space-y-4'>
                {radioGroup(
                  'embarazada',
                  '¿Te encuentras embarazada?',
                  ['SI', 'NO'],
                  'w-full',
                  'Esta información permitirá al equipo de enfermería brindarte un mejor acompañamiento.',
                )}
                {form.embarazada && (
                  <div className='ml-4 pt-2 border-l-2 border-primary/30 pl-4 space-y-4'>
                    {inputField(
                      'Fecha Probable de Parto (FPP)',
                      'fpp',
                      'date',
                      'FPP (Fecha Probable de Parto)',
                    )}
                    {inputField(
                      'Semanas de Gestación',
                      'semanasGestacion',
                      'number',
                      'Semanas',
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='max-w-64 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {isSubmitting ? (
                <span className='inline-flex items-center gap-2'>
                  <span className='material-symbols-outlined animate-spin'>
                    autorenew
                  </span>
                  Enviando...
                </span>
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

export default SurveyDatosClinicos
