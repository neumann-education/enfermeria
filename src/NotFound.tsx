import { Link } from 'react-router'

function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-6'>
      <div className='max-w-xl w-full text-center'>
        <div className='inline-flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-indigo-100 text-indigo-600 mx-auto'>
          <svg
            width='48'
            height='48'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-12 w-12'
          >
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
            <polyline points='7 10 12 15 17 10' />
            <line x1='12' y1='15' x2='12' y2='3' />
          </svg>
        </div>

        <h1 className='text-6xl font-extrabold text-gray-800 mb-2'>404</h1>
        <p className='text-xl text-gray-600 mb-4'>Página no encontrada</p>
        <p className='text-gray-500 mb-6'>
          Lo sentimos — la página que buscas no existe o fue movida. Revisa la
          URL o vuelve al inicio.
        </p>

        <div className='flex justify-center gap-3'>
          <Link
            to='/'
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
          >
            Volver al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className='px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-100'
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
