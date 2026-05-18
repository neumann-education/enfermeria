import Layout from './Layout'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAppData } from './AppDataContext'

function PatientList() {
  const navigate = useNavigate()
  const { users, usersLoading } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const parseMaybeDate = (value?: string | null) => {
    const normalized = String(value || '').trim()
    if (!normalized) return null

    const dmYMatch = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (dmYMatch) {
      return new Date(
        `${dmYMatch[3]}-${dmYMatch[2].padStart(2, '0')}-${dmYMatch[1].padStart(2, '0')}`,
      )
    }

    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const formatTableDateTime = (value?: string | null) => {
    const normalized = String(value || '').trim()
    if (!normalized) return { date: '', time: '' }

    const [datePart, timePart] = normalized
      .split(',')
      .map((part) => part.trim())
    if (datePart && timePart) {
      const [hours, minutes] = timePart.split(':')
      const hourNum = Number(hours)
      if (!Number.isNaN(hourNum)) {
        const suffix = hourNum >= 12 ? 'PM' : 'AM'
        const hour12 = hourNum % 12 || 12
        return {
          date: datePart,
          time: `${hour12.toString().padStart(2, '0')}:${minutes} ${suffix}`,
        }
      }
      return { date: datePart, time: timePart }
    }

    const parsed = new Date(normalized)
    if (!Number.isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0')
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const year = parsed.getFullYear()
      let hour = parsed.getHours()
      const suffix = hour >= 12 ? 'PM' : 'AM'
      hour = hour % 12 || 12
      const minutes = String(parsed.getMinutes()).padStart(2, '0')
      return {
        date: `${day}/${month}/${year}`,
        time: `${String(hour).padStart(2, '0')}:${minutes} ${suffix}`,
      }
    }

    return { date: normalized, time: '' }
  }

  const filterDateObj = parseMaybeDate(filterDate)

  const filteredUsers = users.filter((user) => {
    if (filterDateObj) {
      const userDate = parseMaybeDate(user.fechaUltimaActualizacion)
      if (!userDate) {
        return false
      }
      if (
        userDate.getFullYear() !== filterDateObj.getFullYear() ||
        userDate.getMonth() !== filterDateObj.getMonth() ||
        userDate.getDate() !== filterDateObj.getDate()
      ) {
        return false
      }
    }
    if (
      searchTerm.trim() &&
      ![user.nombreCompleto, user.dni, user.correoElectronico, user.rol]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const hasActiveFilters = !!searchTerm.trim() || !!filterDate
  const totalPatients = users.filter((user) =>
    String(user.rol || '')
      .toLowerCase()
      .includes('estudiante'),
  ).length
  const totalUsers = users.length
  const totalUpdated = users.filter(
    (user) => user.fechaUltimaActualizacion,
  ).length

  return (
    <Layout activeView='user-patients' title='Usuarios y Pacientes'>
      <div className='space-y-8'>
        {/* Top Stats */}
        <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined text-3xl'>group</span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Total Usuarios
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                {totalUsers}
              </p>
              <p className='text-xs font-semibold text-tertiary mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>
                  trending_up
                </span>
                {totalUsers === 1
                  ? '1 usuario en total'
                  : `${totalUsers} usuarios en total`}
              </p>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant'>
              <span className='material-symbols-outlined text-3xl'>
                schedule
              </span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Pacientes registrados
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                {totalPatients}
              </p>
              <p className='text-xs font-semibold text-tertiary mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>
                  person
                </span>
                {totalPatients === 1
                  ? '1 paciente'
                  : `${totalPatients} pacientes`}
              </p>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant'>
              <span className='material-symbols-outlined text-3xl'>
                check_circle
              </span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Actualizaciones disponibles
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                {totalUpdated}
              </p>
              <p className='text-xs font-semibold text-secondary mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>
                  update
                </span>
                Usuarios con última actualización
              </p>
            </div>
          </div>
        </section>

        {/* Filters & Actions */}
        <section className='flex flex-col gap-6'>
          <div className='flex gap-2 justify-end'>
            <button
              type='button'
              onClick={() => navigate('/user-create')}
              className='min-w-44 py-3 px-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all'
            >
              <span className='material-symbols-outlined text-sm'>add</span>
              Crear usuario
            </button>
          </div>

          <div className='flex w-full justify-end'>
            <div className='flex w-full max-w-xl gap-4'>
              <div className='flex items-center w-full bg-surface-container-low px-4 py-2 rounded-full border-none'>
                <span className='material-symbols-outlined text-on-surface-variant text-sm mr-2'>
                  search
                </span>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='bg-transparent border-none focus:ring-0 text-sm w-full placeholder-on-surface-variant'
                  placeholder='Buscar por nombre, DNI, email o rol'
                  type='text'
                />
              </div>

              <input
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className='max-w-48 px-4 py-2 rounded-full border border-outline-variant/50 bg-surface-container-low text-sm focus:outline-none focus:border-primary col-span-1'
                type='date'
              />
            </div>
          </div>
        </section>

        {/* Patient Table */}
        <section className='overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm'>
          <div className='hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant'>
            <div className='col-span-5'>Paciente</div>
            <div className='col-span-3 text-center'>Última actualización</div>
            <div className='col-span-2 text-center'>Rol</div>
            <div className='col-span-2 text-center'>Acciones</div>
          </div>

          {usersLoading ? (
            <div className='rounded-3xl border border-dashed border-surface-container-high p-8 text-center text-on-surface-variant'>
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='rounded-3xl border border-dashed border-surface-container-high p-8 text-center text-on-surface-variant'>
              {hasActiveFilters
                ? 'No se encontraron usuarios con esos filtros.'
                : 'No hay usuarios registrados.'}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const updateValues = formatTableDateTime(
                user.fechaUltimaActualizacion || '',
              )

              return (
                <div
                  key={user.id}
                  className='group border-t border-outline-variant/10 bg-surface-container-lowest transition hover:bg-surface-container-high/30 hover:shadow-lg hover:shadow-primary/5'
                >
                  <div className='grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-12 md:items-center'>
                    <div className='col-span-5 flex items-center gap-4'>
                      <div className='relative'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold'>
                          {user.nombreCompleto
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div className='absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-secondary-container'></div>
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-bold text-on-surface truncate'>
                          {user.nombreCompleto}
                        </p>
                        <div className='flex flex-wrap items-center gap-2 text-xs text-on-surface-variant'>
                          <span className='truncate'>{user.dni}</span>
                          <span className='truncate'>·</span>
                          <span className='truncate'>
                            {user.correoElectronico}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='col-span-3 md:text-center'>
                      <div className='flex flex-col items-start md:items-center'>
                        <span className='text-on-surface text-sm font-semibold'>
                          {updateValues.date || 'Sin actualización'}
                        </span>
                        <span className='text-on-surface-variant text-xs'>
                          {updateValues.time}
                        </span>
                      </div>
                    </div>

                    <div className='col-span-2 md:flex md:items-center md:justify-center'>
                      <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                        <span className='material-symbols-outlined text-base'>
                          badge
                        </span>
                        {user.rol || 'Sin rol'}
                      </span>
                    </div>
                    <div className='col-span-2 flex items-center justify-center gap-2'>
                      <button
                        type='button'
                        onClick={() => navigate(`/user/${user.id}`)}
                        className='p-2 rounded-lg hover:bg-surface-container text-on-surface-variant'
                      >
                        <span className='material-symbols-outlined text-xl'>
                          visibility
                        </span>
                      </button>
                      <button className='p-2 rounded-lg hover:bg-surface-container text-on-surface-variant'>
                        <span className='material-symbols-outlined text-xl'>
                          edit
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </section>
      </div>
    </Layout>
  )
}

export default PatientList
