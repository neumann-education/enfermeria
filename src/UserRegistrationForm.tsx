import { Dispatch, RefObject, SetStateAction } from 'react'

type NationalityOption = {
  name: string
  iso2: string | null
}

type UserRegistrationFormProps = {
  currentStep: number
  fullName: string
  setFullName: Dispatch<SetStateAction<string>>
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  phone: string
  setPhone: Dispatch<SetStateAction<string>>
  dni: string
  setDni: Dispatch<SetStateAction<string>>
  ageInput: string
  setAgeInput: Dispatch<SetStateAction<string>>
  sex: string
  setSex: Dispatch<SetStateAction<string>>
  livingWith: string
  setLivingWith: Dispatch<SetStateAction<string>>
  customLivingWith: string
  setCustomLivingWith: Dispatch<SetStateAction<string>>
  nationality: string
  setNationality: Dispatch<SetStateAction<string>>
  customNationality: string
  setCustomNationality: Dispatch<SetStateAction<string>>
  nationalityFilter: string
  setNationalityFilter: Dispatch<SetStateAction<string>>
  nationalityDropdownOpen: boolean
  setNationalityDropdownOpen: Dispatch<SetStateAction<boolean>>
  filteredNationalities: NationalityOption[]
  nationalityDropdownRef: RefObject<HTMLDivElement | null>
  insuranceType: string
  setInsuranceType: Dispatch<SetStateAction<string>>
  customInsuranceType: string
  setCustomInsuranceType: Dispatch<SetStateAction<string>>
  selectedRole: string
  setSelectedRole: Dispatch<SetStateAction<string>>
  career: string
  setCareer: Dispatch<SetStateAction<string>>
  cycle: string
  setCycle: Dispatch<SetStateAction<string>>
  section: string
  setSection: Dispatch<SetStateAction<string>>
  areaDepartment: string
  setAreaDepartment: Dispatch<SetStateAction<string>>
  cargo: string
  setCargo: Dispatch<SetStateAction<string>>
}

function UserRegistrationForm({
  currentStep,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  dni,
  setDni,
  ageInput,
  setAgeInput,
  sex,
  setSex,
  livingWith,
  setLivingWith,
  customLivingWith,
  setCustomLivingWith,
  nationality,
  setNationality,
  customNationality,
  setCustomNationality,
  nationalityFilter,
  setNationalityFilter,
  nationalityDropdownOpen,
  setNationalityDropdownOpen,
  filteredNationalities,
  nationalityDropdownRef,
  insuranceType,
  setInsuranceType,
  customInsuranceType,
  setCustomInsuranceType,
  selectedRole,
  setSelectedRole,
  career,
  setCareer,
  cycle,
  setCycle,
  section,
  setSection,
  areaDepartment,
  setAreaDepartment,
  cargo,
  setCargo,
}: UserRegistrationFormProps) {
  return (
    <>
      {currentStep === 1 && (
        <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6 space-y-6 animate-fadeIn'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-md'>
              1
            </div>
            <h2 className='text-2xl font-extrabold tracking-tight text-primary'>
              Identificación personal
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Nombre completo <span className='text-red-500'>*</span>
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                placeholder='Juan Pérez'
                type='text'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Correo electrónico <span className='text-red-500'>*</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                placeholder='juan.perez@universidad.edu'
                type='email'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                DNI <span className='text-red-500'>*</span>
              </label>
              <input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                placeholder='12345678'
                type='text'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Número de teléfono <span className='text-red-500'>*</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                placeholder='+57 (300) 000-0000'
                type='tel'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                  Edad <span className='text-red-500'>*</span>
                </label>
                <input
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                  placeholder='25'
                  type='number'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                  Sexo <span className='text-red-500'>*</span>
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
                >
                  <option>Seleccionar...</option>
                  <option value='M'>Masculino</option>
                  <option value='F'>Femenino</option>
                </select>
              </div>
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Viviendo con
              </label>
              <select
                value={livingWith}
                onChange={(e) => setLivingWith(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
              >
                <option>Seleccionar...</option>
                <option>Padres</option>
                <option>Solo</option>
                <option>Compañeros de cuarto</option>
                <option>Pareja</option>
                <option>Otro</option>
              </select>
              {livingWith === 'Otro' && (
                <input
                  value={customLivingWith}
                  onChange={(e) => setCustomLivingWith(e.target.value)}
                  className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                  placeholder='Especifique con quién vive'
                  type='text'
                />
              )}
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Nacionalidad
              </label>
              <div className='relative' ref={nationalityDropdownRef}>
                <button
                  type='button'
                  onClick={() => {
                    setNationalityDropdownOpen(!nationalityDropdownOpen)
                    setNationalityFilter('')
                  }}
                  className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface text-left flex items-center justify-between'
                >
                  <span>{nationality || 'Seleccionar...'}</span>
                  <span className='material-symbols-outlined text-sm'>
                    {nationalityDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {nationalityDropdownOpen && (
                  <div className='absolute z-10 w-full bottom-full bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-lg max-h-56 overflow-y-auto'>
                    <div className='p-2'>
                      <input
                        type='text'
                        value={nationalityFilter}
                        onChange={(e) => setNationalityFilter(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter' &&
                            filteredNationalities.length > 0
                          ) {
                            const sel = filteredNationalities[0]
                            setNationality(sel.name)
                            setNationalityDropdownOpen(false)
                            setNationalityFilter('')
                            e.preventDefault()
                          }
                        }}
                        placeholder='Buscar nacionalidad (ej: P)'
                        className='w-full px-3 py-2 rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 bg-white text-sm'
                      />
                    </div>
                    <div className='divide-y divide-outline-variant/30'>
                      {filteredNationalities.length > 0 ? (
                        filteredNationalities.map((nat) => (
                          <button
                            key={nat.name}
                            type='button'
                            onClick={() => {
                              setNationality(nat.name)
                              setNationalityDropdownOpen(false)
                              setNationalityFilter('')
                            }}
                            className='w-full px-4 py-2 text-left hover:bg-primary/10 transition-colors flex items-center gap-2'
                          >
                            {nat.iso2 ? (
                              <img
                                src={`https://flagcdn.com/16x12/${nat.iso2.toLowerCase()}.png`}
                                alt={`${nat.name} flag`}
                                className='w-4 h-3'
                              />
                            ) : (
                              <span>🌍</span>
                            )}
                            <span>{nat.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className='p-4 text-center text-xs text-on-surface-variant'>
                          No se encontró ninguna nacionalidad.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {nationality === 'Otro' && (
                <input
                  value={customNationality}
                  onChange={(e) => setCustomNationality(e.target.value)}
                  className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                  placeholder='Especifique su nacionalidad'
                  type='text'
                />
              )}
            </div>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                Tipo de seguro
              </label>
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value)}
                className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
              >
                <option>Seleccionar...</option>
                <option>SIS</option>
                <option>ESSALUD</option>
                <option>FFAA</option>
                <option>OTRO</option>
                <option>NINGUNO</option>
              </select>
              {insuranceType === 'OTRO' && (
                <input
                  value={customInsuranceType}
                  onChange={(e) => setCustomInsuranceType(e.target.value)}
                  className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                  placeholder='Especifique el tipo de seguro'
                  type='text'
                />
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className='bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-sm p-6 space-y-6 animate-fadeIn'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-md'>
              2
            </div>
            <h2 className='text-2xl font-extrabold tracking-tight text-primary'>
              Rol institucional
            </h2>
          </div>

          <div className='bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm space-y-8'>
            <div className='flex flex-wrap gap-4'>
              <label className='flex-1 cursor-pointer group'>
                <input
                  checked={selectedRole === 'Estudiante'}
                  onChange={() => setSelectedRole('Estudiante')}
                  className='hidden peer'
                  name='role'
                  type='radio'
                />
                <div className='p-4 rounded-xl border-2 border-transparent bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary-fixed/30 transition-all flex items-center gap-3'>
                  <span className='material-symbols-outlined text-primary'>
                    school
                  </span>
                  <div className='flex flex-col'>
                    <span className='font-bold text-sm'>Estudiante</span>
                  </div>
                </div>
              </label>
              <label className='flex-1 cursor-pointer group'>
                <input
                  checked={selectedRole === 'Administrativo'}
                  onChange={() => setSelectedRole('Administrativo')}
                  className='hidden peer'
                  name='role'
                  type='radio'
                />
                <div className='p-4 rounded-xl border-2 border-transparent bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary-fixed/30 transition-all flex items-center gap-3'>
                  <span className='material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors'>
                    badge
                  </span>
                  <div className='flex flex-col'>
                    <span className='font-bold text-sm'>Administrativo</span>
                  </div>
                </div>
              </label>
            </div>

            {selectedRole === 'Estudiante' && (
              <div className='space-y-4'>
                <h3 className='text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-1 h-4 bg-primary rounded-full'></span>
                  Detalles del estudiante
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                      Carrera
                    </label>
                    <select
                      value={career}
                      onChange={(e) => setCareer(e.target.value)}
                      className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
                    >
                      <option>Seleccionar...</option>
                      <option>
                        Administración de Negocios Internacionales
                      </option>
                      <option>Contabilidad</option>
                    </select>
                  </div>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                      Ciclo académico
                    </label>
                    <select
                      value={cycle}
                      onChange={(e) => setCycle(e.target.value)}
                      className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
                    >
                      <option>Seleccionar...</option>
                      <option>Primer Ciclo</option>
                      <option>Segundo Ciclo</option>
                      <option>Tercer Ciclo</option>
                      <option>Cuarto Ciclo</option>
                      <option>Quinto Ciclo</option>
                      <option>Sexto Ciclo</option>
                    </select>
                  </div>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                      Sección
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none'
                    >
                      <option>Seleccionar...</option>
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                      <option>D</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'Administrativo' && (
              <div className='space-y-4 pt-4 border-t border-surface-container-high'>
                <h3 className='text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-1 h-4 bg-primary rounded-full'></span>
                  Detalles administrativos
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                      Área / Departamento
                    </label>
                    <input
                      value={areaDepartment}
                      onChange={(e) => setAreaDepartment(e.target.value)}
                      className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                      placeholder='ej. Recursos Humanos'
                      type='text'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-on-surface-variant ml-1'>
                      Cargo
                    </label>
                    <input
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className='w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant'
                      placeholder='ej. Coordinador'
                      type='text'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default UserRegistrationForm
