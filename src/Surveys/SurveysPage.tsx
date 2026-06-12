import { useNavigate } from 'react-router'
import Layout from '../Layout'

type SurveyType = {
  type: string
  label: string
  route: string
  icon: string
}

function SurveysPage() {
  const navigate = useNavigate()

  const surveyTypes: SurveyType[] = [
    {
      type: 'DatosClinicos',
      label: 'DATOS CLINICOS DEL ESTUDIANTE',
      route: '/surveys-datos-clinicos',
      icon: 'medical_services',
    },
    {
      type: 'TamizajeSalud',
      label: 'TAMIZAJE DE SALUD NUTRICIONAL',
      route: '/surveys-tamizaje-salud',
      icon: 'health_and_safety',
    },
    {
      type: 'Satisfaccion',
      label: 'ENCUESTA DE SATISFACCION - CHARLA DE ENFERMERIA',
      route: '/surveys-satisfaccion',
      icon: 'thumb_up',
    },
  ]

  return (
    <Layout title='Encuestas' activeView='surveys'>
      <div className='space-y-8'>
        <section className='grid gap-6 lg:grid-cols-[1.4fr_1fr]'>
          <div className='rounded-[32px] border border-outline-variant/20 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.05)]'>
            <div className='inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm'>
              <span className='material-symbols-outlined text-xl'>poll</span>
              Módulo de encuestas
            </div>
            <h1 className='mt-6 text-4xl font-extrabold tracking-tight text-on-surface'>
              Gestiona los formularios de forma rápida y ordenada
            </h1>
            <p className='mt-4 max-w-2xl text-base leading-7 text-on-surface-variant'>
              Accede a los distintos tipos de encuestas, visualiza su estado y
              administra las respuestas de los estudiantes desde un solo lugar.
            </p>
          </div>
          <div className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
            <div className='flex items-center gap-3'>
              <span className='material-symbols-outlined text-3xl text-primary'>
                work_outline
              </span>
              <div>
                <h2 className='text-xl font-bold text-on-surface'>
                  Acciones rápidas
                </h2>
                <p className='text-sm text-on-surface-variant'>
                  Selecciona la encuesta que deseas administrar.
                </p>
              </div>
            </div>
            <div className='mt-6 space-y-4'>
              {surveyTypes.map((survey) => (
                <button
                  key={survey.type}
                  onClick={() => navigate(survey.route)}
                  className='w-full rounded-3xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-4 text-left transition hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm'
                >
                  <div className='flex items-center gap-4'>
                    <span className='material-symbols-outlined grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary text-2xl shadow-sm'>
                      {survey.icon}
                    </span>
                    <div>
                      <p className='text-base font-semibold text-on-surface'>
                        {survey.label}
                      </p>
                      <p className='mt-1 text-sm text-on-surface-variant'>
                        Ir a la sección de{' '}
                        {survey.type.replace(/([A-Z])/g, ' $1').trim()}.
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className='grid gap-6 md:grid-cols-3'>
          <div className='rounded-3xl border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
            <div className='flex items-center gap-3 text-primary'>
              <span className='material-symbols-outlined text-3xl'>
                insights
              </span>
              <h3 className='text-base font-semibold'>Datos clínicos</h3>
            </div>
            <p className='mt-4 text-sm text-on-surface-variant'>
              Registra y revisa el historial clínico de cada estudiante para un
              seguimiento integral.
            </p>
          </div>
          <div className='rounded-3xl border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
            <div className='flex items-center gap-3 text-secondary'>
              <span className='material-symbols-outlined text-3xl'>
                health_and_safety
              </span>
              <h3 className='text-base font-semibold'>Tamizaje nutricional</h3>
            </div>
            <p className='mt-4 text-sm text-on-surface-variant'>
              Administra el tamizaje de salud y nutrición de tus estudiantes con
              controles rápidos.
            </p>
          </div>
          <div className='rounded-3xl border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
            <div className='flex items-center gap-3 text-tertiary'>
              <span className='material-symbols-outlined text-3xl'>
                thumb_up
              </span>
              <h3 className='text-base font-semibold'>Satisfacción</h3>
            </div>
            <p className='mt-4 text-sm text-on-surface-variant'>
              Recopila comentarios sobre las charlas de enfermería y mejora la
              experiencia del estudiante.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default SurveysPage
