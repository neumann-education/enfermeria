import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import Layout from './Layout'
import UserRegistrationForm from './UserRegistrationForm'
import AttentionForm from './AttentionForm'
import { consultaService } from './services/consultaService'
import { useAppData } from './AppDataContext'
import toast from 'react-hot-toast'

type Patient = {
  id: string
  name: string
  age?: string | number
  gender?: string
  sexo?: string
  email?: string
  role?: string
  dni?: string
  celular?: string
  nacionalidad?: string
  carrera?: string
  ciclo?: string
  seccion?: string
  areaDepartamento?: string
  cargo?: string
  viviendoCon?: string
  tipoSeguro?: string
  isPregnant?: string
  hasDisability?: string
  fechaUltimaActualizacion?: string
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4'>
      <p className='text-xs uppercase tracking-[0.16em] text-on-surface-variant'>
        {label}
      </p>
      <p className='mt-2 text-sm font-semibold text-on-surface break-words'>
        {value || '—'}
      </p>
    </div>
  )
}

const nationalities = [
  { name: 'Alemán', iso2: 'DE' },
  { name: 'Argentino', iso2: 'AR' },
  { name: 'Beliceño', iso2: 'BZ' },
  { name: 'Boliviano', iso2: 'BO' },
  { name: 'Brasileño', iso2: 'BR' },
  { name: 'Británico', iso2: 'GB' },
  { name: 'Canadiense', iso2: 'CA' },
  { name: 'Chileno', iso2: 'CL' },
  { name: 'Colombiano', iso2: 'CO' },
  { name: 'Costarricense', iso2: 'CR' },
  { name: 'Cubano', iso2: 'CU' },
  { name: 'Dominicano', iso2: 'DO' },
  { name: 'Ecuatoriano', iso2: 'EC' },
  { name: 'Español', iso2: 'ES' },
  { name: 'Estadounidense', iso2: 'US' },
  { name: 'Francés', iso2: 'FR' },
  { name: 'Guatemalteco', iso2: 'GT' },
  { name: 'Hondureño', iso2: 'HN' },
  { name: 'Italiano', iso2: 'IT' },
  { name: 'Mexicano', iso2: 'MX' },
  { name: 'Nicaragüense', iso2: 'NI' },
  { name: 'Panameño', iso2: 'PA' },
  { name: 'Paraguayo', iso2: 'PY' },
  { name: 'Peruano', iso2: 'PE' },
  { name: 'Puertorriqueño', iso2: 'PR' },
  { name: 'Salvadoreño', iso2: 'SV' },
  { name: 'Uruguayo', iso2: 'UY' },
  { name: 'Venezolano', iso2: 'VE' },
  { name: 'Otro', iso2: null },
]

function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [flowType, setFlowType] = useState<'new' | 'existing' | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedRole, setSelectedRole] = useState('Estudiante')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dni, setDni] = useState('')
  const [ageInput, setAgeInput] = useState('')
  const [sex, setSex] = useState('')
  const [livingWith, setLivingWith] = useState('')
  const [customLivingWith, setCustomLivingWith] = useState('')
  const [career, setCareer] = useState('')
  const [cycle, setCycle] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [section, setSection] = useState('')
  const [motivoAtencion, setMotivoAtencion] = useState('')
  const [medioContacto, setMedioContacto] = useState('')
  const [resultado, setResultado] = useState('')
  const [areaProblematica, setAreaProblematica] = useState('')
  const [customAreaProblematica, setCustomAreaProblematica] = useState('')
  const [areaDepartment, setAreaDepartment] = useState('')
  const [cargo, setCargo] = useState('')
  const [nationality, setNationality] = useState('')
  const [customNationality, setCustomNationality] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false)
  const [insuranceType, setInsuranceType] = useState('')
  const [customInsuranceType, setCustomInsuranceType] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPatientDetailModal, setShowPatientDetailModal] = useState(false)
  const { users } = useAppData()

  const registerAttentionComplete = async (data: any) => {
    try {
      return await consultaService.registerAttentionComplete(data)
    } catch (error: unknown) {
      console.error('Error registrando atención completa:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión',
      }
    }
  }

  const registerAttentionOnly = async (data: any) => {
    try {
      return await consultaService.registerAttentionOnly(data)
    } catch (error: unknown) {
      console.error('Error registrando atención:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión',
      }
    }
  }

  const validateRequiredFields = () => {
    const missingFields = []
    const isNewPatient = flowType === 'new' || !selectedPatient

    if (isNewPatient) {
      if (!dni.trim()) missingFields.push('DNI')
      if (!fullName.trim()) missingFields.push('Nombre completo')
      if (!ageInput.trim()) missingFields.push('Edad')
      if (!sex.trim() || sex === 'Seleccionar...') missingFields.push('Sexo')
      if (!email.trim()) missingFields.push('Email')
      if (!phone.trim()) missingFields.push('Teléfono')
    }

    if (
      !periodo.trim() ||
      !/^[0-9]{4}\s*-\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i.test(
        periodo.trim(),
      )
    ) {
      missingFields.push('Periodo (formato 2026 - I)')
    }
    if (!motivoAtencion.trim()) missingFields.push('Motivo de atención')
    if (!areaProblematica.trim())
      missingFields.push('Área problemática principal')
    if (areaProblematica === 'Otro' && !customAreaProblematica.trim()) {
      missingFields.push('Especifique el área problemática')
    }
    if (!medioContacto.trim()) missingFields.push('Medio de contacto')
    if (!resultado.trim()) missingFields.push('Resultado')
    if (!observaciones.trim()) missingFields.push('Observaciones')

    if (missingFields.length > 0) {
      toast.error(`Complete los siguientes campos: ${missingFields.join(', ')}`)
      return false
    }

    return true
  }

  const steps = [
    { number: 1, title: 'Identificación personal' },
    { number: 2, title: 'Rol institucional' },
    { number: 3, title: 'Registro de atención' },
  ]

  const totalSteps = steps.length

  const getEffectiveStep = () => {
    if (flowType === 'existing' && selectedPatient) {
      return 3
    }
    return currentStep
  }

  const getVisibleSteps = () => {
    if (flowType === 'existing' && selectedPatient) {
      return steps.filter((s) => s.number === 3)
    }
    return steps
  }

  const filteredNationalities = nationalityFilter.trim()
    ? nationalities.filter((nat) =>
        nat.name.toLowerCase().includes(nationalityFilter.trim().toLowerCase()),
      )
    : nationalities

  const nationalityDropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loadedPatientId = useRef<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nationalityDropdownRef.current &&
        !nationalityDropdownRef.current.contains(event.target as Node)
      ) {
        setNationalityDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const patientId = searchParams.get('patientId')?.trim()
    if (!patientId || loadedPatientId.current === patientId) {
      return
    }
    loadedPatientId.current = patientId

    const loadPatientForAttendance = async () => {
      try {
        const user = await consultaService.getUserById(patientId)
        if (!user) {
          return
        }

        handleSelectExistingPatient({
          id: user.id,
          name: user.nombreCompleto || '',
          age: user.edad || '',
          sexo: user.sexo || user.gender || '',
          gender: user.sexo || user.gender || '',
          email: user.correoElectronico || user.email || '',
          dni: user.dni || '',
          celular: user.telefono || user.celular || '',
          nacionalidad: user.nacionalidad || '',
          role: user.rol || user.role || '',
          carrera: user.carrera || '',
          ciclo: user.ciclo || '',
          seccion: user.seccion || '',
          areaDepartamento: user.areaDepartamento || '',
          cargo: user.cargo || '',
          viviendoCon: user.viviendoCon || '',
          tipoSeguro: user.tipoSeguro || '',
          isPregnant: user.isPregnant || '',
          hasDisability: user.hasDisability || '',
          fechaUltimaActualizacion: user.fechaUltimaActualizacion || '',
        })
      } catch (error) {
        console.error(
          'No se pudo cargar el paciente para crear atención',
          error,
        )
      }
    }

    loadPatientForAttendance()
  }, [searchParams])

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      setSearchResults([])
      setSearchError('')
      setIsSearching(false)
      return
    }

    const timer = window.setTimeout(() => {
      setIsSearching(true)
      setSearchError('')

      const mappedUsers = users
        .filter((user) => {
          const normalized = query
          const searchFields = [
            user.nombreCompleto,
            user.dni,
            user.correoElectronico,
            user.celular,
            user.rol,
            user.carrera,
            user.ciclo,
            user.seccion,
          ]
          return searchFields.some((field) =>
            String(field || '')
              .toLowerCase()
              .includes(normalized),
          )
        })
        .map((user) => ({
          id: user.id || '',
          name: user.nombreCompleto || '',
          age: user.edad || '',
          email: user.correoElectronico || '',
          dni: user.dni || '',
          celular: user.celular || '',
          nacionalidad: user.nacionalidad || '',
          role: user.rol || user.role || (user.programa ? 'Estudiante' : ''),
          carrera: user.carrera || user.programa || '',
          ciclo: user.ciclo || '',
          seccion: user.seccion || '',
          areaDepartamento: user.areaDepartamento || '',
          cargo: user.cargo || '',
          viviendoCon: user.viviendoCon || '',
          tipoSeguro: user.tipoSeguro || '',
          isPregnant: user.isPregnant || '',
          hasDisability: user.hasDisability || '',
          fechaUltimaActualizacion: user.fechaUltimaActualizacion || '',
          sexo: user.sexo || user.gender || '',
          gender: user.gender || user.sexo || '',
        }))

      setSearchResults(mappedUsers)
      setIsSearching(false)
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchQuery, users])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (flowType === 'existing' && selectedPatient && currentStep === 3) {
      setFlowType(null)
      setSelectedPatient(null)
      setSearchQuery('')
      resetAttendanceState()
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetAttendanceState = () => {
    setMotivoAtencion('')
    setMedioContacto('')
    setResultado('')
    setAreaProblematica('')
    setCustomAreaProblematica('')
    setPeriodo('')
    setObservaciones('')
  }

  const handleNewPatient = () => {
    setFlowType('new')
    setSelectedPatient(null)
    setSearchQuery('')
    setCurrentStep(1)
    resetAttendanceState()
  }

  const handleSelectExistingPatient = (patient: Patient) => {
    setFlowType('existing')
    setSelectedPatient(patient)
    setSearchResults([])
    setSearchQuery('')
    setCurrentStep(3)
    setSelectedRole(patient.role || selectedRole)
    setSex(patient.sexo || patient.gender || '')
    setFullName(patient.name || '')
    setEmail(patient.email || '')
    setPhone(patient.celular || '')
    setDni(patient.dni || '')
    setAgeInput(String(patient.age || ''))
    setNationality(patient.nacionalidad || '')
    setCareer(patient.carrera || '')
    setCycle(patient.ciclo || '')
    setSection(patient.seccion || '')
    setAreaDepartment(patient.areaDepartamento || '')
    setCargo(patient.cargo || '')
    setLivingWith(patient.viviendoCon || '')
    setCustomLivingWith('')
    setInsuranceType(patient.tipoSeguro || '')
    setCustomInsuranceType('')
    resetAttendanceState()
  }

  const renderStepIndicator = () => {
    const visibleSteps = getVisibleSteps()
    const effectiveStep = getEffectiveStep()

    return (
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-2'>
          {visibleSteps.map((step, index) => {
            const isCompleted = step.number < effectiveStep
            const isActive = step.number === effectiveStep

            return (
              <div key={step.number} className='flex items-center flex-1'>
                <div className='flex flex-col justify-center items-center'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : isCompleted
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    {isCompleted ? (
                      <span className='material-symbols-outlined'>check</span>
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div
                    className={`text-xs text-center mt-1 max-w-16 ${isActive ? 'font-semibold text-primary' : 'text-on-surface-variant'}`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < visibleSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      isCompleted ? 'bg-primary' : 'bg-surface-container-low'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Layout activeView='registration' title='Formulario de registro'>
      <div className='space-y-4 pb-10'>
        {flowType && (
          <nav className='text-sm text-on-surface-variant flex items-center gap-2'>
            <button
              onClick={() => {
                setFlowType(null)
                setSelectedPatient(null)
                setSearchQuery('')
                setCurrentStep(1)
              }}
              className='text-primary hover:underline'
            >
              Regresar
            </button>
            <span>›</span>
            <span className='font-semibold'>Crear nuevo paciente</span>
          </nav>
        )}

        {/* GATEWAY SECTION */}
        {!flowType && (
          <section className='bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl border border-outline-variant/20 p-8 shadow-sm'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-on-surface mb-2'>
                Atención médica
              </h2>
              <p className='text-sm text-on-surface-variant'>
                Selecciona una opción para continuar
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start'>
              {/* Option: Search existing patient */}
              <div className='p-4 rounded-xl border-2 border-outline-variant/30 bg-surface-container-lowest overflow-hidden'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center'>
                    <span className='material-symbols-outlined text-secondary text-lg'>
                      search
                    </span>
                  </div>
                  <h3 className='font-bold text-on-surface'>
                    Buscar paciente existente
                  </h3>
                </div>
                <p className='text-xs text-on-surface-variant mb-4'>
                  Usa datos de un paciente registrado
                </p>

                {/* Search input */}
                <div className='flex items-center bg-white/50 rounded-lg border border-outline-variant px-3 py-2.5 mb-3'>
                  <span className='material-symbols-outlined text-on-surface-variant text-sm'>
                    search
                  </span>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Nombre, Apellido, DNI o Correo electrónico'
                    className='w-full border-none outline-none focus:outline-none focus:ring-0 px-3 text-sm text-on-surface bg-transparent'
                  />
                </div>

                {/* Search results */}
                {searchQuery.trim().length > 0 && (
                  <div className='space-y-3 max-h-96 overflow-y-auto'>
                    {isSearching ? (
                      <div className='text-center py-6'>
                        Buscando usuarios...
                      </div>
                    ) : searchError ? (
                      <div className='text-center py-6'>
                        <span className='material-symbols-outlined text-outline-variant text-3xl mb-2 block'>
                          error
                        </span>
                        <p className='text-sm text-on-surface-variant'>
                          {searchError}
                        </p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((patient) => (
                        <button
                          key={patient.id}
                          type='button'
                          onClick={() => handleSelectExistingPatient(patient)}
                          className='w-full text-left rounded-xl border border-outline-variant/30 p-4 hover:bg-primary/5 hover:border-primary/40 transition-all group shadow-sm hover:shadow-md'
                        >
                          <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                              <span className='material-symbols-outlined text-primary text-lg'>
                                person
                              </span>
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate'>
                                {patient.name}
                              </p>
                              <div className='flex flex-wrap items-center gap-2 mt-2'>
                                {patient.role && (
                                  <span className='text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1'>
                                    <span className='material-symbols-outlined text-sm'>
                                      badge
                                    </span>
                                    {patient.role}
                                  </span>
                                )}
                                {patient.sexo && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                      patient.sexo === 'Masculino'
                                        ? 'bg-blue-100 text-blue-800'
                                        : patient.sexo === 'Femenino'
                                          ? 'bg-pink-100 text-pink-800'
                                          : 'bg-surface-container-low text-on-surface-variant'
                                    }`}
                                  >
                                    <span className='material-symbols-outlined text-sm'>
                                      {patient.sexo === 'Masculino'
                                        ? 'male'
                                        : patient.sexo === 'Femenino'
                                          ? 'female'
                                          : 'person'}
                                    </span>
                                    {patient.sexo}
                                  </span>
                                )}
                                {patient.age && (
                                  <span className='text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full flex items-center gap-1'>
                                    <span className='material-symbols-outlined text-sm'>
                                      calendar_today
                                    </span>
                                    {patient.age} años
                                  </span>
                                )}
                                {patient.email && (
                                  <span className='text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full flex items-center gap-1 truncate max-w-48'>
                                    <span className='material-symbols-outlined text-sm'>
                                      email
                                    </span>
                                    {patient.email}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className='material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-lg'>
                              arrow_forward
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className='text-center py-6'>
                        <span className='material-symbols-outlined text-outline-variant text-3xl mb-2 block'>
                          search_off
                        </span>
                        <p className='text-sm text-on-surface-variant'>
                          No se encontró paciente con "{searchQuery}"
                        </p>
                        <p className='text-xs text-outline-variant mt-1'>
                          Verifica la ortografía o intenta con datos diferentes
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {searchQuery.trim().length === 0 && (
                  <p className='text-xs text-on-surface-variant text-center py-3'>
                    Escribe para buscar
                  </p>
                )}
              </div>

              {/* Option: Create new patient */}
              <button
                type='button'
                onClick={handleNewPatient}
                className='p-4 rounded-xl border-2 hover:bg-primary-fixed/30 transition group text-left h-56 min-h-[10rem] flex flex-col justify-center'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition'>
                    <span className='material-symbols-outlined text-primary text-lg'>
                      add_circle
                    </span>
                  </div>
                  <h3 className='font-bold text-on-surface group-hover:text-primary transition'>
                    Crear nuevo paciente
                  </h3>
                </div>
                <p className='text-xs text-on-surface-variant'>
                  Registrar un paciente nuevo en el sistema
                </p>
              </button>
            </div>
          </section>
        )}

        {/* STEPS - Only show if flow type is selected */}
        {flowType && (
          <>
            {!(flowType === 'existing' && selectedPatient) &&
              renderStepIndicator()}
            <UserRegistrationForm
              currentStep={currentStep}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              dni={dni}
              setDni={setDni}
              ageInput={ageInput}
              setAgeInput={setAgeInput}
              sex={sex}
              setSex={setSex}
              livingWith={livingWith}
              setLivingWith={setLivingWith}
              customLivingWith={customLivingWith}
              setCustomLivingWith={setCustomLivingWith}
              nationality={nationality}
              setNationality={setNationality}
              customNationality={customNationality}
              setCustomNationality={setCustomNationality}
              nationalityFilter={nationalityFilter}
              setNationalityFilter={setNationalityFilter}
              nationalityDropdownOpen={nationalityDropdownOpen}
              setNationalityDropdownOpen={setNationalityDropdownOpen}
              filteredNationalities={filteredNationalities}
              nationalityDropdownRef={nationalityDropdownRef}
              insuranceType={insuranceType}
              setInsuranceType={setInsuranceType}
              customInsuranceType={customInsuranceType}
              setCustomInsuranceType={setCustomInsuranceType}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              career={career}
              setCareer={setCareer}
              cycle={cycle}
              setCycle={setCycle}
              section={section}
              setSection={setSection}
              areaDepartment={areaDepartment}
              setAreaDepartment={setAreaDepartment}
              cargo={cargo}
              setCargo={setCargo}
            />
            {currentStep === 3 && (
              <AttentionForm
                motivoAtencion={motivoAtencion}
                setMotivoAtencion={setMotivoAtencion}
                periodo={periodo}
                setPeriodo={setPeriodo}
                areaProblematica={areaProblematica}
                setAreaProblematica={setAreaProblematica}
                customAreaProblematica={customAreaProblematica}
                setCustomAreaProblematica={setCustomAreaProblematica}
                medioContacto={medioContacto}
                setMedioContacto={setMedioContacto}
                resultado={resultado}
                setResultado={setResultado}
                observaciones={observaciones}
                setObservaciones={setObservaciones}
              />
            )}
            {/* Navigation Buttons - Only show if flow type is selected */}
            <div className='fixed bottom-0 left-0 right-0 md:left-64 bg-white/90 backdrop-blur-xl p-6 flex justify-between items-center border-t border-surface-container-high shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-50'>
              <div className='max-w-4xl'>
                {selectedPatient && (
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => setShowPatientDetailModal(true)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setShowPatientDetailModal(true)
                      }
                    }}
                    key={selectedPatient.id}
                    className='w-full text-left rounded-xl border border-outline-variant/30 p-4 bg-primary/5 hover:border-primary/40 transition-all group shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='material-symbols-outlined text-primary text-lg'>
                          person
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate'>
                          {selectedPatient.name}
                        </p>
                        <div className='flex items-center gap-2 mt-2 overflow-x-auto pb-1'>
                          {selectedPatient.role && (
                            <span className='flex-shrink-0 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1'>
                              <span className='material-symbols-outlined text-sm'>
                                badge
                              </span>
                              {selectedPatient.role}
                            </span>
                          )}
                          {selectedPatient.sexo && (
                            <span
                              className={`flex-shrink-0 text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                selectedPatient.sexo === 'Masculino'
                                  ? 'bg-blue-100 text-blue-800'
                                  : selectedPatient.sexo === 'Femenino'
                                    ? 'bg-pink-100 text-pink-800'
                                    : 'bg-surface-container-low text-on-surface-variant'
                              }`}
                            >
                              <span className='material-symbols-outlined text-sm'>
                                {selectedPatient.sexo === 'Masculino'
                                  ? 'male'
                                  : selectedPatient.sexo === 'Femenino'
                                    ? 'female'
                                    : 'person'}
                              </span>
                              {selectedPatient.sexo}
                            </span>
                          )}
                          {selectedPatient.age && (
                            <span className='flex-shrink-0 text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full flex items-center gap-1'>
                              <span className='material-symbols-outlined text-sm'>
                                calendar_today
                              </span>
                              {selectedPatient.age} años
                            </span>
                          )}
                          {selectedPatient.email && (
                            <span className='flex-shrink-0 text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full flex items-center gap-1 truncate max-w-[14rem]'>
                              <span className='material-symbols-outlined text-sm'>
                                email
                              </span>
                              {selectedPatient.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {showPatientDetailModal && selectedPatient && (
                  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden'>
                      <div className='flex items-center justify-between border-b border-surface-variant px-6 py-4'>
                        <div>
                          <h3 className='text-xl font-bold text-on-surface'>
                            Detalle del paciente
                          </h3>
                          <p className='text-sm text-on-surface-variant'>
                            {selectedPatient.name}
                          </p>
                        </div>
                        <button
                          type='button'
                          onClick={() => setShowPatientDetailModal(false)}
                          className='rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low'
                          aria-label='Cerrar detalle del paciente'
                        >
                          <span className='material-symbols-outlined'>
                            close
                          </span>
                        </button>
                      </div>
                      <div className='max-h-[80vh] overflow-y-auto px-6 py-5 space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <DetailRow
                            label='ID Usuario'
                            value={selectedPatient.id || ''}
                          />
                          <DetailRow
                            label='Nombre completo'
                            value={selectedPatient.name || ''}
                          />
                          <DetailRow
                            label='DNI'
                            value={selectedPatient.dni || ''}
                          />
                          <DetailRow
                            label='Edad'
                            value={String(selectedPatient.age || '')}
                          />
                          <DetailRow
                            label='Sexo'
                            value={
                              selectedPatient.sexo ||
                              selectedPatient.gender ||
                              ''
                            }
                          />
                          <DetailRow
                            label='Email'
                            value={selectedPatient.email || ''}
                          />
                          <DetailRow
                            label='Teléfono'
                            value={selectedPatient.celular || ''}
                          />
                          <DetailRow
                            label='Nacionalidad'
                            value={selectedPatient.nacionalidad || ''}
                          />
                          <DetailRow
                            label='Rol'
                            value={selectedPatient.role || ''}
                          />
                          <DetailRow
                            label='Carrera'
                            value={selectedPatient.carrera || ''}
                          />
                          <DetailRow
                            label='Ciclo'
                            value={selectedPatient.ciclo || ''}
                          />
                          <DetailRow
                            label='Sección'
                            value={selectedPatient.seccion || ''}
                          />
                          <DetailRow
                            label='Área / Departamento'
                            value={selectedPatient.areaDepartamento || ''}
                          />
                          <DetailRow
                            label='Cargo'
                            value={selectedPatient.cargo || ''}
                          />
                          <DetailRow
                            label='Viviendo con'
                            value={selectedPatient.viviendoCon || ''}
                          />
                          <DetailRow
                            label='Tipo de seguro'
                            value={selectedPatient.tipoSeguro || ''}
                          />
                          <DetailRow
                            label='Embarazada'
                            value={selectedPatient.isPregnant || ''}
                          />
                          <DetailRow
                            label='Discapacidad'
                            value={selectedPatient.hasDisability || ''}
                          />
                          <DetailRow
                            label='Última actualización'
                            value={
                              selectedPatient.fechaUltimaActualizacion || ''
                            }
                          />
                        </div>
                        <div className='flex justify-end'>
                          <button
                            type='button'
                            onClick={() => setShowPatientDetailModal(false)}
                            className='rounded-full bg-primary px-5 py-3 text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/80'
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className='flex gap-4'>
                <button
                  onClick={handlePrevious}
                  disabled={flowType === 'new' && currentStep === 1}
                  className='px-8 py-3 rounded-xl font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <span className='material-symbols-outlined'>
                    chevron_left
                  </span>
                  {flowType === 'existing' ? 'Cambiar' : 'Anterior'}
                </button>
                {getEffectiveStep() === totalSteps ? (
                  <button
                    onClick={async () => {
                      if (!validateRequiredFields()) return

                      setIsSaving(true)
                      try {
                        if (flowType === 'new') {
                          // Crear usuario y registrar atención en una sola consulta
                          const combinedFormData = {
                            nombreCompleto: fullName,
                            dni,
                            edad: ageInput,
                            sexo: sex,
                            sex,
                            correoElectronico: email,
                            telefono: phone,
                            nacionalidad:
                              nationality === 'Otro'
                                ? customNationality
                                : nationality,
                            rol: selectedRole,
                            carrera:
                              selectedRole === 'Estudiante' ? career : '',
                            ciclo: selectedRole === 'Estudiante' ? cycle : '',
                            seccion:
                              selectedRole === 'Estudiante' ? section : '',
                            areaDepartamento:
                              selectedRole === 'Administrativo'
                                ? areaDepartment
                                : '',
                            cargo:
                              selectedRole === 'Administrativo' ? cargo : '',
                            viviendoCon:
                              livingWith === 'Otro'
                                ? customLivingWith
                                : livingWith,
                            tipoSeguro:
                              insuranceType === 'OTRO'
                                ? customInsuranceType
                                : insuranceType,
                            isPregnant: 'No',
                            hasDisability: 'No',
                            fechaAtencion: new Date().toLocaleString('es-ES', {
                              timeZone: 'America/Lima',
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }),
                            programa:
                              selectedRole === 'Estudiante' ? career : '',
                            periodo,
                            motivoAtencion,
                            areaProblematica:
                              areaProblematica === 'Otro'
                                ? customAreaProblematica
                                : areaProblematica,
                            medioContacto,
                            resultado,
                            observaciones,
                          }
                          const result =
                            await registerAttentionComplete(combinedFormData)
                          if (!result.success) {
                            toast.error(
                              result.message ||
                                'Error registrando usuario y atención',
                            )
                            return
                          }
                          toast.success(
                            'Usuario y atención registrados correctamente',
                          )
                          navigate(`/user/${result.usuarioId}`)
                        } else {
                          // Registrar atención para paciente existente
                          const attentionFormData = {
                            usuarioId: selectedPatient?.id || '',
                            fechaAtencion: new Date().toLocaleString('es-ES', {
                              timeZone: 'America/Lima',
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }),
                            nombreCompleto: selectedPatient?.name || '',
                            dni: selectedPatient?.dni || '',
                            edad: selectedPatient?.age || '',
                            sexo: selectedPatient?.sexo || '',
                            correoElectronico: selectedPatient?.email || '',
                            telefono: selectedPatient?.celular || '',
                            programa: selectedPatient?.carrera || '',
                            ciclo: selectedPatient?.ciclo || '',
                            periodo,
                            motivoAtencion,
                            areaProblematica:
                              areaProblematica === 'Otro'
                                ? customAreaProblematica
                                : areaProblematica,
                            medioContacto,
                            resultado,
                            observaciones,
                          }
                          const result =
                            await registerAttentionOnly(attentionFormData)
                          if (!result.success) {
                            toast.error(
                              result.message || 'Error registrando atención',
                            )
                            return
                          }
                          toast.success('Atención registrada correctamente')
                          navigate(
                            `/user/${result.usuarioId || selectedPatient?.id}`,
                          )
                        }
                      } finally {
                        setIsSaving(false)
                      }
                    }}
                    disabled={isSaving}
                    className='px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSaving ? (
                      <span className='flex items-center gap-2'>
                        <span className='inline-block w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin'></span>
                        Guardando...
                      </span>
                    ) : (
                      <>
                        <span
                          className='material-symbols-outlined'
                          data-weight='fill'
                        >
                          save
                        </span>
                        Guardar registro
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className='px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2'
                  >
                    Siguiente
                    <span className='material-symbols-outlined'>
                      chevron_right
                    </span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default RegistrationForm
