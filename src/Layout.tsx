import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from './AuthContext'

export type ViewType =
  | 'dashboard'
  | 'consultas'
  | 'reports'
  | 'registration'
  | 'user-patients'
  | 'user-create'
  | 'user-detail'
  | 'attendance-detail'
  | 'patient'
  | 'cafeteria'
  | 'surveys'

type LayoutProps = {
  title?: string
  header?: ReactNode
  activeView: ViewType
  children: ReactNode
}

function Layout({ title, header, activeView, children }: LayoutProps) {
  const { logout, user } = useAuth()
  const handleLogout = logout
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = [
    {
      icon: 'health_and_safety',
      label: 'Consultas',
      target: 'consultas' as const,
    },
    {
      icon: 'group',
      label: 'Usuarios y Pacientes',
      target: 'user-patients' as const,
    },
    {
      icon: 'restaurant',
      label: 'Cafetería',
      target: 'cafeteria' as const,
    },
    { icon: 'assignment', label: 'Encuestas', target: 'surveys' as const },
    { icon: 'analytics', label: 'Reportes', target: 'reports' as const },
  ]

  const handleNavigate = (view: ViewType) => {
    navigate(`/${view}`)
    setMobileNavOpen(false)
  }

  return (
    <div className='bg-surface text-on-surface min-h-screen flex'>
      <aside className='hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 z-50'>
        <div className='p-6 border-b border-slate-200 dark:border-slate-800'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white'>
              <span className='material-symbols-outlined'>
                medical_services
              </span>
            </div>
            <div>
              <h1 className='text-2xl font-black text-violet-700 dark:text-violet-500 tracking-tight'>
                Neumann
              </h1>
              <p className='text-[10px] uppercase tracking-widest text-on-surface-variant font-bold'>
                Sistema de Enfermería
              </p>
            </div>
          </div>
        </div>

        <nav className='flex-1 mt-4'>
          {navItems.map((item) => {
            const active = activeView === item.target
            return (
              <button
                key={item.label}
                type='button'
                onClick={() => handleNavigate(item.target)}
                className={`w-full text-left flex items-center gap-3 px-6 py-4 transition-all ${
                  active
                    ? 'bg-primary-fixed/30 text-primary font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-primary-fixed/20 hover:text-primary'
                }`}
              >
                <span className='material-symbols-outlined'>{item.icon}</span>
                <span className="font-['Manrope'] uppercase tracking-widest text-[11px] font-bold">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        <div className='p-6 mt-auto'>
          <button
            onClick={() => handleNavigate('registration')}
            className='w-full py-3 px-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all'
          >
            <span className='material-symbols-outlined text-sm'>add</span>
            Nueva Consulta
          </button>
        </div>
      </aside>

      <main className='flex-1 md:ml-64 min-h-screen bg-surface'>
        <header className='w-full h-16 sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm flex items-center justify-between px-4 md:px-8'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              className='md:hidden p-2 rounded-md text-on-surface hover:bg-surface-variant transition'
              aria-label='Abrir menú'
              onClick={() => setMobileNavOpen(true)}
            >
              <span className='material-symbols-outlined'>menu</span>
            </button>
            <div className='flex items-center gap-4'>
              {title ? (
                <h1 className="font-['Manrope'] font-bold tracking-tight text-xl text-primary">
                  {title}
                </h1>
              ) : null}
              {header}
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={handleLogout}
              className='hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-surface-container-high hover:bg-surface-variant'
            >
              <span className='material-symbols-outlined text-base'>
                logout
              </span>
              Cerrar sesión
            </button>
            <div className='flex items-center gap-3'>
              <div className='text-right'>
                <p className='text-sm font-bold text-on-surface'>
                  {user || 'Personal de Enfermería'}
                </p>
                <p className='text-xs text-on-surface-variant font-medium hidden md:block'>
                  Tópico Instituto Neumann
                </p>
              </div>
            </div>
          </div>
          <div className='bg-slate-100 dark:bg-slate-800 h-px w-full absolute bottom-0 left-0'></div>
        </header>

        {/* Mobile nav overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
            mobileNavOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileNavOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 transition-transform duration-200 md:hidden ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-bold text-on-surface'>Navegación</h2>
            <button
              type='button'
              aria-label='Cerrar menú'
              onClick={() => setMobileNavOpen(false)}
              className='p-1 rounded hover:bg-surface-variant'
            >
              <span className='material-symbols-outlined'>close</span>
            </button>
          </div>
          <button
            type='button'
            onClick={() => {
              handleLogout()
              setMobileNavOpen(false)
            }}
            className='w-full mb-4 py-2 rounded-lg bg-surface-container-low text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition'
          >
            <span className='material-symbols-outlined align-middle mr-2'>
              logout
            </span>
            Cerrar sesión
          </button>
          <nav className='space-y-1'>
            {navItems.map((item) => {
              const active = activeView === item.target
              return (
                <button
                  key={item.label}
                  type='button'
                  onClick={() => handleNavigate(item.target)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-primary-fixed/30 text-primary font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-surface-variant dark:hover:bg-slate-800 hover:text-primary'
                  }`}
                >
                  <span className='material-symbols-outlined'>{item.icon}</span>
                  <span className="font-['Manrope'] uppercase tracking-widest text-[11px] font-bold">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
          <div className='mt-6'>
            <button
              onClick={() => {
                handleNavigate('registration')
              }}
              className='w-full py-1 px-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all'
            >
              <span className='material-symbols-outlined text-sm'>add</span>
              Nueva Consulta
            </button>
          </div>
        </aside>

        <div className='p-8 px-2 lg:p-12 '>{children}</div>
      </main>
    </div>
  )
}

export default Layout
