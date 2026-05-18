import { Navigate } from 'react-router'
import { useAuth } from './AuthContext'
import Loader from './Loader'
import { JSX } from 'react'

type PublicRouteProps = {
  children: JSX.Element
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return <Loader message='Verificando sesión' />
  }

  if (isLoggedIn) {
    return <Navigate to='/dashboard' replace />
  }

  return children
}

export default PublicRoute
