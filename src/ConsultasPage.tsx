import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { useLocation } from 'react-router'
import Layout from './Layout'
import { consultaService } from './services/consultaService'
import { useAppData, type HistoryAttendance } from './AppDataContext'
import toast from 'react-hot-toast'

type AttendanceFollowUp = {
  idSeguimiento: string
  idAtencion: string
  fechaSeguimiento: string
  hora: string
  asistio: string
  nivelCompromiso: string
  observaciones: string
}

const ATTENDANCE_TYPES = ['Todos', 'Estudiantes', 'Administrativos'] as const
const ATTENDANCE_RESULTS = [
  'Todos',
  'Finalizado',
  'En Seguimiento',
  'Derivado',
  'No concluyente',
] as const

const DATE_RANGE_OPTIONS = [
  'Todos',
  'Últimos 7 días',
  'Este mes',
  'Semestre actual',
] as const

const EXPORT_DATE_RANGE_OPTIONS = [
  ...DATE_RANGE_OPTIONS,
  'Personalizado',
] as const

const FINALIZED_FOLLOWUP_OPTIONS = [
  'Todos',
  'Con seguimiento',
  'Sin seguimiento',
] as const

const PAGE_SIZE = 10

type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number]
type ExportDateRangeOption = (typeof EXPORT_DATE_RANGE_OPTIONS)[number]
type FinalizedFollowUpOption = (typeof FINALIZED_FOLLOWUP_OPTIONS)[number]

function ConsultasPage() {
  const location = useLocation()
  const { attendances, attendancesLoading, updateAttendance } = useAppData()
  const [isSaving, setIsSaving] = useState(false)
  const [selectedAttendance, setSelectedAttendance] =
    useState<HistoryAttendance | null>(null)
  const [receiptAttendance, setReceiptAttendance] =
    useState<HistoryAttendance | null>(null)
  const [attendanceReceiptEmail, setAttendanceReceiptEmail] = useState('')
  const [isAttendanceEmailConfirmOpen, setIsAttendanceEmailConfirmOpen] =
    useState(false)
  const [isSendingAttendanceEmail, setIsSendingAttendanceEmail] =
    useState(false)
  const [attendanceEmailSent, setAttendanceEmailSent] = useState<
    Record<string, boolean>
  >({})
  const [attendanceFollowUps, setAttendanceFollowUps] = useState<
    Record<string, AttendanceFollowUp[]>
  >({})
  const [expandedAttendanceOrders, setExpandedAttendanceOrders] = useState<
    Record<string, boolean>
  >({})
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState<
    Record<string, boolean>
  >({})
  const [creatingFollowUpOrder, setCreatingFollowUpOrder] = useState<
    string | null
  >(null)
  const [editingFollowUp, setEditingFollowUp] =
    useState<AttendanceFollowUp | null>(null)
  const [followUpToDelete, setFollowUpToDelete] = useState<{
    order: string
    followUp: AttendanceFollowUp
  } | null>(null)
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false)
  const [newFollowUpForm, setNewFollowUpForm] = useState({
    fechaSeguimiento: '',
    hora: '',
    asistio: 'Sí',
    nivelCompromiso: '',
    observaciones: '',
  })
  const receiptPreviewRef = useRef<HTMLDivElement | null>(null)
  const [editForm, setEditForm] = useState({
    resultado: 'Finalizado',
    observaciones: '',
    horaSalida: '',
  })
  const [typeFilter, setTypeFilter] =
    useState<(typeof ATTENDANCE_TYPES)[number]>('Todos')
  const [statusFilter, setStatusFilter] =
    useState<(typeof ATTENDANCE_RESULTS)[number]>('Todos')
  const [finalizedFollowUpFilter, setFinalizedFollowUpFilter] =
    useState<FinalizedFollowUpOption>('Todos')
  const [dateRangeFilter, setDateRangeFilter] =
    useState<DateRangeOption>('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportDateRangeOption, setExportDateRangeOption] =
    useState<ExportDateRangeOption>('Todos')
  const [exportCustomStartDate, setExportCustomStartDate] = useState('')
  const [exportCustomEndDate, setExportCustomEndDate] = useState('')
  const [exportIncludeStudentInfo, setExportIncludeStudentInfo] = useState(true)
  const [
    exportIncludeGestationDisability,
    setExportIncludeGestationDisability,
  ] = useState(false)
  const [exportIncludeFollowUps, setExportIncludeFollowUps] = useState(true)
  const [exportIncludeContactInfo, setExportIncludeContactInfo] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const motivoFromUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('motivo')?.trim() || ''
  }, [location.search])
  const appliedMotivoFromUrlRef = useRef('')

  const parseAttendanceDate = (value: string) => {
    const normalized = String(value || '').trim()
    if (!normalized) {
      return null
    }

    const ddmmyyyyMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch
      const date = new Date(Number(year), Number(month) - 1, Number(day))
      return Number.isNaN(date.getTime()) ? null : date
    }

    const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      const [, year, month, day] = isoMatch
      const date = new Date(Number(year), Number(month) - 1, Number(day))
      return Number.isNaN(date.getTime()) ? null : date
    }

    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const formatDateForDateInput = (value: string) => {
    const normalized = String(value || '').trim()
    if (!normalized) {
      return ''
    }

    const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      return normalized
    }

    const dmyMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    const parsed = new Date(normalized)
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear()
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const day = String(parsed.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return ''
  }

  const formatDateForDisplay = (value: string) => {
    const normalized = String(value || '').trim()
    if (!normalized) {
      return ''
    }

    const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      const [, year, month, day] = isoMatch
      return `${day}/${month}/${year}`
    }

    const dmyMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
    }

    const parsed = new Date(normalized)
    if (!Number.isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0')
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const year = parsed.getFullYear()
      return `${day}/${month}/${year}`
    }

    return normalized
  }

  const normalizeAttendanceFollowUp = (
    followUp: AttendanceFollowUp,
  ): AttendanceFollowUp => ({
    ...followUp,
    idSeguimiento: String(followUp.idSeguimiento || '').trim(),
    fechaSeguimiento: formatDateForDisplay(followUp.fechaSeguimiento),
  })

  const parseFollowUpDateTime = (followUp: AttendanceFollowUp) => {
    const date = parseAttendanceDate(followUp.fechaSeguimiento)
    if (!date) {
      return null
    }

    const normalizedTime = String(followUp.hora || '').trim()
    const timeMatch = normalizedTime.match(/^([0-9]{1,2}):([0-9]{2})/)
    if (!timeMatch) {
      return date.getTime()
    }

    const [, hours, minutes] = timeMatch
    const combined = new Date(date)
    combined.setHours(Number(hours), Number(minutes), 0, 0)
    return combined.getTime()
  }

  const sortFollowUpsByDate = (followUps: AttendanceFollowUp[]) =>
    followUps
      .map((followUp, index) => ({ followUp, index }))
      .sort((left, right) => {
        const leftTime = parseFollowUpDateTime(left.followUp)
        const rightTime = parseFollowUpDateTime(right.followUp)

        if (leftTime === null && rightTime === null) {
          return left.index - right.index
        }

        if (leftTime === null) {
          return 1
        }

        if (rightTime === null) {
          return -1
        }

        if (leftTime !== rightTime) {
          return leftTime - rightTime
        }

        return left.index - right.index
      })
      .map(({ followUp }) => followUp)

  const isAttendanceInDateRange = (
    attendanceDate: string,
    range: DateRangeOption,
  ) => {
    if (range === 'Todos') {
      return true
    }

    const date = parseAttendanceDate(attendanceDate)
    if (!date) {
      return false
    }

    const today = new Date()
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )

    if (range === 'Últimos 7 días') {
      const sevenDaysAgo = new Date(startOfToday)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      return date >= sevenDaysAgo && date <= startOfToday
    }

    if (range === 'Este mes') {
      return (
        date.getFullYear() === startOfToday.getFullYear() &&
        date.getMonth() === startOfToday.getMonth()
      )
    }

    const month = startOfToday.getMonth()
    const semesterStart =
      month < 6
        ? new Date(startOfToday.getFullYear(), 0, 1)
        : new Date(startOfToday.getFullYear(), 6, 1)
    const semesterEnd =
      month < 6
        ? new Date(startOfToday.getFullYear(), 5, 30)
        : new Date(startOfToday.getFullYear(), 11, 31)

    return date >= semesterStart && date <= semesterEnd
  }

  const isAttendanceInExportDateRange = (
    attendanceDate: string,
    range: ExportDateRangeOption,
    customStart: string,
    customEnd: string,
  ) => {
    if (range !== 'Personalizado') {
      return isAttendanceInDateRange(attendanceDate, range)
    }

    const attendance = parseAttendanceDate(attendanceDate)
    if (!attendance) {
      return false
    }

    const startDate = parseAttendanceDate(customStart)
    const endDate = parseAttendanceDate(customEnd)

    if (startDate && endDate) {
      return attendance >= startDate && attendance <= endDate
    }

    if (startDate) {
      return attendance >= startDate
    }

    if (endDate) {
      return attendance <= endDate
    }

    return true
  }

  const filteredAttendances = useMemo(
    () =>
      attendances.filter((attendance) => {
        const normalizedUserType = attendance.userType.toLowerCase()
        const matchesType =
          typeFilter === 'Todos' ||
          (typeFilter === 'Estudiantes' &&
            normalizedUserType.includes('estudiante')) ||
          (typeFilter === 'Administrativos' &&
            normalizedUserType.includes('administr')) ||
          attendance.userType === typeFilter
        const matchesStatus =
          statusFilter === 'Todos' || attendance.resultado === statusFilter
        const followUpCount =
          attendance.followUps?.length ??
          attendanceFollowUps[attendance.orden]?.length ??
          0
        const matchesFinalizedFollowUp =
          statusFilter !== 'Finalizado' ||
          finalizedFollowUpFilter === 'Todos' ||
          (finalizedFollowUpFilter === 'Con seguimiento' &&
            followUpCount > 0) ||
          (finalizedFollowUpFilter === 'Sin seguimiento' && followUpCount === 0)
        const matchesDateRange = isAttendanceInDateRange(
          attendance.fechaAtencion,
          dateRangeFilter,
        )
        const normalizedSearch = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !normalizedSearch ||
          [
            attendance.nombreCompleto,
            attendance.correoElectronico,
            attendance.dni,
            attendance.motivoAtencion,
          ].some((field) =>
            String(field || '')
              .toLowerCase()
              .includes(normalizedSearch),
          )
        return (
          matchesType &&
          matchesStatus &&
          matchesFinalizedFollowUp &&
          matchesDateRange &&
          matchesSearch
        )
      }),
    [
      attendances,
      statusFilter,
      typeFilter,
      finalizedFollowUpFilter,
      dateRangeFilter,
      searchTerm,
    ],
  )

  useEffect(() => {
    if (!motivoFromUrl) {
      appliedMotivoFromUrlRef.current = ''
      return
    }

    if (searchTerm !== motivoFromUrl) {
      setSearchTerm(motivoFromUrl)
    }
  }, [motivoFromUrl, searchTerm])

  useEffect(() => {
    if (!motivoFromUrl || attendancesLoading || attendances.length === 0) {
      return
    }

    if (appliedMotivoFromUrlRef.current === motivoFromUrl) {
      return
    }

    const matchingAttendances = filteredAttendances.filter((attendance) => {
      const normalizedMotivo = String(attendance.motivoAtencion || '')
        .toLowerCase()
        .trim()
      return normalizedMotivo.includes(motivoFromUrl.toLowerCase())
    })

    if (matchingAttendances.length === 0) {
      return
    }

    appliedMotivoFromUrlRef.current = motivoFromUrl

    setExpandedAttendanceOrders((prev) => {
      const next = { ...prev }
      matchingAttendances.forEach((attendance) => {
        next[attendance.orden] = true
      })
      return next
    })

    void Promise.all(
      matchingAttendances.map(async (attendance) => {
        const hasKnownFollowUps =
          (attendance.followUps?.length ?? 0) > 0 ||
          (attendanceFollowUps[attendance.orden]?.length ?? 0) > 0

        if (hasKnownFollowUps) {
          return
        }

        if (
          String(attendance.resultado || '')
            .toLowerCase()
            .includes('seguimiento')
        ) {
          await loadAttendanceFollowUps(attendance.orden)
        }
      }),
    )
  }, [
    attendances.length,
    attendancesLoading,
    attendanceFollowUps,
    filteredAttendances,
    motivoFromUrl,
  ])

  const exportAttendances = useMemo(
    () =>
      filteredAttendances.filter((attendance) =>
        isAttendanceInExportDateRange(
          attendance.fechaAtencion,
          exportDateRangeOption,
          exportCustomStartDate,
          exportCustomEndDate,
        ),
      ),
    [
      filteredAttendances,
      exportDateRangeOption,
      exportCustomStartDate,
      exportCustomEndDate,
    ],
  )

  const escapeXml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const jsonToExcelBlob = (data: any[]) => {
    const columns = new Set<string>()
    data.forEach((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach((key) => columns.add(key))
      }
    })

    const headers = Array.from(columns)
    const rows = data.map((item) => {
      return `  <Row>${headers
        .map((key) => {
          const value = item ? item[key] : ''
          const text = value == null ? '' : String(value)
          const type = /^-?\d+(\.\d+)?$/.test(text) ? 'Number' : 'String'
          return `<Cell><Data ss:Type="${type}">${escapeXml(text)}</Data></Cell>`
        })
        .join('')}</Row>`
    })

    const workbook = [
      '<?xml version="1.0"?>',
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
      ' xmlns:o="urn:schemas-microsoft-com:office:office"',
      ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
      ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
      '<Worksheet ss:Name="Reporte">',
      '<Table>',
      `<Row>${headers
        .map(
          (header) =>
            `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`,
        )
        .join('')}</Row>`,
      ...rows,
      '</Table>',
      '</Worksheet>',
      '</Workbook>',
    ].join('')

    return new Blob([workbook], { type: 'application/vnd.ms-excel' })
  }

  const downloadExportReport = async () => {
    setIsExporting(true)

    try {
      const reportData = await consultaService.exportAttendanceReport({
        filterType: typeFilter,
        filterStatus: statusFilter,
        filterFinalizedFollowUp: finalizedFollowUpFilter,
        filterSearch: searchTerm,
        filterDateRange: dateRangeFilter,
        exportRange: exportDateRangeOption,
        exportStartDate: exportCustomStartDate,
        exportEndDate: exportCustomEndDate,
        includeStudentInfo: exportIncludeStudentInfo,
        includeContactInfo: exportIncludeContactInfo,
        includeGestationDisability: exportIncludeGestationDisability,
        includeFollowUps: exportIncludeFollowUps,
      })

      if (!Array.isArray(reportData) || reportData.length === 0) {
        toast.error(
          'No hay registros para exportar con los criterios seleccionados',
        )
        return
      }

      const blob = jsonToExcelBlob(reportData)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `reporte-consultas-${Date.now()}.xls`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setIsExportModalOpen(false)
      toast.success('Reporte descargado correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo generar el reporte')
    } finally {
      setIsExporting(false)
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAttendances.length / PAGE_SIZE),
  )
  const currentPageSafe = Math.min(currentPage, totalPages)
  const paginatedAttendances = filteredAttendances.slice(
    (currentPageSafe - 1) * PAGE_SIZE,
    currentPageSafe * PAGE_SIZE,
  )
  const pageStart =
    filteredAttendances.length === 0 ? 0 : (currentPageSafe - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(
    filteredAttendances.length,
    currentPageSafe * PAGE_SIZE,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    typeFilter,
    statusFilter,
    finalizedFollowUpFilter,
    dateRangeFilter,
    searchTerm,
  ])

  useEffect(() => {
    const shouldLockScroll = Boolean(
      selectedAttendance ||
      receiptAttendance ||
      creatingFollowUpOrder ||
      followUpToDelete ||
      isExportModalOpen ||
      isAttendanceEmailConfirmOpen,
    )

    const previousOverflow = document.body.style.overflow
    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [
    selectedAttendance,
    receiptAttendance,
    creatingFollowUpOrder,
    followUpToDelete,
    isExportModalOpen,
    isAttendanceEmailConfirmOpen,
  ])

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages: number[] = [1]
    if (currentPageSafe > 3) {
      pages.push(-1)
    }

    const startPage = Math.max(2, currentPageSafe - 1)
    const endPage = Math.min(totalPages - 1, currentPageSafe + 1)
    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page)
    }

    if (currentPageSafe < totalPages - 2) {
      pages.push(-1)
    }

    pages.push(totalPages)
    return pages
  }, [currentPageSafe, totalPages])

  const handleSelectAttendance = (attendance: HistoryAttendance) => {
    setSelectedAttendance(attendance)
    setEditForm({
      resultado: attendance.resultado || 'Finalizado',
      observaciones: attendance.observaciones || '',
      horaSalida: attendance.horaSalida || '',
    })
  }

  const handleOpenReceiptModal = (attendance: HistoryAttendance) => {
    setReceiptAttendance(attendance)
  }

  const handleEditFollowUp = async (
    attendance: HistoryAttendance,
    followUp: AttendanceFollowUp,
  ) => {
    setCreatingFollowUpOrder(attendance.orden)
    setEditingFollowUp(followUp)
    setNewFollowUpForm({
      fechaSeguimiento: formatDateForDateInput(followUp.fechaSeguimiento),
      hora: followUp.hora,
      asistio: followUp.asistio || 'Sí',
      nivelCompromiso: followUp.nivelCompromiso,
      observaciones: followUp.observaciones,
    })

    if (!attendanceFollowUps[attendance.orden]) {
      const current = attendance.followUps || []
      if (current.length > 0) {
        setAttendanceFollowUps((prev) => ({
          ...prev,
          [attendance.orden]: current,
        }))
      } else {
        await loadAttendanceFollowUps(attendance.orden)
      }
    }
  }

  const handleStartNewFollowUp = async (attendance: HistoryAttendance) => {
    setCreatingFollowUpOrder(attendance.orden)
    setEditingFollowUp(null)
    setFollowUpToDelete(null)
    setNewFollowUpForm({
      fechaSeguimiento: '',
      hora: '',
      asistio: 'Sí',
      nivelCompromiso: '',
      observaciones: '',
    })

    if (!attendance.followUps && !attendanceFollowUps[attendance.orden]) {
      await loadAttendanceFollowUps(attendance.orden)
    }
  }

  const handleCancelNewFollowUp = () => {
    setCreatingFollowUpOrder(null)
    setEditingFollowUp(null)
    setFollowUpToDelete(null)
    setNewFollowUpForm({
      fechaSeguimiento: '',
      hora: '',
      asistio: 'Sí',
      nivelCompromiso: '',
      observaciones: '',
    })
  }

  const handleSaveFollowUp = async () => {
    if (!creatingFollowUpOrder) {
      return
    }

    if (!newFollowUpForm.fechaSeguimiento.trim()) {
      toast.error('Indique la fecha del seguimiento')
      return
    }

    setIsSavingFollowUp(true)
    try {
      const normalizedFechaSeguimiento = formatDateForDateInput(
        newFollowUpForm.fechaSeguimiento,
      )
      const displayFechaSeguimiento = formatDateForDisplay(
        normalizedFechaSeguimiento,
      )

      if (editingFollowUp) {
        await consultaService.updateAttendanceFollowUp({
          idSeguimiento: editingFollowUp.idSeguimiento,
          ...newFollowUpForm,
          fechaSeguimiento: normalizedFechaSeguimiento,
        })

        await loadAttendanceFollowUps(creatingFollowUpOrder, true)

        toast.success('Seguimiento actualizado correctamente')
      } else {
        const result = await consultaService.saveAttendanceFollowUp({
          orden: creatingFollowUpOrder,
          ...newFollowUpForm,
          fechaSeguimiento: normalizedFechaSeguimiento,
        })

        const savedFollowUp: AttendanceFollowUp = {
          idSeguimiento: String(
            result?.idSeguimiento || result?.recordId || Date.now(),
          ),
          idAtencion: creatingFollowUpOrder,
          fechaSeguimiento: displayFechaSeguimiento,
          hora: newFollowUpForm.hora,
          asistio: newFollowUpForm.asistio,
          nivelCompromiso: newFollowUpForm.nivelCompromiso,
          observaciones: newFollowUpForm.observaciones,
        }

        setAttendanceFollowUps((prev) => ({
          ...prev,
          [creatingFollowUpOrder]: [savedFollowUp],
        }))

        await loadAttendanceFollowUps(creatingFollowUpOrder, true)

        toast.success('Seguimiento guardado correctamente')
      }

      handleCancelNewFollowUp()
    } catch (error) {
      console.error(error)
      toast.error(
        editingFollowUp
          ? 'No se pudo actualizar el seguimiento de la atención'
          : 'No se pudo guardar el seguimiento de la atención',
      )
    } finally {
      setIsSavingFollowUp(false)
    }
  }

  const handleCancelDelete = () => setFollowUpToDelete(null)

  const handleDeleteFollowUp = async () => {
    if (!followUpToDelete) {
      return
    }

    setIsSavingFollowUp(true)
    try {
      await consultaService.deleteAttendanceFollowUp(
        followUpToDelete.followUp.idSeguimiento,
      )
      await loadAttendanceFollowUps(followUpToDelete.order, true)
      toast.success('Seguimiento eliminado correctamente')
      setFollowUpToDelete(null)
      if (
        editingFollowUp &&
        editingFollowUp.idSeguimiento ===
          followUpToDelete.followUp.idSeguimiento
      ) {
        setEditingFollowUp(null)
      }
      handleCancelNewFollowUp()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo eliminar el seguimiento de la atención')
    } finally {
      setIsSavingFollowUp(false)
    }
  }

  const isSeguimientoStatus = (status: string) =>
    status.toLowerCase().includes('seguimiento')

  const getAttendanceFollowUps = (attendance: HistoryAttendance) =>
    sortFollowUpsByDate(
      attendanceFollowUps[attendance.orden] || attendance.followUps || [],
    )

  const loadAttendanceFollowUps = async (orden: string, force = false) => {
    if (!force && (attendanceFollowUps[orden] || isLoadingFollowUps[orden])) {
      return
    }

    setIsLoadingFollowUps((prev) => ({
      ...prev,
      [orden]: true,
    }))

    try {
      const followUps =
        await consultaService.getAttendanceFollowUpsByOrder(orden)
      setAttendanceFollowUps((prev) => ({
        ...prev,
        [orden]: followUps.map(normalizeAttendanceFollowUp),
      }))
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar los seguimientos de la atención')
    } finally {
      setIsLoadingFollowUps((prev) => ({
        ...prev,
        [orden]: false,
      }))
    }
  }

  const toggleAttendanceFollowUps = async (attendance: HistoryAttendance) => {
    const orden = attendance.orden
    const expanded = expandedAttendanceOrders[orden]

    setExpandedAttendanceOrders((prev) => ({
      ...prev,
      [orden]: !expanded,
    }))

    if (
      !expanded &&
      (isSeguimientoStatus(attendance.resultado) ||
        (attendance.followUps?.length ?? 0) > 0 ||
        (attendanceFollowUps[orden]?.length ?? 0) > 0) &&
      !attendance.followUps &&
      !attendanceFollowUps[orden]
    ) {
      await loadAttendanceFollowUps(orden)
    }
  }

  const handleCloseReceiptModal = () => {
    setReceiptAttendance(null)
    setAttendanceReceiptEmail('')
    setIsAttendanceEmailConfirmOpen(false)
  }

  const handleSaveAttendance = async () => {
    if (!selectedAttendance) {
      return
    }

    setIsSaving(true)
    try {
      await consultaService.updateAttendance({
        orden: selectedAttendance.orden,
        observaciones: editForm.observaciones,
        resultado: editForm.resultado,
        horaSalida: editForm.horaSalida,
      })

      updateAttendance(selectedAttendance.orden, {
        resultado: editForm.resultado,
        observaciones: editForm.observaciones,
        horaSalida: editForm.horaSalida,
      })
      toast.success('Atención actualizada correctamente')
      setSelectedAttendance(null)
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar la atención')
    } finally {
      setIsSaving(false)
    }
  }

  const ensureReceiptImagesLoaded = async () => {
    if (!receiptPreviewRef.current) {
      return
    }

    const images = Array.from(
      receiptPreviewRef.current.querySelectorAll<HTMLImageElement>('img'),
    )

    await Promise.all(
      images.map((img) => {
        if (img.complete) {
          return Promise.resolve()
        }

        return new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
      }),
    )
  }

  function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
    let binary = ''
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }

    return btoa(binary)
  }

  const generateReceiptPdfBase64 = async (includeSignature = true) => {
    if (!receiptPreviewRef.current) {
      throw new Error('No hay vista previa de constancia disponible')
    }

    await ensureReceiptImagesLoaded()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    const targetScale = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3)
    let elementToCapture: HTMLDivElement = receiptPreviewRef.current
    let cleanupContainer: HTMLDivElement | null = null

    if (!includeSignature) {
      const clone = receiptPreviewRef.current.cloneNode(true) as HTMLDivElement
      clone.style.position = 'fixed'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.width = `${receiptPreviewRef.current.offsetWidth}px`
      clone.style.height = `${receiptPreviewRef.current.offsetHeight}px`
      clone.style.opacity = '0'
      clone.style.pointerEvents = 'none'
      clone.classList.add('receipt-download-clone')
      clone.querySelectorAll('.receipt-signature').forEach((el) => el.remove())
      document.body.appendChild(clone)
      elementToCapture = clone
      cleanupContainer = clone
    }

    const canvas = await html2canvas(elementToCapture, {
      scale: targetScale,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      backgroundColor: '#f5f3ff',
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      width: elementToCapture.offsetWidth,
      height: elementToCapture.offsetHeight,
      removeContainer: true,
    })

    if (cleanupContainer) {
      cleanupContainer.remove()
    }

    const imgData = canvas.toDataURL('image/png')
    const imageBytes = await fetch(imgData).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.create()
    const a4Width = 595.28
    const a4Height = 841.89
    const page = pdfDoc.addPage([a4Width, a4Height])
    const pngImage = await pdfDoc.embedPng(imageBytes)

    const scale = Math.min(
      1,
      Math.min(a4Width / canvas.width, a4Height / canvas.height),
    )

    const imageWidth = canvas.width * scale
    const imageHeight = canvas.height * scale
    const x = (a4Width - imageWidth) / 2
    const y = a4Height - imageHeight

    page.drawImage(pngImage, {
      x,
      y,
      width: imageWidth,
      height: imageHeight,
    })

    const pdfBytes = await pdfDoc.save()
    return arrayBufferToBase64(pdfBytes)
  }

  const downloadAttendanceReceipt = async () => {
    if (!receiptAttendance) {
      return
    }

    const pdfBase64 = await generateReceiptPdfBase64(true)
    const binary = atob(pdfBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }

    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `constancia-${receiptAttendance.orden || 'atencion'}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const handleOpenAttendanceEmailConfirm = () => {
    if (!receiptAttendance) {
      return
    }

    setAttendanceReceiptEmail(receiptAttendance.correoElectronico || '')
    setIsAttendanceEmailConfirmOpen(true)
  }

  const handleCancelAttendanceEmailConfirm = () => {
    setIsAttendanceEmailConfirmOpen(false)
    setAttendanceReceiptEmail(receiptAttendance?.correoElectronico || '')
  }

  const handleSendAttendanceReceipt = async () => {
    if (!receiptAttendance || !attendanceReceiptEmail.trim()) {
      toast.error('Debes indicar un correo válido')
      return
    }

    setIsSendingAttendanceEmail(true)
    try {
      const pdfBase64 = await generateReceiptPdfBase64(true)
      await consultaService.sendAttendanceReceipt({
        orden: receiptAttendance.orden,
        correoElectronico: attendanceReceiptEmail.trim(),
        nombreCompleto: receiptAttendance.nombreCompleto,
        dni: receiptAttendance.dni,
        horaSalida: receiptAttendance.horaSalida,
        programa: receiptAttendance.programa,
        ciclo: receiptAttendance.ciclo,
        seccion: receiptAttendance.userType.toLowerCase().includes('administr')
          ? ''
          : receiptAttendance.periodo,
        motivoAtencion: receiptAttendance.motivoAtencion,
        observaciones: receiptAttendance.observaciones,
        pdfBase64,
      })

      setAttendanceEmailSent((prev) => ({
        ...prev,
        [receiptAttendance.orden]: true,
      }))
      setIsAttendanceEmailConfirmOpen(false)
      toast.success('Constancia enviada correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo enviar la constancia')
    } finally {
      setIsSendingAttendanceEmail(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes('finalizado')) {
      return 'bg-primary/10 text-primary'
    }
    if (normalized.includes('derivado')) {
      return 'bg-secondary-container text-on-secondary-fixed-variant'
    }
    if (normalized.includes('seguimiento')) {
      return 'bg-tertiary-container text-white'
    }
    return 'bg-surface-container-high text-on-surface-variant'
  }

  return (
    <Layout activeView='consultas' title='Consultas'>
      <div className='space-y-8'>
        <section className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h2 className='text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2'>
              Historial de Consultas
            </h2>
            <p className='text-on-surface-variant font-medium'>
              Gestión administrativa y seguimiento del Instituto Neumann.
            </p>
          </div>
        </section>

        <section className='bg-surface-container-lowest rounded-xl shadow-sm border border-slate-50 overflow-hidden'>
          <div className='p-6 border-b border-slate-50 space-y-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <div>
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as (typeof ATTENDANCE_TYPES)[number],
                    )
                  }
                  className='sm:min-w-[220px] rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                >
                  {ATTENDANCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === 'Todos' ? 'Todos' : type}
                    </option>
                  ))}
                </select>
              </div>
              <div className='hidden sm:flex items-center gap-2 bg-surface-container-high p-1 rounded-lg'>
                {ATTENDANCE_RESULTS.map((status) => (
                  <button
                    key={status}
                    type='button'
                    onClick={() => {
                      setStatusFilter(status)
                      if (status !== 'Finalizado') {
                        setFinalizedFollowUpFilter('Todos')
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      statusFilter === status
                        ? 'bg-white shadow-sm text-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Mobile: use a select for status to avoid overflow */}
              <div className='sm:hidden w-full'>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const value = e.target
                      .value as (typeof ATTENDANCE_RESULTS)[number]
                    setStatusFilter(value)
                    if (value !== 'Finalizado')
                      setFinalizedFollowUpFilter('Todos')
                  }}
                  className='w-full rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                >
                  {ATTENDANCE_RESULTS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              {statusFilter === 'Finalizado' && (
                <div>
                  <select
                    value={finalizedFollowUpFilter}
                    onChange={(event) =>
                      setFinalizedFollowUpFilter(
                        event.target.value as FinalizedFollowUpOption,
                      )
                    }
                    className='sm:min-w-[220px] rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                  >
                    {FINALIZED_FOLLOWUP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <label className='text-sm font-semibold text-on-surface-variant'>
                  Filtrar por fecha
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(event) =>
                    setDateRangeFilter(event.target.value as DateRangeOption)
                  }
                  className='rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                >
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='relative w-full max-w-md ml-auto'>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder='Buscar por nombre, correo, DNI o motivo...'
                  className='w-full rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                />
              </div>
            </div>
          </div>

          {/* Mobile: card list */}
          <div className='sm:hidden px-4 space-y-4'>
            {attendancesLoading ? (
              <div className='p-6 bg-white rounded-2xl shadow-sm text-center text-on-surface-variant'>
                Cargando historial...
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className='p-6 bg-white rounded-2xl shadow-sm text-center text-on-surface-variant'>
                No hay atenciones para mostrar.
              </div>
            ) : (
              paginatedAttendances.map((attendance) => {
                const followUps = getAttendanceFollowUps(attendance)
                return (
                  <div
                    key={attendance.orden}
                    className='bg-white rounded-2xl border border-outline-variant/20 p-4 shadow-sm'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-xs'>
                            {attendance.nombreCompleto
                              .split(' ')
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-bold text-on-surface truncate'>
                              {attendance.nombreCompleto}
                            </p>
                            <p className='text-sm text-on-surface-variant truncate'>
                              {attendance.fechaAtencion}
                              {attendance.horaSalida
                                ? ` · ${attendance.horaSalida}`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <p className='mt-3 text-sm text-on-surface line-clamp-2'>
                          {attendance.motivoAtencion ||
                            attendance.areaProblematica}
                        </p>
                      </div>

                      <div className='flex flex-col items-end gap-2'>
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-bold ${getStatusBadge(attendance.resultado)}`}
                        >
                          {attendance.resultado || 'Sin resultado'}
                        </span>
                        <div className='flex items-center gap-2'>
                          {(isSeguimientoStatus(attendance.resultado) ||
                            (attendance.followUps?.length ?? 0) > 0 ||
                            (attendanceFollowUps[attendance.orden]?.length ??
                              0) > 0) && (
                            <button
                              type='button'
                              onClick={() =>
                                toggleAttendanceFollowUps(attendance)
                              }
                              className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                              aria-label='Ver seguimientos'
                            >
                              <span className='material-symbols-outlined'>
                                {expandedAttendanceOrders[attendance.orden]
                                  ? 'expand_less'
                                  : 'expand_more'}
                              </span>
                            </button>
                          )}
                          <button
                            type='button'
                            onClick={() => handleOpenReceiptModal(attendance)}
                            className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                            aria-label='Ver constancia'
                          >
                            <span className='material-symbols-outlined'>
                              receipt_long
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedAttendanceOrders[attendance.orden] && (
                      <div className='mt-4 border-t border-outline-variant/20 pt-4 space-y-3'>
                        {isLoadingFollowUps[attendance.orden] ? (
                          <p className='text-sm text-on-surface-variant'>
                            Cargando seguimientos...
                          </p>
                        ) : followUps.length === 0 ? (
                          <div className='rounded-3xl border border-dashed border-outline-variant/20 bg-surface-container-low p-4 text-center'>
                            <p className='text-sm font-semibold text-on-surface'>
                              No hay seguimientos aún
                            </p>
                          </div>
                        ) : (
                          followUps.map((followUp, index) => {
                            const asistioLabel =
                              followUp.asistio !== ''
                                ? followUp.asistio
                                : 'Pendiente'

                            const commitmentLabel =
                              followUp.nivelCompromiso || 'Sin nivel'

                            return (
                              <div
                                key={followUp.idSeguimiento}
                                className='rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm'
                              >
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0'>
                                    <p className='text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant'>
                                      Seguimiento {index + 1}
                                    </p>
                                    <p className='mt-2 text-sm font-semibold text-on-surface'>
                                      Fecha y hora
                                    </p>
                                    <p className='text-sm text-on-surface-variant'>
                                      {followUp.fechaSeguimiento}
                                      {followUp.hora
                                        ? ` · ${followUp.hora}`
                                        : ''}
                                    </p>
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleEditFollowUp(attendance, followUp)
                                    }
                                    className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                                    aria-label='Editar seguimiento'
                                  >
                                    <span className='material-symbols-outlined text-sm'>
                                      edit
                                    </span>
                                  </button>
                                </div>

                                <div className='mt-3 flex flex-wrap gap-2'>
                                  <span className='inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary'>
                                    <span className='material-symbols-outlined text-[14px]'>
                                      event_available
                                    </span>
                                    Asistió: {asistioLabel}
                                  </span>
                                  <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                                    <span className='material-symbols-outlined text-[14px]'>
                                      trending_up
                                    </span>
                                    Compromiso: {commitmentLabel}
                                  </span>
                                </div>

                                <div className='mt-3 rounded-xl bg-surface-container-low px-3 py-2'>
                                  <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                    Observaciones
                                  </p>
                                  <p className='mt-1 text-sm text-on-surface'>
                                    {followUp.observaciones ||
                                      'Sin observaciones'}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className='hidden sm:block overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='bg-surface-container-low'>
                <tr>
                  <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Fecha y Hora
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Paciente
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Tipo
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Motivo
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center'>
                    Resultado
                  </th>
                  <th className='px-6 py-4'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {attendancesLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-8 text-center text-on-surface-variant'
                    >
                      Cargando historial...
                    </td>
                  </tr>
                ) : filteredAttendances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-8 text-center text-on-surface-variant'
                    >
                      No hay atenciones para mostrar.
                    </td>
                  </tr>
                ) : (
                  paginatedAttendances.map((attendance) => {
                    const followUps = getAttendanceFollowUps(attendance)

                    return (
                      <Fragment key={attendance.orden}>
                        <tr className='hover:bg-surface-container-low/50 transition-colors'>
                          <td className='px-4 py-2'>
                            <div className='flex flex-col'>
                              <span className='font-bold text-on-surface'>
                                {attendance.fechaAtencion}
                              </span>
                            </div>
                          </td>
                          <td className='px-4 py-2'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-xs'>
                                {attendance.nombreCompleto
                                  .split(' ')
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join('')}
                              </div>
                              <div>
                                <p className='font-bold text-on-surface'>
                                  {attendance.nombreCompleto}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-2'>
                            <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-surface-container-high text-on-surface-variant'>
                              {attendance.userType}
                            </span>
                          </td>
                          <td className='px-4 py-2'>
                            <p className='text-sm font-medium text-on-surface line-clamp-1'>
                              {attendance.motivoAtencion ||
                                attendance.areaProblematica}
                            </p>
                          </td>
                          <td className='px-4 py-2'>
                            <div className='flex justify-center'>
                              <span
                                className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(attendance.resultado)}`}
                              >
                                {attendance.resultado || 'Sin resultado'}
                              </span>
                            </div>
                          </td>
                          <td className='px-4 py-2 text-right flex justify-end gap-2'>
                            {(isSeguimientoStatus(attendance.resultado) ||
                              (attendance.followUps?.length ?? 0) > 0 ||
                              (attendanceFollowUps[attendance.orden]?.length ??
                                0) > 0) && (
                              <button
                                type='button'
                                onClick={() =>
                                  toggleAttendanceFollowUps(attendance)
                                }
                                className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                                aria-label='Ver seguimientos'
                              >
                                <span className='material-symbols-outlined'>
                                  {expandedAttendanceOrders[attendance.orden]
                                    ? 'expand_less'
                                    : 'expand_more'}
                                </span>
                              </button>
                            )}
                            <button
                              type='button'
                              onClick={() => handleSelectAttendance(attendance)}
                              className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                              aria-label='Editar atención'
                            >
                              <span className='material-symbols-outlined'>
                                edit
                              </span>
                            </button>
                            <button
                              type='button'
                              onClick={() => handleOpenReceiptModal(attendance)}
                              className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                              aria-label='Ver constancia'
                            >
                              <span className='material-symbols-outlined'>
                                receipt_long
                              </span>
                            </button>
                          </td>
                        </tr>
                        {expandedAttendanceOrders[attendance.orden] && (
                          <tr className='bg-surface-container-lowest'>
                            <td colSpan={6} className='px-6 py-4'>
                              <div className='rounded-3xl border border-outline-variant/20 bg-white p-4'>
                                <div className='mb-5 flex flex-wrap items-center justify-between gap-4'>
                                  <div className='flex items-center gap-4'>
                                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary'>
                                      <span className='material-symbols-outlined'>
                                        assignment
                                      </span>
                                    </div>

                                    <div>
                                      <p className='text-base font-semibold text-on-surface'>
                                        Seguimientos de la atención
                                      </p>

                                      <p className='text-sm text-on-surface-variant'>
                                        {followUps.length} seguimiento(s)
                                        registrado(s)
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleStartNewFollowUp(attendance)
                                    }
                                    className='inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90'
                                  >
                                    <span className='material-symbols-outlined text-base'>
                                      add_circle
                                    </span>

                                    {followUps.length > 0
                                      ? 'Agregar seguimiento'
                                      : 'Crear seguimiento'}
                                  </button>
                                </div>
                                {isLoadingFollowUps[attendance.orden] ? (
                                  <p className='text-sm text-on-surface-variant'>
                                    Cargando seguimientos...
                                  </p>
                                ) : followUps.length === 0 ? (
                                  <div className='rounded-3xl border border-dashed border-outline-variant/20 bg-surface-container-low p-6 text-center'>
                                    <p className='text-sm font-semibold text-on-surface'>
                                      No hay seguimientos aún
                                    </p>
                                    <p className='mt-2 text-sm text-on-surface-variant'>
                                      Haz clic en "Crear seguimiento" para
                                      registrar el primer estado.
                                    </p>
                                  </div>
                                ) : (
                                  <div className='space-y-3'>
                                    {followUps.map((followUp, index) => {
                                      const asistioLabel =
                                        followUp.asistio !== ''
                                          ? followUp.asistio
                                          : 'Pendiente'

                                      const commitmentLabel =
                                        followUp.nivelCompromiso || 'Sin nivel'

                                      const labelChipClass =
                                        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold'

                                      return (
                                        <div
                                          key={followUp.idSeguimiento}
                                          className='rounded-3xl border border-outline-variant/20 bg-white p-5 shadow-sm transition hover:shadow-md'
                                        >
                                          <div className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr_1.2fr_auto] lg:items-start'>
                                            {/* INFO */}
                                            <div className='min-w-0'>
                                              <p className='text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant'>
                                                Seguimiento {index + 1}
                                              </p>
                                              <div className='mt-2 rounded-2xl bg-surface-container-low px-4 py-3'>
                                                <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                                  Fecha y hora
                                                </p>
                                                <p className='mt-1 text-sm font-semibold text-on-surface'>
                                                  {followUp.fechaSeguimiento}
                                                  {followUp.hora
                                                    ? ` · ${followUp.hora}`
                                                    : ''}
                                                </p>
                                              </div>
                                            </div>

                                            {/* BADGES */}
                                            <div className='flex flex-wrap gap-2'>
                                              <span
                                                className={`${labelChipClass} bg-secondary/10 text-secondary`}
                                              >
                                                <span className='material-symbols-outlined text-[14px]'>
                                                  event_available
                                                </span>
                                                Asistió: {asistioLabel}
                                              </span>

                                              <span
                                                className={`${labelChipClass} bg-primary/10 text-primary`}
                                              >
                                                <span className='material-symbols-outlined text-[14px]'>
                                                  trending_up
                                                </span>
                                                Compromiso: {commitmentLabel}
                                              </span>
                                            </div>

                                            {/* OBSERVACIONES */}
                                            <div className='rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm leading-relaxed text-on-surface'>
                                              <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant'>
                                                Observaciones
                                              </p>
                                              <p className='mt-1'>
                                                {followUp.observaciones ||
                                                  'Sin observaciones'}
                                              </p>
                                            </div>

                                            {/* ACTIONS */}
                                            <div className='flex items-center justify-end gap-2 lg:pt-1'>
                                              <button
                                                type='button'
                                                onClick={() =>
                                                  handleEditFollowUp(
                                                    attendance,
                                                    followUp,
                                                  )
                                                }
                                                className='rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high'
                                                aria-label='Editar seguimiento'
                                              >
                                                <span className='material-symbols-outlined text-sm'>
                                                  edit
                                                </span>
                                              </button>

                                              <button
                                                type='button'
                                                onClick={() =>
                                                  setFollowUpToDelete({
                                                    order: attendance.orden,
                                                    followUp,
                                                  })
                                                }
                                                className='rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high'
                                                aria-label='Eliminar seguimiento'
                                              >
                                                <span className='material-symbols-outlined text-sm'>
                                                  delete
                                                </span>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className='p-6 bg-slate-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-sm text-on-surface-variant'>
              Mostrando {pageStart} - {pageEnd} de {filteredAttendances.length}{' '}
              registros
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPageSafe === 1}
                className='flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-on-surface-variant hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <span className='material-symbols-outlined text-sm'>
                  chevron_left
                </span>
                Anterior
              </button>
              <div className='flex items-center gap-2'>
                {visiblePageNumbers.map((page) =>
                  page === -1 ? (
                    <span
                      key={`ellipsis-${Math.random()}`}
                      className='text-on-surface-variant'
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type='button'
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                        page === currentPageSafe
                          ? 'bg-primary text-white'
                          : 'text-on-surface-variant hover:bg-white'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                type='button'
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPageSafe === totalPages}
                className='flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-on-surface-variant hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Siguiente
                <span className='material-symbols-outlined text-sm'>
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {isExportModalOpen &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Exportar reporte
                      </p>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Filtros de fecha y detalles
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Selecciona el rango y la información adicional que
                        deseas incluir.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setIsExportModalOpen(false)}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-6'>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Rango de fechas
                        </label>
                        <select
                          value={exportDateRangeOption}
                          onChange={(event) =>
                            setExportDateRangeOption(
                              event.target.value as ExportDateRangeOption,
                            )
                          }
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface'
                        >
                          {EXPORT_DATE_RANGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      {exportDateRangeOption === 'Personalizado' && (
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Fecha inicial
                            </label>
                            <input
                              type='date'
                              value={exportCustomStartDate}
                              onChange={(event) =>
                                setExportCustomStartDate(event.target.value)
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
                              value={exportCustomEndDate}
                              onChange={(event) =>
                                setExportCustomEndDate(event.target.value)
                              }
                              className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-low p-5'>
                      <p className='text-sm font-semibold text-on-surface mb-4'>
                        Incluir información adicional
                      </p>
                      <div className='grid gap-3'>
                        <label className='inline-flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={exportIncludeStudentInfo}
                            onChange={(event) =>
                              setExportIncludeStudentInfo(event.target.checked)
                            }
                            className='h-4 w-4 rounded border border-outline-variant/50 text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-on-surface'>
                            Incluir información básica del estudiante
                          </span>
                        </label>
                        <label className='inline-flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={exportIncludeContactInfo}
                            onChange={(event) =>
                              setExportIncludeContactInfo(event.target.checked)
                            }
                            className='h-4 w-4 rounded border border-outline-variant/50 text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-on-surface'>
                            Incluir datos de contacto y administrativos
                          </span>
                        </label>
                        <label className='inline-flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={exportIncludeGestationDisability}
                            onChange={(event) =>
                              setExportIncludeGestationDisability(
                                event.target.checked,
                              )
                            }
                            className='h-4 w-4 rounded border border-outline-variant/50 text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-on-surface'>
                            Incluir información de gestación y discapacidad
                          </span>
                        </label>
                        <label className='inline-flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={exportIncludeFollowUps}
                            onChange={(event) =>
                              setExportIncludeFollowUps(event.target.checked)
                            }
                            className='h-4 w-4 rounded border border-outline-variant/50 text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-on-surface'>
                            Incluir los seguimientos de las atenciones
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-low p-5'>
                      <p className='text-sm font-semibold text-on-surface mb-2'>
                        Resumen del reporte
                      </p>
                      <p className='text-sm text-on-surface-variant'>
                        Registros encontrados: {exportAttendances.length}
                      </p>
                      <p className='mt-2 text-sm text-on-surface-variant'>
                        El reporte usará los filtros actuales del listado y el
                        rango de fechas seleccionado en este modal.
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col gap-3 border-t border-surface-variant px-6 py-4 sm:flex-row sm:justify-end'>
                    <button
                      type='button'
                      onClick={() => setIsExportModalOpen(false)}
                      className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition'
                    >
                      Cancelar
                    </button>
                    <button
                      type='button'
                      onClick={downloadExportReport}
                      disabled={isExporting}
                      className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {isExporting
                        ? 'Generando reporte...'
                        : 'Descargar reporte'}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {selectedAttendance &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {isSaving && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Guardando...
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Gestionar atención
                      </p>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Orden {selectedAttendance.orden}
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        {selectedAttendance.nombreCompleto} •{' '}
                        {selectedAttendance.userType}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setSelectedAttendance(null)}
                      disabled={isSaving}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>
                          DNI
                        </p>
                        <p className='mt-2 text-sm text-on-surface'>
                          {selectedAttendance.dni || '—'}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>
                          Fecha
                        </p>
                        <p className='mt-2 text-sm text-on-surface'>
                          {selectedAttendance.fechaAtencion}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>
                          Hora de salida
                        </p>
                        <input
                          type='time'
                          value={editForm.horaSalida}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              horaSalida: event.target.value,
                            }))
                          }
                          disabled={isSaving}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        />
                      </div>
                    </div>
                    {!selectedAttendance.userType
                      .toLowerCase()
                      .includes('administr') && (
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <p className='text-sm font-semibold text-on-surface'>
                            Programa
                          </p>
                          <p className='mt-2 text-sm text-on-surface'>
                            {selectedAttendance.programa || '—'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-semibold text-on-surface'>
                            Ciclo
                          </p>
                          <p className='mt-2 text-sm text-on-surface'>
                            {selectedAttendance.ciclo || '—'}
                          </p>
                        </div>
                      </div>
                    )}
                    {!selectedAttendance.userType
                      .toLowerCase()
                      .includes('administr') && (
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>
                          Periodo
                        </p>
                        <p className='mt-2 text-sm text-on-surface'>
                          {selectedAttendance.periodo || '—'}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-semibold text-on-surface'>
                        Área problemática
                      </p>
                      <p className='mt-2 text-sm text-on-surface'>
                        {selectedAttendance.areaProblematica || '—'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-on-surface'>
                        Motivo de atención
                      </p>
                      <p className='mt-2 text-sm text-on-surface'>
                        {selectedAttendance.motivoAtencion || '—'}
                      </p>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Resultado
                        </label>
                        <select
                          value={editForm.resultado}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              resultado: event.target.value,
                            }))
                          }
                          disabled={isSaving}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value='Finalizado'>Finalizado</option>
                          <option value='En Seguimiento'>En Seguimiento</option>
                          <option value='Derivado'>Derivado</option>
                          <option value='No concluyente'>No concluyente</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-semibold text-on-surface'>
                        Observaciones / Recomendaciones
                      </label>
                      <textarea
                        value={editForm.observaciones}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            observaciones: event.target.value,
                          }))
                        }
                        disabled={isSaving}
                        className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface min-h-[140px] disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='Comentarios o recomendaciones'
                      />
                    </div>
                    <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                      <button
                        type='button'
                        onClick={() => setSelectedAttendance(null)}
                        disabled={isSaving}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSaveAttendance}
                        disabled={isSaving}
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {creatingFollowUpOrder &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {isSavingFollowUp && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Guardando...
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        {editingFollowUp
                          ? 'Editar seguimiento'
                          : 'Crear seguimiento'}
                      </p>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Orden {creatingFollowUpOrder}
                      </h3>
                    </div>
                    <button
                      type='button'
                      onClick={handleCancelNewFollowUp}
                      disabled={isSavingFollowUp}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Fecha de seguimiento
                        </label>
                        <input
                          type='date'
                          value={newFollowUpForm.fechaSeguimiento}
                          onChange={(event) =>
                            setNewFollowUpForm((prev) => ({
                              ...prev,
                              fechaSeguimiento: event.target.value,
                            }))
                          }
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Hora
                        </label>
                        <input
                          type='time'
                          value={newFollowUpForm.hora}
                          onChange={(event) =>
                            setNewFollowUpForm((prev) => ({
                              ...prev,
                              hora: event.target.value,
                            }))
                          }
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Asistió
                        </label>
                        <select
                          value={newFollowUpForm.asistio}
                          onChange={(event) =>
                            setNewFollowUpForm((prev) => ({
                              ...prev,
                              asistio: event.target.value,
                            }))
                          }
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                        >
                          <option value=''>Pendiente</option>
                          <option value='Sí'>Sí</option>
                          <option value='No'>No</option>
                        </select>
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Nivel de compromiso
                        </label>
                        <select
                          value={newFollowUpForm.nivelCompromiso}
                          onChange={(event) =>
                            setNewFollowUpForm((prev) => ({
                              ...prev,
                              nivelCompromiso: event.target.value,
                            }))
                          }
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface'
                        >
                          <option value='' disabled>
                            Seleccione un nivel
                          </option>
                          <option value='Alto'>Alto</option>
                          <option value='Medio'>Medio</option>
                          <option value='Bajo'>Bajo</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-semibold text-on-surface'>
                        Observaciones
                      </label>
                      <textarea
                        value={newFollowUpForm.observaciones}
                        onChange={(event) =>
                          setNewFollowUpForm((prev) => ({
                            ...prev,
                            observaciones: event.target.value,
                          }))
                        }
                        className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-white px-4 py-3 text-on-surface min-h-[140px]'
                        placeholder='Detalles del seguimiento'
                      />
                    </div>
                    <div className='flex justify-end gap-3'>
                      <button
                        type='button'
                        onClick={handleCancelNewFollowUp}
                        disabled={isSavingFollowUp}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSaveFollowUp}
                        disabled={isSavingFollowUp}
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingFollowUp
                          ? 'Guardando...'
                          : 'Guardar seguimiento'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {followUpToDelete &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-2 lg:p-4'>
                <div className='w-full max-w-lg rounded-[32px] bg-white border border-slate-200 p-6 shadow-2xl'>
                  <div className='flex items-center justify-between gap-4 pb-4 border-b border-slate-200'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Confirmar eliminación
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={handleCancelDelete}
                      className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='mt-6 space-y-4'>
                    <p className='text-sm text-on-surface'>
                      ¿Estás seguro de que deseas eliminar el seguimiento del{' '}
                      <b>{followUpToDelete.followUp.fechaSeguimiento}</b>?
                    </p>

                    <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                      <button
                        type='button'
                        onClick={handleCancelDelete}
                        disabled={isSavingFollowUp}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleDeleteFollowUp}
                        disabled={isSavingFollowUp}
                        className='rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingFollowUp
                          ? 'Eliminando...'
                          : 'Eliminar seguimiento'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {receiptAttendance &&
            createPortal(
              <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-2'>
                <div className='relative h-[65vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl'>
                  {/* HEADER */}
                  <div className='flex items-center justify-between border-b border-surface-variant px-5 py-2'>
                    <div>
                      <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
                        Constancia de atención
                      </p>
                      <h3 className='text-base font-bold text-on-surface'>
                        Orden {receiptAttendance.orden}
                      </h3>
                      <p className='text-xs text-on-surface-variant'>
                        {receiptAttendance.nombreCompleto} •{' '}
                        {receiptAttendance.userType}
                      </p>
                    </div>

                    <button
                      type='button'
                      onClick={handleCloseReceiptModal}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high'
                    >
                      <span className='material-symbols-outlined text-base'>
                        close
                      </span>
                    </button>
                  </div>

                  {/* BODY */}
                  <div className='max-h-[68vh] overflow-y-auto px-4 py-2 space-y-2'>
                    {/* ACTIONS */}
                    <div className='flex items-center justify-between gap-2'>
                      <button
                        type='button'
                        onClick={downloadAttendanceReceipt}
                        className='inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white'
                      >
                        <span className='material-symbols-outlined text-sm'>
                          download
                        </span>
                        Descargar
                      </button>

                      <button
                        type='button'
                        onClick={handleOpenAttendanceEmailConfirm}
                        disabled={
                          !receiptAttendance.correoElectronico ||
                          isSendingAttendanceEmail
                        }
                        className='inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50'
                      >
                        <span className='material-symbols-outlined text-sm'>
                          email
                        </span>
                        {attendanceEmailSent[receiptAttendance.orden]
                          ? 'Reenviar'
                          : 'Enviar'}
                      </button>
                    </div>

                    {/* RECEIPT */}
                    <div className='overflow-hidden rounded-2xl border bg-[#f5f3ff]'>
                      <div
                        ref={receiptPreviewRef}
                        className='flex flex-col md:flex-row border-b border-gray-300'
                      >
                        {/* LEFT */}
                        <div className='flex w-full flex-col justify-between bg-[#673AB6] p-3 text-white md:w-[200px]'>
                          <div>
                            <img
                              src='https://res.cloudinary.com/detbcxpfb/image/upload/v1775600238/resultado_qprg0t.png'
                              alt='Logo'
                              style={{ width: '130px', marginBottom: '16px' }}
                            />

                            <h3 className='text-sm font-semibold'>
                              Atención de Enfermería
                            </h3>

                            <p className='mt-1 text-[11px] text-white/80'>
                              Registro médico oficial
                            </p>
                          </div>

                          <div className='text-[10px] opacity-80'>
                            IES NEUMANN
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className='flex-1 bg-white p-3'>
                          {/* TITLE */}
                          <div className='mb-2'>
                            <h4 className='text-lg font-bold text-[#673AB6]'>
                              Constancia de Atención
                            </h4>
                            <div className='mt-1 h-1 w-12 bg-[#673AB6]' />
                          </div>

                          {/* USER */}
                          <div className='mb-2 rounded-xl bg-[#f5f3ff] p-2'>
                            <div className='text-[10px] uppercase tracking-widest text-[#666]'>
                              {receiptAttendance.userType?.toUpperCase() ||
                                'USUARIO'}
                            </div>

                            <div className='text-base font-semibold'>
                              {receiptAttendance.nombreCompleto || '—'}
                            </div>

                            <div className='mt-1 grid grid-cols-1 gap-2 text-xs text-[#444] md:grid-cols-4'>
                              <div className='rounded-xl border border-[#ececec] bg-white px-2 py-1'>
                                <div className='text-[10px] uppercase tracking-[0.2em] text-gray-500'>
                                  DNI
                                </div>
                                <div className='mt-1 font-semibold text-slate-700'>
                                  {receiptAttendance.dni || '-'}
                                </div>
                              </div>
                              <div className='rounded-xl border border-[#ececec] bg-white px-2 py-1'>
                                <div className='text-[10px] uppercase tracking-[0.2em] text-gray-500'>
                                  ORDEN
                                </div>
                                <div className='mt-1 font-semibold text-slate-700'>
                                  {receiptAttendance.orden || '-'}
                                </div>
                              </div>
                              <div className='rounded-xl border border-[#ececec] bg-white px-2 py-1'>
                                <div className='text-[10px] uppercase tracking-[0.2em] text-gray-500'>
                                  FECHA
                                </div>
                                <div className='mt-1 font-semibold text-slate-700'>
                                  {receiptAttendance.fechaAtencion || '-'}
                                </div>
                              </div>
                              <div className='rounded-xl border border-[#ececec] bg-white px-2 py-1'>
                                <div className='text-[10px] uppercase tracking-[0.2em] text-gray-500'>
                                  HORA DE SALIDA
                                </div>
                                <div className='mt-1 font-semibold text-slate-700'>
                                  {receiptAttendance.horaSalida || '-'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* GRID */}
                          <div className='mb-2 grid grid-cols-2 gap-2 md:grid-cols-3'>
                            <div className='rounded-xl border p-1 px-2'>
                              <div className='text-[10px] text-gray-500'>
                                Programa
                              </div>
                              <div className='text-xs font-semibold'>
                                {receiptAttendance.programa || '—'}
                              </div>
                            </div>

                            <div className='flex  justify-between rounded-xl border p-1 px-2'>
                              <div>
                                <div className='text-[10px] text-gray-500'>
                                  Ciclo
                                </div>
                                <div className='text-xs font-semibold'>
                                  {receiptAttendance.ciclo || '—'}
                                </div>
                              </div>
                              <div>
                                <div className='text-[10px] text-gray-500'>
                                  Sección
                                </div>
                                <div className='text-xs font-semibold'>
                                  {receiptAttendance.seccion || '—'}
                                </div>
                              </div>
                            </div>

                            <div className='rounded-xl border p-1 px-2'>
                              <div className='text-[10px] text-gray-500'>
                                Periodo
                              </div>
                              <div className='text-xs font-semibold'>
                                {receiptAttendance.periodo || '—'}
                              </div>
                            </div>
                          </div>

                          {/* TEXT AREAS */}
                          <div className='mb-2'>
                            <div className='text-[10px] uppercase text-gray-500 mb-1'>
                              Motivo
                            </div>
                            <div className='rounded-xl bg-gray-50 p-2 text-xs min-h-[40px]'>
                              {receiptAttendance.motivoAtencion || '—'}
                            </div>
                          </div>

                          <div className='mb-2'>
                            <div className='text-[10px] uppercase text-gray-500 mb-1'>
                              Recomendaciones
                            </div>
                            <div className='rounded-xl bg-gray-50 p-2 text-xs min-h-[40px]'>
                              {receiptAttendance.observaciones || '—'}
                            </div>
                          </div>

                          {/* SIGNATURE */}
                          {/* <img
                            src='firmaEjemplo.png'
                            className='h-14 object-contain'
                            alt='firma'
                          /> */}
                          <div className='h-14 object-contain'></div>

                          {/* FOOTER */}
                          <div className='mt-2 flex justify-between text-xs text-gray-600'>
                            <span>Lic. Irma Rosario Mamani Mayta</span>
                            <span>
                              {new Date().toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}
          {receiptAttendance &&
            isAttendanceEmailConfirmOpen &&
            createPortal(
              <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4'>
                <div className='w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden'>
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Confirmar envío
                      </p>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Revisar correo de destino
                      </h3>
                    </div>
                    <button
                      type='button'
                      onClick={handleCancelAttendanceEmailConfirm}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                      aria-label='Cerrar confirmación'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='space-y-5 px-6 py-6'>
                    <p className='text-sm text-on-surface-variant'>
                      El correo se enviará a esta dirección. Si necesitas
                      cambiarla, edítala antes de confirmar.
                    </p>
                    <label className='block space-y-2'>
                      <span className='text-sm font-semibold text-on-surface'>
                        Correo electrónico
                      </span>
                      <input
                        type='email'
                        value={attendanceReceiptEmail}
                        onChange={(e) =>
                          setAttendanceReceiptEmail(e.target.value)
                        }
                        className='w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary'
                        placeholder='correo@dominio.com'
                      />
                    </label>
                    <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                      <button
                        type='button'
                        onClick={handleCancelAttendanceEmailConfirm}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSendAttendanceReceipt}
                        disabled={
                          !attendanceReceiptEmail.trim() ||
                          isSendingAttendanceEmail
                        }
                        className='rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSendingAttendanceEmail
                          ? 'Enviando...'
                          : 'Confirmar y enviar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </section>
      </div>
    </Layout>
  )
}

export default ConsultasPage  
