function PercentageBarChart({
  data,
  total,
  title,
}: {
  data: { label: string; count: number }[]
  total: number
  title?: string
}) {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-info',
    'bg-warning',
    'bg-error',
    'bg-success',
  ]

  return (
    <div className='space-y-4'>
      {title && <p className='text-sm text-on-surface-variant'>{title}</p>}

      <div className='flex h-8 w-full overflow-hidden rounded-full bg-surface-container-low'>
        {data.map((item, idx) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0
          return (
            <div
              key={idx}
              className={`${colors[idx % colors.length]} transition-all`}
              style={{ width: `${percentage}%` }}
              title={`${item.label}: ${percentage.toFixed(1)}%`}
            />
          )
        })}
      </div>

      {/* Leyenda */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {data.map((item, idx) => {
          const percentage =
            total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
          return (
            <div key={idx} className='flex items-center gap-2 text-sm'>
              <div
                className={`h-3 w-3 rounded-full ${colors[idx % colors.length]}`}
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
export default PercentageBarChart
