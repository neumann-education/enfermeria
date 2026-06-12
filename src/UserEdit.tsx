import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Layout from './Layout'
import UserRegistrationForm from './UserRegistrationForm'
import { consultaService } from './services/consultaService'
import { useAppData } from './AppDataContext'
import toast from 'react-hot-toast'
import { normalizeSexCode } from './utils/sex'

type NationalityOption = {
  name: string
  iso2: string | null
}

const nationalities: NationalityOption[] = [
  { name: 'Aleman', iso2: 'DE' },
  { name: 'Argentino', iso2: 'AR' },
  { name: 'Beliceno', iso2: 'BZ' },
  { name: 'Boliviano', iso2: 'BO' },
  { name: 'Brasileno', iso2: 'BR' },
  { name: 'Britanico', iso2: 'GB' },
  { name: 'Canadiense', iso2: 'CA' },
  { name: 'Chileno', iso2: 'CL' },
  { name: 'Colombiano', iso2: 'CO' },
  { name: 'Costarricense', iso2: 'CR' },
  { name: 'Cubano', iso2: 'CU' },
  { name: 'Dominicano', iso2: 'DO' },
  { name: 'Ecuatoriano', iso2: 'EC' },
  { name: 'Espanol', iso2: 'ES' },
  { name: 'Estadounidense', iso2: 'US' },
  { name: 'Frances', iso2: 'FR' },
  { name: 'Guatemalteco', iso2: 'GT' },
  { name: 'Hondureno', iso2: 'HN' },
  { name: 'Italiano', iso2: 'IT' },
  { name: 'Mexicano', iso2: 'MX' },
  { name: 'Nicaraguense', iso2: 'NI' },
  { name: 'Panameno', iso2: 'PA' },
  { name: 'Paraguayo', iso2: 'PY' },
  { name: 'Peruano', iso2: 'PE' },
  { name: 'Puertorriqueno', iso2: 'PR' },
  { name: 'Salvadoreno', iso2: 'SV' },
  { name: 'Uruguayo', iso2: 'UY' },
  { name: 'Venezolano', iso2: 'VE' },
  { name: 'Otro', iso2: null },
]

const LIVING_WITH_OPTIONS = [
  'Padres',
  'Solo',
  'Companeros de cuarto',
  'Pareja',
  'Otro',
]

const INSURANCE_OPTIONS = ['SIS', 'ESSALUD', 'FFAA', 'OTRO', 'NINGUNO']

function UserEdit() {
  const { id } = useParams<{ id: string }>()
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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
  const [section, setSection] = useState('')
  const [areaDepartment, setAreaDepartment] = useState('')
  const [cargo, setCargo] = useState('')
  const [nationality, setNationality] = useState('')
  const [customNationality, setCustomNationality] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false)
  const [insuranceType, setInsuranceType] = useState('')
  const [customInsuranceType, setCustomInsuranceType] = useState('')
  const [selectedRole, setSelectedRole] = useState('Estudiante')

  const navigate = useNavigate()
  const nationalityDropdownRef = useRef<HTMLDivElement>(null)
  const { refreshUsers } = useAppData()

  const filteredNationalities = nationalities.filter((nat) =>
    nat.name.toLowerCase().includes(nationalityFilter.toLowerCase()),
  )

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
    const loadUser = async () => {
      if (!id) {
        toast.error('No se encontro el usuario')
        navigate('/user-patients')
        return
      }

      setIsLoadingUser(true)
      try {
        const userData = await consultaService.getUserById(id)
        if (!userData) {
          toast.error('Usuario no encontrado')
          navigate('/user-patients')
          return
        }

        const currentNationality = String(userData.nacionalidad || '')
        const knownNationality = nationalities.some(
          (item) => item.name === currentNationality,
        )

        const currentLivingWith = String(userData.viviendoCon || '')
        const knownLivingWith = LIVING_WITH_OPTIONS.includes(currentLivingWith)

        const currentInsurance = String(userData.tipoSeguro || '')
        const knownInsurance = INSURANCE_OPTIONS.includes(currentInsurance)

        setFullName(String(userData.nombreCompleto || ''))
        setEmail(String(userData.correoElectronico || userData.email || ''))
        setPhone(String(userData.telefono || userData.celular || ''))
        setDni(String(userData.dni || ''))
        setAgeInput(String(userData.edad || ''))
        setSex(normalizeSexCode(userData.sexo || ''))

        setLivingWith(
          knownLivingWith ? currentLivingWith : currentLivingWith ? 'Otro' : '',
        )
        setCustomLivingWith(knownLivingWith ? '' : currentLivingWith)

        setNationality(
          knownNationality
            ? currentNationality
            : currentNationality
              ? 'Otro'
              : '',
        )
        setCustomNationality(knownNationality ? '' : currentNationality)

        setInsuranceType(
          knownInsurance ? currentInsurance : currentInsurance ? 'OTRO' : '',
        )
        setCustomInsuranceType(knownInsurance ? '' : currentInsurance)

        const role = String(userData.rol || '')
          .toLowerCase()
          .includes('administr')
          ? 'Administrativo'
          : 'Estudiante'

        setSelectedRole(role)
        setCareer(String(userData.carrera || userData.programa || ''))
        setCycle(String(userData.ciclo || ''))
        setSection(String(userData.seccion || ''))
        setAreaDepartment(String(userData.areaDepartamento || ''))
        setCargo(String(userData.cargo || ''))
      } catch (error) {
        console.error(error)
        toast.error('No se pudo cargar el usuario para edicion')
        navigate('/user-patients')
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadUser()
  }, [id, navigate])

  const validateRequiredFields = () => {
    const missingFields = []
    if (!dni.trim()) missingFields.push('DNI')
    if (!fullName.trim()) missingFields.push('Nombre completo')
    if (!ageInput.trim()) missingFields.push('Edad')
    if (!sex.trim() || sex === 'Seleccionar...') missingFields.push('Sexo')
    if (!email.trim()) missingFields.push('Email')
    if (!phone.trim()) missingFields.push('Telefono')
    return missingFields
  }

  const handleUpdateUser = async () => {
    if (!id) {
      toast.error('No se encontro el usuario')
      return
    }

    const missingFields = validateRequiredFields()
    if (missingFields.length > 0) {
      toast.error(`Complete los siguientes campos: ${missingFields.join(', ')}`)
      return
    }

    const formData = {
      usuarioId: id,
      nombreCompleto: fullName,
      dni,
      edad: ageInput,
      sexo: sex,
      correoElectronico: email,
      email,
      telefono: phone,
      nacionalidad: nationality === 'Otro' ? customNationality : nationality,
      rol: selectedRole,
      programa: selectedRole === 'Estudiante' ? career : '',
      carrera: selectedRole === 'Estudiante' ? career : '',
      ciclo: selectedRole === 'Estudiante' ? cycle : '',
      seccion: selectedRole === 'Estudiante' ? section : '',
      areaDepartamento: selectedRole === 'Administrativo' ? areaDepartment : '',
      cargo: selectedRole === 'Administrativo' ? cargo : '',
      viviendoCon: livingWith === 'Otro' ? customLivingWith : livingWith,
      tipoSeguro:
        insuranceType === 'OTRO' ? customInsuranceType : insuranceType,
    }

    setIsSaving(true)
    try {
      await consultaService.updateUsuario(formData)
      await refreshUsers()
      toast.success('Usuario actualizado correctamente')
      navigate(`/user/${id}`)
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar el usuario')
    } finally {
      setIsSaving(false)
    }
  }

  const steps = [
    { number: 1, title: 'Identificacion personal' },
    { number: 2, title: 'Rol institucional' },
  ]

  const renderStepIndicator = () => (
    <div className='mb-8'>
      <div className='flex items-center justify-between mb-2'>
        {steps.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
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
                  className={`text-xs text-center mt-1 max-w-16 ${
                    isActive
                      ? 'font-semibold text-primary'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
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

  if (isLoadingUser) {
    return (
      <Layout activeView='user-patients' title='Editar usuario'>
        <div className='rounded-xl border border-outline-variant/20 bg-white p-6'>
          <div className='h-6 w-56 animate-pulse rounded-full bg-surface-variant' />
          <div className='mt-4 h-10 w-full animate-pulse rounded-xl bg-surface-variant' />
          <div className='mt-2 h-10 w-full animate-pulse rounded-xl bg-surface-variant' />
        </div>
      </Layout>
    )
  }

  return (
    <Layout activeView='user-patients' title='Editar usuario'>
      {renderStepIndicator()}
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

      <div className='mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-end'>
        <button
          type='button'
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className='w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Anterior
        </button>
        {currentStep < steps.length ? (
          <button
            type='button'
            onClick={() =>
              setCurrentStep((prev) => Math.min(steps.length, prev + 1))
            }
            className='w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition'
          >
            Siguiente
          </button>
        ) : (
          <button
            type='button'
            onClick={handleUpdateUser}
            disabled={isSaving}
            className='w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSaving ? 'Guardando...' : 'Actualizar usuario'}
          </button>
        )}
      </div>
    </Layout>
  )
}

export default UserEdit
