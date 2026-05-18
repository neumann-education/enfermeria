import { useState, useEffect } from 'react'
import Layout from '../Layout'
import {
  SurveyConfig,
  SurveyType,
  fetchSurveyConfigs,
  createSurveyConfig,
  updateSurveyConfigById,
  deleteSurveyConfigById,
} from '../services/surveyService'

function SurveysConfig() {
  const [configs, setConfigs] = useState<SurveyConfig[]>([])
  const [newConfig, setNewConfig] = useState({
    type: 'DatosClinicos' as SurveyType,
    period: '',
    isOpen: true,
  })

  useEffect(() => {
    const loadConfigs = async () => {
      setConfigs(await fetchSurveyConfigs())
    }
    loadConfigs()
  }, [])

  const handleAdd = async () => {
    if (!newConfig.period) return
    const config = await createSurveyConfig(newConfig)
    setConfigs((prev) => [...prev, config])
    setNewConfig({ type: 'DatosClinicos', period: '', isOpen: true })
  }

  const handleToggle = async (id: string) => {
    const config = configs.find((c) => c.id === id)
    if (!config) return

    const updated = await updateSurveyConfigById(id, {
      isOpen: !config.isOpen,
    })

    if (!updated) return

    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isOpen: updated.isOpen } : c)),
    )
  }

  const handleDelete = async (id: string) => {
    await deleteSurveyConfigById(id)
    setConfigs(configs.filter((c) => c.id !== id))
  }

  return (
    <Layout title='Configuración de Encuestas' activeView='surveys'>
      <div className='space-y-6'>
        <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6'>
          <h2 className='text-2xl font-bold'>Configuración de Encuestas</h2>
          <p>Administra las encuestas disponibles.</p>
        </div>

        <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6'>
          <h3 className='text-lg font-bold mb-4'>Agregar Nueva Encuesta</h3>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <select
              value={newConfig.type}
              onChange={(e) =>
                setNewConfig({
                  ...newConfig,
                  type: e.target.value as SurveyType,
                })
              }
              className='px-4 py-3 bg-surface-container-low border-none rounded-xl'
            >
              <option value='DatosClinicos'>Datos Clínicos</option>
              <option value='TamizajeSalud'>Tamizaje Salud</option>
              <option value='Satisfaccion'>Satisfacción</option>
            </select>
            <input
              type='text'
              placeholder='Período (ej: 2026 - I)'
              value={newConfig.period}
              onChange={(e) =>
                setNewConfig({ ...newConfig, period: e.target.value })
              }
              className='px-4 py-3 bg-surface-container-low border-none rounded-xl'
            />
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={newConfig.isOpen}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, isOpen: e.target.checked })
                }
              />
              Abierto
            </label>
            <button
              onClick={handleAdd}
              className='px-4 py-3 bg-primary text-white rounded-xl font-bold'
            >
              Agregar
            </button>
          </div>
        </div>

        <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6'>
          <h3 className='text-lg font-bold mb-4'>Encuestas Configuradas</h3>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left p-2'>Encuesta</th>
                <th className='text-left p-2'>Período</th>
                <th className='text-left p-2'>Abierto</th>
                <th className='text-left p-2'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} className='border-b'>
                  <td className='p-2'>{config.type}</td>
                  <td className='p-2'>{config.period}</td>
                  <td className='p-2'>
                    <button
                      onClick={() => handleToggle(config.id)}
                      className={`px-2 py-1 rounded ${config.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {config.isOpen ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td className='p-2'>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className='px-2 py-1 bg-red-500 text-white rounded'
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default SurveysConfig
