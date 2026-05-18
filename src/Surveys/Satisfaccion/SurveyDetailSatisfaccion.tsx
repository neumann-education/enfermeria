import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import Layout from '../../Layout'
import { fetchSurveyData } from '../../services/surveyService'
import SatisfaccionGroupedResponses from './SatisfaccionGroupedResponses'

type SatisfaccionResponse = {
  id?: string
  type?: string
  period?: string
  configId?: string
  registeredAt?: string
  nombresApellidos?: string
  carreraProfesional?: string
  ciclo?: string
  seccion?: string
  infoCharla?: string
  servicioEnfermeria?: string
  proximoTema?: string
  recomendacion?: string | number
}

type FieldConfig = {
  key: keyof SatisfaccionResponse
  label: string
  format?: (value: unknown) => string
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'nombresApellidos', label: 'Nombres y Apellidos' },
  { key: 'carreraProfesional', label: 'Carrera profesional' },
  { key: 'ciclo', label: 'Ciclo' },
  { key: 'seccion', label: 'Sección' },
  {
    key: 'infoCharla',
    label:
      '¿Qué tan satisfecho te encuentras con la información brindada en la charla?',
  },
  {
    key: 'servicioEnfermeria',
    label: '¿Qué tan satisfecho/a te encuentras con el servicio de enfermería?',
  },
  {
    key: 'proximoTema',
    label:
      '¿Cuál te gustaría que sea el próximo tema a tratar por el área de enfermería?',
  },
  {
    key: 'recomendacion',
    label:
      '¿Qué tanto recomendarías el área de enfermería con tus compañeros? (1-10)',
    format: (value) => {
      if (value === null || value === undefined || value === '') return '—'
      return String(value)
    },
  },
]

const displayValue = (value: unknown) => {
  if (value === true) return 'Sí'
  if (value === false) return 'No'
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const escapeCsv = (value: unknown) =>
  `"${displayValue(value).replace(/"/g, '""')}"`

function SurveyDetailSatisfaccion() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const period = searchParams.get('period')
  const SURVEY_TYPE = 'Satisfaccion'
  const [filteredResponses, setFilteredResponses] = useState<
    SatisfaccionResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'individual' | 'summary'>('summary')
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0)

  useEffect(() => {
    const loadSurvey = async () => {
      setIsLoading(true)
      if (!id) {
        setIsLoading(false)
        return
      }
      if (!period) {
        setIsLoading(false)
        return
      }
      const resp = (await fetchSurveyData(
        SURVEY_TYPE,
        period,
        id,
      )) as SatisfaccionResponse[]
      setFilteredResponses(resp)
      setIsLoading(false)
    }
    loadSurvey()
  }, [id, period])

  // Función para descargar CSV
  const downloadCSV = () => {
    if (filteredResponses.length === 0) return

    const headers = FIELD_CONFIGS.map((field) => field.label)
    const csvRows = []
    csvRows.push(headers.join(','))

    for (const response of filteredResponses) {
      const values = headers.map((header) => {
        const field = FIELD_CONFIGS.find((item) => item.label === header)
        const rawValue = field ? response[field.key] : ''
        return escapeCsv(rawValue)
      })
      csvRows.push(values.join(','))
    }

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `respuestas_${SURVEY_TYPE}_${period}_todos.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Función para descargar JSON
  const downloadJSON = () => {
    const filteredData = filteredResponses.map((response) =>
      FIELD_CONFIGS.reduce<Record<string, string>>((acc, field) => {
        const rawValue = response[field.key]
        acc[field.key] = field.format
          ? field.format(rawValue)
          : displayValue(rawValue)
        return acc
      }, {}),
    )

    const dataStr = JSON.stringify(filteredData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `respuestas_${SURVEY_TYPE}_${period}_todos.json`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Layout title='Respuestas de encuesta' activeView='surveys'>
        <div className='space-y-8'>
          <section className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.05)]'>
            <div className='animate-pulse'>
              <div className='h-8 w-1/3 rounded-full bg-slate-200' />
              <div className='mt-6 h-10 w-3/4 rounded-full bg-slate-200' />
              <div className='mt-4 h-4 w-2/3 rounded-full bg-slate-200' />
            </div>
          </section>
        </div>
      </Layout>
    )
  }

  const currentResponse = filteredResponses[currentResponseIndex]

  return (
    <Layout title={`Respuestas - Encuesta`} activeView='surveys'>
      <div className='space-y-8'>
        <section className='grid gap-6 '>
          <div className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.05)]'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
                  <span className='material-symbols-outlined'>fact_check</span>
                  Respuestas de encuesta
                </span>
                <h1 className='mt-5 text-3xl font-extrabold tracking-tight text-on-surface'>
                  {SURVEY_TYPE.replace(/([A-Z])/g, ' $1').trim()} • {period}
                </h1>
                <p className='mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant'>
                  Revisa las respuestas recibidas y filtra por ciclo para
                  analizar la información por grupo.
                </p>
              </div>
              <div className='grid gap-3 '>
                <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-low p-4 text-center'>
                  <p className='text-sm uppercase tracking-[0.24em] text-on-surface-variant'>
                    Total respuestas
                  </p>
                  <p className='mt-3 text-3xl font-bold text-primary'>
                    {filteredResponses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='space-y-6'>
          <div className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
            <div className='flex flex-col gap-4 border-b border-outline-variant/20 pb-6 mb-6'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='text-xl font-bold text-on-surface'>
                    Respuestas ({filteredResponses.length})
                  </h3>
                  <p className='text-sm text-on-surface-variant'>
                    Listado de respuestas recibidas para esta encuesta.
                  </p>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={downloadCSV}
                    className='inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700'
                  >
                    <span className='material-symbols-outlined text-base'>
                      download
                    </span>
                    Descargar CSV
                  </button>
                  <button
                    onClick={downloadJSON}
                    className='inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700'
                  >
                    <span className='material-symbols-outlined text-base'>
                      download
                    </span>
                    Descargar JSON
                  </button>
                </div>
              </div>

              <div className='flex gap-2 rounded-full bg-surface-container-low p-1 w-fit'>
                <button
                  onClick={() => setViewMode('summary')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'summary'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className='material-symbols-outlined text-base'>
                    bar_chart
                  </span>
                  Summary
                </button>
                <button
                  onClick={() => setViewMode('individual')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'individual'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className='material-symbols-outlined text-base'>
                    person
                  </span>
                  Vista individual
                </button>
              </div>
            </div>

            {filteredResponses.length === 0 ? (
              <div className='rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant'>
                No hay respuestas para el ciclo seleccionado.
              </div>
            ) : viewMode === 'individual' ? (
              <div>
                <div className='mb-6'>
                  <label className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                    Seleccionar respuesta
                  </label>
                  <div className='mt-2'>
                    <select
                      value={currentResponseIndex}
                      onChange={(e) =>
                        setCurrentResponseIndex(Number(e.target.value))
                      }
                      className='w-full rounded-3xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'
                    >
                      {filteredResponses.map((response, idx) => (
                        <option key={idx} value={idx}>
                          {response.nombresApellidos || 'Sin nombre'} (
                          {response.ciclo || 'Sin ciclo'} -{' '}
                          {response.seccion || 'Sin sección'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='mb-6 flex items-center justify-between gap-4'>
                  <button
                    onClick={() =>
                      setCurrentResponseIndex(
                        Math.max(0, currentResponseIndex - 1),
                      )
                    }
                    disabled={currentResponseIndex === 0}
                    className='inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface transition-all hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <span className='material-symbols-outlined text-base'>
                      arrow_back
                    </span>
                    Anterior
                  </button>
                  <span className='text-sm text-on-surface-variant'>
                    {currentResponseIndex + 1} de {filteredResponses.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentResponseIndex(
                        Math.min(
                          filteredResponses.length - 1,
                          currentResponseIndex + 1,
                        ),
                      )
                    }
                    disabled={
                      currentResponseIndex === filteredResponses.length - 1
                    }
                    className='inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface transition-all hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Siguiente
                    <span className='material-symbols-outlined text-base'>
                      arrow_forward
                    </span>
                  </button>
                </div>

                {currentResponse && (
                  <div className='overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm'>
                    <div className='border-b border-outline-variant/20 bg-surface-container-low px-6 py-4'>
                      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                              {currentResponseIndex + 1}
                            </span>
                            <h4 className='text-lg font-semibold text-on-surface'>
                              {currentResponse.nombresApellidos || 'Sin nombre'}
                            </h4>
                          </div>
                        </div>
                        <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ml-10 lg:ml-0'>
                          <span className='material-symbols-outlined text-base'>
                            school
                          </span>
                          {currentResponse.ciclo || 'Sin ciclo'} /{' '}
                          {currentResponse.seccion || 'Sin sección'}
                        </div>
                      </div>
                    </div>
                    <div className='p-6'>
                      <div className='space-y-4'>
                        {FIELD_CONFIGS.map((field) => (
                          <div
                            key={String(field.key)}
                            className='rounded-2xl bg-surface-container-low p-4'
                          >
                            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                              {field.label}
                            </p>
                            <p className='mt-2 text-base text-on-surface'>
                              {field.format
                                ? field.format(currentResponse[field.key])
                                : displayValue(currentResponse[field.key])}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='space-y-6'>
                <SatisfaccionGroupedResponses responses={filteredResponses} />
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default SurveyDetailSatisfaccion
