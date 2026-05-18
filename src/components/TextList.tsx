function TextList({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className='space-y-2'>
      {title && <p className='text-sm text-on-surface-variant'>{title}</p>}
      <div className='max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
        {items.map((item, idx) => (
          <div
            key={idx}
            className='bg-surface-container-low rounded-lg px-4 py-2 text-sm font-medium text-on-surface'
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
export default TextList
