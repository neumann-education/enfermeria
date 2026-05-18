import { FormState } from './CafeteriaSupervisionTypes'

type BooleanField = Exclude<
  keyof FormState,
  'fecha' | 'hora' | 'concesionario' | 'supervisor' | 'observaciones'
>

type CafeteriaSupervisionFormProps = {
  form: FormState
  errors?: Partial<Record<keyof FormState, boolean>>
  onInputChange: (key: keyof FormState, value: string | boolean) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent) => void
  isEdit?: boolean
  isSaving?: boolean
  isReadOnly?: boolean
}

const formatPeriodoInput = (value: string) => {
  const normalized = value.toUpperCase().replace(/[^0-9IVXLCDM\- ]/g, '')
  const digits = normalized.replace(/[^0-9]/g, '').slice(0, 4)
  const hasExplicitSeparator = normalized.includes('-')

  let romanPart = ''
  if (hasExplicitSeparator) {
    const afterSeparator = normalized.split('-').slice(1).join('-')
    romanPart = afterSeparator.replace(/[^IVXLCDM]/g, '').slice(0, 4)
  } else if (digits.length === 4) {
    const afterDigitsIndex = normalized.indexOf(digits) + digits.length
    const afterDigits = normalized.slice(afterDigitsIndex)
    romanPart = afterDigits.replace(/[^IVXLCDM]/g, '').slice(0, 4)
  }

  if (!digits) {
    return ''
  }

  if (digits.length < 4 && !romanPart) {
    return digits
  }

  if (digits.length === 4 && !romanPart) {
    return `${digits} - `
  }

  if (romanPart) {
    return `${digits} - ${romanPart}`
  }

  return digits
}

function CafeteriaSupervisionForm({
  form,
  errors,
  onInputChange,
  onCancel,
  onSubmit,
  isEdit,
  isSaving,
  isReadOnly = false,
}: CafeteriaSupervisionFormProps) {
  const radioGroup = (
    key: BooleanField,
    label: string,
    spanClass = 'md:col-span-2',
  ) => {
    const hasError = Boolean(errors?.[key])
    return (
      <fieldset
        className={`rounded-lg p-4 space-y-3 ${spanClass} ${
          hasError
            ? 'border-rose-500 ring-1 ring-rose-100'
            : 'border border-slate-200'
        }`}
      >
        <legend
          className={`text-sm font-semibold ${hasError ? 'text-rose-700' : ''}`}
        >
          {label}
        </legend>
        <div className='grid grid-cols-2 gap-3 max-w-lg'>
          {(['SI', 'NO'] as const).map((option) => {
            const value = option === 'SI'
            const isChecked = form[key] === value
            return (
              <label
                key={option}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold ${
                  isReadOnly ? 'cursor-default opacity-70' : 'cursor-pointer'
                } border transition-all ${
                  isChecked
                    ? 'bg-primary text-white border-primary'
                    : isReadOnly
                      ? 'bg-surface-container-low text-on-surface border-slate-200'
                      : 'bg-surface-container-low text-on-surface border-slate-200 hover:border-primary/70'
                }`}
                style={{ minWidth: '120px' }}
              >
                <input
                  type='radio'
                  name={`${String(key)}-${label}`}
                  checked={isChecked}
                  onChange={
                    isReadOnly ? undefined : () => onInputChange(key, value)
                  }
                  disabled={isReadOnly}
                  className='sr-only'
                />
                <span className='block'>{option}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6 space-y-4'>
        <nav className='text-sm text-on-surface-variant flex items-center gap-2'>
          <button onClick={onCancel} className='text-primary hover:underline'>
            Supervisiones
          </button>
          <span>›</span>
          <span className='font-semibold'>
            {isReadOnly
              ? 'Detalle supervisión'
              : isEdit
                ? 'Editar supervisión'
                : 'Crear supervisión'}
          </span>
        </nav>

        <div>
          <h2 className='text-3xl font-extrabold font-headline text-on-surface'>
            {isReadOnly
              ? 'Detalle supervisión de cafetería'
              : isEdit
                ? 'Editar supervisión de cafetería'
                : 'Nueva supervisión cafetería'}
          </h2>
          <p className='text-on-surface-variant mt-1'>
            {isReadOnly
              ? 'Vista de solo lectura. Cierra para volver al listado.'
              : isEdit
                ? 'Modifica los datos y guarda los cambios.'
                : 'Completa el formulario de supervisión.'}
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className='bg-white/50 border border-outline-variant/20 rounded-xl p-6 space-y-6 shadow-sm'
      >
        <section>
          <h3 className='text-lg font-bold mb-3'>I) Datos Generales</h3>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <label className='space-y-1'>
              <span className='text-sm font-semibold text-on-surface'>
                Fecha de supervisión
              </span>
              <input
                type='date'
                value={form.fecha}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) => onInputChange('fecha', e.target.value)
                }
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-xl transition-all text-on-surface placeholder:text-outline-variant focus:ring-2 ${
                  errors?.fecha
                    ? 'border border-rose-500 ring-1 ring-rose-100'
                    : 'border-none focus:ring-primary/20'
                }`}
                required
              />
            </label>
            <label className='space-y-1'>
              <span className='text-sm font-semibold text-on-surface'>
                Hora de supervisión
              </span>
              <input
                type='time'
                value={form.hora}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) => onInputChange('hora', e.target.value)
                }
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-xl transition-all text-on-surface placeholder:text-outline-variant focus:ring-2 ${
                  errors?.hora
                    ? 'border border-rose-500 ring-1 ring-rose-100'
                    : 'border-none focus:ring-primary/20'
                }`}
                required
              />
            </label>
            <label className='space-y-1'>
              <span className='text-sm font-semibold text-on-surface'>
                Periodo
              </span>
              <input
                type='text'
                value={form.periodo}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) =>
                        onInputChange(
                          'periodo',
                          formatPeriodoInput(e.target.value),
                        )
                }
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                placeholder='2026 - I'
                className={`w-full px-4 py-3 bg-surface-container-low rounded-xl transition-all text-on-surface placeholder:text-outline-variant focus:ring-2 ${
                  errors?.periodo
                    ? 'border border-rose-500 ring-1 ring-rose-100'
                    : 'border-none focus:ring-primary/20'
                }`}
                required
              />
            </label>
            <label className='space-y-1 md:col-span-2'>
              <span className='text-sm font-semibold text-on-surface'>
                Nombre del concesionario
              </span>
              <input
                type='text'
                value={form.concesionario}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) => onInputChange('concesionario', e.target.value)
                }
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-xl transition-all text-on-surface placeholder:text-outline-variant focus:ring-2 ${
                  errors?.concesionario
                    ? 'border border-rose-500 ring-1 ring-rose-100'
                    : 'border-none focus:ring-primary/20'
                }`}
                required
                placeholder='Ej: Concesionario Yael'
              />
            </label>
            <label className='space-y-1 md:col-span-2'>
              <span className='text-sm font-semibold text-on-surface'>
                Nombre completo del supervisor
              </span>
              <input
                type='text'
                value={form.supervisor}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) => onInputChange('supervisor', e.target.value)
                }
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-xl transition-all text-on-surface placeholder:text-outline-variant focus:ring-2 ${
                  errors?.supervisor
                    ? 'border border-rose-500 ring-1 ring-rose-100'
                    : 'border-none focus:ring-primary/20'
                }`}
                required
                placeholder='Ej: María Pérez'
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>
            II) Higiene y Seguridad Alimentaria
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {radioGroup(
              'higieneBasica',
              'Personal cumple higiene y seguridad alimentaria? (manos limpias, uñas cortas, guantes, mascarilla, gorro, mandil).',
            )}
            {radioGroup(
              'limpiezaAmbiente',
              'Limpieza del ambiente y servicio (lugar limpio, sin basura visible, tacho con tapa, vías de circulación).',
            )}
            {radioGroup(
              'signosETA',
              'Personal presenta signos de ETA (ictericia, vómitos, dolor de garganta, fiebre, heridas).',
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>
            III) Calidad del Servicio y Alimentos
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {radioGroup(
              'calidadVariado',
              'Ofrecen alimentos variados (naturales, artesanales, industriales, bebidas).',
            )}
            {radioGroup(
              'fechaVencimiento',
              'Productos con fecha de vencimiento vigente y visible.',
            )}
            {radioGroup(
              'conservacionAlimentos',
              'Alimentos protegidos y conservados correctamente.',
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>IV) Atención al Cliente</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {radioGroup(
              'amabilidad',
              'Amabilidad y cortesía del personal (saludan, sonríen, son atentos, rápidos).',
            )}
            {radioGroup(
              'tiempoServicio',
              'Tiempo de servicio adecuado (atención en menos de 5 minutos).',
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>
            V) Precios y Competitividad
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {radioGroup('calidadPrecio', 'Relación calidad-precio adecuada.')}
            {radioGroup(
              'preciosCompetitivos',
              'Precios competitivos respecto a establecimientos similares.',
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>
            VI) Sostenibilidad y Responsabilidad Social
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {radioGroup(
              'productosLocales',
              'Se ofrecen productos locales u orgánicos?',
            )}
            {radioGroup(
              'reciclaResiduos',
              'Se recicla residuos (botellas plásticas, etc.)?',
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>
            VII) Infraestructura y Equipamiento
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
            {radioGroup(
              'estadoEquipamiento',
              'Evalúe el estado de conservación del equipamiento y mobiliario.',
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>
            VIII) Observaciones / Recomendaciones
          </h3>
          <textarea
            value={form.observaciones}
            onChange={
              isReadOnly
                ? undefined
                : (e) => onInputChange('observaciones', e.target.value)
            }
            disabled={isReadOnly}
            className={`w-full h-32 rounded-lg border border-slate-200 p-3 resize-none ${
              isReadOnly ? 'opacity-70' : ''
            }`}
            placeholder='Anota observaciones o recomendaciones...'
          />
        </section>

        <section>
          <h3 className='text-lg font-bold mb-3'>Estado de la supervisión</h3>
          <fieldset className='flex items-center gap-4'>
            {['Aprobado', 'No aprobado'].map((value) => {
              const isChecked = form.aprobado === value
              const base = isReadOnly
                ? 'cursor-default opacity-70'
                : 'cursor-pointer'
              const colorClasses =
                value === 'Aprobado'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-rose-100 text-rose-700 border-rose-200'

              return (
                <label
                  key={String(value)}
                  className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold ${base} border transition-all ${isChecked ? colorClasses : 'bg-surface-container-low text-on-surface border-slate-200 hover:border-primary/70'}`}
                  style={{ minWidth: 160 }}
                >
                  <input
                    type='radio'
                    name='aprobado'
                    value={String(value)}
                    checked={isChecked}
                    onChange={
                      isReadOnly
                        ? undefined
                        : () => onInputChange('aprobado', String(value))
                    }
                    disabled={isReadOnly}
                    className='sr-only'
                  />
                  <span>{String(value)}</span>
                </label>
              )
            })}
          </fieldset>
        </section>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 rounded-lg border border-slate-300 text-on-surface-variant hover:bg-surface-container-high transition'
          >
            {isReadOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button
              type='submit'
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl font-bold transition ${
                isSaving
                  ? 'bg-slate-300 text-slate-700 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isSaving ? 'Guardando...' : 'Guardar supervisión'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CafeteriaSupervisionForm
