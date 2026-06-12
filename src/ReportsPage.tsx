import ExcelJS from 'exceljs'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppData } from './AppDataContext'
import { DEFAULT_ACADEMIC_PERIOD } from './constants/academicPeriod'
import { BarChartComponent, PieChartComponent } from './components/BarChart'
import Layout from './Layout'
import { consultaService } from './services/consultaService'

const MONTHS_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

const parseAttendanceDate = (value: string) => {
  const normalized = String(value || '').trim()
  if (!normalized) return null

  const dmy = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2]) - 1
    const year = Number(dmy[3])
    const date = new Date(year, month, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const iso = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const year = Number(iso[1])
    const month = Number(iso[2]) - 1
    const day = Number(iso[3])
    const date = new Date(year, month, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const normalizeSex = (value: string) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (normalized === 'm' || normalized.startsWith('masc')) return 'Masculino'
  if (normalized === 'f' || normalized.startsWith('fem')) return 'Femenino'
  return 'No definido'
}

const buildMonthlySeries = (attendances: any[], monthsBack: number) => {
  const now = new Date()
  const series: { label: string; value: number; key: string }[] = []
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`
    series.push({ key, label, value: 0 })
  }

  const lookup = series.reduce<Record<string, number>>((acc, item, idx) => {
    acc[item.key] = idx
    return acc
  }, {})

  attendances.forEach((attendance) => {
    const date = parseAttendanceDate(attendance.fechaAtencion)
    if (!date) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const index = lookup[key]
    if (index !== undefined) {
      series[index].value += 1
    }
  })

  return series.map((item) => ({ label: item.label, value: item.value }))
}

const REPORT_DATE_RANGE_OPTIONS = [
  'Todos',
  'Últimos 7 días',
  'Este mes',
  'Semestre actual',
  'Personalizado',
] as const

type ReportDateRangeOption = (typeof REPORT_DATE_RANGE_OPTIONS)[number]
type ReportKind = 'gestantes' | 'discapacidad' | 'consultas' | 'usuarios'

const createReportFilterState = () => ({
  gestantesStartDate: '',
  gestantesEndDate: '',
  gestantesWithoutCurrentPeriodFollowUps: false,
  discapacidadStartDate: '',
  discapacidadEndDate: '',
  discapacidadWithoutCurrentPeriodFollowUps: false,
  consultasDateRange: 'Todos' as ReportDateRangeOption,
  consultasStartDate: '',
  consultasEndDate: '',
  consultasOnlyFollowUps: true,
  consultasRol: 'Todos' as 'Todos' | 'Estudiantes' | 'Administrativos',
  consultasCiclo: 'Todos',
  consultasPrograma: 'Todos',
  consultasPeriodo: 'Todos',
  usuariosRol: 'Todos' as 'Todos' | 'Admin' | 'Estudiantes',
  usuariosCarrera: 'Todos',
  usuariosCiclo: 'Todos',
  usuariosSexo: 'Todos',
})

const collectDistinctValues = (values: Array<string | undefined | null>) =>
  Array.from(
    new Set(
      values
        .map((value) => String(value || '').trim())
        .filter((value) => Boolean(value)),
    ),
  ).sort((left, right) => left.localeCompare(right, 'es'))

function ReportsPage() {
  const navigate = useNavigate()
  const {
    users,
    usersLoading,
    attendances,
    attendancesLoading,
    refreshUsers,
    refreshAttendances,
  } = useAppData()
  const [range, setRange] = useState<'6m' | '12m'>('6m')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [reportModalKind, setReportModalKind] = useState<ReportKind | null>(
    null,
  )
  const [reportFilters, setReportFilters] = useState(createReportFilterState)

  useEffect(() => {
    if (!usersLoading && users.length === 0) {
      refreshUsers()
    }
    if (!attendancesLoading && attendances.length === 0) {
      refreshAttendances()
    }
  }, [
    usersLoading,
    attendancesLoading,
    users.length,
    attendances.length,
    refreshUsers,
    refreshAttendances,
  ])

  const totalAttendances = attendances.length
  const totalUsers = users.length

  const statusCounts = useMemo(() => {
    const counts = {
      finalizado: 0,
      seguimiento: 0,
      derivado: 0,
      otros: 0,
    }
    attendances.forEach((attendance) => {
      const status = String(attendance.resultado || '').toLowerCase()
      if (status.includes('finalizado')) counts.finalizado += 1
      else if (status.includes('seguimiento')) counts.seguimiento += 1
      else if (status.includes('derivado')) counts.derivado += 1
      else counts.otros += 1
    })
    return counts
  }, [attendances])

  const userTypeCounts = useMemo(() => {
    const counts = { estudiantes: 0, administrativos: 0, otros: 0 }
    attendances.forEach((attendance) => {
      const type = String(attendance.userType || '').toLowerCase()
      if (type.includes('estudiante')) counts.estudiantes += 1
      else if (type.includes('administr')) counts.administrativos += 1
      else counts.otros += 1
    })
    return counts
  }, [attendances])

  const areaSeries = useMemo(
    () => buildMonthlySeries(attendances, range === '6m' ? 6 : 12),
    [attendances, range],
  )

  const sexoData = useMemo(() => {
    const counts: Record<string, number> = {}
    users.forEach((user) => {
      const label = normalizeSex(user.sexo || '')
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts).map(([label, value]) => ({ label, value }))
  }, [users])

  const areaProblematicaData = useMemo(() => {
    const counts: Record<string, number> = {}
    attendances.forEach((attendance) => {
      const label =
        String(attendance.areaProblematica || 'Sin área').trim() || 'Sin área'
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [attendances])

  const facultyBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    attendances.forEach((attendance) => {
      const label =
        String(attendance.programa || 'Sin programa').trim() || 'Sin programa'
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [attendances])

  const availablePrograms = useMemo(
    () =>
      collectDistinctValues(
        attendances.map((attendance) => attendance.programa),
      ),
    [attendances],
  )
  const availablePeriods = useMemo(
    () =>
      collectDistinctValues(
        attendances.map((attendance) => attendance.periodo),
      ),
    [attendances],
  )
  const availableCareers = useMemo(
    () => collectDistinctValues(users.map((user) => user.carrera)),
    [users],
  )
  const availableCycles = useMemo(
    () => collectDistinctValues(users.map((user) => user.ciclo)),
    [users],
  )
  const availableSexes = useMemo(
    () => collectDistinctValues(users.map((user) => user.sexo || '')),
    [users],
  )

  const openReportModal = (kind: ReportKind) => {
    setReportModalKind(kind)
    setReportFilters(createReportFilterState())
  }

  const closeReportModal = () => {
    setReportModalKind(null)
  }

  const applyAllBorders = (worksheet: ExcelJS.Worksheet) => {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    })
  }

  const downloadConsultasExcel = async (
    data: any[],
    filename: string,
  ): Promise<boolean> => {
    if (!data || data.length === 0) {
      toast.error('No hay datos para descargar')
      return false
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Consultas')

    const headers = [
      { key: 'orden', label: 'Orden' },
      { key: 'fechaAtencion', label: 'Fecha atencion' },
      { key: 'horaSalida', label: 'Hora de salida' },
      { key: 'horaAtencion', label: 'Hora atencion' },
      { key: 'nombreCompleto', label: 'Nombre completo' },
      { key: 'dni', label: 'DNI' },
      { key: 'programa', label: 'Programa' },
      { key: 'ciclo', label: 'Ciclo' },
      { key: 'periodo', label: 'Periodo' },
      { key: 'seccion', label: 'Seccion' },
      { key: 'motivoAtencion', label: 'Motivo de atencion' },
      { key: 'areaProblematica', label: 'Area problematica' },
      { key: 'resultado', label: 'Resultado' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'correoElectronico', label: 'Correo electronico' },
      { key: 'userType', label: 'Tipo usuario' },
    ]

    worksheet.columns = headers.map((header) => ({
      header: header.label,
      key: header.key,
      width: Math.min(40, Math.max(12, header.label.length + 2)),
    }))

    data.forEach((row) => {
      const values: Record<string, string> = {}
      headers.forEach((header) => {
        values[header.key] = String(row[header.key] || '')
      })
      worksheet.addRow(values)
    })

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        }
      })
    })

    applyAllBorders(worksheet)

    const seguimientoSheet = workbook.addWorksheet('Seguimientos')
    const seguimientoHeaders = [
      { key: 'orden', label: 'Orden' },
      { key: 'nombreCompleto', label: 'Nombre completo' },
      { key: 'dni', label: 'DNI' },
      { key: 'fechaSeguimiento', label: 'Fecha seguimiento' },
      { key: 'hora', label: 'Hora' },
      { key: 'asistio', label: 'Asistio' },
      { key: 'nivelCompromiso', label: 'Nivel de compromiso' },
      { key: 'observaciones', label: 'Observaciones' },
    ]

    seguimientoSheet.columns = seguimientoHeaders.map((header) => ({
      header: header.label,
      key: header.key,
      width: Math.min(40, Math.max(12, header.label.length + 2)),
    }))

    data.forEach((row) => {
      const followUps = Array.isArray(row.followUps) ? row.followUps : []
      if (followUps.length === 0) return

      followUps.forEach((followUp: any) => {
        seguimientoSheet.addRow({
          orden: String(row.orden || ''),
          nombreCompleto: String(row.nombreCompleto || ''),
          dni: String(row.dni || ''),
          fechaSeguimiento: String(followUp.fechaSeguimiento || ''),
          hora: String(followUp.hora || ''),
          asistio: String(followUp.asistio || ''),
          nivelCompromiso: String(followUp.nivelCompromiso || ''),
          observaciones: String(followUp.observaciones || ''),
        })
      })
    })

    seguimientoSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        }
      })
    })

    applyAllBorders(seguimientoSheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }

  const downloadUsuariosExcel = async (
    data: any[],
    filename: string,
  ): Promise<boolean> => {
    if (!data || data.length === 0) {
      toast.error('No hay datos para descargar')
      return false
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Usuarios')

    const headers = [
      { key: 'Nombre Completo', label: 'Nombre completo' },
      { key: 'DNI', label: 'DNI' },
      { key: 'Edad', label: 'Edad' },
      { key: 'Sexo', label: 'Sexo' },
      { key: 'Email', label: 'Correo electronico' },
      { key: 'Teléfono', label: 'Telefono' },
      { key: 'Nacionalidad', label: 'Nacionalidad' },
      { key: 'Rol', label: 'Rol' },
      { key: 'Carrera', label: 'Carrera' },
      { key: 'Ciclo', label: 'Ciclo' },
      { key: 'Sección', label: 'Seccion' },
      { key: 'Área / Departamento', label: 'Area / Departamento' },
      { key: 'Cargo', label: 'Cargo' },
      { key: 'Viviendo con', label: 'Viviendo con' },
      { key: 'Tipo de Seguro', label: 'Tipo de seguro' },
      { key: 'Embarazada', label: 'Embarazada' },
      { key: 'Discapacidad', label: 'Discapacidad' },
      {
        key: 'Fecha de última actualización',
        label: 'Fecha de ultima actualizacion',
      },
    ]

    worksheet.columns = headers.map((header) => ({
      header: header.label,
      key: header.key,
      width: Math.min(40, Math.max(12, header.label.length + 2)),
    }))

    data.forEach((row) => {
      const values: Record<string, string> = {}
      headers.forEach((header) => {
        values[header.key] = String(row[header.key] || '')
      })
      worksheet.addRow(values)
    })

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        }
      })
    })

    applyAllBorders(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }

  const downloadGestantesExcel = async (
    data: any[],
    filename: string,
  ): Promise<boolean> => {
    if (!data || data.length === 0) {
      toast.error('No hay datos para descargar')
      return false
    }

    // If backend returns flat rows (one per seguimiento), transform to grouped structure
    let groupedData: any[] = data
    if (!data[0].followUpsByPeriod) {
      const usersMap: Record<string, any> = {}
      const periodsSet = new Set<string>()

      const get = (obj: any, keys: string[]) => {
        for (const k of keys) {
          if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return obj[k]
        }
        return ''
      }

      data.forEach((row: any) => {
        const dni = String(get(row, ['DNI', 'Dni', 'dni', 'Cell']) || '').trim()
        const periodo = String(
          get(row, [
            'Periodo seguimiento',
            'PERIODO SEGUIMIENTO',
            'Periodo seguimiento',
          ]) ||
            get(row, ['Periodo registrado', 'PERIODO REGISTRO']) ||
            '',
        ).trim()
        if (periodo) periodsSet.add(periodo)

        if (!usersMap[dni]) {
          usersMap[dni] = {
            'PERIODO REGISTRO': String(
              get(row, [
                'Periodo registrado',
                'PERIODO REGISTRO',
                'Periodo registro',
              ]) || '',
            ).trim(),
            'FECHA REGISTRO': String(get(row, ['FECHA REGISTRO']) || '').trim(),
            DNI: dni,
            NOMBRES: String(
              get(row, ['Nombres', 'NOMBRES', 'Nombre Completo']) || '',
            ).trim(),
            Discapacidad: String(
              get(row, ['Discapacidad', 'DISCAPACIDAD']) || '',
            ).trim(),
            'Carnet-CONADIS': String(
              get(row, ['Carnet-CONADIS', 'CARNET - CONADIS']) || '',
            ).trim(),
            Cell: String(
              get(row, ['Cell', 'Teléfono', 'Teléfono']) || '',
            ).trim(),
            Correo: String(
              get(row, ['Correo', 'Email', 'Correo electrónico']) || '',
            ).trim(),
            followUpsByPeriod: {},
          }
        }

        const fu = {
          'Estudiante regular': String(
            get(row, ['Estudiante regular', 'ESTUDIANTE REGULAR']) || '',
          ).trim(),
          Carrera: String(get(row, ['Carrera', 'CARRERA']) || '').trim(),
          Ciclo: String(get(row, ['Ciclo', 'CICLO']) || '').trim(),
          Turno: String(get(row, ['Turno', 'TURNO']) || '').trim(),
          Observacion: String(
            get(row, ['SEGUIMIENTOS', 'OBSERVACIONES', 'OBSERVACIONES']) || '',
          ).trim(),
        }

        usersMap[dni].followUpsByPeriod[periodo] = fu
      })

      const periods = Array.from(periodsSet).sort()
      groupedData = Object.values(usersMap).map((u: any) => ({ ...u }))
      // attach periods ordering to groupedData via a symbol property
      ;(groupedData as any).__periods = periods
    }

    const periods: string[] =
      (groupedData as any).__periods ||
      Array.from(
        new Set(
          (groupedData as any[]).flatMap((r: any) =>
            Object.keys(r.followUpsByPeriod || {}),
          ),
        ),
      ).sort()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Gestantes')

    const baseHeaders = [
      'PERIODO REGISTRADO',
      'FECHA REGISTRO',
      'DNI',
      'NOMBRES',
      'EDAD',
      'CONTROL PRENATAL',
      'FECHA PROBABLE DE PARTO',
      'CELULAR',
      'CORREO',
    ]
    const subHeaders = [
      'Estudiante regular',
      'Carrera',
      'Ciclo',
      'Turno',
      'Observacion',
    ]

    // Build first header row with merged period groups
    let colIndex = 1
    // Base headers: merge across two rows
    baseHeaders.forEach(() => {
      worksheet.mergeCells(1, colIndex, 2, colIndex)
      colIndex += 1
    })

    // Period headers: each period spans subHeaders.length columns
    const periodCols: number[] = []
    const periodFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFEEEEEE' },
    }

    periods.forEach((period: string) => {
      const start = colIndex
      const end = colIndex + subHeaders.length - 1
      worksheet.mergeCells(1, start, 1, end)
      worksheet.getCell(1, start).value = period
      // second row: write subheaders
      for (let i = 0; i < subHeaders.length; i += 1) {
        worksheet.getCell(2, start + i).value = subHeaders[i]
      }
      // record period columns for styling
      for (let c = start; c <= end; c += 1) {
        periodCols.push(c)
      }
      colIndex = end + 1
    })

    // Fill base header values in row 1 for merged cells
    for (let i = 0; i < baseHeaders.length; i += 1) {
      worksheet.getCell(1, i + 1).value = baseHeaders[i]
    }

    // Style headers
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      }
    })
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      }
    })

    // Apply fill only to period header cells (rows 1 and 2)
    periodCols.forEach((c) => {
      const h1 = worksheet.getRow(1).getCell(c)
      const h2 = worksheet.getRow(2).getCell(c)
      h1.fill = periodFill
      h2.fill = periodFill
    })

    // Add data rows starting from row 3
    data.forEach((row: any) => {
      const values: any[] = []
      // base fields
      baseHeaders.forEach((h) => {
        values.push(row[h] || row[h.replace('REGISTRADO', 'REGISTRO')] || '')
      })
      // period subfields
      periods.forEach((p: string) => {
        const fu = (row.followUpsByPeriod && row.followUpsByPeriod[p]) || {}
        values.push(fu['Estudiante regular'] || '')
        values.push(fu['Carrera'] || '')
        values.push(fu['Ciclo'] || '')
        values.push(fu['Turno'] || '')
        values.push(fu['Observacion'] || '')
      })
      const newRow = worksheet.addRow(values)
      // apply fill to period columns in this row
      periodCols.forEach((c: number) => {
        const cell = newRow.getCell(c)
        cell.fill = periodFill
      })
    })

    // Adjust column widths
    worksheet.columns.forEach((col) => {
      col.width = Math.min(
        40,
        Math.max(12, ((col.header as string) || '').toString().length + 4),
      )
    })

    applyAllBorders(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }

  const downloadDiscapacidadExcel = async (
    data: any[],
    filename: string,
  ): Promise<boolean> => {
    if (!data || data.length === 0) {
      toast.error('No hay datos para descargar')
      return false
    }

    // If backend returns flat rows (one per seguimiento), transform to grouped structure
    let groupedData: any[] = data
    if (!data[0].followUpsByPeriod) {
      const usersMap: Record<string, any> = {}
      const periodsSet = new Set<string>()

      const get = (obj: any, keys: string[]) => {
        for (const k of keys) {
          if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return obj[k]
        }
        return ''
      }

      data.forEach((row: any) => {
        const dni = String(get(row, ['DNI', 'Dni', 'dni', 'Cell']) || '').trim()
        const periodo = String(
          get(row, [
            'Periodo seguimiento',
            'PERIODO SEGUIMIENTO',
            'Periodo seguimiento',
          ]) ||
            get(row, ['Periodo registrado', 'PERIODO REGISTRO']) ||
            '',
        ).trim()
        if (periodo) periodsSet.add(periodo)

        if (!usersMap[dni]) {
          usersMap[dni] = {
            'PERIODO REGISTRO': String(
              get(row, [
                'Periodo registrado',
                'PERIODO REGISTRO',
                'Periodo registro',
              ]) || '',
            ).trim(),
            'FECHA REGISTRO': String(get(row, ['FECHA REGISTRO']) || '').trim(),
            DNI: dni,
            NOMBRES: String(
              get(row, ['Nombres', 'NOMBRES', 'Nombre Completo']) || '',
            ).trim(),
            Discapacidad: String(
              get(row, ['Discapacidad', 'DISCAPACIDAD']) || '',
            ).trim(),
            'Carnet-CONADIS': String(
              get(row, ['Carnet-CONADIS', 'CARNET - CONADIS']) || '',
            ).trim(),
            Cell: String(
              get(row, ['Cell', 'Teléfono', 'Teléfono']) || '',
            ).trim(),
            Correo: String(
              get(row, ['Correo', 'Email', 'Correo electrónico']) || '',
            ).trim(),
            followUpsByPeriod: {},
          }
        }

        const fu = {
          'Estudiante regular': String(
            get(row, ['Estudiante regular', 'ESTUDIANTE REGULAR']) || '',
          ).trim(),
          Carrera: String(get(row, ['Carrera', 'CARRERA']) || '').trim(),
          Ciclo: String(get(row, ['Ciclo', 'CICLO']) || '').trim(),
          Turno: String(get(row, ['Turno', 'TURNO']) || '').trim(),
          Observacion: String(
            get(row, ['SEGUIMIENTOS', 'OBSERVACIONES', 'OBSERVACIONES']) || '',
          ).trim(),
        }

        usersMap[dni].followUpsByPeriod[periodo] = fu
      })

      const periodsArr = Array.from(periodsSet).sort()
      groupedData = Object.values(usersMap).map((u: any) => ({ ...u }))
      ;(groupedData as any).__periods = periodsArr
    }

    const periods: string[] =
      (groupedData as any).__periods ||
      Array.from(
        new Set(
          (groupedData as any[]).flatMap((r: any) =>
            Object.keys(r.followUpsByPeriod || {}),
          ),
        ),
      ).sort()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Discapacidad')

    const baseHeaders = [
      'PERIODO REGISTRO',
      'FECHA REGISTRO',
      'DNI',
      'NOMBRES',
      'DISCAPACIDAD',
      'CARNET - CONADIS',
      'OBSERVACIONES',
      'CELULAR',
      'CORREO',
    ]
    const subHeaders = [
      'Estudiante regular',
      'Carrera',
      'Ciclo',
      'Turno',
      'Observaciones',
    ]

    // Build first header row with merged period groups
    let colIndex = 1
    // Base headers: merge across two rows
    baseHeaders.forEach(() => {
      worksheet.mergeCells(1, colIndex, 2, colIndex)
      colIndex += 1
    })

    // Period headers: each period spans subHeaders.length columns
    const periodCols: number[] = []
    const periodFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFEEEEEE' },
    }

    periods.forEach((period) => {
      const start = colIndex
      const end = colIndex + subHeaders.length - 1
      worksheet.mergeCells(1, start, 1, end)
      worksheet.getCell(1, start).value = period
      // second row: write subheaders
      for (let i = 0; i < subHeaders.length; i += 1) {
        worksheet.getCell(2, start + i).value = subHeaders[i]
      }
      // record period columns for styling
      for (let c = start; c <= end; c += 1) {
        periodCols.push(c)
      }
      colIndex = end + 1
    })

    // Fill base header values in row 1 for merged cells
    for (let i = 0; i < baseHeaders.length; i += 1) {
      worksheet.getCell(1, i + 1).value = baseHeaders[i]
    }

    // Style headers
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      }
    })
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      }
    })

    // Apply fill only to period header cells (rows 1 and 2)
    periodCols.forEach((c) => {
      const h1 = worksheet.getRow(1).getCell(c)
      const h2 = worksheet.getRow(2).getCell(c)
      h1.fill = periodFill
      h2.fill = periodFill
    })

    // Add data rows starting from row 3
    ;(groupedData as any[]).forEach((row: any) => {
      const values: any[] = []
      // base fields - use mapped keys from grouped structure
      values.push(row['PERIODO REGISTRO'] || row['Periodo registrado'] || '')
      values.push(row['FECHA REGISTRO'] || '')
      values.push(row['DNI'] || '')
      values.push(row['NOMBRES'] || row['Nombres'] || '')
      values.push(row['Discapacidad'] || row['DISCAPACIDAD'] || '')
      values.push(row['Carnet-CONADIS'] || row['CARNET - CONADIS'] || '')
      values.push(row['Observaciones'] || row['OBSERVACIONES'] || '')
      values.push(row['CELULAR'] || row['Cell'] || '')
      values.push(row['CORREO'] || row['Correo'] || '')

      // period subfields
      periods.forEach((p) => {
        const fu = (row.followUpsByPeriod && row.followUpsByPeriod[p]) || {}
        values.push(fu['Estudiante regular'] || '')
        values.push(fu['Carrera'] || '')
        values.push(fu['Ciclo'] || '')
        values.push(fu['Turno'] || '')
        values.push(fu['Observacion'] || fu['Observaciones'] || '')
      })

      const newRow = worksheet.addRow(values)
      // apply fill to period columns in this row
      periodCols.forEach((c) => {
        const cell = newRow.getCell(c)
        cell.fill = periodFill
      })
    })

    // Adjust column widths
    worksheet.columns.forEach((col) => {
      col.width = Math.min(
        40,
        Math.max(12, ((col.header as string) || '').toString().length + 4),
      )
    })

    applyAllBorders(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }

  const handleDownload = async (kind: ReportKind) => {
    setIsDownloading(kind)
    try {
      if (kind === 'gestantes') {
        const result = await consultaService.getReportGestantes({
          startDate: reportFilters.gestantesStartDate || undefined,
          endDate: reportFilters.gestantesEndDate || undefined,
          withoutCurrentPeriodFollowUps:
            reportFilters.gestantesWithoutCurrentPeriodFollowUps,
        })
        const downloaded = await downloadGestantesExcel(
          result.gestantes,
          `reporte-gestantes-${Date.now()}.xlsx`,
        )
        if (!downloaded) return
      }
      if (kind === 'discapacidad') {
        const data = await consultaService.getReportDiscapacidad({
          startDate: reportFilters.discapacidadStartDate || undefined,
          endDate: reportFilters.discapacidadEndDate || undefined,
          withoutCurrentPeriodFollowUps:
            reportFilters.discapacidadWithoutCurrentPeriodFollowUps,
        })
        const downloaded = await downloadDiscapacidadExcel(
          data,
          `reporte-discapacidad-${Date.now()}.xlsx`,
        )
        if (!downloaded) return
      }
      if (kind === 'consultas') {
        const data = await consultaService.getReportAttendances({
          dateRange: reportFilters.consultasDateRange,
          startDate: reportFilters.consultasStartDate || undefined,
          endDate: reportFilters.consultasEndDate || undefined,
          onlyFollowUps: reportFilters.consultasOnlyFollowUps,
          role: reportFilters.consultasRol,
          ciclo:
            reportFilters.consultasRol === 'Estudiantes' &&
            reportFilters.consultasCiclo !== 'Todos'
              ? reportFilters.consultasCiclo
              : undefined,
          programa:
            reportFilters.consultasRol !== 'Estudiantes' ||
            reportFilters.consultasPrograma === 'Todos'
              ? undefined
              : reportFilters.consultasPrograma,
          periodo:
            reportFilters.consultasPeriodo === 'Todos'
              ? undefined
              : reportFilters.consultasPeriodo,
        })
        const downloaded = await downloadConsultasExcel(
          data,
          `reporte-consultas-${Date.now()}.xlsx`,
        )
        if (!downloaded) return
      }
      if (kind === 'usuarios') {
        const data = await consultaService.getReportUsers({
          role: reportFilters.usuariosRol,
          carrera:
            reportFilters.usuariosRol === 'Estudiantes' &&
            reportFilters.usuariosCarrera !== 'Todos'
              ? reportFilters.usuariosCarrera
              : undefined,
          ciclo:
            reportFilters.usuariosRol === 'Estudiantes' &&
            reportFilters.usuariosCiclo !== 'Todos'
              ? reportFilters.usuariosCiclo
              : undefined,
          sexo:
            reportFilters.usuariosSexo === 'Todos'
              ? undefined
              : reportFilters.usuariosSexo,
        })
        const downloaded = await downloadUsuariosExcel(
          data,
          `reporte-usuarios-${Date.now()}.xlsx`,
        )
        if (!downloaded) return
      }
      toast.success('Reporte descargado correctamente')
      closeReportModal()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo descargar el reporte')
    } finally {
      setIsDownloading(null)
    }
  }

  const reportModalContent = reportModalKind ? (
    <div className=' w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
      <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
            Exportar reporte
          </p>
          <h3 className='text-xl font-bold text-on-surface'>
            {reportModalKind === 'gestantes' && 'Filtro de gestantes'}
            {reportModalKind === 'discapacidad' && 'Filtro de discapacidad'}
            {reportModalKind === 'consultas' && 'Filtro de consultas'}
            {reportModalKind === 'usuarios' && 'Filtro de usuarios'}
          </h3>
          <p className='text-sm text-on-surface-variant'>
            {reportModalKind === 'gestantes' &&
              'Filtra por fecha de registro y excluye registros con seguimiento en el periodo actual.'}
            {reportModalKind === 'discapacidad' &&
              'Filtra por fecha de registro y excluye registros con seguimiento en el periodo actual.'}
            {reportModalKind === 'consultas' &&
              'Filtra por fecha de atención, programa, periodo y seguimiento.'}
            {reportModalKind === 'usuarios' &&
              'Filtra solo estudiantes y acota por carrera, ciclo o sexo.'}
          </p>
        </div>
        <button
          type='button'
          onClick={closeReportModal}
          className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
          aria-label='Cerrar'
        >
          <span className='material-symbols-outlined'>close</span>
        </button>
      </div>

      <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-6'>
        {(reportModalKind === 'gestantes' ||
          reportModalKind === 'discapacidad') && (
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label className='text-sm font-semibold text-on-surface'>
                Fecha inicial
              </label>
              <input
                type='date'
                value={
                  reportModalKind === 'gestantes'
                    ? reportFilters.gestantesStartDate
                    : reportFilters.discapacidadStartDate
                }
                onChange={(event) =>
                  setReportFilters((current) =>
                    reportModalKind === 'gestantes'
                      ? {
                          ...current,
                          gestantesStartDate: event.target.value,
                        }
                      : {
                          ...current,
                          discapacidadStartDate: event.target.value,
                        },
                  )
                }
                className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
              />
            </div>
            <div>
              <label className='text-sm font-semibold text-on-surface'>
                Fecha final
              </label>
              <input
                type='date'
                value={
                  reportModalKind === 'gestantes'
                    ? reportFilters.gestantesEndDate
                    : reportFilters.discapacidadEndDate
                }
                onChange={(event) =>
                  setReportFilters((current) =>
                    reportModalKind === 'gestantes'
                      ? {
                          ...current,
                          gestantesEndDate: event.target.value,
                        }
                      : {
                          ...current,
                          discapacidadEndDate: event.target.value,
                        },
                  )
                }
                className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
              />
            </div>
          </div>
        )}

        {(reportModalKind === 'gestantes' ||
          reportModalKind === 'discapacidad') && (
          <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-low p-5'>
            <label className='inline-flex items-center gap-3'>
              <input
                type='checkbox'
                checked={
                  reportModalKind === 'gestantes'
                    ? reportFilters.gestantesWithoutCurrentPeriodFollowUps
                    : reportFilters.discapacidadWithoutCurrentPeriodFollowUps
                }
                onChange={(event) =>
                  setReportFilters((current) =>
                    reportModalKind === 'gestantes'
                      ? {
                          ...current,
                          gestantesWithoutCurrentPeriodFollowUps:
                            event.target.checked,
                        }
                      : {
                          ...current,
                          discapacidadWithoutCurrentPeriodFollowUps:
                            event.target.checked,
                        },
                  )
                }
                className='h-4 w-4 rounded border border-outline-variant/50 text-primary focus:ring-primary'
              />
              <span className='text-sm text-on-surface'>
                Sin seguimientos del periodo actual ({DEFAULT_ACADEMIC_PERIOD})
              </span>
            </label>
          </div>
        )}

        {reportModalKind === 'consultas' && (
          <>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label className='text-sm font-semibold text-on-surface'>
                  Rango de fecha de atención
                </label>
                <select
                  value={reportFilters.consultasDateRange}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      consultasDateRange: event.target
                        .value as ReportDateRangeOption,
                    }))
                  }
                  className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                >
                  {REPORT_DATE_RANGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-semibold text-on-surface'>
                  Rol
                </label>
                <select
                  value={reportFilters.consultasRol}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      consultasRol: event.target.value as
                        | 'Todos'
                        | 'Estudiantes'
                        | 'Administrativos',
                    }))
                  }
                  className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                >
                  <option value='Todos'>Todos</option>
                  <option value='Estudiantes'>Estudiantes</option>
                  <option value='Administrativos'>Administrativos</option>
                </select>
              </div>
            </div>

            {reportFilters.consultasRol === 'Estudiantes' && (
              <div>
                <label className='text-sm font-semibold text-on-surface'>
                  Ciclo
                </label>
                <select
                  value={reportFilters.consultasCiclo}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      consultasCiclo: event.target.value,
                    }))
                  }
                  className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                >
                  <option value='Todos'>Todos</option>
                  {availableCycles.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportFilters.consultasRol === 'Estudiantes' && (
              <div>
                <label className='text-sm font-semibold text-on-surface'>
                  Programa
                </label>
                <select
                  value={reportFilters.consultasPrograma}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      consultasPrograma: event.target.value,
                    }))
                  }
                  className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                >
                  <option value='Todos'>Todos</option>
                  {availablePrograms.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportFilters.consultasDateRange === 'Personalizado' && (
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='text-sm font-semibold text-on-surface'>
                    Fecha inicial
                  </label>
                  <input
                    type='date'
                    value={reportFilters.consultasStartDate}
                    onChange={(event) =>
                      setReportFilters((current) => ({
                        ...current,
                        consultasStartDate: event.target.value,
                      }))
                    }
                    className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                  />
                </div>
                <div>
                  <label className='text-sm font-semibold text-on-surface'>
                    Fecha final
                  </label>
                  <input
                    type='date'
                    value={reportFilters.consultasEndDate}
                    onChange={(event) =>
                      setReportFilters((current) => ({
                        ...current,
                        consultasEndDate: event.target.value,
                      }))
                    }
                    className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                  />
                </div>
              </div>
            )}

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-low p-5'>
                <label className='inline-flex items-center gap-3'>
                  <input
                    type='checkbox'
                    checked={reportFilters.consultasOnlyFollowUps}
                    onChange={(event) =>
                      setReportFilters((current) => ({
                        ...current,
                        consultasOnlyFollowUps: event.target.checked,
                      }))
                    }
                    className='h-4 w-4 rounded border border-outline-variant/50 text-primary focus:ring-primary'
                  />
                  <span className='text-sm text-on-surface'>
                    Solo atenciones con seguimientos
                  </span>
                </label>
              </div>
              <div>
                <label className='text-sm font-semibold text-on-surface'>
                  Periodo
                </label>
                <select
                  value={reportFilters.consultasPeriodo}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      consultasPeriodo: event.target.value,
                    }))
                  }
                  className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                >
                  <option value='Todos'>Todos</option>
                  {availablePeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {reportModalKind === 'usuarios' && (
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-low p-5 md:col-span-2'>
              <label className='text-sm font-semibold text-on-surface'>
                Rol
              </label>
              <select
                value={reportFilters.usuariosRol}
                onChange={(event) =>
                  setReportFilters((current) => ({
                    ...current,
                    usuariosRol: event.target.value as
                      | 'Todos'
                      | 'Admin'
                      | 'Estudiantes',
                    usuariosCarrera:
                      event.target.value === 'Estudiantes'
                        ? current.usuariosCarrera
                        : 'Todos',
                    usuariosCiclo:
                      event.target.value === 'Estudiantes'
                        ? current.usuariosCiclo
                        : 'Todos',
                  }))
                }
                className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
              >
                <option value='Todos'>Todos</option>
                <option value='Admin'>Administrativos</option>
                <option value='Estudiantes'>Estudiantes</option>
              </select>
            </div>
            {reportFilters.usuariosRol === 'Estudiantes' && (
              <>
                <div>
                  <label className='text-sm font-semibold text-on-surface'>
                    Carrera
                  </label>
                  <select
                    value={reportFilters.usuariosCarrera}
                    onChange={(event) =>
                      setReportFilters((current) => ({
                        ...current,
                        usuariosCarrera: event.target.value,
                      }))
                    }
                    className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                  >
                    <option value='Todos'>Todos</option>
                    {availableCareers.map((career) => (
                      <option key={career} value={career}>
                        {career}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='text-sm font-semibold text-on-surface'>
                    Ciclo
                  </label>
                  <select
                    value={reportFilters.usuariosCiclo}
                    onChange={(event) =>
                      setReportFilters((current) => ({
                        ...current,
                        usuariosCiclo: event.target.value,
                      }))
                    }
                    className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                  >
                    <option value='Todos'>Todos</option>
                    {availableCycles.map((cycle) => (
                      <option key={cycle} value={cycle}>
                        {cycle}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className='text-sm font-semibold text-on-surface'>
                Sexo
              </label>
              <select
                value={reportFilters.usuariosSexo}
                onChange={(event) =>
                  setReportFilters((current) => ({
                    ...current,
                    usuariosSexo: event.target.value,
                  }))
                }
                className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
              >
                <option value='Todos'>Todos</option>
                {availableSexes.map((sex) => (
                  <option key={sex} value={sex}>
                    {sex}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-3 border-t border-surface-variant px-6 py-4 sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={closeReportModal}
          className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition'
        >
          Cancelar
        </button>
        <button
          type='button'
          onClick={() => {
            if (reportModalKind) {
              handleDownload(reportModalKind)
            }
          }}
          disabled={isDownloading !== null}
          className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isDownloading ? 'Generando reporte...' : 'Descargar reporte'}
        </button>
      </div>
    </div>
  ) : null

  const totalStudent = userTypeCounts.estudiantes
  const totalAdmin = userTypeCounts.administrativos
  const totalTipo = Math.max(totalStudent + totalAdmin, 1)
  const percentStudent = Math.round((totalStudent / totalTipo) * 100)
  const percentAdmin = Math.round((totalAdmin / totalTipo) * 100)

  return (
    <Layout activeView='reports' title='Reportes Estadísticos'>
      <div className='space-y-8'>
        <header className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold text-on-surface tracking-tight font-headline'>
              Panel de Estadísticas
            </h1>
            <p className='text-on-surface-variant font-medium mt-1'>
              Reportes consolidados de atenciones y usuarios.
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => navigate('/consultas')}
              className='flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-all'
            >
              <span className='material-symbols-outlined text-[20px]'>
                table_view
              </span>
              Ver consultas
            </button>
          </div>
        </header>

        <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined text-3xl'>groups</span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Total Atenciones
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                {totalAttendances.toLocaleString()}
              </p>
              <p className='text-xs font-semibold text-on-surface-variant mt-1'>
                Registros acumulados
              </p>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-5'>
            <div className='w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant'>
              <span className='material-symbols-outlined text-3xl'>badge</span>
            </div>
            <div>
              <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
                Total Usuarios
              </p>
              <p className='text-3xl font-extrabold text-on-surface font-headline'>
                {totalUsers.toLocaleString()}
              </p>
              <p className='text-xs font-semibold text-on-surface-variant mt-1'>
                Usuarios registrados
              </p>
            </div>
          </div>
        </section>

        <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10'>
            <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
              Finalizado
            </p>
            <p className='text-3xl font-extrabold text-primary mt-3'>
              {statusCounts.finalizado.toLocaleString()}
            </p>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10'>
            <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
              En seguimiento
            </p>
            <p className='text-3xl font-extrabold text-tertiary mt-3'>
              {statusCounts.seguimiento.toLocaleString()}
            </p>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10'>
            <p className='text-sm font-bold text-on-surface-variant uppercase tracking-wider'>
              Derivado
            </p>
            <p className='text-3xl font-extrabold text-secondary mt-3'>
              {statusCounts.derivado.toLocaleString()}
            </p>
          </div>
        </section>

        <section className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <h3 className='text-xl font-bold font-headline'>
                  Consultas por fecha
                </h3>
                <p className='text-sm text-on-surface-variant'>
                  Cantidad de consultas por mes.
                </p>
              </div>
              <select
                value={range}
                onChange={(event) =>
                  setRange(event.target.value === '12m' ? '12m' : '6m')
                }
                className='bg-surface-container-high border-none rounded-xl text-sm font-medium focus:ring-primary/20'
              >
                <option value='6m'>Últimos 6 meses</option>
                <option value='12m'>Último año</option>
              </select>
            </div>
            <div className='mt-6 h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={areaSeries}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id='areaGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='0%' stopColor='#3b82f6' stopOpacity={0.4} />
                      <stop offset='100%' stopColor='#3b82f6' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='#3b82f6'
                    fill='url(#areaGradient)'
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10'>
            <h3 className='text-xl font-bold font-headline mb-6'>Por sexo</h3>
            <PieChartComponent data={sexoData} showLegend />
          </div>

          <div className='lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-primary p-8 rounded-xl text-white overflow-hidden relative group'>
              <div className='relative z-10 flex justify-between items-center'>
                <div>
                  <h4 className='text-2xl font-bold font-headline'>
                    Estudiantes
                  </h4>
                  <p className='text-primary-fixed opacity-90 mt-1 font-medium'>
                    Representan el {percentStudent}% de las atenciones totales.
                  </p>
                  <div className='mt-6 flex items-baseline gap-2'>
                    <span className='text-5xl font-black'>{totalStudent}</span>
                    <span className='text-lg opacity-60'>Consultas</span>
                  </div>
                </div>
                <div className='w-32 h-32 opacity-20'>
                  <span className='material-symbols-outlined !text-[120px]'>
                    school
                  </span>
                </div>
              </div>
              <div className='absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform'></div>
            </div>
            <div className='bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 overflow-hidden relative group'>
              <div className='relative z-10 flex justify-between items-center'>
                <div>
                  <h4 className='text-2xl font-bold font-headline text-on-surface'>
                    Administrativos
                  </h4>
                  <p className='text-on-surface-variant mt-1 font-medium'>
                    Representan el {percentAdmin}% de las atenciones totales.
                  </p>
                  <div className='mt-6 flex items-baseline gap-2'>
                    <span className='text-5xl font-black text-on-surface'>
                      {totalAdmin}
                    </span>
                    <span className='text-lg text-on-surface-variant'>
                      Consultas
                    </span>
                  </div>
                </div>
                <div className='w-32 h-32 opacity-10'>
                  <span className='material-symbols-outlined !text-[120px]'>
                    badge
                  </span>
                </div>
              </div>
              <div className='absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform'></div>
            </div>
          </div>

          <div className='lg:col-span-6 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10'>
            <h3 className='text-xl font-bold font-headline mb-6'>
              Área problemática
            </h3>
            <BarChartComponent data={areaProblematicaData} />
          </div>

          <div className='lg:col-span-6 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold font-headline'>
                Desglose por Facultad
              </h3>
            </div>
            <div className='space-y-5'>
              {facultyBreakdown.length === 0 ? (
                <p className='text-sm text-on-surface-variant'>Sin datos.</p>
              ) : (
                facultyBreakdown.map((faculty) => (
                  <div
                    key={faculty.label}
                    className='flex items-center justify-between pb-4 border-b border-outline-variant/20'
                  >
                    <div className='text-lg font-bold text-on-surface'>
                      {faculty.label}
                    </div>
                    <div className='text-right'>
                      <div className='text-xl font-extrabold text-on-surface'>
                        {faculty.value}
                      </div>
                      <div className='text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60'>
                        Atenciones
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className='bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10'>
          <div className='flex flex-col gap-2 mb-6'>
            <h3 className='text-2xl font-black font-headline'>
              Descargar reportes
            </h3>
            <p className='text-sm text-on-surface-variant'>
              Exporta los registros en formato Excel.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
            <button
              type='button'
              onClick={() => openReportModal('gestantes')}
              className='rounded-2xl border border-outline-variant/20 bg-white px-6 py-5 text-left shadow-sm hover:shadow-md transition'
            >
              <p className='text-sm font-semibold text-on-surface-variant uppercase'>
                Gestantes
              </p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-lg font-bold text-on-surface'>
                  Descargar
                </span>
                {isDownloading === 'gestantes' ? (
                  <span className='h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin' />
                ) : (
                  <span className='material-symbols-outlined text-primary'>
                    download
                  </span>
                )}
              </div>
            </button>
            <button
              type='button'
              onClick={() => openReportModal('discapacidad')}
              className='rounded-2xl border border-outline-variant/20 bg-white px-6 py-5 text-left shadow-sm hover:shadow-md transition'
            >
              <p className='text-sm font-semibold text-on-surface-variant uppercase'>
                Con discapacidad
              </p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-lg font-bold text-on-surface'>
                  Descargar
                </span>
                {isDownloading === 'discapacidad' ? (
                  <span className='h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin' />
                ) : (
                  <span className='material-symbols-outlined text-primary'>
                    download
                  </span>
                )}
              </div>
            </button>
            <button
              type='button'
              onClick={() => openReportModal('consultas')}
              className='rounded-2xl border border-outline-variant/20 bg-white px-6 py-5 text-left shadow-sm hover:shadow-md transition'
            >
              <p className='text-sm font-semibold text-on-surface-variant uppercase'>
                Consultas
              </p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-lg font-bold text-on-surface'>
                  Descargar
                </span>
                {isDownloading === 'consultas' ? (
                  <span className='h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin' />
                ) : (
                  <span className='material-symbols-outlined text-primary'>
                    download
                  </span>
                )}
              </div>
            </button>
            <button
              type='button'
              onClick={() => openReportModal('usuarios')}
              className='rounded-2xl border border-outline-variant/20 bg-white px-6 py-5 text-left shadow-sm hover:shadow-md transition'
            >
              <p className='text-sm font-semibold text-on-surface-variant uppercase'>
                Usuarios
              </p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-lg font-bold text-on-surface'>
                  Descargar
                </span>
                {isDownloading === 'usuarios' ? (
                  <span className='h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin' />
                ) : (
                  <span className='material-symbols-outlined text-primary'>
                    download
                  </span>
                )}
              </div>
            </button>
          </div>
          {isDownloading && (
            <p className='mt-4 text-sm text-on-surface-variant'>
              Generando reporte...
            </p>
          )}
        </section>

        {reportModalContent &&
          createPortal(
            <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4'>
              {reportModalContent}
            </div>,
            document.body,
          )}

        <button
          onClick={() => navigate('/registration')}
          className='fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40'
        >
          <span className='material-symbols-outlined !text-3xl'>add</span>
        </button>
      </div>
    </Layout>
  )
}

export default ReportsPage
