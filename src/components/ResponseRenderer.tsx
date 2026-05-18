import { DatosClinicosResponse } from '../Surveys/DatosClinicos/DatosClinicosResponse'
import { StackedBarChart } from './BarChart'
import TextList from './TextList'

function ResponseRenderer({
  label,
  responses,
  getValue,
  type = 'auto',
}: {
  label: string
  responses: DatosClinicosResponse[]
  getValue: (response: DatosClinicosResponse) => any
  type?: 'auto' | 'number' | 'multiple' | 'text'
}) {
  const detectType = () => {
    const sampleValues = responses
      .map((r) => getValue(r))
      .filter((v) => v !== null && v !== undefined && v !== '')
    if (sampleValues.length === 0) return 'empty'

    const firstValue = sampleValues[0]

    if (typeof firstValue === 'number') return 'number'

    if (
      typeof firstValue === 'boolean' ||
      (typeof firstValue === 'string' &&
        sampleValues.length > 0 &&
        new Set(sampleValues).size <= 6)
    ) {
      return 'multiple'
    }

    return 'text'
  }

  const detectedType = type === 'auto' ? detectType() : type

  // Filtrar respuestas válidas
  const validResponses = responses.filter((r) => {
    const val = getValue(r)
    return val !== null && val !== undefined && val !== ''
  })

  const total = validResponses.length

  if (total === 0) {
    return (
      <div className='overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm'>
        <div className='border-b border-outline-variant/20 bg-surface-container-low px-6 py-4'>
          <h4 className='text-lg font-semibold text-on-surface'>{label}</h4>
          <p className='mt-1 text-sm text-on-surface-variant'>Sin respuestas</p>
        </div>
        <div className='p-6'>
          <p className='text-center text-on-surface-variant'>
            No hay datos disponibles
          </p>
        </div>
      </div>
    )
  }

  // Renderizar según el tipo detectado
  const renderContent = () => {
    switch (detectedType) {
      case 'number': {
        // Agrupar valores numéricos
        const frecuencias: { [key: string]: number } = {}
        validResponses.forEach((r) => {
          const val = getValue(r)
          if (typeof val === 'number') {
            frecuencias[val] = (frecuencias[val] || 0) + 1
          }
        })

        const chartData = Object.entries(frecuencias).map(([value, count]) => ({
          label: value,
          count,
        }))

        return (
          <StackedBarChart
            data={chartData}
            total={total}
            title={`Total: ${total} respuestas`}
          />
        )
      }

      case 'multiple': {
        // Procesar respuestas de selección múltiple (booleanos o categorías)
        const frecuencias: { [key: string]: number } = {}
        validResponses.forEach((r) => {
          let val = getValue(r)
          // Convertir booleanos a texto
          if (typeof val === 'boolean') {
            val = val ? 'Sí' : 'No'
          }
          frecuencias[val] = (frecuencias[val] || 0) + 1
        })

        const chartData = Object.entries(frecuencias).map(([label, count]) => ({
          label,
          count,
        }))

        return (
          <StackedBarChart
            data={chartData}
            total={total}
            title={`Total: ${total} respuestas`}
          />
        )
      }

      case 'text': {
        const uniqueValues = [
          ...new Set(validResponses.map((r) => getValue(r))),
        ]
        return (
          <TextList
            items={uniqueValues}
            title={`Total: ${total} respuestas (${uniqueValues.length} únicas)`}
          />
        )
      }

      default:
        return null
    }
  }

  return (
    <div className='overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm'>
      <div className='border-b border-outline-variant/20 bg-surface-container-low px-6 py-4'>
        <h4 className='text-lg font-semibold text-on-surface'>{label}</h4>
      </div>
      <div className='p-6'>{renderContent()}</div>
    </div>
  )
}

export default ResponseRenderer
