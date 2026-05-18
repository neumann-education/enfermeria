import {
  renderMultipleField,
  renderNumberField,
  renderTextField,
} from '../../components/survey/RenderFields'

function SatisfaccionGroupedResponses({ responses }: { responses: any[] }) {
  const carreras = responses.map((r) => r.carreraProfesional).filter(Boolean)
  const ciclos = responses.map((r) => r.ciclo).filter(Boolean)
  const secciones = responses.map((r) => r.seccion).filter(Boolean)

  // Respuestas principales
  const nombres = responses.map((r) => r.nombresApellidos).filter(Boolean)
  const infoCharla = responses.map((r) => r.infoCharla).filter(Boolean)
  const servicio = responses.map((r) => r.servicioEnfermeria).filter(Boolean)
  const temas = responses.map((r) => r.proximoTema).filter(Boolean)
  const recomendaciones = responses.map((r) =>
    r.recomendacion ? Number(r.recomendacion) : null,
  )

  return (
    <div>
      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        DATOS PERSONALES
      </h1>
      <div className='space-y-6'>
        {renderTextField('Nombres y Apellidos', nombres)}
        {renderMultipleField('Carrera profesional', carreras)}
        {renderMultipleField('Ciclo', ciclos)}
        {renderMultipleField('Sección', secciones)}
      </div>

      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        SATISFACCIÓN
      </h1>
      <div className='space-y-6'>
        {renderTextField('Nombres y Apellidos', nombres)}
        {renderMultipleField(
          '¿Qué tan satisfecho te encuentras con la información brindada en la charla?',
          infoCharla,
        )}
        {renderMultipleField(
          '¿Qué tan satisfecho/a te encuentras con el servicio de enfermería?',
          servicio,
        )}
        {renderTextField(
          '¿Cuál te gustaría que sea el próximo tema a tratar por el área de enfermería?',
          temas,
        )}
        {renderNumberField(
          '¿Qué tanto recomendarías el área de enfermería con tus compañeros? (1-10)',
          recomendaciones,
        )}
      </div>
    </div>
  )
}

export default SatisfaccionGroupedResponses
