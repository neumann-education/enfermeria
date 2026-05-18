import { useEffect, useState } from 'react'

type LoaderProps = {
  message?: string
}

function Loader({ message = 'Cargando...' }: LoaderProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='min-h-screen bg-surface flex items-center justify-center'>
      <div className='text-center'>
        <div className='relative mb-6'>
          {/* Heartbeat animation container */}
          <div className='relative'>
            {/* Health Metrics icon from Material Symbols */}
            <div className='w-20 h-20 mx-auto relative'>
              <span className='material-symbols-outlined text-6xl text-primary animate-pulse'>
                health_metrics
              </span>
            </div>
          </div>

          {/* Pulse rings */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-20 h-20 border-2 border-primary/20 rounded-full animate-ping'></div>
          </div>
          <div className='absolute inset-0 flex items-center justify-center animation-delay-300'>
            <div className='w-28 h-28 border border-primary/10 rounded-full animate-ping'></div>
          </div>
        </div>

        <p className='text-on-surface text-lg font-medium'>
          {message}
          {dots}
        </p>
      </div>
    </div>
  )
}

export default Loader
