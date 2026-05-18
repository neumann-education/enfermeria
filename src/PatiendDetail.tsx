import Layout from './Layout'

type PatientDetailProps = {}

function PatientDetail({}: PatientDetailProps) {
  return (
    <Layout
      activeView='patient'
      header={
        <>
          <span className='material-symbols-outlined text-slate-400'>
            search
          </span>
          <span className="text-slate-400 font-['Manrope'] font-bold text-sm">
            Buscar registros clínicos...
          </span>
        </>
      }
    >
      <div className='p-10 space-y-8 max-w-7xl mx-auto w-full'>
        <section className='flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <span className='text-label-md font-medium text-on-surface-variant'>
                Patient ID: #NI-8842-RG
              </span>
              <span className='px-3 py-1 bg-secondary-container text-on-secondary-fixed-variant text-[11px] font-bold uppercase tracking-wider rounded-full'>
                Seguimiento
              </span>
            </div>
            <h2 className='text-4xl font-extrabold text-on-surface tracking-tight font-headline'>
              Elena Rodríguez García
            </h2>
            <div className='flex items-center gap-6 text-on-surface-variant text-sm'>
              <div className='flex items-center gap-1.5'>
                <span className='material-symbols-outlined text-base'>
                  calendar_today
                </span>
                <span>Last visit: Oct 24, 2023</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='material-symbols-outlined text-base'>
                  medical_services
                </span>
                <span>Primary: Dr. Julian Vane</span>
              </div>
            </div>
          </div>
          <div className='flex gap-3'>
            <button className='px-6 py-2.5 rounded-xl border-2 border-outline-variant/20 font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2'>
              <span className='material-symbols-outlined text-lg'>edit</span>
              Editar registro
            </button>
            <button className='px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/10 hover:opacity-90 transition-all flex items-center gap-2'>
              <span className='material-symbols-outlined text-lg'>
                picture_as_pdf
              </span>
              Exportar PDF
            </button>
          </div>
        </section>

        <div className='grid grid-cols-12 gap-6'>
          <div className='col-span-12 lg:col-span-4 space-y-6'>
            <div className='bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-transparent hover:border-primary/10 transition-all'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-primary mb-4'>
                Consultation Summary
              </h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center py-2 border-b border-surface-container-high'>
                  <span className='text-on-surface-variant text-sm'>Date</span>
                  <span className='font-semibold text-on-surface'>
                    Oct 24, 2023
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-surface-container-high'>
                  <span className='text-on-surface-variant text-sm'>Type</span>
                  <span className='font-semibold text-on-surface'>
                    Physical Assessment
                  </span>
                </div>
                <div className='flex justify-between items-center py-2'>
                  <span className='text-on-surface-variant text-sm'>
                    Duration
                  </span>
                  <span className='font-semibold text-on-surface'>
                    45 Minutes
                  </span>
                </div>
              </div>
            </div>
            <div className='bg-surface-container-low rounded-xl p-6 border-l-4 border-primary/20'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6'>
                Patient Profile
              </h3>
              <div className='grid grid-cols-2 gap-y-6'>
                <div>
                  <p className='text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-tighter'>
                    Age
                  </p>
                  <p className='text-lg font-bold text-on-surface'>34 Years</p>
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-tighter'>
                    Gender
                  </p>
                  <p className='text-lg font-bold text-on-surface'>Female</p>
                </div>
                <div className='col-span-2'>
                  <p className='text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-tighter'>
                    Professional Role
                  </p>
                  <p className='text-lg font-bold text-on-surface'>
                    Software Architect
                  </p>
                </div>
                <div className='col-span-2'>
                  <p className='text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-tighter'>
                    Blood Type
                  </p>
                  <p className='text-lg font-bold text-on-surface'>
                    O Positive (O+)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='col-span-12 lg:col-span-8 space-y-6'>
            <div className='bg-surface-container-lowest rounded-xl p-8 shadow-sm'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='p-2 bg-primary-fixed rounded-lg text-primary'>
                  <span className='material-symbols-outlined'>psychology</span>
                </span>
                <h3 className='font-headline font-bold text-xl'>
                  Reason for Consultation
                </h3>
              </div>
              <p className='text-on-surface-variant leading-relaxed font-body'>
                Patient reports persistent lumbar discomfort exacerbated by long
                periods of sitting during work cycles. Describes the pain as a
                "dull ache" radiating toward the right hip, appearing primarily
                in the late afternoon.
              </p>
            </div>
            <div className='bg-surface-container-lowest rounded-xl p-8 shadow-sm border-l-4 border-tertiary'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-tertiary mb-6'>
                Hallazgos clínicos
              </h3>
              <div className='space-y-6'>
                <div>
                  <label className='label-md font-bold text-on-surface-variant block mb-2'>
                    Identified Problem
                  </label>
                  <div className='p-4 bg-tertiary-fixed-dim/10 rounded-lg text-on-tertiary-fixed-variant font-semibold'>
                    L4-L5 Compression Syndrome (Mild / Stage 1)
                  </div>
                </div>
                <div>
                  <label className='label-md font-bold text-on-surface-variant block mb-2'>
                    Observations
                  </label>
                  <ul className='space-y-3'>
                    <li className='flex items-start gap-3'>
                      <span className='material-symbols-outlined text-tertiary text-sm mt-1'>
                        check_circle
                      </span>
                      <span className='text-on-surface-variant'>
                        Reduced range of motion in lateral flexion by 15%.
                      </span>
                    </li>
                    <li className='flex items-start gap-3'>
                      <span className='material-symbols-outlined text-tertiary text-sm mt-1'>
                        check_circle
                      </span>
                      <span className='text-on-surface-variant'>
                        Palpation reveals myofascial trigger points in the
                        quadratus lumborum.
                      </span>
                    </li>
                    <li className='flex items-start gap-3'>
                      <span className='material-symbols-outlined text-tertiary text-sm mt-1'>
                        check_circle
                      </span>
                      <span className='text-on-surface-variant'>
                        Neurological screening (reflexes) remains within normal
                        parameters.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='bg-surface-container-lowest rounded-xl p-8 shadow-sm'>
              <div className='flex items-center justify-between mb-8'>
                <h3 className='font-headline font-bold text-xl'>
                  Plan de seguimiento
                </h3>
                <span className='text-xs font-bold text-primary px-3 py-1 bg-primary-fixed rounded-full'>
                  Phase 1 of 3
                </span>
              </div>
              <div className='space-y-4'>
                <div className='flex items-center p-4 bg-surface-container-low rounded-xl group cursor-pointer hover:bg-surface-container-high transition-colors'>
                  <div className='w-6 h-6 border-2 border-primary rounded-md flex items-center justify-center mr-4 bg-primary text-white'>
                    <span className='material-symbols-outlined text-sm'>
                      done
                    </span>
                  </div>
                  <div className='flex-1'>
                    <p className='font-bold text-on-surface'>
                      Ergonomic Assessment
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      Review office chair and monitor height.
                    </p>
                  </div>
                  <span className='text-[10px] font-bold uppercase text-on-surface-variant/50'>
                    Completed
                  </span>
                </div>
                <div className='flex items-center p-4 bg-surface-container-low rounded-xl group cursor-pointer hover:bg-surface-container-high transition-colors'>
                  <div className='w-6 h-6 border-2 border-outline rounded-md flex items-center justify-center mr-4 bg-white'></div>
                  <div className='flex-1'>
                    <p className='font-bold text-on-surface'>
                      Daily Stretching Routine
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      Perform prescribed L4 series twice daily.
                    </p>
                  </div>
                  <span className='text-[10px] font-bold uppercase text-primary'>
                    Next Action
                  </span>
                </div>
                <div className='flex items-center p-4 bg-surface-container-low rounded-xl group cursor-pointer hover:bg-surface-container-high transition-colors'>
                  <div className='w-6 h-6 border-2 border-outline rounded-md flex items-center justify-center mr-4 bg-white'></div>
                  <div className='flex-1'>
                    <p className='font-bold text-on-surface'>
                      Imaging Referral (MRI)
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      If symptoms persist after 14 days of routine.
                    </p>
                  </div>
                  <span className='text-[10px] font-bold uppercase text-on-surface-variant/50'>
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PatientDetail
