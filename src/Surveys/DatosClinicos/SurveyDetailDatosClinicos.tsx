import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import ExcelJS from 'exceljs'
import Layout from '../../Layout'
import { fetchSurveyData, formatSurveyLink } from '../../services/surveyService'
import DatosClinicosGroupedResponses from './DatosClinicosGroupedResponses'
import { DatosClinicosResponse } from './DatosClinicosResponse'

function SurveyDetailDatosClinicos() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const period = searchParams.get('period')

  const [filteredResponses, setFilteredResponses] = useState<
    DatosClinicosResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'individual' | 'summary'>('summary')
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0)

  const SURVEY_TYPE = 'DatosClinicos'

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
      const resp = await fetchSurveyData('DatosClinicos', period, id)
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
      { header: 'Programa', key: 'programa', width: 20 },
      { header: 'Ciclo', key: 'ciclo', width: 12 },
      { header: 'Sección', key: 'seccion', width: 12 },
      { header: 'Nombres y Apellidos', key: 'nombresApellidos', width: 30 },
      { header: 'Fecha de nacimiento', key: 'fechaNacimiento', width: 16 },
      { header: 'Edad', key: 'edad', width: 10 },
      { header: 'Sexo', key: 'sexo', width: 10 },
      { header: 'DNI', key: 'dni', width: 16 },
      { header: 'Celular', key: 'celular', width: 16 },
      { header: 'Domicilio', key: 'domicilio', width: 28 },
      { header: 'Nacionalidad', key: 'nacionalidad', width: 18 },
      { header: 'Tipo de seguro', key: 'tipoSeguro', width: 16 },
      { header: 'Contacto nombres', key: 'contactoNombres', width: 24 },
      { header: 'Contacto celular', key: 'contactoCelular', width: 16 },
      { header: 'Parentesco', key: 'parentesco', width: 16 },
      {
        header: '¿PADECES ALGUNA ENFERMEDAD?',
        key: 'padeceEnfermedad',
        width: 18,
      },
      { header: 'Nombre enfermedad', key: 'enfermedadNombre', width: 24 },
      {
        header: '¿TIENE USTED ALGUN TIPO DE DISCAPACIDAD?',
        key: 'discapacidad',
        width: 14,
      },
      { header: 'Nombre discapacidad', key: 'discapacidadNombre', width: 24 },
      {
        header: '¿CUENTAS CON CARNET CONADIS?',
        key: 'carnetConadis',
        width: 14,
      },
      {
        header: '¿SIGUES TRATAMIENTO MEDICO?',
        key: 'tratamientoMedico',
        width: 18,
      },
      { header: 'Nombre tratamiento', key: 'tratamientoNombre', width: 24 },
      {
        header: '¿ERES ALERGICO A ALGUN MEDICAMENTO / OTROS?',
        key: 'alergico',
        width: 12,
      },
      { header: 'Nombre alergias', key: 'alergicoNombre', width: 24 },
      {
        header: '¿HAS RECIBIDO VACUNA CONTRA LA COVID - 19 ?',
        key: 'vacunaCovid',
        width: 14,
      },
      { header: '¿CUANTAS DOSIS?', key: 'dosisCovid', width: 16 },
      {
        header: '¿EN ESTOS MOMENTOS TE ENCUENTRAS EMBARAZADA?',
        key: 'embarazada',
        width: 12,
      },
      { header: 'FECHA PROBABLE DE PARTO (FPP)', key: 'fpp', width: 16 },
      { header: 'Semanas gestación', key: 'semanasGestacion', width: 18 },
    ]

    filteredResponses.forEach((response) => {
      worksheet.addRow({
        programa: response.programa || '',
        ciclo: response.ciclo || '',
        seccion: response.seccion || '',
        nombresApellidos: response.nombresApellidos || '',
        fechaNacimiento: response.fechaNacimiento || '',
        edad: response.edad || '',
        sexo: response.sexo || '',
        dni: response.dni || '',
        celular: response.celular || '',
        domicilio: response.domicilio || '',
        nacionalidad: response.nacionalidad || '',
        tipoSeguro: response.tipoSeguro || '',
        contactoNombres: response.contactoNombres || '',
        contactoCelular: response.contactoCelular || '',
        parentesco: response.parentesco || '',
        padeceEnfermedad: response.padeceEnfermedad ? 'Sí' : 'No',
        enfermedadNombre: response.enfermedadNombre || '',
        discapacidad: response.discapacidad ? 'Sí' : 'No',
        discapacidadNombre: response.discapacidadNombre || '',
        carnetConadis: response.carnetConadis ? 'Sí' : 'No',
        tratamientoMedico: response.tratamientoMedico ? 'Sí' : 'No',
        tratamientoNombre: response.tratamientoNombre || '',
        alergico: response.alergico ? 'Sí' : 'No',
        alergicoNombre: response.alergicoNombre || '',
        vacunaCovid: response.vacunaCovid ? 'Sí' : 'No',
        dosisCovid: response.dosisCovid || '',
        embarazada: response.embarazada ? 'Sí' : 'No',
        fpp: response.fpp || '',
        semanasGestacion: response.semanasGestacion || '',
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
    link.download = `respuestas_${SURVEY_TYPE}_${period ?? 'periodo'}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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
                  Datos Clínicos • {period}
                </h1>
                {id && (
                  <div className='mt-2'>
                    <a
                      href={formatSurveyLink('DatosClinicos', id)}
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
                          <p className='mt-1 text-sm text-on-surface-variant ml-10'>
                            Correo: {currentResponse.correoElectronico || '—'}
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
                      <div className='space-y-6'>
                        <div className='rounded-3xl bg-surface-container-low p-4'>
                          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                            I) Antecedentes personales
                          </p>
                          <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Edad
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.edad || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Fecha de nacimiento
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.fechaNacimiento || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Sexo
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.sexo === 'M'
                                  ? 'Masculino'
                                  : currentResponse.sexo === 'F'
                                    ? 'Femenino'
                                    : currentResponse.sexo || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Celular
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.celular || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Domicilio
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.domicilio || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Nacionalidad
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.nacionalidad || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Tipo de seguro
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.tipoSeguro || '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='rounded-3xl bg-surface-container-low p-4'>
                          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                            II) Datos de contacto de emergencia
                          </p>
                          <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Nombres y apellidos
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.contactoNombres || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Celular
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.contactoCelular || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4 sm:col-span-2'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Parentesco
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.parentesco || '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='rounded-3xl bg-surface-container-low p-4'>
                          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                            III) Antecedentes clínicos
                          </p>
                          <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Padece alguna enfermedad?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.padeceEnfermedad ? 'Sí' : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Tiene algún tipo de discapacidad?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.discapacidad ? 'Sí' : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Cuenta con carnet CONADIS?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.carnetConadis ? 'Sí' : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Sigue tratamiento médico?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.tratamientoMedico
                                  ? 'Sí'
                                  : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Es alérgico a algún medicamento u otra
                                sustancia?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.alergico ? 'Sí' : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Ha recibido vacuna contra la COVID-19?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.vacunaCovid ? 'Sí' : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4 sm:col-span-2'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Nombre de la enfermedad
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.enfermedadNombre || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4 sm:col-span-2'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Nombre de la discapacidad
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.discapacidadNombre || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4 sm:col-span-2'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Nombre del tratamiento
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.tratamientoNombre || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4 sm:col-span-2'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Nombre de la alergia
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.alergicoNombre || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Dosis de COVID-19
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.dosisCovid || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                ¿Se encuentra embarazada?
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.embarazada ? 'Sí' : 'No'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Semanas de gestación
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.semanasGestacion || '—'}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-white p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                Fecha probable de parto (FPP)
                              </p>
                              <p className='mt-2 text-base text-on-surface'>
                                {currentResponse.fpp || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DatosClinicosGroupedResponses responses={filteredResponses} />
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default SurveyDetailDatosClinicos
