import { BarChartComponent, PieChartComponent } from '../BarChart'
import TextList from '../TextList'
const mapValue = (value: any, fieldType?: string): string => {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  const strValue = String(value).trim().toUpperCase()

  // Mapeo de sexo
  if (fieldType === 'sexo') {
    if (strValue === 'M') return 'Masculino'
    if (strValue === 'F') return 'Femenino'
  }

  return String(value).trim()
}
export const renderTextField = (label: string, values: string[]) => {
  const uniqueValues = [...new Set(values.filter((v) => v && v.trim() !== ''))]
  const total = values.filter((v) => v && v.trim() !== '').length

  if (total === 0) return null

  return (
    <div className='overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm'>
      <div className='border-b border-outline-variant/20 bg-surface-container-low px-6 py-4'>
        <h4 className='text-lg font-semibold text-on-surface'>{label}</h4>
      </div>
      <div className='p-6'>
        <TextList
          items={uniqueValues}
          title={`Total: ${total} respuestas (${uniqueValues.length} únicas)`}
        />
      </div>
    </div>
  )
}

// Función para renderizar campos de selección múltiple (StackedBarChart o PieChart)
export const renderMultipleField = (
  label: string,
  values: (string | boolean | null)[],
  fieldType?: string,
) => {
  const validValues = values
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map((v) => mapValue(v, fieldType))
    .filter((v) => v !== '')

  const total = validValues.length

  if (total === 0) return null

  const frecuencias: { [key: string]: number } = {}
  validValues.forEach((val) => {
    frecuencias[val] = (frecuencias[val] || 0) + 1
  })

  const chartData = Object.entries(frecuencias).map(([label, count]) => ({
    label,
    value: count,
  }))

  // Detectar si es un campo binario (2 o menos opciones únicas)
  const isBinaryField = Object.keys(frecuencias).length <= 2

  return (
    <div className='overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm'>
      <div className='border-b border-outline-variant/20 bg-surface-container-low px-6 py-4'>
        <h4 className='text-lg font-semibold text-on-surface'>{label}</h4>
      </div>
      <div className='p-6'>
        {isBinaryField ? (
          <PieChartComponent
            data={chartData}
            title={`Total: ${total} respuestas`}
          />
        ) : (
          <BarChartComponent
            data={chartData}
            title={`Total: ${total} respuestas`}
          />
        )}
      </div>
    </div>
  )
}

// Función para renderizar campos numéricos (BarChartComponent)
export const renderNumberField = (
  label: string,
  values: (number | null | undefined)[],
) => {
  const validValues = values.filter((v) => typeof v === 'number')
  const total = validValues.length

  if (total === 0) return null

  const frecuencias: { [key: string]: number } = {}
  validValues.forEach((val) => {
    if (typeof val === 'number') {
      frecuencias[String(val)] = (frecuencias[String(val)] || 0) + 1
    }
  })

  const chartData = Object.entries(frecuencias).map(([label, value]) => ({
    label,
    value,
  }))

  return (
    <div className='overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm'>
      <div className='border-b border-outline-variant/20 bg-surface-container-low px-6 py-4'>
        <h4 className='text-lg font-semibold text-on-surface'>{label}</h4>
      </div>
      <div className='p-6'>
        <BarChartComponent
          data={chartData}
          title={`Total: ${total} respuestas`}
        />
      </div>
    </div>
  )
}
