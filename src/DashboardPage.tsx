import Layout from './Layout'

function DashboardPage() {
  return (
    <Layout activeView='dashboard' title='Panel de Control Académico'>
      <div className='space-y-8'>
        <section>
          <h2 className='text-3xl font-bold font-headline text-on-surface tracking-tight'>
            Panel de Control Académico
          </h2>
          <p className='text-on-surface-variant mt-1'>
            Bienvenido al sistema central de salud del Tópico Instituto Neumann.
          </p>
        </section>

        <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <article className='bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between'>
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-primary-fixed rounded-lg text-primary'>
                <span className='material-symbols-outlined'>stethoscope</span>
              </div>
              <span className='text-[10px] font-bold text-primary bg-primary-fixed px-2 py-1 rounded-full uppercase tracking-wider'>
                Hoy
              </span>
            </div>
            <div>
              <span className='text-4xl font-extrabold font-headline text-on-surface'>
                24
              </span>
              <p className='text-sm font-medium text-on-surface-variant mt-1'>
                Consultas totales hoy
              </p>
            </div>
            <div className='mt-4 pt-4 border-t border-slate-50'>
              <div className='flex items-center text-xs text-tertiary font-semibold'>
                <span className='material-symbols-outlined text-sm mr-1'>
                  trending_up
                </span>
                <span>12% más que ayer</span>
              </div>
            </div>
          </article>

          <article className='bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between'>
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-secondary-container rounded-lg text-secondary'>
                <span className='material-symbols-outlined'>
                  pending_actions
                </span>
              </div>
              <span className='text-[10px] font-bold text-secondary bg-secondary-container px-2 py-1 rounded-full uppercase tracking-wider'>
                En curso
              </span>
            </div>
            <div>
              <span className='text-4xl font-extrabold font-headline text-on-surface'>
                08
              </span>
              <p className='text-sm font-medium text-on-surface-variant mt-1'>
                Casos activos
              </p>
            </div>
            <div className='mt-4 pt-4 border-t border-slate-50'>
              <div className='flex items-center text-xs text-on-surface-variant font-semibold'>
                <span className='material-symbols-outlined text-sm mr-1'>
                  schedule
                </span>
                <span>Promedio 15m espera</span>
              </div>
            </div>
          </article>

          <article className='bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between'>
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-tertiary-container/10 rounded-lg text-tertiary'>
                <span className='material-symbols-outlined'>task_alt</span>
              </div>
              <span className='text-[10px] font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-1 rounded-full uppercase tracking-wider'>
                Mensual
              </span>
            </div>
            <div>
              <span className='text-4xl font-extrabold font-headline text-on-surface'>
                112
              </span>
              <p className='text-sm font-medium text-on-surface-variant mt-1'>
                Casos cerrados este mes
              </p>
            </div>
            <div className='mt-4 pt-4 border-t border-slate-50'>
              <div className='flex items-center text-xs text-tertiary font-semibold'>
                <span className='material-symbols-outlined text-sm mr-1'>
                  check_circle
                </span>
                <span>98% tasa de resolución</span>
              </div>
            </div>
          </article>
        </section>

        <section className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
            <div className='flex items-center justify-between px-2'>
              <h3 className='text-xl font-bold font-headline'>
                Actividad Reciente
              </h3>
              <button className='text-primary text-sm font-bold hover:underline'>
                Ver Historial Completo
              </button>
            </div>
            <div className='overflow-hidden rounded-xl border border-slate-100'>
              <table className='w-full text-left border-collapse'>
                <thead className='bg-surface-container-low'>
                  <tr>
                    <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Estudiante
                    </th>
                    <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      ID / Carnet
                    </th>
                    <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Hora
                    </th>
                    <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right'>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-50'>
                  <tr className='hover:bg-slate-50/50 transition-colors'>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs'>
                          MA
                        </div>
                        <span className='font-semibold text-on-surface'>
                          Mateo Alarcón
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-sm text-on-surface-variant'>
                      #2023-0142
                    </td>
                    <td className='px-6 py-5 text-sm text-on-surface-variant'>
                      09:15 AM
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-tertiary-container text-tertiary-fixed-dim'>
                        Open
                      </span>
                    </td>
                  </tr>
                  <tr className='hover:bg-slate-50/50 transition-colors'>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold text-xs'>
                          SP
                        </div>
                        <span className='font-semibold text-on-surface'>
                          Sofía Paredes
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-sm text-on-surface-variant'>
                      #2022-0988
                    </td>
                    <td className='px-6 py-5 text-sm text-on-surface-variant'>
                      08:45 AM
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-fixed-variant'>
                        Follow-up
                      </span>
                    </td>
                  </tr>
                  <tr className='hover:bg-slate-50/50 transition-colors'>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold text-xs'>
                          DL
                        </div>
                        <span className='font-semibold text-on-surface'>
                          Diego López
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-sm text-on-surface-variant'>
                      #2024-0012
                    </td>
                    <td className='px-6 py-5 text-sm text-on-surface-variant'>
                      08:00 AM
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-surface-variant text-on-surface-variant'>
                        Closed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside className='space-y-6'>
            <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 text-white shadow-xl shadow-primary/30'>
              <div className='relative z-10'>
                <h4 className='text-lg font-bold font-headline mb-2'>
                  Nueva Consulta
                </h4>
                <p className='text-primary-fixed/80 text-sm mb-6 leading-relaxed'>
                  Inicia el registro médico de forma rápida y segura.
                </p>
                <button className='w-full py-3 bg-white text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors'>
                  <span className='material-symbols-outlined'>add</span>
                  Registrar Paciente
                </button>
              </div>
              <div className='absolute -right-10 -bottom-10 opacity-10'>
                <span className='material-symbols-outlined text-[150px]'>
                  health_and_safety
                </span>
              </div>
            </div>
            <div className='bg-surface-container-high p-6 rounded-2xl'>
              <h4 className='font-bold text-on-surface mb-4 flex items-center gap-2'>
                <span className='material-symbols-outlined text-primary'>
                  emergency_home
                </span>
                Seguimiento Crítico
              </h4>
              <div className='space-y-4'>
                <div className='bg-surface-container-lowest p-4 rounded-xl border-l-4 border-error'>
                  <p className='text-xs font-bold text-error uppercase mb-1'>
                    Inmediato
                  </p>
                  <p className='text-sm font-semibold text-on-surface'>
                    Revisión de Alergia
                  </p>
                  <p className='text-xs text-on-surface-variant'>
                    Carlos M. - Aula 402
                  </p>
                </div>
                <div className='bg-surface-container-lowest p-4 rounded-xl border-l-4 border-secondary'>
                  <p className='text-xs font-bold text-secondary uppercase mb-1'>
                    Pendiente
                  </p>
                  <p className='text-sm font-semibold text-on-surface'>
                    Control de Presión
                  </p>
                  <p className='text-xs text-on-surface-variant'>
                    Prof. Martha S. - 12:30 PM
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </Layout>
  )
}

export default DashboardPage
