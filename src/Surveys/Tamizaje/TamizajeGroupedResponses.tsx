import {
  renderMultipleField,
  renderNumberField,
  renderTextField,
} from '../../components/survey/RenderFields'

function TamizajeGroupedResponses({ responses }: { responses: any[] }) {
  const programas = responses.map((r) => r.programa).filter(Boolean)
  const ciclos = responses.map((r) => r.ciclo).filter(Boolean)
  const secciones = responses.map((r) => r.seccion).filter(Boolean)

  const nombres = responses.map((r) => r.nombresApellidos).filter(Boolean)
  const edades = responses.map((r) => (r.edad ? Number(r.edad) : null))
  const sexos = responses.map((r) => r.sexo)
  const dnis = responses.map((r) => r.dni).filter(Boolean)

  const pesos = responses.map((r) =>
    r.pesoActual ? Number(r.pesoActual) : null,
  )
  const estaturas = responses.map((r) =>
    r.estaturaActual ? Number(r.estaturaActual) : null,
  )

  const actividad = responses.map((r) => r.actividadFisica)
  const frecuencia = responses.map((r) => r.frecuenciaActividad).filter(Boolean)
  const comidas = responses.map((r) => r.comidasPorDia).filter(Boolean)
  const consumo = responses.map((r) => r.consumoFrutasVerduras).filter(Boolean)

  const alergias = responses.map((r) => r.alergiaIntolerancia).filter(Boolean)
  const funcionVegetales = responses
    .map((r) => r.funcionVegetales)
    .filter(Boolean)
  const platos1 = responses.map((r) => r.platoFavorito1).filter(Boolean)
  const platos2 = responses.map((r) => r.platoFavorito2).filter(Boolean)

  return (
    <div>
      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        Información del Programa
      </h1>
      <div className='space-y-6'>
        {renderTextField('Programa actual', programas)}
        {renderMultipleField('Ciclo', ciclos)}
        {renderMultipleField('Sección', secciones)}
      </div>

      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        Datos personales
      </h1>
      <div className='space-y-6'>
        {renderTextField('Nombres y Apellidos', nombres)}
        {renderNumberField('Edad', edades)}
        {renderMultipleField('Sexo', sexos, 'sexo')}
        {renderTextField('DNI', dnis)}
      </div>

      <h1 className='text-2xl font-bold text-on-surface mt-8 mb-6 pb-2 border-b border-outline-variant/20'>
        Evaluación nutricional
      </h1>
      <div className='space-y-6'>
        {renderNumberField('¿Cuál es tu peso actual?', pesos)}
        {renderNumberField('¿Cuál es tu estatura actual? (cm)', estaturas)}
        {renderMultipleField(
          'Realiza usted alguna actividad física?',
          actividad,
        )}
        {renderMultipleField(
          '¿Con qué frecuencia realiza actividad física?',
          frecuencia,
        )}
        {renderMultipleField('¿Cuántas comidas consumes al día?', comidas)}
        {renderMultipleField(
          '¿Qué proporción de frutas y verduras consumes?',
          consumo,
        )}
        {renderTextField(
          '¿Tienes alguna alergia o intolerancia alimentaria?',
          alergias,
        )}
        {renderMultipleField(
          '¿Cuál crees que es la función del consumo de los vegetales?',
          funcionVegetales,
        )}
        {renderTextField('Plato favorito 1', platos1)}
        {renderTextField('Plato favorito 2', platos2)}
      </div>
    </div>
  )
}

export default TamizajeGroupedResponses
