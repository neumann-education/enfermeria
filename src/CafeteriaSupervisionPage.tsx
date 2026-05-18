import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import Layout from './Layout'

import { cafeteriaService } from './services/cafeteriaService'
import CafeteriaSupervisionList from './CafeteriaSupervisionList'
import {
  CafeteriaSupervisionRecord,
  FormState,
  initialFormState,
} from './CafeteriaSupervisionTypes'
import CafeteriaSupervisionForm from './CafeteriaSupervisionForm'

function CafeteriaSupervisionPage() {
  const [records, setRecords] = useState<CafeteriaSupervisionRecord[]>([])
  const [form, setForm] = useState<FormState>(initialFormState)
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [recordToDelete, setRecordToDelete] =
    useState<CafeteriaSupervisionRecord | null>(null)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({})

  const handleInputChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: false }))
  }

  const formatDateForMemory = (value: string) => {
    const trimmed = String(value || '').trim()
    if (!trimmed) return ''
    const parts = trimmed.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return trimmed
  }

  const formatTimeForMemory = (value: string) => {
    const trimmed = String(value || '').trim()
    if (!trimmed) return ''
    const parts = trimmed.split(':')
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
    }
    return trimmed
  }

  const formatDateForInput = (value: string) => {
    const trimmed = String(value || '').trim()
    const parts = trimmed.split('/')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
    return trimmed
  }

  const formatTimeForInput = (value: string) => {
    const trimmed = String(value || '').trim()
    const parts = trimmed.split(':')
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
    }
    return trimmed
  }

  const loadSupervisions = async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const supervisionRecords = await cafeteriaService.listSupervisions()
      setRecords(supervisionRecords)
    } catch (error) {
      setLoadError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    loadSupervisions()
  }, [])

  const totalRecords = records.length
  const approvedCount = records.filter(
    (record) => record.aprobado === 'Aprobado',
  ).length
  const lastRegistered = records[0]?.registradoEn || null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const requiredTextFields: (keyof FormState)[] = [
      'fecha',
      'hora',
      'concesionario',
      'supervisor',
      'periodo',
    ]

    const newErrors: Partial<Record<keyof FormState, boolean>> = {}

    requiredTextFields.forEach((key) => {
      if (!String(form[key] || '').trim()) {
        newErrors[key] = true
      }
    })

    const allBooleans: (keyof FormState)[] = [
      'higieneBasica',
      'limpiezaAmbiente',
      'signosETA',
      'calidadVariado',
      'fechaVencimiento',
      'conservacionAlimentos',
      'amabilidad',
      'tiempoServicio',
      'calidadPrecio',
      'preciosCompetitivos',
      'productosLocales',
      'reciclaResiduos',
      'estadoEquipamiento',
    ]

    if (allBooleans.some((key) => form[key] === null)) {
      allBooleans.forEach((key) => {
        if (form[key] === null) {
          newErrors[key] = true
        }
      })
    }

    if (Object.keys(newErrors).length > 0) {
      toast.error('Completa los campos obligatorios.')
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    setErrors({})

    try {
      const now = new Date().toLocaleString('es-PE')

      const formattedFecha = formatDateForMemory(form.fecha)
      const formattedHora = formatTimeForMemory(form.hora)

      if (mode === 'edit' && editingId !== null) {
        const result = await cafeteriaService.updateSupervision({
          id: editingId,
          ...form,
        })
        setRecords((prev) =>
          prev.map((record) =>
            record.id === editingId
              ? {
                  ...record,
                  ...form,
                  fecha: formattedFecha,
                  hora: formattedHora,
                  registradoEn:
                    record.registradoEn || String(result.timestamp || now),
                }
              : record,
          ),
        )
        toast.success('Supervisión actualizada correctamente.')
        setEditingId(null)
      } else {
        const result = await cafeteriaService.createSupervision(form)
        const newId = String(result.id || '')
        const registeredAt = String(result.timestamp || now)
        const nuevoRegistro: CafeteriaSupervisionRecord = {
          id: newId,
          ...form,
          fecha: formattedFecha,
          hora: formattedHora,
          registradoEn: registeredAt,
        }
        setRecords((prev) => [nuevoRegistro, ...prev])
        toast.success('Supervisión guardada correctamente.')
      }

      setForm(initialFormState)
      setMode('list')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (record: CafeteriaSupervisionRecord) => {
    setForm({
      fecha: formatDateForInput(record.fecha),
      hora: formatTimeForInput(record.hora),
      periodo: record.periodo,
      concesionario: record.concesionario,
      supervisor: record.supervisor,
      higieneBasica: record.higieneBasica,
      limpiezaAmbiente: record.limpiezaAmbiente,
      signosETA: record.signosETA,
      calidadVariado: record.calidadVariado,
      fechaVencimiento: record.fechaVencimiento,
      conservacionAlimentos: record.conservacionAlimentos,
      amabilidad: record.amabilidad,
      tiempoServicio: record.tiempoServicio,
      calidadPrecio: record.calidadPrecio,
      preciosCompetitivos: record.preciosCompetitivos,
      productosLocales: record.productosLocales,
      reciclaResiduos: record.reciclaResiduos,
      estadoEquipamiento: record.estadoEquipamiento,
      observaciones: record.observaciones,
      aprobado: record.aprobado || '',
    })
    setEditingId(record.id)
    setMode('edit')
  }

  const handleView = (record: CafeteriaSupervisionRecord) => {
    setForm({
      fecha: formatDateForInput(record.fecha),
      hora: formatTimeForInput(record.hora),
      periodo: record.periodo,
      concesionario: record.concesionario,
      supervisor: record.supervisor,
      higieneBasica: record.higieneBasica,
      limpiezaAmbiente: record.limpiezaAmbiente,
      signosETA: record.signosETA,
      calidadVariado: record.calidadVariado,
      fechaVencimiento: record.fechaVencimiento,
      conservacionAlimentos: record.conservacionAlimentos,
      amabilidad: record.amabilidad,
      tiempoServicio: record.tiempoServicio,
      calidadPrecio: record.calidadPrecio,
      preciosCompetitivos: record.preciosCompetitivos,
      productosLocales: record.productosLocales,
      reciclaResiduos: record.reciclaResiduos,
      estadoEquipamiento: record.estadoEquipamiento,
      observaciones: record.observaciones,
      aprobado: record.aprobado || '',
    })
    setEditingId(record.id)
    setMode('view')
  }

  const handleDeleteRequest = (id: string) => {
    const record = records.find((item) => item.id === id) || null
    setRecordToDelete(record)
  }

  const handleCancelDelete = () => {
    setRecordToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete) {
      return
    }

    setIsDeleting(true)
    try {
      await cafeteriaService.deleteSupervision(recordToDelete.id)
      setRecords((prev) =>
        prev.filter((record) => record.id !== recordToDelete.id),
      )
      toast.success('Supervisión eliminada correctamente.')
      setRecordToDelete(null)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Layout activeView='cafeteria' title='Supervisión Cafetería'>
      <div className='space-y-6'>
        {mode === 'list' ? (
          <>
            {loadError && (
              <div className='rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700'>
                {loadError}
              </div>
            )}

            <section className='grid gap-6 xl:grid-cols-[1.4fr_0.8fr]'>
              <div className='rounded-[32px] border border-outline-variant/20 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.05)]'>
                <div className='inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm'>
                  <span className='material-symbols-outlined text-xl'>
                    restaurant_menu
                  </span>
                  Supervisión de cafetería
                </div>
                <h1 className='mt-6 text-4xl font-extrabold tracking-tight text-on-surface'>
                  Control elegante y rápido de inspecciones
                </h1>
                <p className='mt-4 max-w-2xl text-base leading-7 text-on-surface-variant'>
                  Administra registros, exporta resultados y revisa el estado de
                  cada supervisión desde un panel claro y moderno.
                </p>
                <div className='mt-8 grid gap-4 sm:grid-cols-2'>
                  <div className='rounded-3xl bg-white/95 border border-outline-variant/20 p-6 shadow-sm'>
                    <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                      Registros totales
                    </p>
                    <p className='mt-3 text-3xl font-bold text-primary'>
                      {totalRecords}
                    </p>
                  </div>
                  <div className='rounded-3xl bg-white/95 border border-outline-variant/20 p-6 shadow-sm'>
                    <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                      Aprobados
                    </p>
                    <p className='mt-3 text-3xl font-bold text-secondary'>
                      {approvedCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
                <div className='flex items-center justify-between gap-4'>
                  <div>
                    <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
                      Crear nueva supervisión
                    </p>
                    <p className='mt-2 text-sm text-on-surface-variant'>
                      Inicia una nueva inspección con un solo clic.
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => setMode('create')}
                    className='inline-flex items-center gap-2 rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition'
                  >
                    <span className='material-symbols-outlined'>add</span>
                    Crear nueva supervisión
                  </button>
                </div>
                <div className='mt-6 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-5'>
                  <p className='text-sm text-on-surface-variant'>
                    Último registro:{' '}
                    <span className='font-semibold text-on-surface'>
                      {lastRegistered ?? 'Sin registros'}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <CafeteriaSupervisionList
              records={records}
              isLoading={isLoading}
              onCreate={() => setMode('create')}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDeleteRequest}
            />
          </>
        ) : (
          <CafeteriaSupervisionForm
            form={form}
            errors={errors}
            onInputChange={handleInputChange}
            onCancel={() => {
              setForm(initialFormState)
              setEditingId(null)
              setErrors({})
              setMode('list')
            }}
            onSubmit={handleSubmit}
            isEdit={mode === 'edit'}
            isSaving={isSaving}
            isReadOnly={mode === 'view'}
          />
        )}
      </div>

      {recordToDelete &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4'>
            <div className='w-full max-w-md rounded-[32px] bg-white border border-slate-200 p-6 shadow-2xl'>
              <div className='flex items-center justify-between gap-4 pb-4 border-b border-slate-200'>
                <div>
                  <h2 className='text-xl font-bold text-on-surface'>
                    Confirmar eliminación
                  </h2>
                  <p className='text-sm text-on-surface-variant'>
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <button
                  type='button'
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50'
                  aria-label='Cerrar'
                >
                  <span className='material-symbols-outlined'>close</span>
                </button>
              </div>
              <p className='mt-6 text-sm text-on-surface'>
                ¿Estás seguro de que deseas eliminar la supervisión de{' '}
                <strong>{recordToDelete.concesionario}</strong> del periodo{' '}
                <strong>{recordToDelete.periodo}</strong>?
              </p>
              <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className='rounded-3xl border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className='rounded-3xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar supervisión'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Layout>
  )
}

export default CafeteriaSupervisionPage
