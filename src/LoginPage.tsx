import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { authService } from './services/authService'

type LoginPageProps = {
  onLogin: (displayName: string) => void
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [identity, setIdentity] = useState('')
  const [viewPassword, setViewPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/dashboard'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!identity.trim() || !password.trim()) {
      setError('Por favor ingrese usuario y contraseña')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await authService.login(identity.trim(), password)
      setError('')
      onLogin(result?.user?.nombre!)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo validar el acceso'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='flex-grow flex flex-col md:flex-row min-h-screen bg-surface'>
      <section className='hidden md:flex md:w-1/2 lg:w-3/5 bg-primary relative overflow-hidden items-center justify-center p-12'>
        <div className='absolute inset-0 z-0'>
          <img
            alt='Laboratorio'
            className='w-full h-full object-cover opacity-30 mix-blend-overlay'
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuCuSj8ND5sPyKPZ-Nml72RSgeqk315gMgGeoe1HLXjb-_OawLQnkHbZXpRFZIkp43FUrTn5Rg1WIq2yAuJVpvMs76ra6xPJmMxKcw1SGVs9S2mdX7puEKxhKQYcghNACJHppd0J1lNfgSGsEFc15NOsvkGwuOfqh5uxlSDi0pNw5y2RgsKZe6iwhJaWo3P6sqWNfnKy6XalP_dwi6wjiDBx4etG8doRQnXQcizwXAKZHyZpQkm_PGJWT53zY7Feujsx6mmtXNHE4Q8'
          />
          <div className='absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary-container/60'></div>
        </div>
        <div className='relative z-10 max-w-xl text-white'>
          <div className='mb-8 flex items-center gap-3'>
            <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center'>
              <span
                className='material-symbols-outlined text-primary text-3xl'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_services
              </span>
            </div>
            <span className='font-headline font-extrabold text-2xl tracking-tight'>
              Instituto Neumann
            </span>
          </div>
          <h1 className='font-headline text-5xl font-extrabold mb-6 leading-tight'>
            Excelencia Médica, <br />
            <span className='text-primary-fixed'>Gestión de Pacientes.</span>
          </h1>
          <p className='text-xl text-primary-fixed/80 leading-relaxed font-light'>
            Acceda al portal institucional para la gestión clínica y
            administrativa del Tópico Neumann.
          </p>
          <div className='mt-12 flex gap-4'>
            <div className='glass-effect p-6 rounded-xl border border-white/10 flex-1'>
              <span className='material-symbols-outlined text-white mb-3 block text-3xl'>
                verified_user
              </span>
              <p className='font-headline font-bold text-lg mb-1 text-white'>
                Acceso institucional
              </p>
              <p className='text-sm text-white/90 font-medium'>
                Ingreso con credenciales del instituto para el personal
                autorizado.
              </p>
            </div>
            <div className='glass-effect p-6 rounded-xl border border-white/10 flex-1'>
              <span className='material-symbols-outlined text-white mb-3 block text-3xl'>
                clinical_notes
              </span>
              <p className='font-headline font-bold text-lg mb-1 text-white'>
                Gestión de casos
              </p>
              <p className='text-sm text-white/90 font-medium'>
                Historial clínico centralizado y control de estado de
                atenciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-surface'>
        <div className='md:hidden mb-12 flex flex-col items-center'>
          <div className='w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4'>
            <span
              className='material-symbols-outlined text-white text-3xl'
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              medical_services
            </span>
          </div>
          <span className='font-headline font-extrabold text-xl text-primary tracking-tight'>
            Instituto Neumann
          </span>
        </div>

        <div className='w-full max-w-md'>
          <header className='mb-10'>
            <h2 className='font-headline text-3xl font-bold text-on-surface mb-2'>
              Bienvenido de nuevo
            </h2>
            <p className='text-on-surface-variant font-medium'>
              Ingrese sus credenciales para continuar al Tópico.
            </p>
          </header>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label
                className='block font-label text-sm font-semibold text-on-surface-variant'
                htmlFor='identity'
              >
                Correo Institucional o DNI
              </label>
              <div className='relative'>
                <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline'>
                  person
                </span>
                <input
                  id='identity'
                  name='identity'
                  type='text'
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder='usuario@neumann.edu.pe'
                  className='w-full pl-12 pr-4 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label
                className='block font-label text-sm font-semibold text-on-surface-variant'
                htmlFor='password'
              >
                Contraseña
              </label>
              <div className='relative'>
                <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline'>
                  lock
                </span>
                <input
                  id='password'
                  name='password'
                  type={viewPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='w-full pl-12 pr-12 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline'
                />

                <button
                  type='button'
                  onClick={() => setViewPassword((prev) => !prev)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-outline hover:text-primary transition-colors'
                  aria-label={
                    viewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  <span className='material-symbols-outlined'>
                    {viewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && <p className='text-sm text-error'>{error}</p>}

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-primary text-white py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-container hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {isSubmitting && (
                <span className='material-symbols-outlined animate-spin text-xl'>
                  autorenew
                </span>
              )}
              Iniciar Sesión
              <span className='material-symbols-outlined text-xl'>
                arrow_forward
              </span>
            </button>
          </form>

          <p className='text-xs text-on-surface-variant mt-4'>
            Acceso exclusivo para personal autorizado.
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
