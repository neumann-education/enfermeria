type SurveyLoadingProps = {
  title?: string
  description?: string
}

function SurveyLoading({
  title = 'Cargando encuesta...',
  description = 'Estamos verificando la configuración de la encuesta.',
}: SurveyLoadingProps) {
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-lg overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl'>
        <div className='h-2 bg-gradient-to-r from-primary via-secondary to-primary' />
        <div className='p-8 sm:p-10 text-center'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary shadow-inner'>
            <span className='material-symbols-outlined animate-spin text-4xl'>
              autorenew
            </span>
          </div>
          <h2 className='text-2xl font-extrabold tracking-tight text-on-surface'>
            {title}
          </h2>
          <p className='mt-3 text-sm leading-6 text-on-surface-variant'>
            {description}
          </p>

          <div
            className='mt-8 flex items-center justify-center gap-2'
            aria-hidden='true'
          >
            <span className='h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.2s]' />
            <span className='h-2.5 w-2.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.1s]' />
            <span className='h-2.5 w-2.5 rounded-full bg-primary animate-bounce' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyLoading
