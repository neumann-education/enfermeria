export const normalizeSexCode = (value?: string | null) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (normalized === 'm' || normalized.startsWith('masc')) {
    return 'M'
  }

  if (normalized === 'f' || normalized.startsWith('fem')) {
    return 'F'
  }

  return String(value || '').trim()
}

export const normalizeSexLabel = (value?: string | null) => {
  const code = normalizeSexCode(value).toUpperCase()
  if (code === 'M') return 'Masculino'
  if (code === 'F') return 'Femenino'
  return String(value || '').trim()
}

export const isMaleSex = (value?: string | null) => {
  const code = normalizeSexCode(value).toUpperCase()
  return code === 'M'
}
