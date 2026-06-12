import { useEffect, useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import { SatisfaccionResponse } from './SurveyDetailSatisfaccion'

function ResultadosSatisfaccion({
  responses,
}: {
  responses: SatisfaccionResponse[]
}) {
  const scoreMap: Record<string, number> = {
    'MUY INSATISFECHO': -2,
    INSATISFECHO: -1,
    'NI SATISFECHO': 0,
    SATISFECHO: 1,
    'MUY SATISFECHO': 2,
  }

  const calculateAverage = (values: Array<string | undefined>) => {
    const scoredValues = values
      .map(
        (value) =>
          scoreMap[
            String(value || '')
              .trim()
              .toUpperCase()
          ],
      )
      .filter((value): value is number => typeof value === 'number')

    if (scoredValues.length === 0) {
      return new Decimal(0)
    }

    const total = scoredValues.reduce<Decimal>(
      (sum, value) => sum.add(value),
      new Decimal(0),
    )
    return total.div(scoredValues.length)
  }

  const charlaAverage = calculateAverage(
    responses.map((response) => response.infoCharla),
  )
  const servicioAverage = calculateAverage(
    responses.map((response) => response.servicioEnfermeria),
  )
  const satisfactionToPercentage = (average: Decimal) =>
    average.add(2).div(4).mul(100)
  const formatPercentage = (value: Decimal | number) =>
    `${new Decimal(value).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1)}%`

  const formatWidthPercentage = (value: Decimal | number) =>
    `${new Decimal(value).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1)}%`

  const charlaPercentage = satisfactionToPercentage(charlaAverage)
  const servicioPercentage = satisfactionToPercentage(servicioAverage)

  const recommendationCounts = useMemo(() => {
    const counts = Array.from({ length: 11 }, () => 0)

    responses.forEach((response) => {
      const value = Number(response.recomendacion)
      if (Number.isInteger(value) && value >= 0 && value <= 10) {
        counts[value] += 1
      }
    })

    return counts
  }, [responses])

  const recommendationTotal = recommendationCounts.reduce<Decimal>(
    (sum, count) => sum.add(count),
    new Decimal(0),
  )

  const promoterCount = recommendationCounts[9] + recommendationCounts[10]
  const detractorCount =
    recommendationCounts[0] +
    recommendationCounts[1] +
    recommendationCounts[2] +
    recommendationCounts[3] +
    recommendationCounts[4] +
    recommendationCounts[5] +
    recommendationCounts[6]
  const recommendationPercentageValue = recommendationTotal.equals(0)
    ? new Decimal(0)
    : new Decimal(promoterCount)
        .sub(detractorCount)
        .div(recommendationTotal)
        .mul(100)

  const generalPercentage = charlaPercentage.add(servicioPercentage).div(2)

  const recommendationPercentage = (count: number) => {
    if (recommendationTotal.equals(0)) {
      return '0%'
    }

    return `${new Decimal(count)
      .div(recommendationTotal)
      .mul(100)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toFixed(0)}%`
  }

  const recommendationBarWidth = (count: number) => {
    if (recommendationTotal.equals(0)) {
      return '0%'
    }

    return `${new Decimal(count)
      .div(recommendationTotal)
      .mul(100)
      .toDecimalPlaces(1, Decimal.ROUND_HALF_UP)
      .toFixed(1)}%`
  }

  const suggestedTopics = useMemo(() => {
    const counts = new Map<string, number>()

    responses.forEach((response) => {
      const topic = String(response.proximoTema || '').trim()
      if (!topic) {
        return
      }

      counts.set(topic, (counts.get(topic) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([topic, votes]) => ({ topic, votes }))
      .sort(
        (left, right) =>
          right.votes - left.votes || left.topic.localeCompare(right.topic),
      )
  }, [responses])

  const [charlaResponses, setCharlaResponses] = useState<{
    veryDissatisfied: number
    dissatisfied: number
    neutral: number
    satisfied: number
    verySatisfied: number
  }>({
    veryDissatisfied: 0,
    dissatisfied: 0,
    neutral: 0,
    satisfied: 0,
    verySatisfied: 0,
  })

  const [servicioResponses, setServicioResponses] = useState<{
    veryDissatisfied: number
    dissatisfied: number
    neutral: number
    satisfied: number
    verySatisfied: number
  }>({
    veryDissatisfied: 0,
    dissatisfied: 0,
    neutral: 0,
    satisfied: 0,
    verySatisfied: 0,
  })

  useEffect(() => {
    const charlaData = {
      veryDissatisfied: 0,
      dissatisfied: 0,
      neutral: 0,
      satisfied: 0,
      verySatisfied: 0,
    }

    const servicioData = {
      veryDissatisfied: 0,
      dissatisfied: 0,
      neutral: 0,
      satisfied: 0,
      verySatisfied: 0,
    }

    responses.forEach((response) => {
      if (response.infoCharla) {
        switch (response.infoCharla) {
          case 'MUY INSATISFECHO':
            charlaData.veryDissatisfied++
            break
          case 'INSATISFECHO':
            charlaData.dissatisfied++
            break
          case 'NI SATISFECHO':
            charlaData.neutral++
            break
          case 'SATISFECHO':
            charlaData.satisfied++
            break
          case 'MUY SATISFECHO':
            charlaData.verySatisfied++
            break
        }
      }

      if (response.servicioEnfermeria) {
        switch (response.servicioEnfermeria) {
          case 'MUY INSATISFECHO':
            servicioData.veryDissatisfied++
            break
          case 'INSATISFECHO':
            servicioData.dissatisfied++
            break
          case 'NI SATISFECHO':
            servicioData.neutral++
            break
          case 'SATISFECHO':
            servicioData.satisfied++
            break
          case 'MUY SATISFECHO':
            servicioData.verySatisfied++
            break
        }
      }
    })

    setCharlaResponses(charlaData)
    setServicioResponses(servicioData)
  }, [responses])

  return (
    <div className='max-w-7xl mx-auto space-y-4 pb-6'>
      <section className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 md:col-span-6 lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-center relative overflow-hidden'>
          <div className='absolute -right-10 -top-10 w-40 h-40 bg-primary-container/10 rounded-full blur-2xl'></div>
          <div className='flex justify-between items-start mb-4 relative z-10'>
            <div>
              <h3 className='text-sm font-bold text-on-surface-variant font-headline uppercase tracking-wide'>
                Porcentaje General
              </h3>
              <p className='text-xs text-on-surface-variant mt-1'>
                Satisfacción global de la sesión
              </p>
            </div>
            <span className='material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded-lg'>
              speed
            </span>
          </div>
          <div className='flex items-end gap-4 mt-2 relative z-10'>
            <span className='text-6xl font-extrabold text-primary font-headline tracking-tighter'>
              {formatPercentage(generalPercentage)}
            </span>
          </div>
          <div className='w-full h-3 bg-surface-container-high rounded-full mt-6 overflow-hidden'>
            <div
              className='h-full bg-primary rounded-full relative'
              style={{ width: formatWidthPercentage(generalPercentage) }}
            >
              <div
                className='absolute inset-0 bg-white/20 w-full'
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 2s infinite',
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className='col-span-12 md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-4'>
          <div className='bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:bg-surface-container-low transition-colors'>
            <div className='flex justify-between items-center mb-2'>
              <h4 className='text-sm font-semibold text-on-surface-variant font-body'>
                Satisfacción Charla
              </h4>
              <span className='material-symbols-outlined text-on-surface-variant text-xl'>
                record_voice_over
              </span>
            </div>
            <div className='mt-2'>
              <span className='text-3xl font-bold text-on-surface font-headline'>
                {formatPercentage(charlaPercentage)}
              </span>
            </div>
          </div>
          <div className='bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:bg-surface-container-low transition-colors'>
            <div className='flex justify-between items-center mb-2'>
              <h4 className='text-sm font-semibold text-on-surface-variant font-body'>
                Satisfacción Servicio
              </h4>
              <span className='material-symbols-outlined text-on-surface-variant text-xl'>
                support_agent
              </span>
            </div>
            <div className='mt-2'>
              <span className='text-3xl font-bold text-on-surface font-headline'>
                {formatPercentage(servicioPercentage)}
              </span>
            </div>
          </div>
          <div className='col-span-2 bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex items-center justify-between hover:bg-surface-container-low transition-colors'>
            <div>
              <h4 className='text-sm font-semibold text-on-surface-variant font-body mb-1'>
                Recomendación NPS
              </h4>
              <p className='text-xs text-on-surface-variant max-w-xs'>
                Probabilidad de recomendación del servicio a compañeros.
              </p>
            </div>
            <div className='text-right'>
              <span className='text-4xl font-extrabold text-primary font-headline'>
                {formatPercentage(recommendationPercentageValue)}
              </span>
              <div className='text-xs font-medium text-tertiary mt-1'>
                {recommendationTotal.equals(0)
                  ? 'Sin respuestas'
                  : `Promotores: ${promoterCount}`}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 className='text-lg font-bold text-on-surface font-headline mb-4 px-2'>
          Procesamiento de Encuestas
        </h2>
        <div className='space-y-6'>
          <div className='bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 '>
              <div>
                <span className='inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md mb-2 uppercase tracking-wide'>
                  Área: Charla
                </span>
                <h3 className='text-base font-semibold text-on-surface font-body leading-snug max-w-2xl'>
                  ¿Qué tan satisfecho te encuentras con la información brindada
                  en la charla?
                </h3>
              </div>
              <div className='bg-surface-container py-2 px-4 rounded-lg text-center min-w-[100px]'>
                <p className='text-[10px] uppercase font-bold text-on-surface-variant'>
                  Promedio
                </p>
                <p className='text-xl font-bold text-primary font-headline'>
                  {charlaAverage.toFixed(2)}
                  <span className='text-sm text-on-surface-variant'>/2</span>
                </p>
              </div>
            </div>
            <div className='flex flex-col space-y-2'>
              <div>
                <div className='flex justify-between text-xs text-on-surface-variant mb-1 font-medium px-1'>
                  <span>
                    Insatisfecho (
                    {charlaResponses.veryDissatisfied +
                      charlaResponses.dissatisfied}
                    )
                  </span>
                  <span>Neutro ({charlaResponses.neutral})</span>
                  <span>
                    Satisfecho (
                    {charlaResponses.satisfied + charlaResponses.verySatisfied})
                  </span>
                </div>
                <div className='h-6 w-full flex rounded-md overflow-hidden bg-surface-variant'>
                  <div
                    className='bg-error/80 h-full'
                    style={{ width: '0%' }}
                    title={`-2: ${charlaResponses.veryDissatisfied}`}
                  ></div>
                  <div
                    className='bg-error/60 h-full'
                    style={{ width: '0%' }}
                    title={`-1: ${charlaResponses.dissatisfied}`}
                  ></div>
                  <div
                    className='bg-outline/40 h-full'
                    style={{ width: '8%' }}
                    title={`0: ${charlaResponses.neutral}`}
                  ></div>
                  <div
                    className='bg-primary/60 h-full'
                    style={{ width: '45%' }}
                    title={`1: ${charlaResponses.satisfied}`}
                  ></div>
                  <div
                    className='bg-primary h-full'
                    style={{ width: '47%' }}
                    title={`2: ${charlaResponses.verySatisfied}`}
                  ></div>
                </div>
              </div>
              <div className=' bg-surface-container/50 rounded-xl pt-2 border border-outline-variant/20'>
                <div className='flex justify-between items-center text-center'>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-on-surface-variant font-headline mb-1'>
                      -2
                    </p>
                    <p className='text-lg font-semibold text-on-surface font-body'>
                      {charlaResponses.veryDissatisfied
                        ? charlaResponses.veryDissatisfied
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-on-surface-variant font-headline mb-1'>
                      -1
                    </p>
                    <p className='text-lg font-semibold text-on-surface font-body'>
                      {charlaResponses.dissatisfied
                        ? charlaResponses.dissatisfied
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-on-surface-variant font-headline mb-1'>
                      0
                    </p>
                    <p className='text-lg font-semibold text-on-surface font-body'>
                      {charlaResponses.neutral ? charlaResponses.neutral : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-primary font-headline mb-1'>
                      1
                    </p>
                    <p className='text-lg font-semibold text-primary font-body'>
                      {charlaResponses.satisfied
                        ? charlaResponses.satisfied
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-primary font-headline mb-1'>
                      2
                    </p>
                    <p className='text-lg font-semibold text-primary font-body'>
                      {charlaResponses.verySatisfied
                        ? charlaResponses.verySatisfied
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
              <div>
                <span className='inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-md mb-2 uppercase tracking-wide'>
                  Área: Servicio
                </span>
                <h3 className='text-base font-semibold text-on-surface font-body leading-snug max-w-2xl'>
                  ¿Qué tan satisfecho/a te encuentras con el Serv. de
                  Enfermería?
                </h3>
              </div>
              <div className='bg-surface-container py-2 px-4 rounded-lg text-center min-w-[100px]'>
                <p className='text-[10px] uppercase font-bold text-on-surface-variant'>
                  Promedio
                </p>
                <p className='text-xl font-bold text-primary font-headline'>
                  {servicioAverage.toFixed(2)}
                  <span className='text-sm text-on-surface-variant'>/2</span>
                </p>
              </div>
            </div>
            <div className='flex flex-col space-y-2'>
              <div>
                <div className='flex justify-between text-xs text-on-surface-variant mb-1 font-medium px-1'>
                  <span>
                    Insatisfecho (
                    {charlaResponses.veryDissatisfied +
                      charlaResponses.dissatisfied}
                    )
                  </span>
                  <span>Neutro ({charlaResponses.neutral})</span>
                  <span>
                    Satisfecho (
                    {charlaResponses.satisfied + charlaResponses.verySatisfied})
                  </span>
                </div>
                <div className='h-6 w-full flex rounded-md overflow-hidden bg-surface-variant'>
                  <div
                    className='bg-error/80 h-full'
                    style={{ width: '0%' }}
                    title={`-2: ${servicioResponses.veryDissatisfied}`}
                  ></div>
                  <div
                    className='bg-error/60 h-full'
                    style={{ width: '0%' }}
                    title={`-1: ${servicioResponses.dissatisfied}`}
                  ></div>
                  <div
                    className='bg-outline/40 h-full'
                    style={{ width: '7%' }}
                    title={`0: ${servicioResponses.neutral}`}
                  ></div>
                  <div
                    className='bg-primary/60 h-full'
                    style={{ width: '43%' }}
                    title={`1: ${servicioResponses.satisfied}`}
                  ></div>
                  <div
                    className='bg-primary h-full'
                    style={{ width: '50%' }}
                    title={`2: ${servicioResponses.verySatisfied}`}
                  ></div>
                </div>
              </div>
              <div className=' bg-surface-container/50 rounded-xl pt-2 border border-outline-variant/20'>
                <div className='flex justify-between items-center text-center'>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-on-surface-variant font-headline mb-1'>
                      -2
                    </p>
                    <p className='text-lg font-semibold text-on-surface font-body'>
                      {servicioResponses.veryDissatisfied
                        ? servicioResponses.veryDissatisfied
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-on-surface-variant font-headline mb-1'>
                      -1
                    </p>
                    <p className='text-lg font-semibold text-on-surface font-body'>
                      {servicioResponses.dissatisfied
                        ? servicioResponses.dissatisfied
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-on-surface-variant font-headline mb-1'>
                      0
                    </p>
                    <p className='text-lg font-semibold text-on-surface font-body'>
                      {servicioResponses.neutral
                        ? servicioResponses.neutral
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-primary font-headline mb-1'>
                      1
                    </p>
                    <p className='text-lg font-semibold text-primary font-body'>
                      {servicioResponses.satisfied
                        ? servicioResponses.satisfied
                        : '-'}
                    </p>
                  </div>
                  <div className='flex-1 border-r border-outline-variant/20 last:border-0'>
                    <p className='text-xs font-bold text-primary font-headline mb-1'>
                      2
                    </p>
                    <p className='text-lg font-semibold text-primary font-body'>
                      {servicioResponses.verySatisfied
                        ? servicioResponses.verySatisfied
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10'>
          <div className='mb-4'>
            <span className='inline-block px-2 py-1 bg-primary-container/20 text-primary-container text-xs font-bold rounded-md mb-2 uppercase tracking-wide'>
              Análisis NPS
            </span>
            <h3 className='text-base font-semibold text-on-surface font-body leading-snug'>
              Desglose de Recomendación (0-10)
            </h3>
          </div>
          <div className='flex flex-col gap-4 '>
            <div className='flex items-center gap-4'>
              <div className='w-24 text-right'>
                <p className='text-sm font-bold text-on-surface'>Promotores</p>
                <p className='text-[10px] text-on-surface-variant'>(9-10)</p>
              </div>
              <div className='flex-1'>
                <div className='h-8 bg-surface-variant rounded-md overflow-hidden flex items-center'>
                  <div
                    className='h-full bg-primary/80 flex items-center justify-end pr-2 text-white text-xs font-bold'
                    style={{
                      width: recommendationBarWidth(
                        recommendationCounts[9] + recommendationCounts[10],
                      ),
                    }}
                  >
                    {Math.round(
                      ((recommendationCounts[9] + recommendationCounts[10]) /
                        (recommendationTotal.toNumber() || 1)) *
                        100,
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-24 text-right'>
                <p className='text-sm font-bold text-on-surface'>Pasivos</p>
                <p className='text-[10px] text-on-surface-variant'>(7-8)</p>
              </div>
              <div className='flex-1'>
                <div className='h-8 bg-surface-variant rounded-md overflow-hidden flex items-center'>
                  <div
                    className='h-full bg-outline/40 flex items-center justify-end pr-2 text-on-surface text-xs font-bold'
                    style={{
                      width: recommendationBarWidth(
                        recommendationCounts[7] + recommendationCounts[8],
                      ),
                    }}
                  >
                    {Math.round(
                      ((recommendationCounts[7] + recommendationCounts[8]) /
                        (recommendationTotal.toNumber() || 1)) *
                        100,
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-24 text-right'>
                <p className='text-sm font-bold text-on-surface'>Detractores</p>
                <p className='text-[10px] text-on-surface-variant'>(0-6)</p>
              </div>
              <div className='flex-1'>
                <div className='h-8 bg-surface-variant rounded-md overflow-hidden flex items-center'>
                  <div
                    className='h-full bg-error/60 flex items-center justify-end pr-2 text-white text-xs font-bold'
                    style={{
                      width: recommendationBarWidth(
                        recommendationCounts[0] +
                          recommendationCounts[1] +
                          recommendationCounts[2] +
                          recommendationCounts[3] +
                          recommendationCounts[4] +
                          recommendationCounts[5] +
                          recommendationCounts[6],
                      ),
                    }}
                  >
                    {Math.round(
                      ((recommendationCounts[0] +
                        recommendationCounts[1] +
                        recommendationCounts[2] +
                        recommendationCounts[3] +
                        recommendationCounts[4] +
                        recommendationCounts[5] +
                        recommendationCounts[6]) /
                        (recommendationTotal.toNumber() || 1)) *
                        100,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 space-y-2'>
            <p className='text-xs text-on-surface-variant mt-1'>
              Distribución detallada de las calificaciones obtenidas
            </p>
            <div className='grid grid-cols-11 gap-1 md:gap-2'>
              <div className='text-center'>
                <div className='bg-error/10 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  0
                </div>
                <div className='bg-error/5 text-on-surface font-bold py-2 border-x border-b border-error/20 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[0]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-error/10 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  1
                </div>
                <div className='bg-error/5 text-on-surface font-bold py-2 border-x border-b border-error/20 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[1]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-error/10 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  2
                </div>
                <div className='bg-error/5 text-on-surface font-bold py-2 border-x border-b border-error/20 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[2]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-error/10 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  3
                </div>
                <div className='bg-error/5 text-on-surface font-bold py-2 border-x border-b border-error/20 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[3]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-error/10 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  4
                </div>
                <div className='bg-error/5 text-on-surface font-bold py-2 border-x border-b border-error/20 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[4]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-error/20 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  5
                </div>
                <div className='bg-error/10 text-on-surface font-bold py-2 border-x border-b border-error/30 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[5]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-error/20 text-error text-[10px] font-bold py-1 rounded-t-lg'>
                  6
                </div>
                <div className='bg-error/10 text-on-surface font-bold py-2 border-x border-b border-error/30 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[6]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-outline/20 text-on-surface-variant text-[10px] font-bold py-1 rounded-t-lg'>
                  7
                </div>
                <div className='bg-outline/10 text-on-surface font-bold py-2 border-x border-b border-outline/30 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[7]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-outline/20 text-on-surface-variant text-[10px] font-bold py-1 rounded-t-lg'>
                  8
                </div>
                <div className='bg-outline/10 text-on-surface font-bold py-2 border-x border-b border-outline/30 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[8]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-primary/20 text-primary text-[10px] font-bold py-1 rounded-t-lg'>
                  9
                </div>
                <div className='bg-primary/10 text-on-surface font-bold py-2 border-x border-b border-primary/30 rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[9]}</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-primary text-on-primary text-[10px] font-bold py-1 rounded-t-lg'>
                  10
                </div>
                <div className='bg-primary/20 text-primary font-black py-2 border-x border-b border-primary rounded-b-lg text-sm leading-tight'>
                  <div>{recommendationCounts[10]}</div>
                </div>
              </div>
            </div>
            <div className='flex justify-between mt-4 text-[10px] font-bold uppercase tracking-tighter'>
              <span className='text-error'>
                Detractores ({recommendationPercentage(detractorCount)})
              </span>
              <span className='text-on-surface-variant'>
                Pasivos (
                {recommendationPercentage(
                  recommendationCounts[7] + recommendationCounts[8],
                )}
                )
              </span>
              <span className='text-primary'>
                Promotores ({recommendationPercentage(promoterCount)})
              </span>
            </div>
          </div>
        </div>

        <div className='bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex flex-col h-full'>
          <div className='mb-4'>
            <h3 className='text-base font-semibold text-on-surface font-body leading-snug'>
              Temas sugeridos para futuras charlas
            </h3>
            <p className='text-xs text-on-surface-variant mt-1'>
              Basado en respuestas abiertas
            </p>
          </div>
          <div className='flex-1 max-h-[320px] overflow-y-auto pr-2 mt-2 space-y-2'>
            {suggestedTopics.length === 0 ? (
              <div className='rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant'>
                No hay temas sugeridos registrados.
              </div>
            ) : (
              suggestedTopics.map((item) => (
                <div
                  key={item.topic}
                  className='flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <span className='material-symbols-outlined text-primary'>
                      forum
                    </span>
                    <span className='text-sm font-medium text-on-surface font-body truncate'>
                      {item.topic}
                    </span>
                  </div>
                  <span className='bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant shrink-0'>
                    {item.votes} voto{item.votes === 1 ? '' : 's'}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className='hidden flex-1 overflow-y-auto pr-2 mt-2 space-y-2'>
            <div className='flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined text-tertiary'>
                  restaurant_menu
                </span>
                <span className='text-sm font-medium text-on-surface font-body'>
                  Alimentación saludable
                </span>
              </div>
              <span className='bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant'>
                29 votos
              </span>
            </div>
            <div className='flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined text-primary'>
                  diversity_1
                </span>
                <span className='text-sm font-medium text-on-surface font-body'>
                  Métodos anticonceptivos
                </span>
              </div>
              <span className='bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant'>
                26 votos
              </span>
            </div>
            <div className='flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined text-secondary'>
                  psychology
                </span>
                <span className='text-sm font-medium text-on-surface font-body'>
                  Problemas emocionales
                </span>
              </div>
              <span className='bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant'>
                20 votos
              </span>
            </div>
            <div className='flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined text-outline'>
                  more_horiz
                </span>
                <span className='text-sm font-medium text-on-surface font-body'>
                  Otros temas
                </span>
              </div>
              <span className='bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant'>
                17 votos
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ResultadosSatisfaccion
