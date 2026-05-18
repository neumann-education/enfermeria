import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  matchPath,
  useLocation,
} from 'react-router'

import PatientList from './PatientList'
import RegistrationForm from './RegistrationForm'

import { Toaster } from 'react-hot-toast'
import { AppDataProvider } from './AppDataContext'
import AttendanceDetail from './AttendanceDetail'
import { AuthProvider, useAuth } from './AuthContext'
import CafeteriaSupervisionPage from './CafeteriaSupervisionPage'
import ConsultasPage from './ConsultasPage'
import Loader from './Loader'
import LoginPage from './LoginPage'
import NotFound from './NotFound'
import ProtectedRoute from './ProtectedRoute'
import ReportsPage from './ReportsPage'
import SurveyDatosClinicos from './Surveys/DatosClinicos/SurveyDatosClinicos'
import SurveyDetailDatosClinicos from './Surveys/DatosClinicos/SurveyDetailDatosClinicos'
import SurveysDatosClinicosList from './Surveys/DatosClinicos/SurveysDatosClinicosList'
import SurveyDetailSatisfaccion from './Surveys/Satisfaccion/SurveyDetailSatisfaccion'
import SurveySatisfaccion from './Surveys/Satisfaccion/SurveySatisfaccion'
import SurveysSatisfaccionList from './Surveys/Satisfaccion/SurveysSatisfaccionList'
import SurveysConfig from './Surveys/SurveysConfig'
import SurveysPage from './Surveys/SurveysPage'
import SurveyDetailTamizaje from './Surveys/Tamizaje/SurveyDetailTamizaje'
import SurveysTamizajeSaludList from './Surveys/Tamizaje/SurveysTamizajeSaludList'
import SurveyTamizajeSalud from './Surveys/Tamizaje/SurveyTamizajeSalud'
import UserCreate from './UserCreate'
import UserDetail from './UserDetail'

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Loader
        message={isLoggedIn ? 'Cargando aplicación' : 'Verificando sesión'}
      />
    )
  }

  return (
    <Routes>
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <ConsultasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <ConsultasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/consultas'
        element={
          <ProtectedRoute>
            <ConsultasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/reports'
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/registration'
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user-create'
        element={
          <ProtectedRoute>
            <UserCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user/:id'
        element={
          <ProtectedRoute>
            <UserDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user-patients'
        element={
          <ProtectedRoute>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/attendance/:order'
        element={
          <ProtectedRoute>
            <AttendanceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path='/cafeteria'
        element={
          <ProtectedRoute>
            <CafeteriaSupervisionPage />
          </ProtectedRoute>
        }
      />
      {/* SURVEYS */}
      <Route
        path='/surveys'
        element={
          <ProtectedRoute>
            <SurveysPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-config'
        element={
          <ProtectedRoute>
            <SurveysConfig />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-datos-clinicos'
        element={
          <ProtectedRoute>
            <SurveysDatosClinicosList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-datos-clinicos/:id'
        element={
          <ProtectedRoute>
            <SurveyDetailDatosClinicos />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-tamizaje-salud'
        element={
          <ProtectedRoute>
            <SurveysTamizajeSaludList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-tamizaje-salud/:id'
        element={
          <ProtectedRoute>
            <SurveyDetailTamizaje />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-satisfaccion'
        element={
          <ProtectedRoute>
            <SurveysSatisfaccionList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/surveys-satisfaccion/:id'
        element={
          <ProtectedRoute>
            <SurveyDetailSatisfaccion />
          </ProtectedRoute>
        }
      />

      <Route
        path='*'
        element={
          isLoggedIn ? (
            <Navigate to='/dashboard' replace />
          ) : (
            <Navigate to='/login' replace />
          )
        }
      />
    </Routes>
  )
}

function PublicRoutes() {
  const handlePublicLogin = (displayName: string) => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('authUser', displayName)
  }

  return (
    <Routes>
      <Route
        path='/login'
        element={<LoginPage onLogin={handlePublicLogin} />}
      />
      <Route
        path='/survey-datos-clinicos/:id'
        element={<SurveyDatosClinicos />}
      />
      <Route path='/survey-tamizaje-salud' element={<NotFound />} />
      <Route
        path='/survey-tamizaje-salud/:id'
        element={<SurveyTamizajeSalud />}
      />
      <Route path='/survey-satisfaccion' element={<SurveySatisfaccion />} />
      <Route path='/survey-satisfaccion/:id' element={<SurveySatisfaccion />} />
    </Routes>
  )
}

function ProtectedApp() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </AuthProvider>
  )
}

function AppShell() {
  const location = useLocation()
  const isPublicRoute = [
    '/login',
    '/survey-datos-clinicos/:id',
    '/survey-tamizaje-salud',
    '/survey-tamizaje-salud/:id',
    '/survey-satisfaccion',
    '/survey-satisfaccion/:id',
  ].some((path) => matchPath({ path, end: true }, location.pathname))

  return isPublicRoute ? <PublicRoutes /> : <ProtectedApp />
}

function App() {
  return (
    <HashRouter>
      <AppShell />
      <Toaster />
    </HashRouter>
  )
}

export default App
