import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import Layout from '../../Layout'
import { fetchSurveyData, formatSurveyLink } from '../../services/surveyService'
import ExcelJS from 'exceljs'
import SatisfaccionGroupedResponses from './SatisfaccionGroupedResponses'
import ResultadosSatisfaccion from './ResultadosSatisfaccion'

export type SatisfaccionResponse = {
  id?: string
  type?: string
  period?: string
  configId?: string
  registeredAt?: string
  nombresApellidos?: string
  correoElectronico?: string
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
  { key: 'correoElectronico', label: 'Correo electrónico' },
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

function SurveyDetailSatisfaccion() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const period = searchParams.get('period')
  const SURVEY_TYPE = 'Satisfaccion'
  const [filteredResponses, setFilteredResponses] = useState<
    SatisfaccionResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<
    'individual' | 'summary' | 'results'
  >('summary')
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

  if (isLoading) {
    return (
      <Layout title='Respuestas de encuesta' activeView='surveys'>
        <div className='space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
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

  const downloadExcel = async () => {
    if (filteredResponses.length === 0) return

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Respuestas')

      // Build columns from FIELD_CONFIGS
      worksheet.columns = FIELD_CONFIGS.map((f) => ({
        header: f.label,
        key: String(f.key),
        width: 28,
      }))

      // Add rows as objects for better column mapping
      filteredResponses.forEach((r) => {
        const rowObj: Record<string, any> = {}
        FIELD_CONFIGS.forEach((f) => {
          const val = r[f.key]
          rowObj[String(f.key)] = f.format ? f.format(val) : displayValue(val)
        })
        worksheet.addRow(rowObj)
      })

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true,
          }
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${SURVEY_TYPE}-${period || 'period'}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generating Excel file', err)
    }
  }

  return (
    <Layout title={`Respuestas - Encuesta`} activeView='surveys'>
      <div className='space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
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
                {id && (
                  <div className='mt-2'>
                    <a
                      href={formatSurveyLink(SURVEY_TYPE, id)}
                      target='_blank'
                      rel='noreferrer'
                      className='text-sm text-primary underline'
                    >
                      Ver enlace de la encuesta
                    </a>
                  </div>
                )}
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
                    onClick={downloadExcel}
                    className='inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700'
                  >
                    <span className='material-symbols-outlined text-base'>
                      download
                    </span>
                    Descargar respuestas
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
                  Resumen
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
                <button
                  onClick={() => setViewMode('results')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'results'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className='material-symbols-outlined text-base'>
                    person
                  </span>
                  Resultados de satisfacción
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
            ) : viewMode === 'summary' ? (
              <div className='space-y-6'>
                <SatisfaccionGroupedResponses responses={filteredResponses} />
              </div>
            ) : viewMode === 'results' ? (
              <ResultadosSatisfaccion responses={filteredResponses} />
            ) : null}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default SurveyDetailSatisfaccion
