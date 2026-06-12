import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { consultaService } from './services/consultaService'
import toast from 'react-hot-toast'

type UserItem = {
  id: string
  nombreCompleto: string
  dni: string
  correoElectronico: string
  celular?: string
  telefono?: string
  edad?: string
  sexo?: string
  rol?: string
  role?: string
  programa?: string
  carrera?: string
  ciclo?: string
  seccion?: string
  nacionalidad?: string
  areaDepartamento?: string
  cargo?: string
  viviendoCon?: string
  tipoSeguro?: string
  isPregnant?: string
  hasDisability?: string
  fechaUltimaActualizacion?: string
}

type AttendanceFollowUp = {
  idSeguimiento: string
  idAtencion: string
  fechaSeguimiento: string
  hora: string
  asistio: string
  nivelCompromiso: string
  observaciones: string
}

export type HistoryAttendance = {
  orden: string
  fechaAtencion: string
  horaSalida: string
  usuarioId: string
  nombreCompleto: string
  dni: string
  userType: string
  programa: string
  ciclo: string
  seccion?: string
  periodo: string
  motivoAtencion: string
  areaProblematica: string
  observaciones: string
  resultado: string
  correoElectronico: string
  followUps?: AttendanceFollowUp[]
}

type AppDataContextType = {
  users: UserItem[]
  usersLoading: boolean
  usersError: string | null
  attendances: HistoryAttendance[]
  attendancesLoading: boolean
  attendancesError: string | null
  refreshUsers: () => Promise<void>
  refreshAttendances: () => Promise<void>
  updateAttendance: (orden: string, updates: Partial<HistoryAttendance>) => void
  appendAttendanceFollowUp: (
    orden: string,
    followUp: AttendanceFollowUp,
  ) => void
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined)

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [attendances, setAttendances] = useState<HistoryAttendance[]>([])
  const [attendancesLoading, setAttendancesLoading] = useState(false)
  const [attendancesError, setAttendancesError] = useState<string | null>(null)

  const loadUsers = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const usersData = await consultaService.searchUsers('')
      setUsers(
        usersData.map((user: any) => ({
          id: user.id || '',
          nombreCompleto: user.nombreCompleto || '',
          dni: user.dni || '',
          correoElectronico: user.correoElectronico || '',
          celular: user.celular || user.telefono || '',
          telefono: user.telefono || user.celular || '',
          edad: user.edad || '',
          sexo: user.sexo || '',
          rol: user.rol || '',
          role: user.role || user.rol || '',
          programa: user.programa || '',
          carrera: user.carrera || '',
          ciclo: user.ciclo || '',
          seccion: user.seccion || '',
          nacionalidad: user.nacionalidad || '',
          areaDepartamento:
            user.areaDepartamento || user['Área / Departamento'] || '',
          cargo: user.cargo || '',
          viviendoCon: user.viviendoCon || '',
          tipoSeguro: user.tipoSeguro || '',
          isPregnant: user.isPregnant || '',
          hasDisability: user.hasDisability || '',
          fechaUltimaActualizacion: user.fechaUltimaActualizacion || '',
        })),
      )
    } catch (error) {
      console.error(error)
      setUsersError('No se pudieron cargar los usuarios')
      toast.error('No se pudieron cargar los usuarios')
    } finally {
      setUsersLoading(false)
    }
  }

  const loadAttendances = async () => {
    setAttendancesLoading(true)
    setAttendancesError(null)
    try {
      const result = await consultaService.getHistoryAttendances()
      setAttendances(result)
    } catch (error) {
      console.error(error)
      setAttendancesError('No se pudo cargar el historial de atenciones')
      toast.error('No se pudo cargar el historial de atenciones')
    } finally {
      setAttendancesLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    loadUsers()
    loadAttendances()
  }, [isLoggedIn])

  const refreshUsers = async () => {
    await loadUsers()
  }

  const refreshAttendances = async () => {
    await loadAttendances()
  }

  const updateAttendance = (
    orden: string,
    updates: Partial<HistoryAttendance>,
  ) => {
    setAttendances((prev) =>
      prev.map((attendance) =>
        attendance.orden === orden
          ? {
              ...attendance,
              ...updates,
            }
          : attendance,
      ),
    )
  }

  const appendAttendanceFollowUp = (
    orden: string,
    followUp: AttendanceFollowUp,
  ) => {
    setAttendances((prev) =>
      prev.map((attendance) =>
        attendance.orden === orden
          ? {
              ...attendance,
              followUps: [...(attendance.followUps || []), followUp],
            }
          : attendance,
      ),
    )
  }

  return (
    <AppDataContext.Provider
      value={{
        users,
        usersLoading,
        usersError,
        attendances,
        attendancesLoading,
        attendancesError,
        refreshUsers,
        refreshAttendances,
        updateAttendance,
        appendAttendanceFollowUp,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return context
}
