import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export const BarChartComponent = ({
  data,
  title,
  showLegend = false,
}: {
  data: { label: string; value: number }[]
  title?: string
  showLegend?: boolean
}) => {
  return (
    <div className='space-y-4'>
      {title && <p className='text-sm text-on-surface-variant'>{title}</p>}
      <ResponsiveContainer width='100%' height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='label' />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          <Bar dataKey='value' fill='#3B82F6' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Gráfico de barras apiladas para porcentajes
export const StackedBarChart = ({
  data,
  total,
  title,
}: {
  data: { label: string; count: number }[]
  total: number
  title?: string
}) => {
  const chartData = [
    {
      name: 'Respuestas',
      ...Object.fromEntries(
        data.map((item) => [item.label, (item.count / total) * 100]),
      ),
    },
  ]

  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
  ]

  return (
    <div className='space-y-4'>
      {title && <p className='text-sm text-on-surface-variant'>{title}</p>}
      <ResponsiveContainer width='100%' height={300}>
        <BarChart
          data={chartData}
          layout='horizontal'
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis type='number' domain={[0, 100]} unit='%' />
          <YAxis type='category' dataKey='name' />
          <Tooltip
            formatter={(value) => {
              const numericValue = Number(value)

              return Number.isFinite(numericValue)
                ? `${numericValue.toFixed(1)}%`
                : String(value)
            }}
          />
          <Legend />
          {data.map((item, idx) => (
            <Bar
              key={item.label}
              dataKey={item.label}
              stackId='stack'
              fill={colors[idx % colors.length]}
              radius={
                idx === 0
                  ? [4, 0, 0, 4]
                  : idx === data.length - 1
                    ? [0, 4, 4, 0]
                    : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-4'>
        {data.map((item, idx) => {
          const percentage =
            total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
          return (
            <div key={idx} className='flex items-center gap-2 text-sm'>
              <div
                className={`h-3 w-3 rounded-full`}
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className='font-medium text-on-surface'>{item.label}:</span>
              <span className='text-on-surface-variant'>
                {item.count} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Gráfico de pastel para campos binarios o pocas opciones
export const PieChartComponent = ({
  data,
  title,
  showLegend = false,
  compact = false,
}: {
  data: { label: string; value: number }[]
  title?: string
  showLegend?: boolean
  compact?: boolean
}) => {
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const chartData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
  }))

  return (
    <div className='space-y-4'>
      {title && <p className='text-sm text-on-surface-variant'>{title}</p>}
      <ResponsiveContainer width='100%' height={compact ? 220 : 300}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={({
              payload,
            }: {
              payload?: { label?: string; percentage?: string }
            }) => `${payload?.label ?? ''} (${payload?.percentage ?? '0.0'}%)`}
            outerRadius={compact ? 76 : 100}
            fill='#8884d8'
            dataKey='value'
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} respuestas`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {showLegend && (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-4'>
          {chartData.map((item, idx) => (
            <div key={idx} className='flex items-center gap-2 text-sm'>
              <div
                className={`h-3 w-3 rounded-full`}
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className='font-medium text-on-surface'>{item.label}:</span>
              <span className='text-on-surface-variant'>
                {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
