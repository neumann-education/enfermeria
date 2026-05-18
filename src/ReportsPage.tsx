import { useNavigate } from 'react-router'
import Layout from './Layout'

function ReportsPage() {
  const navigate = useNavigate()

  return (
    <Layout activeView='reports' title='Reportes Estadísticos'>
      <div className='space-y-8'>
        <header className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold text-on-surface tracking-tight font-headline'>
              Panel de Estadísticas
            </h1>
            <p className='text-on-surface-variant font-medium mt-1'>
              Análisis detallado de atenciones médicas - Gestión 2024
            </p>
          </div>
          <div className='flex gap-3'>
            <button className='flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-all'>
              <span className='material-symbols-outlined text-[20px]'>
                ios_share
              </span>
              Compartir
            </button>
            <button className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:brightness-110 shadow-lg shadow-primary/20 transition-all'>
              <span className='material-symbols-outlined text-[20px]'>
                download
              </span>
              Exportar Reporte
            </button>
          </div>
        </header>

        <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined text-3xl'>groups</span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Total Atenciones
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                1,284
              </p>
              <p className='text-xs font-semibold text-tertiary mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>
                  trending_up
                </span>
                +12% este mes
              </p>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant'>
              <span className='material-symbols-outlined text-3xl'>
                task_alt
              </span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Casos Cerrados
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                94.2%
              </p>
              <p className='text-xs font-semibold text-tertiary mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>
                  check_circle
                </span>
                Alta eficiencia
              </p>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant'>
              <span className='material-symbols-outlined text-3xl'>timer</span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Tiempo Promedio
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                12.5 min
              </p>
              <p className='text-xs font-semibold text-secondary mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>
                  schedule
                </span>
                Optimizado
              </p>
            </div>
          </div>
        </section>

        <section className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Line Chart: Evolution */}
          <div className='lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10'>
            <div className='flex justify-between items-start mb-8'>
              <div>
                <h3 className='text-xl font-bold font-headline'>
                  Evolución de Atenciones
                </h3>
                <p className='text-sm text-on-surface-variant'>
                  Frecuencia semanal de consultas médicas
                </p>
              </div>
              <select className='bg-surface-container-high border-none rounded-xl text-sm font-medium focus:ring-primary/20'>
                <option>Últimos 6 meses</option>
                <option>Último año</option>
              </select>
            </div>
            {/* SVG Line Chart Placeholder */}
            <div className='relative h-64 w-full mt-4'>
              <svg className='w-full h-full' viewBox='0 0 800 200'>
                <defs>
                  <linearGradient id='lineGrad' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#4f1c9d' stopOpacity='0.2' />
                    <stop offset='100%' stopColor='#4f1c9d' stopOpacity='0' />
                  </linearGradient>
                </defs>
                <path
                  d='M0,150 Q100,140 200,100 T400,120 T600,60 T800,80 L800,200 L0,200 Z'
                  fill='url(#lineGrad)'
                />
                <path
                  d='M0,150 Q100,140 200,100 T400,120 T600,60 T800,80'
                  fill='none'
                  stroke='#4f1c9d'
                  strokeLinecap='round'
                  strokeWidth='4'
                />
                <circle cx='200' cy='100' fill='#4f1c9d' r='5' />
                <circle cx='400' cy='120' fill='#4f1c9d' r='5' />
                <circle cx='600' cy='60' fill='#4f1c9d' r='5' />
              </svg>
              <div className='absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter opacity-50'>
                <span>Ene</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          {/* Bar Chart: Frequent Consultation */}
          <div className='lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10'>
            <h3 className='text-xl font-bold font-headline mb-6'>
              Motivos de Consulta
            </h3>
            <div className='space-y-5'>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm font-semibold'>
                  <span>Cefalea / Migraña</span>
                  <span className='text-primary'>42%</span>
                </div>
                <div className='h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary rounded-full'
                    style={{ width: '42%' }}
                  ></div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm font-semibold'>
                  <span>Control de Presión</span>
                  <span className='text-primary'>28%</span>
                </div>
                <div className='h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary-container rounded-full'
                    style={{ width: '28%' }}
                  ></div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm font-semibold'>
                  <span>Accidentes Menores</span>
                  <span className='text-primary'>15%</span>
                </div>
                <div className='h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-secondary-fixed-dim rounded-full'
                    style={{ width: '15%' }}
                  ></div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm font-semibold'>
                  <span>Otros</span>
                  <span className='text-primary'>15%</span>
                </div>
                <div className='h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-outline-variant rounded-full'
                    style={{ width: '15%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown: User Type */}
          <div className='lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-primary p-8 rounded-xl text-white overflow-hidden relative group'>
              <div className='relative z-10 flex justify-between items-center'>
                <div>
                  <h4 className='text-2xl font-bold font-headline'>
                    Estudiantes
                  </h4>
                  <p className='text-primary-fixed opacity-90 mt-1 font-medium'>
                    Representan el 74% de las atenciones totales.
                  </p>
                  <div className='mt-6 flex items-baseline gap-2'>
                    <span className='text-5xl font-black'>950</span>
                    <span className='text-lg opacity-60'>Consultas</span>
                  </div>
                </div>
                <div className='w-32 h-32 opacity-20'>
                  <span className='material-symbols-outlined !text-[120px]'>
                    school
                  </span>
                </div>
              </div>
              <div className='absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform'></div>
            </div>
            <div className='bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 overflow-hidden relative group'>
              <div className='relative z-10 flex justify-between items-center'>
                <div>
                  <h4 className='text-2xl font-bold font-headline text-on-surface'>
                    Administrativos
                  </h4>
                  <p className='text-on-surface-variant mt-1 font-medium'>
                    Representan el 26% de las atenciones totales.
                  </p>
                  <div className='mt-6 flex items-baseline gap-2'>
                    <span className='text-5xl font-black text-on-surface'>
                      334
                    </span>
                    <span className='text-lg text-on-surface-variant'>
                      Consultas
                    </span>
                  </div>
                </div>
                <div className='w-32 h-32 opacity-10'>
                  <span className='material-symbols-outlined !text-[120px]'>
                    badge
                  </span>
                </div>
              </div>
              <div className='absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform'></div>
            </div>
          </div>

          {/* Table: Faculty Breakdown */}
          <div className='lg:col-span-12 bg-surface-container-low p-10 rounded-xl'>
            <div className='flex justify-between items-center mb-10'>
              <h3 className='text-2xl font-black font-headline tracking-tight'>
                Desglose por Facultad
              </h3>
              <button className='text-primary font-bold hover:underline flex items-center gap-1'>
                Ver todos
                <span className='material-symbols-outlined text-sm'>
                  arrow_forward
                </span>
              </button>
            </div>
            <div className='space-y-6'>
              <div className='flex items-center justify-between pb-6 border-b border-outline-variant/20'>
                <div className='flex items-center gap-6'>
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm font-bold'>
                    F-ING
                  </div>
                  <div>
                    <div className='text-lg font-bold'>
                      Facultad de Ingeniería
                    </div>
                    <div className='text-sm text-on-surface-variant font-medium'>
                      Carreras de Tecnología y Civil
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-12'>
                  <div className='text-right'>
                    <div className='text-xl font-extrabold'>412</div>
                    <div className='text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60'>
                      Atenciones
                    </div>
                  </div>
                  <div className='px-4 py-1.5 bg-tertiary-container/20 text-on-tertiary-fixed-variant rounded-full text-xs font-bold'>
                    ESTABLE
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-between pb-6 border-b border-outline-variant/20'>
                <div className='flex items-center gap-6'>
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm font-bold'>
                    F-ADM
                  </div>
                  <div>
                    <div className='text-lg font-bold'>
                      Facultad de Negocios
                    </div>
                    <div className='text-sm text-on-surface-variant font-medium'>
                      Administración y Marketing
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-12'>
                  <div className='text-right'>
                    <div className='text-xl font-extrabold'>285</div>
                    <div className='text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60'>
                      Atenciones
                    </div>
                  </div>
                  <div className='px-4 py-1.5 bg-error-container text-on-error-container rounded-full text-xs font-bold'>
                    ALERTA +5%
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-6'>
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm font-bold'>
                    F-ART
                  </div>
                  <div>
                    <div className='text-lg font-bold'>Facultad de Diseño</div>
                    <div className='text-sm text-on-surface-variant font-medium'>
                      Diseño Gráfico e Interiores
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-12'>
                  <div className='text-right'>
                    <div className='text-xl font-extrabold'>198</div>
                    <div className='text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60'>
                      Atenciones
                    </div>
                  </div>
                  <div className='px-4 py-1.5 bg-secondary-container text-on-secondary-fixed-variant rounded-full text-xs font-bold'>
                    EN RANGO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAB for New Consultation */}
        <button
          onClick={() => navigate('/registration')}
          className='fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40'
        >
          <span className='material-symbols-outlined !text-3xl'>add</span>
        </button>
      </div>
    </Layout>
  )
}

export default ReportsPage
