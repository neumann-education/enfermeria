import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Layout from './Layout'
import { consultaService } from './services/consultaService'
import toast from 'react-hot-toast'

type AttendanceDetailData = {
  orden: string
  fechaAtencion: string
  usuarioId: string
  nombreCompleto: string
  edad: string
  dni: string
  celular: string
  correoElectronico: string
  programa: string
  ciclo: string
  periodo: string
  sexo: string
  motivoAtencion: string
  areaProblematica: string
  medioContacto: string
  observaciones: string
  resultado: string
}

function AttendanceDetail() {
  const { order } = useParams<{ order: string }>()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<AttendanceDetailData | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!order) return
      setIsLoading(true)
      try {
        const data = await consultaService.getAttendanceByOrder(order)
        if (!data) {
          toast.error('Atención no encontrada')
          return
        }
        setAttendance(data)
      } catch (error) {
        console.error(error)
        toast.error('No se pudo cargar la atención')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [order])

  const renderDetailRow = (label: string, value: string) => (
    <div className='rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4'>
      <p className='text-[10px] uppercase tracking-widest text-on-surface-variant'>
        {label}
      </p>
      <p className='mt-2 text-sm font-semibold text-on-surface'>
        {value || '—'}
      </p>
    </div>
  )

  return (
    <Layout
      activeView='attendance-detail'
      title={
        attendance ? `Atención ${attendance.orden}` : 'Detalle de atención'
      }
    >
      {isLoading ? (
        <div className='p-10 rounded-3xl bg-white shadow-sm text-center'>
          Cargando...
        </div>
      ) : !attendance ? (
        <div className='p-10 rounded-3xl bg-white shadow-sm text-center'>
          Atención no encontrada.
        </div>
      ) : (
        <div className='space-y-8'>
          <section className='flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <span className='text-label-md font-medium text-on-surface-variant'>
                  N° ORDEN: {attendance.orden}
                </span>
                <span className='px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant text-[11px] font-bold uppercase tracking-wider rounded-full'>
                  {attendance.resultado || 'Atención'}
                </span>
              </div>
              <h2 className='text-4xl font-extrabold text-on-surface tracking-tight font-headline'>
                {attendance.nombreCompleto}
              </h2>
              <div className='flex items-center gap-6 text-on-surface-variant text-sm'>
                <div className='flex items-center gap-1.5'>
                  <span className='material-symbols-outlined text-base'>
                    calendar_today
                  </span>
                  <span>Fecha: {attendance.fechaAtencion}</span>
                </div>
              </div>
            </div>
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => navigate(`/user/${attendance.usuarioId}`)}
                className='px-6 py-2.5 rounded-xl border-2 border-outline-variant/20 font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2'
              >
                <span className='material-symbols-outlined text-lg'>
                  person
                </span>
                Ver paciente
              </button>
            </div>
          </section>

          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-4 space-y-6'>
              <div className='bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-transparent hover:border-primary/10 transition-all'>
                <h3 className='text-xs font-bold uppercase tracking-widest text-primary mb-4'>
                  Datos del paciente
                </h3>
                <div className='space-y-4'>
                  {renderDetailRow('ID Usuario', attendance.usuarioId)}
                  {renderDetailRow('DNI', attendance.dni)}
                  {renderDetailRow('Edad', attendance.edad)}
                  {renderDetailRow('Sexo', attendance.sexo || '')}
                  {renderDetailRow('Teléfono', attendance.celular)}
                  {renderDetailRow('Email', attendance.correoElectronico)}
                  {renderDetailRow('Programa', attendance.programa)}
                  {renderDetailRow('Ciclo', attendance.ciclo)}
                </div>
              </div>
            </div>
            <div className='col-span-12 lg:col-span-8 space-y-6'>
              <div className='bg-surface-container-lowest rounded-xl p-8 shadow-sm'>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='p-2 bg-primary-fixed rounded-lg text-primary'>
                    <span className='material-symbols-outlined'>
                      psychology
                    </span>
                  </span>
                  <h3 className='font-headline font-bold text-xl'>
                    Motivo de atención
                  </h3>
                </div>
                <p className='text-on-surface-variant leading-relaxed font-body'>
                  {attendance.motivoAtencion || 'Sin motivo registrado.'}
                </p>
              </div>
              <div className='bg-surface-container-lowest rounded-xl p-8 shadow-sm border-l-4 border-tertiary'>
                <h3 className='text-xs font-bold uppercase tracking-widest text-tertiary mb-6'>
                  Detalle de la atención
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {renderDetailRow('Periodo', attendance.periodo)}
                  {renderDetailRow(
                    'Área problemática',
                    attendance.areaProblematica,
                  )}
                  {renderDetailRow(
                    'Medio de contacto',
                    attendance.medioContacto,
                  )}
                  {renderDetailRow('Resultado', attendance.resultado)}
                </div>
                <div className='mt-6'>
                  <h4 className='text-sm font-bold text-on-surface mb-2'>
                    Observaciones
                  </h4>
                  <p className='text-on-surface-variant'>
                    {attendance.observaciones ||
                      'No hay observaciones adicionales.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default AttendanceDetail
