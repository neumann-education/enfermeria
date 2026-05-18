import { CafeteriaSupervisionRecord } from './CafeteriaSupervisionTypes'

type CafeteriaSupervisionListProps = {
  records: CafeteriaSupervisionRecord[]
  isLoading?: boolean
  onCreate: () => void
  onEdit: (record: CafeteriaSupervisionRecord) => void
  onView?: (record: CafeteriaSupervisionRecord) => void
  onDelete: (id: string) => void
}

function CafeteriaSupervisionList({
  records,
  isLoading = false,
  onCreate,
  onView,
  onDelete,
}: CafeteriaSupervisionListProps) {
  return (
    <div className='space-y-6'>
      <section className='rounded-[32px] border border-outline-variant/20 bg-white/95 shadow-sm p-6'>
        <h3 className='text-xl font-bold mb-4'>Listado de supervisiones</h3>
        {!records.length ? (
          <div className='rounded-3xl border border-dashed border-outline-variant/20 bg-surface-container-low px-6 py-12 text-center'>
            <p className='text-sm font-semibold text-on-surface'>
              {isLoading
                ? 'Cargando supervisiones...'
                : 'Aún no hay registros. Inicia una supervisión.'}
            </p>
            {!isLoading && (
              <button
                type='button'
                onClick={onCreate}
                className='mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition'
              >
                <span className='material-symbols-outlined text-base'>add</span>
                Crear supervisión
              </button>
            )}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='bg-surface-container-high'>
                <tr>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Fecha
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Hora
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Periodo
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Concesionario
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Supervisor
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Estado
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Registrado
                  </th>
                  <th className='px-4 py-2 text-xs font-bold uppercase tracking-wider'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {records.map((record) => {
                  const totalSi = [
                    record.higieneBasica,
                    record.limpiezaAmbiente,
                    record.signosETA,
                    record.calidadVariado,
                    record.fechaVencimiento,
                    record.conservacionAlimentos,
                    record.amabilidad,
                    record.tiempoServicio,
                    record.calidadPrecio,
                    record.preciosCompetitivos,
                    record.productosLocales,
                    record.reciclaResiduos,
                    record.estadoEquipamiento,
                  ].filter(Boolean).length

                  const estado = record.aprobado
                    ? record.aprobado
                    : totalSi >= 10
                      ? 'Aprobado'
                      : 'Revisar'

                  return (
                    <tr
                      key={record.id}
                      className='hover:bg-slate-50/70 transition'
                    >
                      <td className='px-4 py-3'>{record.fecha}</td>
                      <td className='px-4 py-3'>{record.hora}</td>
                      <td className='px-4 py-3'>{record.periodo}</td>
                      <td className='px-4 py-3'>{record.concesionario}</td>
                      <td className='px-4 py-3'>{record.supervisor}</td>
                      <td className='px-4 py-3'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            estado === 'Aprobado'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className='px-4 py-3'>{record.registradoEn}</td>
                      <td className='px-4 py-3 space-x-2 flex items-center'>
                        <button
                          type='button'
                          onClick={() => onView && onView(record)}
                          title='Ver supervisión'
                          className='inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-on-surface hover:bg-surface-container-high transition'
                        >
                          <span className='material-symbols-outlined text-base'>
                            visibility
                          </span>
                        </button>
                        {/* <button
                          type='button'
                          onClick={() => onEdit(record)}
                          title='Editar supervisión'
                          className='inline-flex items-center justify-center w-10 h-10 rounded-lg border border-primary text-primary hover:bg-primary/10 transition'
                        >
                          <span className='material-symbols-outlined text-base'>
                            edit
                          </span>
                        </button> */}
                        <button
                          type='button'
                          onClick={() => onDelete(record.id)}
                          title='Eliminar supervisión'
                          className='inline-flex items-center justify-center w-10 h-10 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-100 transition'
                        >
                          <span className='material-symbols-outlined text-base'>
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default CafeteriaSupervisionList
