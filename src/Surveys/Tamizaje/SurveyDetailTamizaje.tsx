import ExcelJS from 'exceljs'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import Layout from '../../Layout'
import { fetchSurveyData } from '../../services/surveyService'
import TamizajeGroupedResponses from './TamizajeGroupedResponses'

function SurveyDetailTamizaje() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const period = searchParams.get('period')
  const SURVEY_TYPE = 'TamizajeSalud'
  const [filteredResponses, setFilteredResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'individual' | 'summary'>('summary')
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0)

  // Campos a excluir completamente
  const EXCLUDED_FIELDS = [
    'id',
    'type',
    'period',
    'configId',
    'registeredAt',
    'fpp',
    'fechaNacimiento',
  ]

  const getFieldLabel = (key: string): string =>
    key.replace(/([A-Z])/g, ' $1').trim()

  // (removed unused shouldShowField helper)

  useEffect(() => {
    const loadSurvey = async () => {
      setIsLoading(true)
      if (!id) {
        setIsLoading(false)
        return
      }
      if (!period) {
        throw new Error('No se proporcionó el periodo')
      }
      const resp = await fetchSurveyData(SURVEY_TYPE, period, id)
      setFilteredResponses(resp)
      setIsLoading(false)
    }
    loadSurvey()
  }, [id, period])

  const downloadExcel = async () => {
    if (filteredResponses.length === 0) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Respuestas')

    worksheet.columns = [
      { header: 'Nombres y Apellidos', key: 'nombresApellidos', width: 28 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Nro de DNI', key: 'dni', width: 16 },
      { header: 'Nro de Celular', key: 'celular', width: 16 },
      { header: 'Correo Electrónico', key: 'correoElectronico', width: 24 },
      { header: 'Programa actual', key: 'programa', width: 28 },
      { header: 'Ciclo', key: 'ciclo', width: 12 },
      { header: 'Sección', key: 'seccion', width: 8 },
      { header: 'Sexo', key: 'sexo', width: 10 },
      { header: '¿Cuál es tu peso actual?', key: 'pesoActual', width: 18 },
      {
        header: '¿Cuál es tu estatura actual? (cm)',
        key: 'estaturaActual',
        width: 20,
      },
      {
        header: 'Realiza usted alguna actividad física?',
        key: 'actividadFisica',
        width: 24,
      },
      {
        header: '¿Con qué frecuencia realiza actividad física?',
        key: 'frecuenciaActividad',
        width: 28,
      },
      {
        header: '¿Cuántas comidas consumes al día?',
        key: 'comidasPorDia',
        width: 24,
      },
      {
        header: '¿Qué proporción de frutas y verduras consumes?',
        key: 'consumoFrutasVerduras',
        width: 32,
      },
      {
        header: '¿Tienes alguna alergia o intolerancia alimentaria?',
        key: 'alergiaIntolerancia',
        width: 32,
      },
      {
        header: '¿Cuál crees que es la función del consumo de los vegetales?',
        key: 'funcionVegetales',
        width: 36,
      },
      { header: 'Plato favorito 1', key: 'platoFavorito1', width: 24 },
      { header: 'Plato favorito 2', key: 'platoFavorito2', width: 24 },
    ]

    filteredResponses.forEach((r) => {
      worksheet.addRow({
        nombresApellidos: r.nombresApellidos || '',
        edad: r.edad || '',
        dni: r.dni || '',
        celular: r.celular || '',
        correoElectronico: r.correoElectronico || '',
        programa: r.programa || '',
        ciclo: r.ciclo || '',
        seccion: r.seccion || '',
        sexo: r.sexo || '',
        pesoActual: r.pesoActual || '',
        estaturaActual: r.estaturaActual || '',
        actividadFisica:
          r.actividadFisica === true
            ? 'Sí'
            : r.actividadFisica === false
              ? 'No'
              : '',
        frecuenciaActividad: r.frecuenciaActividad || '',
        comidasPorDia: r.comidasPorDia || '',
        consumoFrutasVerduras: r.consumoFrutasVerduras || '',
        alergiaIntolerancia: r.alergiaIntolerancia || '',
        funcionVegetales: r.funcionVegetales || '',
        platoFavorito1: r.platoFavorito1 || '',
        platoFavorito2: r.platoFavorito2 || '',
      })
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
    const link = document.createElement('a')
    link.href = url
    link.download = `respuestas_${SURVEY_TYPE}_${period || 'periodo'}.xlsx`
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
                    onClick={downloadExcel}
                    className='inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700'
                  >
                    <span className='material-symbols-outlined text-base'>
                      download
                    </span>
                    Descargar Excel
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
                          <p className='mt-1 text-sm text-on-surface-variant ml-10'>
                            DNI: {currentResponse.dni || '—'}
                          </p>
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
                        {Object.entries(currentResponse)
                          .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className='rounded-2xl bg-surface-container-low p-4'
                            >
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                {getFieldLabel(key)}
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {value === true
                                  ? 'Sí'
                                  : value === false
                                    ? 'No'
                                    : value !== undefined &&
                                        value !== null &&
                                        value !== ''
                                      ? String(value)
                                      : '—'}
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
                <TamizajeGroupedResponses responses={filteredResponses} />
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default SurveyDetailTamizaje
