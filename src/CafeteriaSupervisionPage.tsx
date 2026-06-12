import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import Layout from './Layout'
import ExcelJS from 'exceljs'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cafeteriaService } from './services/cafeteriaService'
import CafeteriaSupervisionList from './CafeteriaSupervisionList'
import { PieChartComponent } from './components/BarChart'
import {
  CafeteriaSupervisionRecord,
  FormState,
  initialFormState,
} from './CafeteriaSupervisionTypes'
import CafeteriaSupervisionForm from './CafeteriaSupervisionForm'

type CafeteriaQuestionKey = Exclude<
  keyof FormState,
  | 'fecha'
  | 'hora'
  | 'concesionario'
  | 'supervisor'
  | 'observaciones'
  | 'periodo'
  | 'aprobado'
>

type CafeteriaQuestionGroup =
  | 'Higiene y Seguridad Alimentaria'
  | 'Calidad del Servicio y Alimentos'
  | 'Atención al Cliente'
  | 'Precios y Competitividad'
  | 'Infraestructura y Equipamiento'

const CAFETERIA_QUESTION_DEFS: ReadonlyArray<{
  key: CafeteriaQuestionKey
  label: string
  group: CafeteriaQuestionGroup
}> = [
  {
    key: 'higieneBasica',
    label:
      'Personal cumple higiene y seguridad alimentaria? (manos limpias, uñas cortas, guantes, mascarilla, gorro, mandil).',
    group: 'Higiene y Seguridad Alimentaria',
  },
  {
    key: 'limpiezaAmbiente',
    label:
      'Limpieza del ambiente y servicio (lugar limpio, sin basura visible, tacho con tapa, vías de circulación).',
    group: 'Higiene y Seguridad Alimentaria',
  },
  {
    key: 'signosETA',
    label:
      'Personal presenta signos de ETA (ictericia, vómitos, dolor de garganta, fiebre, heridas).',
    group: 'Higiene y Seguridad Alimentaria',
  },
  {
    key: 'calidadVariado',
    label:
      'Ofrecen alimentos variados (naturales, artesanales, industriales, bebidas).',
    group: 'Calidad del Servicio y Alimentos',
  },
  {
    key: 'fechaVencimiento',
    label: 'Productos con fecha de vencimiento vigente y visible.',
    group: 'Calidad del Servicio y Alimentos',
  },
  {
    key: 'conservacionAlimentos',
    label: 'Alimentos protegidos y conservados correctamente.',
    group: 'Calidad del Servicio y Alimentos',
  },
  {
    key: 'amabilidad',
    label:
      'Amabilidad y cortesía del personal (saludan, sonríen, son atentos, rápidos).',
    group: 'Atención al Cliente',
  },
  {
    key: 'tiempoServicio',
    label: 'Tiempo de servicio adecuado (atención en menos de 5 minutos).',
    group: 'Atención al Cliente',
  },
  {
    key: 'calidadPrecio',
    label: 'Relación calidad-precio adecuada.',
    group: 'Precios y Competitividad',
  },
  {
    key: 'preciosCompetitivos',
    label: 'Precios competitivos respecto a establecimientos similares.',
    group: 'Precios y Competitividad',
  },
  // {
  //   key: 'productosLocales',
  //   label: 'Se ofrecen productos locales u orgánicos?',
  //   group: 'Sostenibilidad y Responsabilidad Social',
  // },
  // {
  //   key: 'reciclaResiduos',
  //   label: 'Se recicla residuos (botellas plásticas, etc.)?',
  //   group: 'Sostenibilidad y Responsabilidad Social',
  // },
  {
    key: 'estadoEquipamiento',
    label: 'Evalúe el estado de conservación del equipamiento y mobiliario.',
    group: 'Infraestructura y Equipamiento',
  },
]

const CAFETERIA_QUESTION_GROUPS: CafeteriaQuestionGroup[] = [
  'Higiene y Seguridad Alimentaria',
  'Calidad del Servicio y Alimentos',
  'Atención al Cliente',
  'Precios y Competitividad',
  'Infraestructura y Equipamiento',
]

type CafeteriaDateRangeOption =
  | 'Todos'
  | 'Este mes'
  | 'Ultimo trimestre'
  | 'Este año'
  | 'Personalizado'

const CAFETERIA_DATE_RANGE_OPTIONS: CafeteriaDateRangeOption[] = [
  'Todos',
  'Este mes',
  'Ultimo trimestre',
  'Este año',
  'Personalizado',
]

const parseCafeteriaDate = (value: string): Date | null => {
  const normalized = String(value || '').trim()
  if (!normalized) return null

  const dmyMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const romanToNumber = (value: string) => {
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let total = 0
  let prev = 0

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const current = romanMap[value[index]] || 0
    if (current < prev) {
      total -= current
    } else {
      total += current
    }
    prev = current
  }

  return total
}

const getCafeteriaPeriodSortValue = (period: string) => {
  const normalized = String(period || '').toUpperCase()
  const match = normalized.match(/(\d{4})\s*-\s*([IVXLCDM]+)/)

  if (!match) {
    return Number.MAX_SAFE_INTEGER
  }

  const year = Number(match[1])
  const romanValue = romanToNumber(match[2])

  if (!year || !romanValue) {
    return Number.MAX_SAFE_INTEGER
  }

  return year * 100 + romanValue
}

const isInCafeteriaDateRange = (
  recordDate: string,
  range: CafeteriaDateRangeOption,
  customStart: string,
  customEnd: string,
) => {
  if (range === 'Todos') return true

  const date = parseCafeteriaDate(recordDate)
  if (!date) return false

  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  if (range === 'Este mes') {
    return (
      date.getFullYear() === startOfToday.getFullYear() &&
      date.getMonth() === startOfToday.getMonth()
    )
  }

  if (range === 'Ultimo trimestre') {
    const currentQuarter = Math.floor(startOfToday.getMonth() / 3)
    const quarterStartMonth = Math.max(0, (currentQuarter - 1) * 3)
    const quarterEndMonth = quarterStartMonth + 2
    const quarterYear =
      currentQuarter === 0
        ? startOfToday.getFullYear() - 1
        : startOfToday.getFullYear()
    const startDate = new Date(quarterYear, quarterStartMonth, 1)
    const endDate = new Date(quarterYear, quarterEndMonth + 1, 0)
    return date >= startDate && date <= endDate
  }

  if (range === 'Este año') {
    return date.getFullYear() === startOfToday.getFullYear()
  }

  const startDate = parseCafeteriaDate(customStart)
  const endDate = parseCafeteriaDate(customEnd)

  if (startDate && endDate) {
    return date >= startDate && date <= endDate
  }

  if (startDate) {
    return date >= startDate
  }

  if (endDate) {
    return date <= endDate
  }

  return true
}
function CafeteriaSupervisionPage() {
  const [records, setRecords] = useState<CafeteriaSupervisionRecord[]>([])
  const [form, setForm] = useState<FormState>(initialFormState)
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [recordToDelete, setRecordToDelete] =
    useState<CafeteriaSupervisionRecord | null>(null)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({})
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list')
  const [cafeteriaDateRange, setCafeteriaDateRange] =
    useState<CafeteriaDateRangeOption>('Todos')
  const [cafeteriaCustomStartDate, setCafeteriaCustomStartDate] = useState('')
  const [cafeteriaCustomEndDate, setCafeteriaCustomEndDate] = useState('')

  const filteredReportRecords = useMemo(
    () =>
      records.filter((record) =>
        isInCafeteriaDateRange(
          record.fecha,
          cafeteriaDateRange,
          cafeteriaCustomStartDate,
          cafeteriaCustomEndDate,
        ),
      ),
    [
      records,
      cafeteriaDateRange,
      cafeteriaCustomStartDate,
      cafeteriaCustomEndDate,
    ],
  )

  const reportSummary = useMemo(
    () =>
      CAFETERIA_QUESTION_DEFS.map((question) => {
        const yesCount = filteredReportRecords.filter(
          (record) => record[question.key] === true,
        ).length
        const noCount = filteredReportRecords.filter(
          (record) => record[question.key] === false,
        ).length
        const totalAnswered = yesCount + noCount
        const yesPercentage =
          totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0

        return {
          ...question,
          yesCount,
          noCount,
          totalAnswered,
          yesPercentage,
        }
      }),
    [filteredReportRecords],
  )

  const reportAverages = useMemo(() => {
    const approvals = filteredReportRecords.map(
      (record) =>
        CAFETERIA_QUESTION_DEFS.filter(
          (question) => record[question.key] === true,
        ).length,
    )
    const yesResponsesCount = filteredReportRecords.reduce((sum, record) => {
      const yesCount = CAFETERIA_QUESTION_DEFS.filter(
        (question) => record[question.key] === true,
      ).length

      return sum + yesCount
    }, 0)
    const averageYes =
      approvals.length > 0
        ? Math.round(
            approvals.reduce((sum, value) => sum + value, 0) / approvals.length,
          )
        : 0

    return {
      total: filteredReportRecords.length,
      averageYes,
      yesResponsesCount,
      approvedCount: filteredReportRecords.filter(
        (record) => record.aprobado === 'Aprobado',
      ).length,
      reviewCount: filteredReportRecords.filter(
        (record) => record.aprobado !== 'Aprobado',
      ).length,
    }
  }, [filteredReportRecords])

  const reportDateSeries = useMemo(() => {
    const counts = new Map<
      string,
      {
        value: number
        sortValue: number
        details: {
          concesionario: string
          supervisor: string
          periodo: string
        }[]
      }
    >()

    filteredReportRecords.forEach((record) => {
      const label = record.periodo?.trim() || 'Sin periodo'
      const yesCount = CAFETERIA_QUESTION_DEFS.filter(
        (question) => record[question.key] === true,
      ).length
      const recordDate = parseCafeteriaDate(record.fecha)
      const dateValue = recordDate?.getTime() ?? Number.MAX_SAFE_INTEGER
      const current = counts.get(label) || {
        value: 0,
        sortValue: dateValue,
        details: [],
      }

      counts.set(label, {
        value: current.value + yesCount,
        sortValue: Math.min(current.sortValue, dateValue),
        details: [
          ...current.details,
          {
            concesionario: record.concesionario || 'Sin concesionario',
            supervisor: record.supervisor || 'Sin supervisor',
            periodo: record.periodo || 'Sin periodo',
          },
        ],
      })
    })

    return Array.from(counts.entries())
      .map(([label, item]) => ({
        label,
        value: item.value,
        details: item.details,
        sortValue: item.sortValue,
      }))
      .sort((first, second) => first.sortValue - second.sortValue)
      .map(({ label, value, details }) => ({ label, value, details }))
  }, [filteredReportRecords])

  const reportStatusData = useMemo(
    () => [
      {
        label: 'Aprobado',
        value: filteredReportRecords.filter(
          (record) => record.aprobado === 'Aprobado',
        ).length,
      },
      {
        label: 'No aprobado',
        value: filteredReportRecords.filter(
          (record) => record.aprobado !== 'Aprobado',
        ).length,
      },
    ],
    [filteredReportRecords],
  )

  const reportRecordsByPeriod = useMemo(() => {
    const periodMap = new Map<string, CafeteriaSupervisionRecord[]>()

    filteredReportRecords.forEach((record) => {
      const periodLabel = record.periodo?.trim() || 'Sin periodo'
      const existing = periodMap.get(periodLabel)
      if (existing) {
        existing.push(record)
      } else {
        periodMap.set(periodLabel, [record])
      }
    })

    return periodMap
  }, [filteredReportRecords])

  const reportPeriods = useMemo(
    () =>
      Array.from(reportRecordsByPeriod.keys())
        .map((period) => ({
          period,
          sortValue: getCafeteriaPeriodSortValue(period),
        }))
        .sort((first, second) => first.sortValue - second.sortValue)
        .map((item) => item.period),
    [reportRecordsByPeriod],
  )

  const reportQuestionPeriodSeries = useMemo(
    () =>
      CAFETERIA_QUESTION_DEFS.map((question) => {
        const series = reportPeriods.map((period) => {
          const periodRecords = reportRecordsByPeriod.get(period) || []
          const yesCount = periodRecords.filter(
            (record) => record[question.key] === true,
          ).length
          const noCount = periodRecords.filter(
            (record) => record[question.key] === false,
          ).length
          const totalAnswered = yesCount + noCount

          return {
            period,
            yesCount,
            noCount,
            totalAnswered,
            yesPercentage:
              totalAnswered > 0
                ? Math.round((yesCount / totalAnswered) * 100)
                : 0,
          }
        })

        const totalAnswered = series.reduce(
          (sum, item) => sum + item.totalAnswered,
          0,
        )
        const yesCount = series.reduce((sum, item) => sum + item.yesCount, 0)
        const overallPercentage =
          totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0

        return {
          ...question,
          series,
          totalAnswered,
          overallPercentage,
        }
      }),
    [reportPeriods, reportRecordsByPeriod],
  )

  const reportObservations = useMemo(
    () =>
      filteredReportRecords
        .filter(
          (record) => String(record.observaciones || '').trim().length > 0,
        )
        .map((record) => ({
          id: record.id,
          fecha: record.fecha || 'Sin fecha',
          sortValue:
            parseCafeteriaDate(record.fecha)?.getTime() ??
            Number.MAX_SAFE_INTEGER,
          hora: record.hora || '',
          periodo: record.periodo || 'Sin periodo',
          concesionario: record.concesionario || 'Sin concesionario',
          supervisor: record.supervisor || 'Sin supervisor',
          observaciones: String(record.observaciones || '').trim(),
        }))
        .sort((first, second) => first.sortValue - second.sortValue),
    [filteredReportRecords],
  )

  const downloadFilteredReport = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Supervisiones Cafeteria')

      worksheet.columns = [
        { header: 'Fecha', key: 'fecha', width: 16 },
        { header: 'Hora', key: 'hora', width: 14 },
        { header: 'Periodo', key: 'periodo', width: 16 },
        { header: 'Concesionario', key: 'concesionario', width: 28 },
        { header: 'Supervisor', key: 'supervisor', width: 28 },
        {
          header:
            'Personal cumple higiene y seguridad alimentaria? (manos limpias, uñas cortas, guantes, mascarilla, gorro, mandil).',
          key: 'higieneBasica',
          width: 40,
        },
        {
          header:
            'Limpieza del ambiente y servicio (lugar limpio, sin basura visible, tacho con tapa, vías de circulación).',
          key: 'limpiezaAmbiente',
          width: 40,
        },
        {
          header:
            'Personal presenta signos de ETA (ictericia, vómitos, dolor de garganta, fiebre, heridas).',
          key: 'signosETA',
          width: 34,
        },
        {
          header:
            'Ofrecen alimentos variados (naturales, artesanales, industriales, bebidas).',
          key: 'calidadVariado',
          width: 34,
        },
        {
          header: 'Productos con fecha de vencimiento vigente y visible.',
          key: 'fechaVencimiento',
          width: 34,
        },
        {
          header: 'Alimentos protegidos y conservados correctamente.',
          key: 'conservacionAlimentos',
          width: 34,
        },
        {
          header:
            'Amabilidad y cortesía del personal (saludan, sonríen, son atentos, rápidos).',
          key: 'amabilidad',
          width: 34,
        },
        {
          header:
            'Tiempo de servicio adecuado (atención en menos de 5 minutos).',
          key: 'tiempoServicio',
          width: 32,
        },
        {
          header: 'Relación calidad-precio adecuada.',
          key: 'calidadPrecio',
          width: 26,
        },
        {
          header: 'Precios competitivos respecto a establecimientos similares.',
          key: 'preciosCompetitivos',
          width: 34,
        },
        {
          header:
            'Evalúe el estado de conservación del equipamiento y mobiliario.',
          key: 'estadoEquipamiento',
          width: 34,
        },
        { header: 'Observaciones', key: 'observaciones', width: 36 },
        { header: 'Estado', key: 'aprobado', width: 16 },
      ]

      filteredReportRecords.forEach((record) => {
        worksheet.addRow({
          fecha: record.fecha || '',
          hora: record.hora || '',
          periodo: record.periodo || '',
          concesionario: record.concesionario || '',
          supervisor: record.supervisor || '',
          higieneBasica: record.higieneBasica ? 'Sí' : 'No',
          limpiezaAmbiente: record.limpiezaAmbiente ? 'Sí' : 'No',
          signosETA: record.signosETA ? 'Sí' : 'No',
          calidadVariado: record.calidadVariado ? 'Sí' : 'No',
          fechaVencimiento: record.fechaVencimiento ? 'Sí' : 'No',
          conservacionAlimentos: record.conservacionAlimentos ? 'Sí' : 'No',
          amabilidad: record.amabilidad ? 'Sí' : 'No',
          tiempoServicio: record.tiempoServicio ? 'Sí' : 'No',
          calidadPrecio: record.calidadPrecio ? 'Sí' : 'No',
          preciosCompetitivos: record.preciosCompetitivos ? 'Sí' : 'No',

          estadoEquipamiento: record.estadoEquipamiento ? 'Sí' : 'No',
          observaciones: record.observaciones || '',
          aprobado: record.aprobado || '',
        })
      })

      worksheet.getRow(1).font = { bold: true }
      worksheet.eachRow((row, rowNumber) => {
        row.alignment = {
          vertical: 'top',
          horizontal: 'left',
          wrapText: true,
        }
        if (rowNumber === 1) {
          row.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          }
        }
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const dateSuffix = `${year}-${month}-${day}`
      const normalizedRange = cafeteriaDateRange
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u')

      const fileName =
        cafeteriaDateRange === 'Personalizado'
          ? (() => {
              const start = cafeteriaCustomStartDate || 'sin-desde'
              const end = cafeteriaCustomEndDate || 'sin-hasta'
              const rangeSuffix = start === end ? start : `${start}-a-${end}`
              return `cafeteria-supervisiones-personalizado-${rangeSuffix}.xlsx`
            })()
          : `cafeteria-supervisiones-${normalizedRange}-${dateSuffix}.xlsx`

      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Descarga generada correctamente.')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const downloadSingleReport = async (record: CafeteriaSupervisionRecord) => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Supervision Cafeteria')

      worksheet.columns = [
        { header: 'Fecha', key: 'fecha', width: 16 },
        { header: 'Hora', key: 'hora', width: 14 },
        { header: 'Periodo', key: 'periodo', width: 16 },
        { header: 'Concesionario', key: 'concesionario', width: 28 },
        { header: 'Supervisor', key: 'supervisor', width: 28 },
        {
          header:
            'Personal cumple higiene y seguridad alimentaria? (manos limpias, uñas cortas, guantes, mascarilla, gorro, mandil).',
          key: 'higieneBasica',
          width: 40,
        },
        {
          header:
            'Limpieza del ambiente y servicio (lugar limpio, sin basura visible, tacho con tapa, vías de circulación).',
          key: 'limpiezaAmbiente',
          width: 40,
        },
        {
          header:
            'Personal presenta signos de ETA (ictericia, vómitos, dolor de garganta, fiebre, heridas).',
          key: 'signosETA',
          width: 34,
        },
        {
          header:
            'Ofrecen alimentos variados (naturales, artesanales, industriales, bebidas).',
          key: 'calidadVariado',
          width: 34,
        },
        {
          header: 'Productos con fecha de vencimiento vigente y visible.',
          key: 'fechaVencimiento',
          width: 34,
        },
        {
          header: 'Alimentos protegidos y conservados correctamente.',
          key: 'conservacionAlimentos',
          width: 34,
        },
        {
          header:
            'Amabilidad y cortesía del personal (saludan, sonríen, son atentos, rápidos).',
          key: 'amabilidad',
          width: 34,
        },
        {
          header:
            'Tiempo de servicio adecuado (atención en menos de 5 minutos).',
          key: 'tiempoServicio',
          width: 32,
        },
        {
          header: 'Relación calidad-precio adecuada.',
          key: 'calidadPrecio',
          width: 26,
        },
        {
          header: 'Precios competitivos respecto a establecimientos similares.',
          key: 'preciosCompetitivos',
          width: 34,
        },

        {
          header:
            'Evalúe el estado de conservación del equipamiento y mobiliario.',
          key: 'estadoEquipamiento',
          width: 34,
        },
        { header: 'Observaciones', key: 'observaciones', width: 36 },
        { header: 'Estado', key: 'aprobado', width: 16 },
      ]

      worksheet.addRow({
        fecha: record.fecha || '',
        hora: record.hora || '',
        periodo: record.periodo || '',
        concesionario: record.concesionario || '',
        supervisor: record.supervisor || '',
        higieneBasica: record.higieneBasica ? 'Sí' : 'No',
        limpiezaAmbiente: record.limpiezaAmbiente ? 'Sí' : 'No',
        signosETA: record.signosETA ? 'Sí' : 'No',
        calidadVariado: record.calidadVariado ? 'Sí' : 'No',
        fechaVencimiento: record.fechaVencimiento ? 'Sí' : 'No',
        conservacionAlimentos: record.conservacionAlimentos ? 'Sí' : 'No',
        amabilidad: record.amabilidad ? 'Sí' : 'No',
        tiempoServicio: record.tiempoServicio ? 'Sí' : 'No',
        calidadPrecio: record.calidadPrecio ? 'Sí' : 'No',
        preciosCompetitivos: record.preciosCompetitivos ? 'Sí' : 'No',

        estadoEquipamiento: record.estadoEquipamiento ? 'Sí' : 'No',
        observaciones: record.observaciones || '',
        aprobado: record.aprobado || '',
      })

      worksheet.getRow(1).font = { bold: true }
      worksheet.eachRow((row, rowNumber) => {
        row.alignment = {
          vertical: 'top',
          horizontal: 'left',
          wrapText: true,
        }
        if (rowNumber === 1) {
          row.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          }
        }
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safeDate = (record.fecha || 'sin-fecha').replace(/\s+/g, '-')
      const safeConcesionario = (record.concesionario || 'sin-concesionario')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      link.download = `cafeteria-supervision-${safeConcesionario}-${safeDate}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Descarga generada correctamente.')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const renderDateTooltip = (props: any) => {
    const { active, payload, label } = props as {
      active?: boolean
      payload?: Array<{
        payload?: {
          value?: number
          details?: {
            concesionario: string
            supervisor: string
            periodo: string
          }[]
        }
      }>
      label?: string | number
    }

    if (!active || !payload?.length) return null

    const point = payload[0]?.payload

    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-lg'>
        <p className='text-sm font-semibold text-on-surface'>
          {String(label ?? '')}
        </p>
        <p className='mt-1 text-sm text-on-surface-variant'>
          {point?.value ?? 0} respuestas SI
        </p>
        <div className='mt-3 space-y-2'>
          {(point?.details || []).map((detail, index) => (
            <div
              key={`${detail.concesionario}-${detail.supervisor}-${index}`}
              className='rounded-xl bg-surface-container-low px-3 py-2 text-sm'
            >
              <p className='font-medium text-on-surface'>
                Concesionario: {detail.concesionario}
              </p>
              <p className='text-on-surface-variant'>
                Supervisor: {detail.supervisor}
              </p>
              <p className='text-on-surface-variant'>
                Periodo: {detail.periodo}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderQuestionPeriodTooltip = (props: any) => {
    const { active, payload, label } = props as {
      active?: boolean
      payload?: Array<{
        payload?: {
          yesCount?: number
          noCount?: number
          totalAnswered?: number
          yesPercentage?: number
        }
      }>
      label?: string | number
    }

    if (!active || !payload?.length) return null

    const point = payload[0]?.payload

    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-lg'>
        <p className='text-sm font-semibold text-on-surface'>
          {String(label ?? '')}
        </p>
        <p className='mt-1 text-sm text-on-surface-variant'>
          {point?.yesPercentage ?? 0}% respuestas SI
        </p>
        <div className='mt-3 grid gap-1 text-sm text-on-surface-variant'>
          <p>
            SI:{' '}
            <span className='font-semibold text-on-surface'>
              {point?.yesCount ?? 0}
            </span>
          </p>
          <p>
            NO:{' '}
            <span className='font-semibold text-on-surface'>
              {point?.noCount ?? 0}
            </span>
          </p>
          <p>
            Total:{' '}
            <span className='font-semibold text-on-surface'>
              {point?.totalAnswered ?? 0}
            </span>
          </p>
        </div>
      </div>
    )
  }

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

      estadoEquipamiento: record.estadoEquipamiento,
      observaciones: record.observaciones,
      aprobado: record.aprobado || '',
    })
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

      estadoEquipamiento: record.estadoEquipamiento,
      observaciones: record.observaciones,
      aprobado: record.aprobado || '',
    })
    setMode('view')
  }

  const handleDeleteRequest = (id: string) => {
    const record = records.find((item) => item.id === id) || null
    setRecordToDelete(record)
  }

  const handleCancelDelete = () => {
    setRecordToDelete(null)
  }

  const renderReportTab = () => (
    <div className='space-y-6'>
      <section className='rounded-[32px] border border-outline-variant/20 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.05)]'>
        <div className='inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm'>
          <span className='material-symbols-outlined text-xl'>analytics</span>
          Resumen histórico de cafetería
        </div>
        <h1 className='mt-6 text-4xl font-extrabold tracking-tight text-on-surface'>
          Consolidado de respuestas por pregunta
        </h1>
        <p className='mt-4 max-w-2xl text-base leading-7 text-on-surface-variant'>
          Consulta el comportamiento de cada criterio de supervisión y filtra
          por período para revisar el historial completo.
        </p>
        <div className='mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-3xl bg-white/95 border border-outline-variant/20 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
              Registros filtrados
            </p>
            <p className='mt-3 text-3xl font-bold text-primary'>
              {reportAverages.total}
            </p>
          </div>
          <div className='rounded-3xl bg-white/95 border border-outline-variant/20 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
              Aprobados
            </p>
            <p className='mt-3 text-3xl font-bold text-secondary'>
              {reportAverages.approvedCount}
            </p>
          </div>
          <div className='rounded-3xl bg-white/95 border border-outline-variant/20 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
              En revisión
            </p>
            <p className='mt-3 text-3xl font-bold text-amber-600'>
              {reportAverages.reviewCount}
            </p>
          </div>
          <div className='rounded-3xl bg-white/95 border border-outline-variant/20 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
              Promedio de respuestas SI
            </p>
            <p className='mt-3 text-3xl font-bold text-primary'>
              {reportAverages.averageYes}
            </p>
          </div>
        </div>
      </section>

      <section className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm space-y-6'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
            I) Datos Generales
          </p>
          <h2 className='mt-2 text-2xl font-bold text-on-surface'>
            Tendencia general y estado de supervisión
          </h2>
        </div>

        <div className='grid gap-6 xl:grid-cols-2'>
          <article className='rounded-3xl border border-slate-200 bg-surface-container-lowest p-5 shadow-sm'>
            <div className='mb-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant'>
                Periodo de supervisión
              </p>
              <h3 className='mt-2 text-base font-semibold text-on-surface'>
                Respuestas Sí por periodo
              </h3>
            </div>

            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={reportDateSeries}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={renderDateTooltip} />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='#3b82f6'
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className='rounded-3xl border border-slate-200 bg-surface-container-lowest p-5 shadow-sm'>
            <div className='mb-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant'>
                Estado de la supervisión
              </p>
              <h3 className='mt-2 text-base font-semibold text-on-surface'>
                Distribución por resultado
              </h3>
            </div>
            <PieChartComponent data={reportStatusData} showLegend compact />
          </article>
        </div>
      </section>

      <section className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-4'>
            <div className='flex flex-wrap items-end gap-3'>
              <div>
                <label className='block text-sm font-semibold text-on-surface'>
                  Filtro de fechas
                </label>
                <select
                  value={cafeteriaDateRange}
                  onChange={(event) =>
                    setCafeteriaDateRange(
                      event.target.value as CafeteriaDateRangeOption,
                    )
                  }
                  className='mt-2 w-full min-w-[220px] rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface'
                >
                  {CAFETERIA_DATE_RANGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type='button'
                onClick={downloadFilteredReport}
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90'
              >
                <span className='material-symbols-outlined text-lg'>
                  download
                </span>
                Descargar
              </button>
            </div>
            {cafeteriaDateRange === 'Personalizado' && (
              <div className='grid gap-3 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-semibold text-on-surface'>
                    Desde
                  </label>
                  <input
                    type='date'
                    value={cafeteriaCustomStartDate}
                    onChange={(event) =>
                      setCafeteriaCustomStartDate(event.target.value)
                    }
                    className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-on-surface'>
                    Hasta
                  </label>
                  <input
                    type='date'
                    value={cafeteriaCustomEndDate}
                    onChange={(event) =>
                      setCafeteriaCustomEndDate(event.target.value)
                    }
                    className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface'
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-8'>
          {CAFETERIA_QUESTION_GROUPS.map((group) => {
            const groupItems = reportSummary.filter(
              (item) => item.group === group,
            )

            return (
              <section key={group} className='space-y-4'>
                <div className='flex items-center justify-between gap-4'>
                  <div>
                    <h3 className='mt-2 text-xl font-bold text-on-surface'>
                      {group}
                    </h3>
                  </div>
                  <div className='rounded-full bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant'>
                    {groupItems.length} preguntas
                  </div>
                </div>

                <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
                  {groupItems.map((item) => {
                    const questionSeries = reportQuestionPeriodSeries.find(
                      (seriesItem) => seriesItem.key === item.key,
                    )
                    const noPercentage =
                      item.totalAnswered > 0
                        ? Math.round((item.noCount / item.totalAnswered) * 100)
                        : 0
                    const series = questionSeries?.series ?? []

                    return (
                      <article
                        key={item.key}
                        className='rounded-3xl border border-slate-200 bg-surface-container-lowest p-5 shadow-sm'
                      >
                        <div className='mb-4'>
                          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant'>
                            Pregunta
                          </p>
                          <h4 className='mt-2 text-base font-semibold text-on-surface'>
                            {item.label}
                          </h4>
                          <div className='mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant'>
                            <span className='rounded-full bg-surface-container-low px-3 py-1'>
                              SI {item.yesPercentage}% ({item.yesCount})
                            </span>
                            <span className='rounded-full bg-surface-container-low px-3 py-1'>
                              NO {noPercentage}% ({item.noCount})
                            </span>
                            <span className='rounded-full bg-surface-container-low px-3 py-1'>
                              Total {item.totalAnswered}
                            </span>
                          </div>
                        </div>
                        <div className='h-56'>
                          {series.length === 0 ? (
                            <div className='flex h-full items-center justify-center text-xs text-on-surface-variant'>
                              Sin periodos para graficar.
                            </div>
                          ) : (
                            <ResponsiveContainer width='100%' height='100%'>
                              <LineChart
                                data={series}
                                margin={{
                                  top: 10,
                                  right: 20,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis
                                  dataKey='period'
                                  tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  allowDecimals={false}
                                  tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                  content={renderQuestionPeriodTooltip}
                                />
                                <Line
                                  type='monotone'
                                  dataKey='yesPercentage'
                                  stroke='#0ea5e9'
                                  strokeWidth={3}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </section>

      <section className='rounded-[32px] border border-outline-variant/20 bg-white/95 p-6 shadow-sm'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant'>
            II) Observaciones
          </p>
          <h2 className='mt-2 text-2xl font-bold text-on-surface'>
            Observaciones registradas
          </h2>
          <p className='mt-2 text-sm text-on-surface-variant'>
            Se listan las observaciones de los registros filtrados.
          </p>
        </div>

        {reportObservations.length === 0 ? (
          <div className='mt-6 overflow-hidden rounded-3xl border border-dashed border-outline-variant/50 bg-surface-container-lowest px-6 py-10 text-center'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high'>
              <span className='text-2xl'>📝</span>
            </div>

            <h3 className='mt-4 text-sm font-semibold text-on-surface'>
              No hay observaciones
            </h3>

            <p className='mt-1 text-sm text-on-surface-variant'>
              No se encontraron registros para el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className='mt-6 relative'>
            {/* línea timeline */}
            <div className='absolute left-[18px] top-0 h-full w-px bg-gradient-to-b from-primary/40 via-outline-variant to-transparent' />

            <div className='space-y-5'>
              {reportObservations.map((item, index) => (
                <article key={`${item.id}-${index}`} className='relative pl-14'>
                  {/* punto timeline */}
                  <div className='absolute left-0 top-1'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 backdrop-blur'>
                      <div className='h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.6)]' />
                    </div>
                  </div>

                  {/* card */}
                  <div className='group overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg'>
                    {/* header */}
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                      <div>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                            {item.periodo}
                          </span>

                          <span className='text-xs text-on-surface-variant'>
                            {item.fecha}
                            {item.hora ? ` · ${item.hora}` : ''}
                          </span>
                        </div>
                      </div>

                      <span className='rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 text-[11px] font-medium text-on-surface-variant'>
                        #{index + 1}
                      </span>
                    </div>

                    {/* contenido */}
                    <p className='mt-2 whitespace-pre-line text-sm leading-6 text-on-surface'>
                      {item.observaciones}
                    </p>

                    {/* footer */}
                    <div className='mt-3 flex flex-wrap items-center gap-2 border-t border-outline-variant/30 pt-4 text-xs text-on-surface-variant'>
                      <span className='rounded-full bg-surface-container-high px-3 py-1 flex items-center gap-1 text-primary'>
                        <span className='material-symbols-outlined text-sm '>
                          food_bank
                        </span>

                        {item.concesionario}
                      </span>

                      <span className='rounded-full bg-surface-container-high px-3 py-1 flex items-center gap-1 text-primary'>
                        <span className='material-symbols-outlined text-sm '>
                          person
                        </span>

                        {item.supervisor}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )

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
            <div className='flex flex-wrap gap-3 rounded-[28px] border border-outline-variant/20 bg-white/95 p-3 shadow-sm'>
              <button
                type='button'
                onClick={() => setActiveTab('list')}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === 'list'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Listado
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('report')}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === 'report'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Resumen histórico
              </button>
            </div>

            {loadError && (
              <div className='rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700'>
                {loadError}
              </div>
            )}

            {activeTab === 'report' ? (
              renderReportTab()
            ) : (
              <>
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
                      Administra registros, exporta resultados y revisa el
                      estado de cada supervisión desde un panel claro y moderno.
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
                  onDownload={downloadSingleReport}
                  onDelete={handleDeleteRequest}
                />
              </>
            )}
          </>
        ) : (
          <CafeteriaSupervisionForm
            form={form}
            errors={errors}
            onInputChange={handleInputChange}
            onCancel={() => {
              setForm(initialFormState)
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
