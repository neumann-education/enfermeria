import {
  renderMultipleField,
  renderNumberField,
  renderTextField,
} from '../../components/survey/RenderFields'
import { DatosClinicosResponse } from './DatosClinicosResponse'

function DatosClinicosGroupedResponses({
  responses,
}: {
  responses: DatosClinicosResponse[]
}) {
  // ===== INFORMACIÓN DEL PROGRAMA =====

  const programas = responses.map((r) => r.programa).filter(Boolean)
  const ciclos = responses.map((r) => r.ciclo).filter(Boolean)
  const secciones = responses.map((r) => r.seccion).filter(Boolean)

  // ===== I) ANTECEDENTES PERSONALES =====
  // Textos
  const nombresApellidos = responses
    .map((r) => r.nombresApellidos)
    .filter(Boolean)
  const fechasNacimiento = responses
    .map((r) => r.fechaNacimiento)
    .filter(Boolean)
  const dnis = responses.map((r) => r.dni).filter(Boolean)
  const celulares = responses.map((r) => r.celular).filter(Boolean)
  const domicilios = responses.map((r) => r.domicilio).filter(Boolean)
  const nacionalidades = responses.map((r) => r.nacionalidad).filter(Boolean)

  // Números (Edad)
  const edades = responses.map((r) => (r.edad ? Number(r.edad) : null))
  // Selección múltiple
  const sexos = responses.map((r) => r.sexo)
  console.log('Sexos:', sexos)

  const tiposSeguro = responses.map((r) => r.tipoSeguro)

  // ===== II) DATOS DE CONTACTO DE EMERGENCIA =====
  // Textos
  const contactosNombres = responses
    .map((r) => r.contactoNombres)
    .filter(Boolean)
  const contactosCelular = responses
    .map((r) => r.contactoCelular)
    .filter(Boolean)

  // Selección múltiple
  const parentescos = responses.map((r) => r.parentesco)

  // ===== III) ANTECEDENTES CLÍNICOS =====
  // Selección múltiple (booleanos)
  const padeceEnfermedad = responses.map((r) => r.padeceEnfermedad)
  const discapacidad = responses.map((r) => r.discapacidad)
  const carnetConadis = responses.map((r) => r.carnetConadis)
  const tratamientoMedico = responses.map((r) => r.tratamientoMedico)
  const alergico = responses.map((r) => r.alergico)
  const vacunaCovid = responses.map((r) => r.vacunaCovid)
  const embarazada = responses.map((r) => r.embarazada)

  // Textos (condicionales)
  const enfermedadesNombres = responses
    .filter((r) => r.padeceEnfermedad === true)
    .map((r) => r.enfermedadNombre)
    .filter(Boolean)

  const discapacidadesNombres = responses
    .filter((r) => r.discapacidad === true)
    .map((r) => r.discapacidadNombre)
    .filter(Boolean)

  const tratamientosNombres = responses
    .filter((r) => r.tratamientoMedico === true)
    .map((r) => r.tratamientoNombre)
    .filter(Boolean)

  const alergiasNombres = responses
    .filter((r) => r.alergico === true)
    .map((r) => r.alergicoNombre)
    .filter(Boolean)

  // Números (dosis)
  const dosisCovid = responses
    .filter((r) => r.vacunaCovid === true)
    .map((r) => (r.dosisCovid ? Number(r.dosisCovid) : null))

  // Textos (embarazo)
  const semanasGestacion = responses
    .filter((r) => r.embarazada === true)
    .map((r) => r.semanasGestacion)
    .filter(Boolean)

  const fpps = responses
    .filter((r) => r.embarazada === true)
    .map((r) => r.fpp)
    .filter(Boolean)

  return (
    <div>
      {/* ===== INFORMACIÓN DEL PROGRAMA ===== */}
      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        Información del Programa
      </h1>
      <div className='space-y-6'>
        {renderTextField('Programa', programas)}
        {renderMultipleField('Ciclo', ciclos)}
        {renderMultipleField('Sección', secciones)}
      </div>

      {/* ===== I) ANTECEDENTES PERSONALES ===== */}
      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        I) Antecedentes Personales
      </h1>
      <div className='space-y-6'>
        {renderTextField('Nombres y Apellidos', nombresApellidos)}
        {renderTextField('Fecha de Nacimiento', fechasNacimiento)}
        {renderNumberField('Edad', edades)}
        {renderMultipleField('Sexo', sexos, 'sexo')}
        {renderTextField('DNI', dnis)}
        {renderTextField('Celular', celulares)}
        {renderTextField('Domicilio', domicilios)}
        {renderTextField('Nacionalidad', nacionalidades)}
        {renderMultipleField('Tipo de Seguro', tiposSeguro)}
      </div>

      {/* ===== II) DATOS DE CONTACTO DE EMERGENCIA ===== */}
      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        II) Datos de Contacto de Emergencia
      </h1>
      <div className='space-y-6'>
        {renderTextField('Contacto - Nombres y Apellidos', contactosNombres)}
        {renderTextField('Contacto - Celular', contactosCelular)}
        {renderMultipleField('Parentesco', parentescos)}
      </div>

      {/* ===== III) ANTECEDENTES CLÍNICOS ===== */}
      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        III) Antecedentes Clínicos
      </h1>
      <div className='space-y-6'>
        {renderMultipleField('¿Padeces alguna enfermedad?', padeceEnfermedad)}
        {enfermedadesNombres.length > 0 &&
          renderTextField('Nombre de la enfermedad', enfermedadesNombres)}

        {renderMultipleField(
          '¿Tienes algún tipo de discapacidad?',
          discapacidad,
        )}
        {discapacidadesNombres.length > 0 &&
          renderTextField('Nombre de la discapacidad', discapacidadesNombres)}

        {renderMultipleField('¿Cuentas con carnet CONADIS?', carnetConadis)}

        {renderMultipleField('¿Sigues tratamiento médico?', tratamientoMedico)}
        {tratamientosNombres.length > 0 &&
          renderTextField('Nombre del tratamiento', tratamientosNombres)}

        {renderMultipleField(
          '¿Eres alérgico a algún medicamento u otra sustancia?',
          alergico,
        )}
        {alergiasNombres.length > 0 &&
          renderTextField('Nombre de la alergia', alergiasNombres)}

        {renderMultipleField(
          '¿Has recibido vacuna contra la COVID-19?',
          vacunaCovid,
        )}
        {dosisCovid.length > 0 &&
          renderNumberField('Número de dosis COVID-19', dosisCovid)}

        {renderMultipleField('¿Te encuentras embarazada?', embarazada)}

        {semanasGestacion.length > 0 &&
          renderTextField('Semanas de gestación', semanasGestacion)}

        {fpps.length > 0 &&
          renderTextField('Fecha probable de parto (FPP)', fpps)}
      </div>
    </div>
  )
}

export default DatosClinicosGroupedResponses
