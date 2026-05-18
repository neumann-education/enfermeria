import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthContext'
import Loader from './Loader'
import { JSX } from 'react'

type ProtectedRouteProps = {
  children: JSX.Element
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loader message='Verificando sesión' />
  }

  if (!isLoggedIn) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
