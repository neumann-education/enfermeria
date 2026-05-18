import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import Layout from './Layout'
import { consultaService } from './services/consultaService'
import toast from 'react-hot-toast'

type PatientDetail = {
  id: string
  nombreCompleto: string
  dni: string
  edad: string
  sexo: string
  correoElectronico: string
  telefono: string
  nacionalidad: string
  rol: string
  carrera: string
  ciclo: string
  seccion: string
  areaDepartamento: string
  cargo: string
  viviendoCon: string
  tipoSeguro: string
  isPregnant: string
  hasDisability: string
  fechaUltimaActualizacion: string
}

type AttendanceSummary = {
  orden: string
  fechaAtencion: string
  usuarioId: string
  nombreCompleto: string
  edad: string
  dni: string
  celular: string
  correoElectronico: string
  programa: string
  ciclo: string
  periodo: string
  motivoAtencion: string
  areaProblematica: string
  medioContacto: string
  observaciones: string
  resultado: string
}

type DisabilityDetails = {
  periodoRegistro?: string
  disabilityType?: string
  conadisCardNumber?: string
  observaciones?: string
}

type DisabilityFollowUp = {
  periodoSeguimiento?: string
  estudianteRegular?: string
  carrera?: string
  ciclo?: string
  turno?: string
  observaciones?: string
  fechaRegistro?: string
}

type PregnancyFollowUp = {
  periodoSeguimiento?: string
  estudianteRegular?: string
  carrera?: string
  ciclo?: string
  turno?: string
  controlPrenatal?: string
  observaciones?: string
  fechaRegistro: string
}

type PregnancyDetails = {
  periodoRegistrado?: string
  controlPrenatal?: string
  fechaProbableParto?: string
  estudianteRegular?: string
  observaciones?: string
}

function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<PatientDetail | null>(null)
  const [attendances, setAttendances] = useState<AttendanceSummary[]>([])
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false)
  const [disabilityDetails, setDisabilityDetails] =
    useState<DisabilityDetails | null>(null)
  const [pregnancyDetails, setPregnancyDetails] =
    useState<PregnancyDetails | null>(null)
  const [isLoadingDisabilityDetails, setIsLoadingDisabilityDetails] =
    useState(false)
  const [disabilityFollowUps, setDisabilityFollowUps] = useState<
    DisabilityFollowUp[]
  >([])
  const [editingDisabilityFollowUp, setEditingDisabilityFollowUp] =
    useState<DisabilityFollowUp | null>(null)
  const [pregnancyFollowUps, setPregnancyFollowUps] = useState<
    PregnancyFollowUp[]
  >([])
  const [editingPregnancyFollowUp, setEditingPregnancyFollowUp] =
    useState<PregnancyFollowUp | null>(null)
  const [isLoadingDisabilityFollowUps, setIsLoadingDisabilityFollowUps] =
    useState(false)
  const [isLoadingPregnancyFollowUps, setIsLoadingPregnancyFollowUps] =
    useState(false)
  const [isLoadingPregnancyDetails, setIsLoadingPregnancyDetails] =
    useState(false)
  const [showDisabilityModal, setShowDisabilityModal] = useState(false)
  const [showDisabilityFollowUpModal, setShowDisabilityFollowUpModal] =
    useState(false)
  const [showPregnancyFollowUpModal, setShowPregnancyFollowUpModal] =
    useState(false)
  const [showPregnancyModal, setShowPregnancyModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceSummary | null>(null)
  const [isSavingDisability, setIsSavingDisability] = useState(false)
  const [isSavingDisabilityFollowUp, setIsSavingDisabilityFollowUp] =
    useState(false)
  const [isSavingPregnancyFollowUp, setIsSavingPregnancyFollowUp] =
    useState(false)
  const [isSavingPregnancy, setIsSavingPregnancy] = useState(false)
  const [isSavingAttendance, setIsSavingAttendance] = useState(false)
  const [isSendingAttendanceEmail, setIsSendingAttendanceEmail] =
    useState(false)
  const [attendanceEmailSent, setAttendanceEmailSent] = useState<
    Record<string, boolean>
  >({})
  const [attendanceForm, setAttendanceForm] = useState({
    orden: '',
    observaciones: '',
    resultado: 'Finalizado',
    motivoAtencion: '',
    nombreCompleto: '',
    dni: '',
    programa: '',
    ciclo: '',
    seccion: '',
    correoElectronico: '',
    fechaAtencion: '',
    areaProblematica: '',
  })
  const [disabilityForm, setDisabilityForm] = useState<
    DisabilityDetails & { hasDisability: string }
  >({
    hasDisability: 'No',
    periodoRegistro: '',
    disabilityType: '',
    conadisCardNumber: '',
    observaciones: '',
  })
  const [pregnancyForm, setPregnancyForm] = useState<
    PregnancyDetails & { isPregnant: string }
  >({
    isPregnant: 'No',
    periodoRegistrado: '',
    controlPrenatal: '',
    fechaProbableParto: '',
    estudianteRegular: '',
    observaciones: '',
  })
  const [disabilityFollowUpForm, setDisabilityFollowUpForm] = useState({
    periodoSeguimiento: '',
    estudianteRegular: '',
    carrera: '',
    ciclo: '',
    turno: '',
    observaciones: '',
  })
  const [pregnancyFollowUpForm, setPregnancyFollowUpForm] = useState({
    periodoSeguimiento: '',
    estudianteRegular: '',
    carrera: '',
    ciclo: '',
    turno: '',
    controlPrenatal: '',
    observaciones: '',
  })
  const loadedPatientId = useRef<string | null>(null)
  const receiptPreviewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!id || loadedPatientId.current === id) {
      return
    }
    loadedPatientId.current = id
    setAttendances([])

    const loadUser = async () => {
      setIsLoadingUser(true)
      try {
        const userData = await consultaService.getUserById(id)
        if (!userData) {
          toast.error('Usuario no encontrado')
          setUser(null)
          return
        }
        setUser(userData)
      } catch (error) {
        console.error(error)
        toast.error('No se pudo cargar la información del paciente')
        setUser(null)
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadUser()
  }, [id])

  useEffect(() => {
    if (!id) {
      setAttendances([])
      return
    }

    let active = true
    const loadAttendances = async () => {
      setIsLoadingAttendances(true)
      try {
        const attendanceData = await consultaService.getAttendancesByUserId(id)
        if (!active) {
          return
        }
        setAttendances(
          attendanceData.map((att: any) => ({
            orden: att.orden,
            fechaAtencion: att.fechaAtencion,
            motivoAtencion: att.motivoAtencion,
            areaProblematica: att.areaProblematica,
            medioContacto: att.medioContacto,
            observaciones: att.observaciones || '',
            resultado: att.resultado || '',
            programa: att.programa || '',
            ciclo: att.ciclo || '',
            usuarioId: att.usuarioId || '',
            nombreCompleto: att.nombreCompleto || '',
            dni: att.dni || '',
            correoElectronico: att.correoElectronico || '',
            periodo: att.periodo || '',
          })),
        )
      } catch (error) {
        if (active) {
          console.error(error)
          toast.error('No se pudieron cargar las atenciones')
          setAttendances([])
        }
      } finally {
        if (active) {
          setIsLoadingAttendances(false)
        }
      }
    }

    loadAttendances()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!id || !user) {
      setDisabilityDetails(null)
      setDisabilityFollowUps([])
      setPregnancyDetails(null)
      return
    }

    const loadDisabilityDetails = async () => {
      if (!normalizeYesNo(user.hasDisability)) {
        setDisabilityDetails(null)
        setDisabilityFollowUps([])
        return
      }

      setIsLoadingDisabilityDetails(true)
      try {
        const details =
          await consultaService.getDisabilityDetailsByPatientId(id)
        setDisabilityDetails(details)
      } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar los datos de discapacidad')
        setDisabilityDetails(null)
      } finally {
        setIsLoadingDisabilityDetails(false)
      }
    }

    const loadDisabilityFollowUps = async () => {
      if (!normalizeYesNo(user.hasDisability)) {
        setDisabilityFollowUps([])
        return
      }

      setIsLoadingDisabilityFollowUps(true)
      try {
        const followUps =
          await consultaService.getDisabilityFollowUpsByPatientId(id)
        setDisabilityFollowUps(followUps)
      } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar los seguimientos de discapacidad')
        setDisabilityFollowUps([])
      } finally {
        setIsLoadingDisabilityFollowUps(false)
      }
    }

    const loadPregnancyDetails = async () => {
      if (user.sexo?.toLowerCase().includes('masculino')) {
        setPregnancyDetails(null)
        return
      }
      if (!normalizeYesNo(user.isPregnant)) {
        setPregnancyDetails(null)
        return
      }

      setIsLoadingPregnancyDetails(true)
      try {
        const details = await consultaService.getGestanteDetailsByPatientId(id)
        setPregnancyDetails(details)
      } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar los datos de gestante')
        setPregnancyDetails(null)
      } finally {
        setIsLoadingPregnancyDetails(false)
      }
    }

    const loadPregnancyFollowUps = async () => {
      if (user.sexo?.toLowerCase().includes('masculino')) {
        setPregnancyFollowUps([])
        return
      }
      if (!normalizeYesNo(user.isPregnant)) {
        setPregnancyFollowUps([])
        return
      }

      setIsLoadingPregnancyFollowUps(true)
      try {
        const followUps =
          await consultaService.getPregnancyFollowUpsByPatientId(id)
        setPregnancyFollowUps(followUps)
      } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar los seguimientos de gestante')
        setPregnancyFollowUps([])
      } finally {
        setIsLoadingPregnancyFollowUps(false)
      }
    }

    loadDisabilityDetails()
    loadDisabilityFollowUps()
    loadPregnancyDetails()
    loadPregnancyFollowUps()
  }, [id, user])

  const renderDetailRow = (label: string, value: string) => (
    <div className='rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-5 hover:border-primary/20 hover:shadow-md transition-all'>
      <p className='text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-semibold'>
        {label}
      </p>
      <p className='mt-3 text-base font-semibold text-on-surface'>
        {value || '—'}
      </p>
    </div>
  )

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes('finalizado')) {
      return 'bg-primary/10 text-primary'
    }
    if (normalized.includes('derivado')) {
      return 'bg-secondary-container text-on-secondary-fixed-variant'
    }
    if (normalized.includes('seguimiento')) {
      return 'bg-tertiary-container text-tertiary-fixed-dim'
    }
    return 'bg-surface-container-high text-on-surface-variant'
  }

  const normalizeYesNo = (value?: string) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    return (
      normalized === 'sí' ||
      normalized === 'si' ||
      normalized === 'yes' ||
      normalized === 'true'
    )
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

  const formatTimeWithoutSeconds = (time: string) => {
    const normalized = String(time || '').trim()
    return normalized.replace(/([0-9]{1,2}:[0-9]{2})(?::[0-9]{2})/g, '$1')
  }

  const handleOpenDisabilityModal = () => {
    setDisabilityForm({
      hasDisability: user?.hasDisability || 'No',
      periodoRegistro: disabilityDetails?.periodoRegistro || '',
      disabilityType: disabilityDetails?.disabilityType || '',
      conadisCardNumber: disabilityDetails?.conadisCardNumber || '',
      observaciones: disabilityDetails?.observaciones || '',
    })
    setShowDisabilityModal(true)
  }

  const handleOpenPregnancyModal = () => {
    setPregnancyForm({
      isPregnant: user?.isPregnant || 'No',
      periodoRegistrado: pregnancyDetails?.periodoRegistrado || '',
      controlPrenatal: pregnancyDetails?.controlPrenatal || '',
      fechaProbableParto: pregnancyDetails?.fechaProbableParto || '',
      estudianteRegular: pregnancyDetails?.estudianteRegular || '',
      observaciones: pregnancyDetails?.observaciones || '',
    })
    setShowPregnancyModal(true)
  }

  const handleOpenPregnancyFollowUpModal = (followUp?: PregnancyFollowUp) => {
    if (followUp) {
      setEditingPregnancyFollowUp(followUp)
      setPregnancyFollowUpForm({
        periodoSeguimiento: followUp.periodoSeguimiento || '',
        estudianteRegular: followUp.estudianteRegular || '',
        carrera: followUp.carrera || user?.carrera || '',
        ciclo: followUp.ciclo || user?.ciclo || '',
        turno: followUp.turno || '',
        controlPrenatal: followUp.controlPrenatal || '',
        observaciones: followUp.observaciones || '',
      })
    } else {
      setEditingPregnancyFollowUp(null)
      setPregnancyFollowUpForm({
        periodoSeguimiento: '',
        estudianteRegular: '',
        carrera: user?.carrera || '',
        ciclo: user?.ciclo || '',
        turno: '',
        controlPrenatal: '',
        observaciones: '',
      })
    }
    setShowDisabilityFollowUpModal(false)
    setShowPregnancyFollowUpModal(true)
  }

  const handleOpenDisabilityFollowUpModal = (followUp?: DisabilityFollowUp) => {
    if (followUp) {
      setEditingDisabilityFollowUp(followUp)
      setDisabilityFollowUpForm({
        periodoSeguimiento: followUp.periodoSeguimiento || '',
        estudianteRegular: followUp.estudianteRegular || '',
        carrera: followUp.carrera || user?.carrera || '',
        ciclo: followUp.ciclo || user?.ciclo || '',
        turno: followUp.turno || '',
        observaciones: followUp.observaciones || '',
      })
    } else {
      setEditingDisabilityFollowUp(null)
      setDisabilityFollowUpForm({
        periodoSeguimiento: '',
        estudianteRegular: '',
        carrera: user?.carrera || '',
        ciclo: '',
        turno: '',
        observaciones: '',
      })
    }
    setShowDisabilityFollowUpModal(true)
  }

  const handleSaveDisability = async () => {
    if (!id || !user) {
      return
    }

    const hasDisability = normalizeYesNo(disabilityForm.hasDisability)
    if (hasDisability && !disabilityForm.disabilityType?.trim()) {
      toast.error('Indique el tipo de discapacidad antes de guardar')
      return
    }
    if (hasDisability && !disabilityForm.periodoRegistro?.trim()) {
      toast.error('Indique el periodo de registro antes de guardar')
      return
    }
    if (
      disabilityForm.periodoRegistro?.trim() &&
      !/^[0-9]{4}\s*-\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i.test(
        String(disabilityForm.periodoRegistro || '').trim(),
      )
    ) {
      toast.error('Periodo de registro inválido. Use el formato 2026 - I')
      return
    }

    setIsSavingDisability(true)
    try {
      await consultaService.saveDisabilityDetails({
        usuarioId: id,
        hasDisability: hasDisability ? 'Sí' : 'No',
        periodoRegistro: disabilityForm.periodoRegistro,
        disabilityType: disabilityForm.disabilityType,
        conadisCardNumber: disabilityForm.conadisCardNumber,
        observaciones: disabilityForm.observaciones,
        dni: user.dni,
        nombres: user.nombreCompleto,
      })

      setUser((prev) =>
        prev ? { ...prev, hasDisability: hasDisability ? 'Sí' : 'No' } : prev,
      )
      setDisabilityDetails(
        hasDisability
          ? {
              periodoRegistro: disabilityForm.periodoRegistro,
              disabilityType: disabilityForm.disabilityType,
              conadisCardNumber: disabilityForm.conadisCardNumber,
              observaciones: disabilityForm.observaciones,
            }
          : null,
      )
      setShowDisabilityModal(false)
      toast.success('Datos de discapacidad guardados correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar la información de discapacidad')
    } finally {
      setIsSavingDisability(false)
    }
  }

  const handleSaveDisabilityFollowUp = async () => {
    if (!id || !user) {
      return
    }

    if (!disabilityFollowUpForm.periodoSeguimiento.trim()) {
      toast.error('Indique el periodo del seguimiento')
      return
    }

    if (
      !/^[0-9]{4}\s*-\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i.test(
        disabilityFollowUpForm.periodoSeguimiento.trim(),
      )
    ) {
      toast.error('Periodo inválido. Use el formato 2026 - I')
      return
    }

    if (!disabilityFollowUpForm.observaciones.trim()) {
      toast.error('Ingrese al menos una observación de seguimiento')
      return
    }

    setIsSavingDisabilityFollowUp(true)
    try {
      await consultaService.saveDisabilityFollowUp({
        usuarioId: id,
        periodoSeguimiento: disabilityFollowUpForm.periodoSeguimiento,
        originalPeriodoSeguimiento:
          editingDisabilityFollowUp?.periodoSeguimiento ||
          disabilityFollowUpForm.periodoSeguimiento,
        estudianteRegular: disabilityFollowUpForm.estudianteRegular,
        carrera: disabilityFollowUpForm.carrera,
        ciclo: disabilityFollowUpForm.ciclo,
        turno: disabilityFollowUpForm.turno,
        observaciones: disabilityFollowUpForm.observaciones,
        dni: user.dni,
        nombres: user.nombreCompleto,
      })

      const now = formatCurrentTimestamp()
      const updatedFollowUp: DisabilityFollowUp = {
        periodoSeguimiento: disabilityFollowUpForm.periodoSeguimiento,
        estudianteRegular: disabilityFollowUpForm.estudianteRegular,
        carrera: disabilityFollowUpForm.carrera,
        ciclo: disabilityFollowUpForm.ciclo,
        turno: disabilityFollowUpForm.turno,
        observaciones: disabilityFollowUpForm.observaciones,
        fechaRegistro: editingDisabilityFollowUp?.fechaRegistro || now,
      }

      setDisabilityFollowUps((prev) => {
        const originalPeriod = editingDisabilityFollowUp?.periodoSeguimiento
        if (originalPeriod) {
          const updated = prev.map((item) =>
            item.periodoSeguimiento === originalPeriod ? updatedFollowUp : item,
          )
          return prev.some((item) => item.periodoSeguimiento === originalPeriod)
            ? updated
            : [...prev, updatedFollowUp]
        }
        return [...prev, updatedFollowUp]
      })

      setEditingDisabilityFollowUp(null)
      setShowDisabilityFollowUpModal(false)
      toast.success(
        editingDisabilityFollowUp
          ? 'Seguimiento de discapacidad actualizado correctamente'
          : 'Seguimiento de discapacidad guardado correctamente',
      )
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar el seguimiento de discapacidad')
    } finally {
      setIsSavingDisabilityFollowUp(false)
    }
  }

  const handleSavePregnancyFollowUp = async () => {
    if (!id || !user) {
      return
    }

    if (!pregnancyFollowUpForm.periodoSeguimiento.trim()) {
      toast.error('Indique el periodo del seguimiento')
      return
    }

    if (
      !/^[0-9]{4}\s*-\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i.test(
        pregnancyFollowUpForm.periodoSeguimiento.trim(),
      )
    ) {
      toast.error('Periodo inválido. Use el formato 2026 - I')
      return
    }

    if (!pregnancyFollowUpForm.observaciones.trim()) {
      toast.error('Ingrese al menos una observación de seguimiento')
      return
    }

    setIsSavingPregnancyFollowUp(true)
    try {
      await consultaService.savePregnancyFollowUp({
        usuarioId: id,
        periodoSeguimiento: pregnancyFollowUpForm.periodoSeguimiento,
        originalPeriodoSeguimiento:
          editingPregnancyFollowUp?.periodoSeguimiento ||
          pregnancyFollowUpForm.periodoSeguimiento,
        estudianteRegular: pregnancyFollowUpForm.estudianteRegular,
        carrera: pregnancyFollowUpForm.carrera,
        ciclo: pregnancyFollowUpForm.ciclo,
        turno: pregnancyFollowUpForm.turno,
        controlPrenatal: pregnancyFollowUpForm.controlPrenatal,
        observaciones: pregnancyFollowUpForm.observaciones,
        dni: user.dni,
        nombres: user.nombreCompleto,
      })

      const now = formatCurrentTimestamp()
      const updatedFollowUp: PregnancyFollowUp = {
        periodoSeguimiento: pregnancyFollowUpForm.periodoSeguimiento,
        estudianteRegular: pregnancyFollowUpForm.estudianteRegular,
        carrera: pregnancyFollowUpForm.carrera,
        ciclo: pregnancyFollowUpForm.ciclo,
        turno: pregnancyFollowUpForm.turno,
        controlPrenatal: pregnancyFollowUpForm.controlPrenatal,
        observaciones: pregnancyFollowUpForm.observaciones,
        fechaRegistro: editingPregnancyFollowUp?.fechaRegistro || now,
      }

      setPregnancyFollowUps((prev) => {
        const originalPeriod = editingPregnancyFollowUp?.periodoSeguimiento
        if (originalPeriod) {
          const updated = prev.map((item) =>
            item.periodoSeguimiento === originalPeriod ? updatedFollowUp : item,
          )
          return prev.some((item) => item.periodoSeguimiento === originalPeriod)
            ? updated
            : [...prev, updatedFollowUp]
        }
        return [...prev, updatedFollowUp]
      })

      setEditingPregnancyFollowUp(null)
      setShowPregnancyFollowUpModal(false)
      toast.success(
        editingPregnancyFollowUp
          ? 'Seguimiento de gestante actualizado correctamente'
          : 'Seguimiento de gestante guardado correctamente',
      )
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar el seguimiento de gestante')
    } finally {
      setIsSavingPregnancyFollowUp(false)
    }
  }

  const handleSavePregnancy = async () => {
    if (!id || !user) {
      return
    }

    const isPregnant = normalizeYesNo(pregnancyForm.isPregnant)
    if (
      isPregnant &&
      !pregnancyForm.controlPrenatal?.trim() &&
      !pregnancyForm.fechaProbableParto?.trim()
    ) {
      toast.error(
        'Complete al menos control prenatal o fecha probable de parto',
      )
      return
    }

    setIsSavingPregnancy(true)
    try {
      await consultaService.saveGestanteDetails({
        usuarioId: id,
        isPregnant: isPregnant ? 'Sí' : 'No',
        periodo: pregnancyForm.periodoRegistrado,
        controlPrenatal: pregnancyForm.controlPrenatal,
        fechaProbableParto: pregnancyForm.fechaProbableParto,
        estudianteRegular: pregnancyForm.estudianteRegular,
        observaciones: pregnancyForm.observaciones,
        dni: user.dni,
        nombres: user.nombreCompleto,
        edad: user.edad || '',
        programa: user.carrera || '',
        ciclo: user.ciclo || '',
        turno: '',
        telefono: user.telefono,
        correoElectronico: user.correoElectronico,
      })

      setUser((prev) =>
        prev ? { ...prev, isPregnant: isPregnant ? 'Sí' : 'No' } : prev,
      )
      setPregnancyDetails(
        isPregnant
          ? {
              periodoRegistrado: pregnancyForm.periodoRegistrado,
              controlPrenatal: pregnancyForm.controlPrenatal,
              fechaProbableParto: pregnancyForm.fechaProbableParto,
              estudianteRegular: pregnancyForm.estudianteRegular,
              observaciones: pregnancyForm.observaciones,
            }
          : null,
      )
      setShowPregnancyModal(false)
      toast.success('Datos de gestante guardados correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar la información de gestante')
    } finally {
      setIsSavingPregnancy(false)
    }
  }

  const prepareAttendanceForm = (attendance: AttendanceSummary) => {
    setSelectedAttendance(attendance)
    setAttendanceForm({
      orden: attendance.orden,
      observaciones: attendance.observaciones || '',
      resultado: attendance.resultado || 'Finalizado',
      motivoAtencion: attendance.motivoAtencion || '',
      nombreCompleto: attendance.nombreCompleto || user?.nombreCompleto || '',
      dni: attendance.dni || user?.dni || '',
      programa: attendance.programa || user?.carrera || '',
      ciclo: attendance.ciclo || user?.ciclo || '',
      seccion: user?.seccion || '',
      correoElectronico:
        attendance.correoElectronico || user?.correoElectronico || '',
      fechaAtencion: attendance.fechaAtencion || '',
      areaProblematica: attendance.areaProblematica || '',
    })
  }

  const handleOpenAttendanceModal = (attendance: AttendanceSummary) => {
    prepareAttendanceForm(attendance)
    setShowAttendanceModal(true)
  }

  const handleOpenReceiptModal = (attendance?: AttendanceSummary) => {
    if (attendance) {
      prepareAttendanceForm(attendance)
    }
    if (!selectedAttendance && !attendance) {
      return
    }
    setShowReceiptModal(true)
  }

  const handleSaveAttendance = async () => {
    if (!selectedAttendance) {
      return
    }

    setIsSavingAttendance(true)
    try {
      await consultaService.updateAttendance({
        orden: selectedAttendance.orden,
        observaciones: attendanceForm.observaciones,
        resultado: attendanceForm.resultado,
      })

      setAttendances((prev) =>
        prev.map((attendance) =>
          attendance.orden === selectedAttendance.orden
            ? {
                ...attendance,
                observaciones: attendanceForm.observaciones,
                resultado: attendanceForm.resultado,
              }
            : attendance,
        ),
      )
      setSelectedAttendance((prev) =>
        prev
          ? {
              ...prev,
              observaciones: attendanceForm.observaciones,
              resultado: attendanceForm.resultado,
            }
          : prev,
      )
      toast.success('Atención actualizada correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar la atención')
    } finally {
      setIsSavingAttendance(false)
    }
  }

  const handleSendAttendanceReceipt = async () => {
    if (!selectedAttendance) {
      return
    }
    setIsSendingAttendanceEmail(true)
    try {
      const pdfBase64 = await generateReceiptPdfBase64(true)
      await consultaService.sendAttendanceReceipt({
        orden: selectedAttendance.orden,
        correoElectronico:
          attendanceForm.correoElectronico ||
          selectedAttendance.correoElectronico,
        nombreCompleto: attendanceForm.nombreCompleto,
        dni: attendanceForm.dni,
        programa: attendanceForm.programa,
        ciclo: attendanceForm.ciclo,
        seccion: attendanceForm.seccion,
        motivoAtencion: attendanceForm.motivoAtencion,
        observaciones: attendanceForm.observaciones,
        pdfBase64,
      })

      setAttendanceEmailSent((prev) => ({
        ...prev,
        [selectedAttendance.orden]: true,
      }))
      toast.success('Constancia enviada correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo enviar la constancia')
    } finally {
      setIsSendingAttendanceEmail(false)
    }
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
    const y = (a4Height - imageHeight) / 2

    page.drawImage(pngImage, {
      x,
      y,
      width: imageWidth,
      height: imageHeight,
    })

    const pdfBytes = await pdfDoc.save()
    const pdfBase64 = arrayBufferToBase64(pdfBytes)
    return pdfBase64
  }

  const downloadAttendanceReceipt = async () => {
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
    anchor.download = `constancia-${attendanceForm.orden || 'atencion'}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
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

  const getReceiptDateText = () => {
    const fecha = new Date()
    const dia = fecha.getDate().toString().padStart(2, '0')
    const mes = fecha.toLocaleString('es-ES', { month: 'long' })
    const anio = fecha.getFullYear()
    return `Tacna, ${dia} de ${mes} del ${anio}`
  }

  const formatCurrentTimestamp = () => new Date().toLocaleString('es-ES')

  const isStudent = user?.rol?.toLowerCase().includes('estudiante')
  const isAdministrative = user?.rol?.toLowerCase().includes('administr')
  const isMale = user?.sexo?.toLowerCase().includes('masculino')
  const hasDisability = normalizeYesNo(user?.hasDisability)
  const isPregnant = !isMale && normalizeYesNo(user?.isPregnant)
  const showCombinedTabs = hasDisability && isPregnant
  const [activeHealthTab, setActiveHealthTab] = useState<
    'disability' | 'pregnancy'
  >('disability')

  useEffect(() => {
    if (showCombinedTabs) {
      setActiveHealthTab('disability')
    }
  }, [showCombinedTabs])

  const renderDisabilityPanel = () => (
    <>
      <div className='flex items-center justify-between gap-4 mb-5'>
        <div>
          <h3 className='text-sm font-bold uppercase tracking-[0.2em] text-on-surface'>
            Discapacidad
          </h3>
          <p className='text-xs text-on-surface-variant'>
            Detalle complementario y seguimiento por Periodo
          </p>
        </div>
      </div>
      {isLoadingDisabilityDetails ? (
        <div className='space-y-3'>
          <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
          <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
        </div>
      ) : disabilityDetails ? (
        <div className='space-y-3'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='rounded-2xl bg-surface-container-low p-4'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                Tipo
              </p>
              <p className='mt-2 text-sm font-semibold text-on-surface'>
                {disabilityDetails.disabilityType || '—'}
              </p>
            </div>
            <div className='rounded-2xl bg-surface-container-low p-4'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                Carnet CONADIS
              </p>
              <p className='mt-2 text-sm font-semibold text-on-surface'>
                {disabilityDetails.conadisCardNumber || '—'}
              </p>
            </div>
          </div>
          <div className='rounded-2xl bg-surface-container-low p-4'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
              Observaciones
            </p>
            <p className='mt-2 text-sm text-on-surface leading-relaxed'>
              {disabilityDetails.observaciones || '—'}
            </p>
          </div>
        </div>
      ) : (
        <p className='text-sm text-on-surface-variant'>
          No hay información adicional registrada.
        </p>
      )}

      <div className='mt-6 border-t border-outline-variant/20 pt-4'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
            Seguimiento por Periodo
          </p>
          <button
            type='button'
            onClick={() => handleOpenDisabilityFollowUpModal()}
            className='rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition'
          >
            Nuevo seguimiento
          </button>
        </div>

        {isLoadingDisabilityFollowUps ? (
          <div className='space-y-2'>
            <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
            <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
          </div>
        ) : disabilityFollowUps.length === 0 ? (
          <p className='text-sm text-on-surface-variant'>
            Aún no hay seguimientos registrados.
          </p>
        ) : (
          <div className='space-y-3'>
            {disabilityFollowUps.map((item, index) => (
              <div
                key={`${item.periodoSeguimiento || 'seguimiento'}-${index}`}
                className='rounded-2xl border border-outline-variant/20 bg-white p-4'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-on-surface'>
                      Periodo {item.periodoSeguimiento || '—'}
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      {item.fechaRegistro || 'Sin fecha'}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleOpenDisabilityFollowUpModal(item)}
                    className='rounded-full border border-outline-variant/50 px-3 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition'
                  >
                    Editar
                  </button>
                </div>
                <p className='mt-3 text-sm text-on-surface leading-relaxed'>
                  {item.observaciones || 'Sin observaciones'}
                </p>
                <div className='mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4'>
                  <div className='text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant'>
                    Datos del seguimiento
                  </div>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Est. regular: {item.estudianteRegular || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Carrera: {item.carrera || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Ciclo: {item.ciclo || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Turno: {item.turno || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )

  const renderPregnancyPanel = () => (
    <>
      <div className='flex items-center justify-between gap-4 mb-5'>
        <div>
          <h3 className='text-sm font-bold uppercase tracking-[0.2em] text-on-surface'>
            Gestante
          </h3>
          <p className='text-xs text-on-surface-variant'>
            Datos complementarios y control de seguimiento
          </p>
        </div>
      </div>
      {isLoadingPregnancyDetails ? (
        <div className='space-y-3'>
          <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
          <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
        </div>
      ) : pregnancyDetails ? (
        <div className='space-y-3'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='rounded-2xl bg-surface-container-low p-4'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                Control prenatal
              </p>
              <p className='mt-2 text-sm font-semibold text-on-surface'>
                {pregnancyDetails.controlPrenatal || '—'}
              </p>
            </div>
            <div className='rounded-2xl bg-surface-container-low p-4'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                Fecha probable de parto
              </p>
              <p className='mt-2 text-sm font-semibold text-on-surface'>
                {pregnancyDetails.fechaProbableParto || '—'}
              </p>
            </div>
          </div>
          <div className='rounded-2xl bg-surface-container-low p-4'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
              Observaciones
            </p>
            <p className='mt-2 text-sm text-on-surface leading-relaxed'>
              {pregnancyDetails.observaciones || '—'}
            </p>
          </div>
        </div>
      ) : (
        <p className='text-sm text-on-surface-variant'>
          No hay información adicional registrada.
        </p>
      )}

      <div className='mt-6 border-t border-outline-variant/20 pt-4'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
            Seguimiento de gestante
          </p>
          <button
            type='button'
            onClick={() => handleOpenPregnancyFollowUpModal()}
            className='rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition'
          >
            Nuevo seguimiento
          </button>
        </div>

        {isLoadingPregnancyFollowUps ? (
          <div className='space-y-2'>
            <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
            <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
          </div>
        ) : pregnancyFollowUps.length === 0 ? (
          <p className='text-sm text-on-surface-variant'>
            Aún no hay seguimientos registrados.
          </p>
        ) : (
          <div className='space-y-3'>
            {pregnancyFollowUps.map((item, index) => (
              <div
                key={`${item.periodoSeguimiento || 'seguimiento'}-${index}`}
                className='rounded-2xl border border-outline-variant/20 bg-white p-4'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-on-surface'>
                      Periodo {item.periodoSeguimiento || '—'}
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      {formatTimeWithoutSeconds(item.fechaRegistro) || '—'}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleOpenPregnancyFollowUpModal(item)}
                    className='rounded-full border border-outline-variant/50 px-3 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition'
                  >
                    Editar
                  </button>
                </div>
                <p className='mt-3 text-sm text-on-surface leading-relaxed'>
                  {item.observaciones || 'Sin observaciones'}
                </p>
                <div className='mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4'>
                  <div className='text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant'>
                    Datos del seguimiento
                  </div>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Est. regular: {item.estudianteRegular || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Carrera: {item.carrera || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Ciclo: {item.ciclo || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Turno: {item.turno || '—'}
                    </span>
                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface'>
                      Control prenatal: {item.controlPrenatal || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )

  const renderHealthTabs = () => (
    <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-sm font-bold uppercase tracking-[0.2em] text-on-surface'>
            Discapacidad y gestante
          </h3>
          <p className='text-xs text-on-surface-variant'>
            Cambie entre las pestañas para ver cada bloque de seguimiento.
          </p>
        </div>
        <div className='flex flex-wrap gap-2 rounded-full bg-surface-container-low p-1'>
          <button
            type='button'
            onClick={() => setActiveHealthTab('disability')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeHealthTab === 'disability'
                ? 'bg-white text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Discapacidad
          </button>
          <button
            type='button'
            onClick={() => setActiveHealthTab('pregnancy')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeHealthTab === 'pregnancy'
                ? 'bg-white text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Gestante
          </button>
        </div>
      </div>
      {activeHealthTab === 'disability'
        ? renderDisabilityPanel()
        : renderPregnancyPanel()}
    </div>
  )

  const renderAttendanceSkeleton = () => (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='rounded-3xl border border-outline-variant/20 p-4 bg-white shadow-sm'
        >
          <div className='h-5 w-2/5 rounded-full bg-surface-variant animate-pulse mb-4' />
          <div className='flex flex-wrap gap-2 mb-4'>
            <span className='h-6 w-24 rounded-full bg-surface-variant animate-pulse' />
            <span className='h-6 w-28 rounded-full bg-surface-variant animate-pulse' />
          </div>
          <div className='grid grid-cols-1 gap-3'>
            <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
            <div className='h-4 rounded-full bg-surface-variant animate-pulse' />
          </div>
          <div className='mt-4 h-4 w-1/2 rounded-full bg-surface-variant animate-pulse' />
        </div>
      ))}
    </div>
  )

  return (
    <Layout
      activeView='user-detail'
      title={user ? `Paciente: ${user.nombreCompleto}` : 'Detalle del paciente'}
    >
      {isLoadingUser ? (
        <div className='space-y-6 p-10 rounded-3xl bg-white shadow-sm'>
          <div className='h-5 w-40 rounded-full bg-surface-variant animate-pulse' />
          <div className='h-10 w-2/3 rounded-full bg-surface-variant animate-pulse' />
          <div className='flex flex-col gap-4 lg:flex-row'>
            <div className='h-48 flex-1 rounded-3xl bg-surface-variant animate-pulse' />
            <div className='h-48 flex-1 rounded-3xl bg-surface-variant animate-pulse' />
          </div>
        </div>
      ) : !user ? (
        <div className='p-10 rounded-3xl bg-white shadow-sm text-center'>
          Usuario no encontrado.
        </div>
      ) : (
        <div className='space-y-8'>
          <section className='rounded-[2rem] border border-outline-variant/20 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-high/20 p-6 md:p-8 shadow-sm'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
              <div className='space-y-4'>
                <nav className='flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
                  <button
                    type='button'
                    onClick={() => navigate('/user-patients')}
                    className='text-primary font-semibold hover:underline'
                  >
                    Usuarios
                  </button>
                  <span>›</span>
                  <span className='font-semibold text-on-surface'>Detalle</span>
                </nav>
                <div className='space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-on-secondary-fixed-variant'>
                      {user.rol || 'Usuario'}
                    </span>

                    <span className='rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-semibold text-on-surface-variant'>
                      Actualizado{' '}
                      {formatTimeWithoutSeconds(
                        user.fechaUltimaActualizacion,
                      ) || '—'}
                    </span>
                  </div>
                  <h2 className='text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl'>
                    {user.nombreCompleto}
                  </h2>
                  <p className='max-w-3xl text-sm md:text-base text-on-surface-variant leading-relaxed'>
                    Vista de seguimiento y administrativo con la información
                    esencial agrupada para una lectura rápida y acciones
                    directas.
                  </p>
                </div>
              </div>
              <div className='flex flex-wrap gap-3'>
                <button
                  type='button'
                  onClick={() =>
                    navigate(
                      `/registration?patientId=${encodeURIComponent(id || '')}`,
                    )
                  }
                  className='inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-white px-5 py-3 text-sm font-semibold text-on-surface-variant shadow-sm transition hover:border-primary/30 hover:text-primary'
                >
                  <span className='material-symbols-outlined text-lg'>
                    edit
                  </span>
                  Editar registro
                </button>
              </div>
            </div>
          </section>

          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start'>
              <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm'>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <span className='material-symbols-outlined'>person</span>
                  </span>
                  <div>
                    <h3 className='text-sm font-bold uppercase tracking-[0.2em] text-primary'>
                      Resumen rápido
                    </h3>
                    <p className='text-xs text-on-surface-variant'>
                      Identidad y estado general
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='rounded-2xl bg-surface-container-low p-4'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                      Edad
                    </p>
                    <p className='mt-2 text-lg font-bold text-on-surface'>
                      {user.edad || '—'}
                    </p>
                  </div>
                  <div className='rounded-2xl bg-surface-container-low p-4'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                      Sexo
                    </p>
                    <p className='mt-2 text-lg font-bold text-on-surface'>
                      {user.sexo || '—'}
                    </p>
                  </div>
                  <div className='rounded-2xl bg-surface-container-low p-4'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                      Vive con
                    </p>
                    <p className='mt-2 text-base font-semibold text-on-surface'>
                      {user.viviendoCon || '—'}
                    </p>
                  </div>
                  <div className='rounded-2xl bg-surface-container-low p-4'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                      Seguro
                    </p>
                    <p className='mt-2 text-base font-semibold text-on-surface'>
                      {user.tipoSeguro || '—'}
                    </p>
                  </div>
                  {!isMale && (
                    <div className='rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                            Embarazada
                          </p>
                          <p className='mt-2 text-base font-semibold text-on-surface'>
                            {user.isPregnant || 'No'}
                          </p>
                        </div>
                        <button
                          type='button'
                          onClick={handleOpenPregnancyModal}
                          className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                          aria-label='Editar información de gestante'
                        >
                          <span className='material-symbols-outlined text-base'>
                            edit
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className='rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70'>
                          Discapacidad
                        </p>
                        <p className='mt-2 text-base font-semibold text-on-surface'>
                          {user.hasDisability || 'No'}
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={handleOpenDisabilityModal}
                        className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition'
                        aria-label='Editar información de discapacidad'
                      >
                        <span className='material-symbols-outlined text-base'>
                          edit
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm'>
                <div className='flex items-center gap-3 mb-5'>
                  <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-fixed-variant'>
                    <span className='material-symbols-outlined'>
                      contact_page
                    </span>
                  </span>
                  <div>
                    <h3 className='text-sm font-bold uppercase tracking-[0.2em] text-on-surface'>
                      Contacto
                    </h3>
                    <p className='text-xs text-on-surface-variant'>
                      Datos para ubicación y comunicación
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  {renderDetailRow('DNI', user.dni)}
                  {renderDetailRow('Teléfono', user.telefono || '—')}
                  {renderDetailRow('Email', user.correoElectronico || '—')}
                  {renderDetailRow('Nacionalidad', user.nacionalidad || '—')}
                </div>
              </div>
            </div>
            <div className='col-span-12 lg:col-span-8 space-y-6'>
              <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8 shadow-sm'>
                <div className='flex items-center justify-between gap-4 mb-6'>
                  <div className='flex items-center gap-3'>
                    <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed text-primary'>
                      <span className='material-symbols-outlined'>
                        psychology
                      </span>
                    </span>
                    <div>
                      <h3 className='font-headline text-xl font-bold text-on-surface'>
                        Contexto institucional
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Rol, carrera o área y datos asociados a la ficha
                      </p>
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {isStudent && renderDetailRow('Carrera', user.carrera || '—')}
                  {isStudent && renderDetailRow('Ciclo', user.ciclo || '—')}
                  {isStudent && renderDetailRow('Sección', user.seccion || '—')}
                  {isAdministrative &&
                    renderDetailRow(
                      'Área / Departamento',
                      user.areaDepartamento || '—',
                    )}
                  {isAdministrative &&
                    renderDetailRow('Cargo', user.cargo || '—')}
                </div>
              </div>

              <div className='space-y-6'>
                {showCombinedTabs ? (
                  renderHealthTabs()
                ) : (
                  <>
                    {hasDisability && (
                      <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm'>
                        {renderDisabilityPanel()}
                      </div>
                    )}
                    {isPregnant && (
                      <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm'>
                        {renderPregnancyPanel()}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className='rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8 shadow-sm border-l-4 border-l-error'>
                <div className='flex items-center justify-between gap-4 mb-6'>
                  <div className='flex items-center gap-3'>
                    <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-error-container text-on-error-container'>
                      <span className='material-symbols-outlined text-lg'>
                        health_cross
                      </span>
                    </span>
                    <div>
                      <h3 className='text-sm font-bold uppercase tracking-[0.2em] text-on-error-container'>
                        Listado de atenciones
                      </h3>
                      <p className='text-sm text-on-surface-variant mt-1'>
                        Explora el historial y abre cada atención para
                        gestionarla.
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  {isLoadingAttendances ? (
                    renderAttendanceSkeleton()
                  ) : attendances.length === 0 ? (
                    <div className='rounded-3xl border border-dashed border-surface-container-high p-6 text-center text-on-surface-variant space-y-4'>
                      <p>No hay atenciones registradas para este paciente.</p>
                      <button
                        type='button'
                        onClick={() =>
                          navigate(
                            `/registration?patientId=${encodeURIComponent(id || '')}`,
                          )
                        }
                        className='inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition'
                      >
                        Crear nueva atención
                      </button>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {attendances.map((attendance) => (
                        <div
                          key={attendance.orden}
                          className='rounded-3xl border border-outline-variant/20 p-5 bg-white shadow-sm'
                        >
                          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                            <div className='space-y-2'>
                              <div className='flex flex-wrap items-center gap-2'>
                                <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary'>
                                  Orden {attendance.orden}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(attendance.resultado)}`}
                                >
                                  {attendance.resultado || 'Sin resultado'}
                                </span>
                              </div>
                              <p className='text-sm text-on-surface-variant'>
                                {attendance.fechaAtencion}
                              </p>
                              <p className='text-base font-semibold text-on-surface'>
                                {attendance.motivoAtencion ||
                                  'Sin motivo registrado'}
                              </p>
                            </div>
                            <div className='flex flex-wrap gap-2 text-[13px]'>
                              <span className='rounded-full bg-primary/10 px-3 py-1 text-primary'>
                                {attendance.medioContacto || 'Sin medio'}
                              </span>
                              <span className='rounded-full bg-surface-container-low px-3 py-1 text-on-surface-variant'>
                                {attendance.areaProblematica || 'Sin área'}
                              </span>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              <button
                                type='button'
                                onClick={() =>
                                  handleOpenAttendanceModal(attendance)
                                }
                                className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition'
                                aria-label='Gestionar atención'
                              >
                                <span className='material-symbols-outlined text-base'>
                                  edit
                                </span>
                              </button>
                              <button
                                type='button'
                                onClick={() =>
                                  handleOpenReceiptModal(attendance)
                                }
                                className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-white text-on-surface hover:bg-surface-container-high transition'
                                aria-label='Ver constancia'
                              >
                                <span className='material-symbols-outlined text-base'>
                                  receipt_long
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showAttendanceModal &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {(isSavingAttendance || isSendingAttendanceEmail) && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        {isSavingAttendance
                          ? 'Guardando...'
                          : 'Enviando correo...'}
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Gestionar atención {attendanceForm.orden}
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Actualiza el resultado y las observaciones. La
                        constancia se abre en un modal separado.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowAttendanceModal(false)}
                      disabled={isSavingAttendance || isSendingAttendanceEmail}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid grid-cols-1 gap-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'></div>
                      {!isAdministrative && (
                        <>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <p className='text-sm font-semibold text-on-surface'>
                                Programa
                              </p>
                              <p className='mt-2 text-sm text-on-surface'>
                                {attendanceForm.programa}
                              </p>
                            </div>
                            <div>
                              <p className='text-sm font-semibold text-on-surface'>
                                Ciclo
                              </p>
                              <p className='mt-2 text-sm text-on-surface'>
                                {attendanceForm.ciclo}
                              </p>
                            </div>
                          </div>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <p className='text-sm font-semibold text-on-surface'>
                                Sección
                              </p>
                              <p className='mt-2 text-sm text-on-surface'>
                                {attendanceForm.seccion}
                              </p>
                            </div>
                            <div>
                              <p className='text-sm font-semibold text-on-surface'>
                                Fecha
                              </p>
                              <p className='mt-2 text-sm text-on-surface'>
                                {attendanceForm.fechaAtencion}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {isAdministrative && (
                        <div className='grid grid-cols-1 gap-4'>
                          <div>
                            <p className='text-sm font-semibold text-on-surface'>
                              Fecha
                            </p>
                            <p className='mt-2 text-sm text-on-surface'>
                              {attendanceForm.fechaAtencion}
                            </p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>
                          Área problemática
                        </p>
                        <p className='mt-2 text-sm text-on-surface'>
                          {attendanceForm.areaProblematica || '—'}
                        </p>
                      </div>
                      <div>
                        <label className='text-md font-semibold text-on-surface'>
                          Motivo de atención
                        </label>

                        <p className='mt-2 text-sm text-on-surface'>
                          {attendanceForm.motivoAtencion || '—'}
                        </p>
                      </div>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <label className='text-sm font-semibold text-on-surface'>
                            Resultado
                          </label>
                          <select
                            value={attendanceForm.resultado}
                            onChange={(event) =>
                              setAttendanceForm((prev) => ({
                                ...prev,
                                resultado: event.target.value,
                              }))
                            }
                            disabled={
                              isSavingAttendance || isSendingAttendanceEmail
                            }
                            className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <option value='Finalizado'>Finalizado</option>
                            <option value='En Seguimiento'>
                              En Seguimiento
                            </option>
                            <option value='Derivado'>Derivado</option>
                            <option value='No concluyente'>
                              No concluyente
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Observaciones / Recomendaciones
                        </label>
                        <textarea
                          value={attendanceForm.observaciones}
                          onChange={(event) =>
                            setAttendanceForm((prev) => ({
                              ...prev,
                              observaciones: event.target.value,
                            }))
                          }
                          disabled={
                            isSavingAttendance || isSendingAttendanceEmail
                          }
                          className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface min-h-[140px] disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Ingrese observaciones o recomendaciones'
                        />
                      </div>
                    </div>
                    <div className='flex flex-col gap-3 md:flex-row md:justify-between'>
                      <button
                        type='button'
                        onClick={() => setShowAttendanceModal(false)}
                        disabled={
                          isSavingAttendance || isSendingAttendanceEmail
                        }
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSaveAttendance}
                        disabled={
                          isSavingAttendance || isSendingAttendanceEmail
                        }
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingAttendance ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showReceiptModal &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Constancia de atención
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Vista previa de la constancia, descarga el PDF desde
                        aquí.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowReceiptModal(false)}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='rounded-3xl border border-outline-variant/20 bg-[#f5f3ff] overflow-hidden'>
                      <div ref={receiptPreviewRef} className='overflow-hidden'>
                        <div className='flex flex-col md:flex-row border-t border-b border-outline-variant/20'>
                          <div className='flex w-full flex-col justify-between bg-[#673AB6] p-5 text-white md:w-[260px]'>
                            <div>
                              <img
                                src='https://res.cloudinary.com/detbcxpfb/image/upload/v1775600238/resultado_qprg0t.png'
                                alt='Logo'
                                crossOrigin='anonymous'
                                style={{
                                  width: '180px',
                                  marginBottom: '40px',
                                }}
                              />
                              <h3 className='text-lg font-semibold'>
                                Atención de Enfermería
                              </h3>
                              <p className='mt-3 text-sm text-white/80'>
                                Registro oficial de atención médica
                              </p>
                            </div>
                            <div className='text-xs opacity-80'>
                              Instituto de Educación Superior
                              <br />
                              NEUMANN
                            </div>
                          </div>
                          <div className='flex-1 bg-white p-5 md:p-6'>
                            <div className='mb-5'>
                              <h4 className='text-2xl font-bold text-[#673AB6]'>
                                Constancia de Atención
                              </h4>
                              <div className='mt-2 h-1 w-16 rounded-full bg-[#673AB6]' />
                            </div>
                            <div className='rounded-2xl bg-[#f5f3ff] p-4 mb-4'>
                              <div className='text-[11px] uppercase tracking-[0.3em] text-[#666]'>
                                {user?.rol ? user.rol.toUpperCase() : 'USUARIO'}
                              </div>
                              <div className='mt-2 text-xl font-semibold text-on-surface'>
                                {attendanceForm.nombreCompleto || '—'}
                              </div>
                              <div className='mt-3 text-sm text-[#444]'>
                                DNI: {attendanceForm.dni || '—'}
                              </div>
                              <div className='mt-1 text-sm text-[#444]'>
                                N° ORDEN: {attendanceForm.orden || '—'}
                              </div>
                              <div className='mt-1 text-sm text-[#444]'>
                                FECHA: {attendanceForm.fechaAtencion || '—'}
                              </div>
                            </div>
                            {!isAdministrative && (
                              <div className='grid grid-cols-1 gap-3 md:grid-cols-3 mb-4'>
                                <div className='rounded-2xl border border-[#eee] bg-white p-4'>
                                  <div className='text-[11px] uppercase tracking-[0.3em] text-[#888]'>
                                    Programa
                                  </div>
                                  <div className='mt-2 text-sm font-semibold text-on-surface'>
                                    {attendanceForm.programa || '—'}
                                  </div>
                                </div>
                                <div className='rounded-2xl border border-[#eee] bg-white p-4'>
                                  <div className='text-[11px] uppercase tracking-[0.3em] text-[#888]'>
                                    Ciclo
                                  </div>
                                  <div className='mt-2 text-sm font-semibold text-on-surface'>
                                    {attendanceForm.ciclo || '—'}
                                  </div>
                                </div>
                                <div className='rounded-2xl border border-[#eee] bg-white p-4'>
                                  <div className='text-[11px] uppercase tracking-[0.3em] text-[#888]'>
                                    Sección
                                  </div>
                                  <div className='mt-2 text-sm font-semibold text-on-surface'>
                                    {attendanceForm.seccion || '—'}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className='mb-4'>
                              <div className='text-[11px] uppercase tracking-[0.3em] text-[#666] mb-2'>
                                MOTIVO DE ATENCIÓN
                              </div>
                              <div className='rounded-2xl border border-[#eee] bg-[#fafafa] p-4 text-sm leading-relaxed text-slate-700 min-h-[70px]'>
                                {attendanceForm.motivoAtencion || '—'}
                              </div>
                            </div>
                            <div className='mb-4'>
                              <div className='text-[11px] uppercase tracking-[0.3em] text-[#666] mb-2'>
                                RECOMENDACIONES
                              </div>
                              <div className='rounded-2xl border border-[#eee] bg-[#fafafa] p-4 text-sm leading-relaxed text-slate-700 min-h-[70px]'>
                                {attendanceForm.observaciones || '—'}
                              </div>
                            </div>
                            <div className='receipt-signature pt-6'>
                              <img
                                src='firmaEjemplo.png'
                                alt='Firma de ejemplo'
                                className='h-24 w-auto object-contain'
                              />
                            </div>
                            <div className=' border-slate-200 flex justify-between'>
                              <div className='text-center'>
                                <div className='mx-auto mb-2 h-px w-44 bg-slate-300' />
                                <div className='text-xs text-slate-600'>
                                  Lic. en Enfermería
                                </div>
                              </div>
                              <div className='mt-3 text-sm text-slate-600'>
                                {getReceiptDateText()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-between gap-3'>
                      <button
                        type='button'
                        onClick={downloadAttendanceReceipt}
                        className='inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition'
                      >
                        <span className='material-symbols-outlined text-base'>
                          download
                        </span>
                        Descargar constancia
                      </button>
                      <div className='flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={handleSendAttendanceReceipt}
                          disabled={
                            !attendanceForm.correoElectronico ||
                            isSendingAttendanceEmail
                          }
                          className='inline-flex items-center gap-2 rounded-full bg-secondary text-white px-5 py-3 text-sm font-semibold hover:bg-secondary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <span className='material-symbols-outlined text-base'>
                            email
                          </span>
                          {attendanceEmailSent[attendanceForm.orden]
                            ? 'Reenviar constancia virtual'
                            : 'Enviar constancia virtual'}
                        </button>
                        <button
                          type='button'
                          onClick={() => setShowReceiptModal(false)}
                          className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition'
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showDisabilityModal &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {isSavingDisability && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Guardando...
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Datos de discapacidad
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Complete solo los datos adicionales que aún no están en
                        la ficha.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowDisabilityModal(false)}
                      disabled={isSavingDisability}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid grid-cols-1 gap-4'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Discapacidad
                        </label>
                        <select
                          value={disabilityForm.hasDisability}
                          onChange={(event) =>
                            setDisabilityForm((prev) => ({
                              ...prev,
                              hasDisability: event.target.value,
                            }))
                          }
                          disabled={isSavingDisability}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value='No'>No</option>
                          <option value='Sí'>Sí</option>
                        </select>
                      </div>

                      {normalizeYesNo(disabilityForm.hasDisability) && (
                        <>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Tipo de discapacidad
                            </label>
                            <input
                              type='text'
                              value={disabilityForm.disabilityType}
                              onChange={(event) =>
                                setDisabilityForm((prev) => ({
                                  ...prev,
                                  disabilityType: event.target.value,
                                }))
                              }
                              disabled={isSavingDisability}
                              className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                              placeholder='Ej. visual, motora, auditiva'
                            />
                          </div>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Periodo de registro
                            </label>
                            <input
                              type='text'
                              value={disabilityForm.periodoRegistro}
                              onChange={(event) =>
                                setDisabilityForm((prev) => ({
                                  ...prev,
                                  periodoRegistro: formatPeriodoInput(
                                    event.target.value,
                                  ),
                                }))
                              }
                              disabled={isSavingDisability}
                              className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                              placeholder='2026 - I'
                            />
                          </div>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Carnet CONADIS
                            </label>
                            <select
                              value={disabilityForm.conadisCardNumber}
                              onChange={(event) =>
                                setDisabilityForm((prev) => ({
                                  ...prev,
                                  conadisCardNumber: event.target.value,
                                }))
                              }
                              disabled={isSavingDisability}
                              className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <option value=''>Seleccionar...</option>
                              <option value='Sí'>Sí</option>
                              <option value='No'>No</option>
                            </select>
                          </div>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Observaciones
                            </label>
                            <textarea
                              value={disabilityForm.observaciones}
                              onChange={(event) =>
                                setDisabilityForm((prev) => ({
                                  ...prev,
                                  observaciones: event.target.value,
                                }))
                              }
                              disabled={isSavingDisability}
                              className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface min-h-[120px] disabled:cursor-not-allowed disabled:opacity-50'
                              placeholder='Comentarios adicionales'
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className='flex justify-end gap-3'>
                      <button
                        type='button'
                        onClick={() => setShowDisabilityModal(false)}
                        disabled={isSavingDisability}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSaveDisability}
                        disabled={isSavingDisability}
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingDisability ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showPregnancyModal &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {isSavingPregnancy && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Guardando...
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        Datos de gestante
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Complete solo los datos adicionales que aún no están en
                        la ficha.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowPregnancyModal(false)}
                      disabled={isSavingPregnancy}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid grid-cols-1 gap-4'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Embarazada
                        </label>
                        <select
                          value={pregnancyForm.isPregnant}
                          onChange={(event) =>
                            setPregnancyForm((prev) => ({
                              ...prev,
                              isPregnant: event.target.value,
                            }))
                          }
                          disabled={isSavingPregnancy}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value='No'>No</option>
                          <option value='Sí'>Sí</option>
                        </select>
                      </div>

                      {normalizeYesNo(pregnancyForm.isPregnant) && (
                        <>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Control prenatal
                            </label>
                            <select
                              value={pregnancyForm.controlPrenatal}
                              onChange={(event) =>
                                setPregnancyForm((prev) => ({
                                  ...prev,
                                  controlPrenatal: event.target.value,
                                }))
                              }
                              disabled={isSavingPregnancy}
                              className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <option value=''>Seleccione</option>
                              <option value='Sí'>Sí</option>
                              <option value='No'>No</option>
                            </select>
                          </div>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Fecha probable de parto
                            </label>
                            <input
                              type='date'
                              value={pregnancyForm.fechaProbableParto}
                              onChange={(event) =>
                                setPregnancyForm((prev) => ({
                                  ...prev,
                                  fechaProbableParto: event.target.value,
                                }))
                              }
                              disabled={isSavingPregnancy}
                              className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                            />
                          </div>
                          <div>
                            <label className='text-sm font-semibold text-on-surface'>
                              Observaciones
                            </label>
                            <textarea
                              value={pregnancyForm.observaciones}
                              onChange={(event) =>
                                setPregnancyForm((prev) => ({
                                  ...prev,
                                  observaciones: event.target.value,
                                }))
                              }
                              disabled={isSavingPregnancy}
                              className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface min-h-[120px] disabled:cursor-not-allowed disabled:opacity-50'
                              placeholder='Comentarios adicionales'
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className='flex justify-end gap-3'>
                      <button
                        type='button'
                        onClick={() => setShowPregnancyModal(false)}
                        disabled={isSavingPregnancy}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSavePregnancy}
                        disabled={isSavingPregnancy}
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingPregnancy ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showDisabilityFollowUpModal &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {isSavingDisabilityFollowUp && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Guardando...
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        {editingDisabilityFollowUp
                          ? 'Editar seguimiento de discapacidad'
                          : 'Seguimiento por periodo (Discapacidad)'}
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Registra el estado del estudiante en cada periodo.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowDisabilityFollowUpModal(false)}
                      disabled={isSavingDisabilityFollowUp}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Periodo
                        </label>
                        <input
                          type='text'
                          value={disabilityFollowUpForm.periodoSeguimiento}
                          onChange={(event) =>
                            setDisabilityFollowUpForm((prev) => ({
                              ...prev,
                              periodoSeguimiento: formatPeriodoInput(
                                event.target.value,
                              ),
                            }))
                          }
                          disabled={isSavingDisabilityFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='2026 - I'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Estudiante regular
                        </label>
                        <select
                          value={disabilityFollowUpForm.estudianteRegular}
                          onChange={(event) =>
                            setDisabilityFollowUpForm((prev) => ({
                              ...prev,
                              estudianteRegular: event.target.value,
                            }))
                          }
                          disabled={isSavingDisabilityFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccionar...</option>
                          <option value='Sí'>Sí</option>
                          <option value='No'>No</option>
                        </select>
                      </div>
                      <div className='md:col-span-2'>
                        <label className='text-sm font-semibold text-on-surface'>
                          Carrera
                        </label>
                        <select
                          value={disabilityFollowUpForm.carrera}
                          onChange={(event) =>
                            setDisabilityFollowUpForm((prev) => ({
                              ...prev,
                              carrera: event.target.value,
                            }))
                          }
                          disabled={isSavingDisabilityFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccionar...</option>
                          <option value='Administración de Negocios Internacionales'>
                            Administración de Negocios Internacionales
                          </option>
                          <option value='Contabilidad'>Contabilidad</option>
                        </select>
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Ciclo
                        </label>
                        <input
                          type='text'
                          value={disabilityFollowUpForm.ciclo}
                          onChange={(event) =>
                            setDisabilityFollowUpForm((prev) => ({
                              ...prev,
                              ciclo: event.target.value,
                            }))
                          }
                          disabled={isSavingDisabilityFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Turno
                        </label>
                        <select
                          value={disabilityFollowUpForm.turno}
                          onChange={(event) =>
                            setDisabilityFollowUpForm((prev) => ({
                              ...prev,
                              turno: event.target.value,
                            }))
                          }
                          disabled={isSavingDisabilityFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccionar...</option>
                          <option value='Mañana'>Mañana</option>
                          <option value='Tarde'>Tarde</option>
                          <option value='Noche'>Noche</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-semibold text-on-surface'>
                        Observaciones del ciclo
                      </label>
                      <textarea
                        value={disabilityFollowUpForm.observaciones}
                        onChange={(event) =>
                          setDisabilityFollowUpForm((prev) => ({
                            ...prev,
                            observaciones: event.target.value,
                          }))
                        }
                        disabled={isSavingDisabilityFollowUp}
                        className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface min-h-[130px] disabled:cursor-not-allowed disabled:opacity-50'
                      />
                    </div>
                    <div className='flex justify-end gap-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingDisabilityFollowUp(null)
                          setShowDisabilityFollowUpModal(false)
                        }}
                        disabled={isSavingDisabilityFollowUp}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSaveDisabilityFollowUp}
                        disabled={isSavingDisabilityFollowUp}
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingDisabilityFollowUp
                          ? 'Guardando...'
                          : editingDisabilityFollowUp
                            ? 'Actualizar seguimiento'
                            : 'Guardar seguimiento'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showPregnancyFollowUpModal &&
            createPortal(
              <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden relative'>
                  {isSavingPregnancyFollowUp && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow'>
                        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Guardando...
                      </div>
                    </div>
                  )}
                  <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                    <div>
                      <h3 className='text-xl font-bold text-on-surface'>
                        {editingPregnancyFollowUp
                          ? 'Editar seguimiento de gestante'
                          : 'Seguimiento de gestante'}
                      </h3>
                      <p className='text-sm text-on-surface-variant'>
                        Registra el estado de la gestante por periodo.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowPregnancyFollowUpModal(false)}
                      disabled={isSavingPregnancyFollowUp}
                      className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50'
                      aria-label='Cerrar'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                  <div className='max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Periodo
                        </label>
                        <input
                          type='text'
                          value={pregnancyFollowUpForm.periodoSeguimiento}
                          onChange={(event) =>
                            setPregnancyFollowUpForm((prev) => ({
                              ...prev,
                              periodoSeguimiento: formatPeriodoInput(
                                event.target.value,
                              ),
                            }))
                          }
                          disabled={isSavingPregnancyFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='2026 - I'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Estudiante regular
                        </label>
                        <select
                          value={pregnancyFollowUpForm.estudianteRegular}
                          onChange={(event) =>
                            setPregnancyFollowUpForm((prev) => ({
                              ...prev,
                              estudianteRegular: event.target.value,
                            }))
                          }
                          disabled={isSavingPregnancyFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccione</option>
                          <option value='Sí'>Sí</option>
                          <option value='No'>No</option>
                        </select>
                      </div>
                      <div className='md:col-span-2'>
                        <label className='text-sm font-semibold text-on-surface'>
                          Carrera
                        </label>
                        <select
                          value={pregnancyFollowUpForm.carrera}
                          onChange={(event) =>
                            setPregnancyFollowUpForm((prev) => ({
                              ...prev,
                              carrera: event.target.value,
                            }))
                          }
                          disabled={isSavingPregnancyFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccione</option>
                          <option value='Administración de Negocios Internacionales'>
                            Administración de Negocios Internacionales
                          </option>
                          <option value='Contabilidad'>Contabilidad</option>
                        </select>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Ciclo
                        </label>
                        <input
                          type='text'
                          value={pregnancyFollowUpForm.ciclo}
                          onChange={(event) =>
                            setPregnancyFollowUpForm((prev) => ({
                              ...prev,
                              ciclo: event.target.value,
                            }))
                          }
                          disabled={isSavingPregnancyFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Ciclo'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Turno
                        </label>
                        <select
                          value={pregnancyFollowUpForm.turno}
                          onChange={(event) =>
                            setPregnancyFollowUpForm((prev) => ({
                              ...prev,
                              turno: event.target.value,
                            }))
                          }
                          disabled={isSavingPregnancyFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccione</option>
                          <option value='Mañana'>Mañana</option>
                          <option value='Tarde'>Tarde</option>
                          <option value='Noche'>Noche</option>
                        </select>
                      </div>
                      <div>
                        <label className='text-sm font-semibold text-on-surface'>
                          Control prenatal
                        </label>
                        <select
                          value={pregnancyFollowUpForm.controlPrenatal}
                          onChange={(event) =>
                            setPregnancyFollowUpForm((prev) => ({
                              ...prev,
                              controlPrenatal: event.target.value,
                            }))
                          }
                          disabled={isSavingPregnancyFollowUp}
                          className='mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <option value=''>Seleccione</option>
                          <option value='Sí'>Sí</option>
                          <option value='No'>No</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-semibold text-on-surface'>
                        Observaciones del seguimiento
                      </label>
                      <textarea
                        value={pregnancyFollowUpForm.observaciones}
                        onChange={(event) =>
                          setPregnancyFollowUpForm((prev) => ({
                            ...prev,
                            observaciones: event.target.value,
                          }))
                        }
                        disabled={isSavingPregnancyFollowUp}
                        className='mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3 text-on-surface min-h-[130px] disabled:cursor-not-allowed disabled:opacity-50'
                      />
                    </div>
                    <div className='flex justify-end gap-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingPregnancyFollowUp(null)
                          setShowPregnancyFollowUpModal(false)
                        }}
                        disabled={isSavingPregnancyFollowUp}
                        className='rounded-full border border-outline-variant/50 px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        onClick={handleSavePregnancyFollowUp}
                        disabled={isSavingPregnancyFollowUp}
                        className='rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSavingPregnancyFollowUp
                          ? 'Guardando...'
                          : editingPregnancyFollowUp
                            ? 'Actualizar seguimiento'
                            : 'Guardar seguimiento'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
      )}
    </Layout>
  )
}

export default UserDetail
