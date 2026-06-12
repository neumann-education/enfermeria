const ENV = setupEnv()
const SHEET_ID = ENV.SHEET_ID
const SHEET_NAME_ATENCIONES = ENV.SHEET_NAME
const SHEET_NAME_USUARIOS = ENV.SHEET_NAME_USUARIOS
const SHEET_NAME_CAFETERIA_SUPERVISION = ENV.SHEET_NAME_CAFETERIA_SUPERVISION
const SHEET_NAME_ACCESO = ENV.SHEET_NAME_ACCESO
const CONSTANCIA_FOLDER_ID = ENV.CONSTANCIA_FOLDER_ID
const ATENCIONES_HEADERS = [
  'N° ORDEN',
  'FECHA DE ATENCIÓN',
  'ID Usuario',
  'Nombre Completo',
  'EDAD',
  'DNI',
  'N° DE CELULAR',
  'CORREO ELECTRONICO',
  'PROGRAMA',
  'CICLO',
  'PERIODO',
  'MOTIVO DE ATENCIÓN',
  'ÁREA PROBLEMÁTICA PRINCIPAL',
  'MEDIO DE CONTACTO',
  'OBSERVACIONES',
  'RESULTADO',
  'URL Constancia',
  'SECCIÓN',
  'HORA DE SALIDA',
]

const SEGUIMIENTO_ATENCION_HEADERS = [
  'ID Seguimiento',
  'ID Atencion',
  'FECHA SEGUIMIENTO',
  'HORA',
  'ASISTIO',
  'NIVEL DE COMPROMISO',
  'OBSERVACIONES',
]

const DISCAPACIDAD_HEADERS = [
  'ID Usuario',
  'PERIODO REGISTRO',
  'DNI',
  'NOMBRES',
  'DISCAPACIDAD',
  'CARNET - CONADIS',
  'OBSERVACIONES',
  'FECHA REGISTRO',
]

const SEGUIMIENTO_DISCAPACIDAD_HEADERS = [
  'ID Usuario',
  'PERIODO SEGUIMIENTO',
  'DNI',
  'NOMBRES',
  'ESTUDIANTE REGULAR',
  'CARRERA',
  'CICLO',
  'SECCIÓN',
  'TURNO',
  'OBSERVACIONES',
  'FECHA REGISTRO',
]

const SEGUIMIENTO_GESTANTE_HEADERS = [
  'ID Usuario',
  'PERIODO SEGUIMIENTO',
  'DNI',
  'NOMBRES',
  'ESTUDIANTE REGULAR',
  'CARRERA',
  'CICLO',
  'SECCIÓN',
  'TURNO',
  'CONTROL PRENATAL',
  'OBSERVACIONES',
  'FECHA REGISTRO',
]

const GESTANTES_HEADERS = [
  'ID Usuario',
  'PERIODO REGISTRADO',
  'DNI',
  'NOMBRES',
  'EDAD',
  'CONTROL PRENATAL',
  'FECHA PROBABLE DE PARTO',
  'CELULAR',
  'CORREO',
  'OBSERVACIONES',
  'FECHA REGISTRO',
]

const USUARIOS_HEADERS = [
  'ID Usuario',
  'Nombre Completo',
  'DNI',
  'Edad',
  'Sexo',
  'Email',
  'Teléfono',
  'Nacionalidad',
  'Rol',
  'Carrera',
  'Ciclo',
  'Sección',
  'Área / Departamento',
  'Cargo',
  'Viviendo con',
  'Tipo de Seguro',
  'Embarazada',
  'Discapacidad',
  'Fecha de última actualización',
]

const CAFETERIA_SUPERVISION_HEADERS = [
  'ID',
  'FECHA',
  'HORA',
  'PERIODO',
  'CONCESIONARIO',
  'SUPERVISOR',
  'HIGIENE BASICA',
  'LIMPIEZA AMBIENTE',
  'SIGNOS ETA',
  'CALIDAD VARIADO',
  'FECHA VENCIMIENTO',
  'CONSERVACION ALIMENTOS',
  'AMABILIDAD',
  'TIEMPO SERVICIO',
  'CALIDAD PRECIO',
  'PRECIOS COMPETITIVOS',
  'ESTADO EQUIPAMIENTO',
  'OBSERVACIONES',
  'ESTADO',
  'REGISTRADO EN',
]

const SURVEY_CONFIG_HEADERS = [
  'ID',
  'TIPO',
  'PERIODO',
  'LINK',
  'ABIERTO',
  'CREADO EN',
]

const SURVEY_DATOS_CLINICOS_HEADERS = [
  'ID',
  'TIPO',
  'PERIODO',
  'CONFIG_ID',
  'REGISTRADO EN',
  'PROGRAMA',
  'CICLO',
  'SECCION',
  'NOMBRES APELLIDOS',
  'FECHA NACIMIENTO',
  'EDAD',
  'SEXO',
  'DNI',
  'CELULAR',
  'CORREO ELECTRONICO',
  'DOMICILIO',
  'NACIONALIDAD',
  'TIPO SEGURO',
  'CONTACTO NOMBRES',
  'CONTACTO CELULAR',
  'PARENTESCO',
  'PADECE ENFERMEDAD',
  'ENFERMEDAD NOMBRE',
  'DISCAPACIDAD',
  'DISCAPACIDAD NOMBRE',
  'CARNET CONADIS',
  'TRATAMIENTO MEDICO',
  'TRATAMIENTO NOMBRE',
  'ALERGICO',
  'ALERGICO NOMBRE',
  'VACUNA COVID',
  'DOSIS COVID',
  'EMBARAZADA',
  'FPP',
  'SEMANAS GESTACION',
]

const SURVEY_TAMIZAJE_SALUD_HEADERS = [
  'ID',
  'TIPO',
  'PERIODO',
  'CONFIG_ID',
  'REGISTRADO EN',
  'NOMBRES APELLIDOS',
  'EDAD',
  'DNI',
  'CELULAR',
  'CORREO ELECTRONICO',
  'PROGRAMA',
  'CICLO',
  'SECCION',
  'SEXO',
  'PESO ACTUAL',
  'ESTATURA ACTUAL',
  'ACTIVIDAD FISICA',
  'FRECUENCIA ACTIVIDAD',
  'COMIDAS POR DIA',
  'CONSUMO FRUTAS VERDURAS',
  'ALERGIA INTOLERANCIA',
  'FUNCION VEGETALES',
  'PLATO FAVORITO 1',
  'PLATO FAVORITO 2',
]

const SURVEY_SATISFACCION_HEADERS = [
  'ID',
  'TIPO',
  'PERIODO',
  'CONFIG_ID',
  'REGISTRADO EN',
  'CORREO ELECTRONICO',
  'NOMBRES APELLIDOS',
  'CARRERA PROFESIONAL',
  'CICLO',
  'SECCION',
  'INFO CHARLA',
  'SERVICIO ENFERMERIA',
  'PROXIMO TEMA',
  'RECOMENDACION',
]

const ACCESO_HEADERS = ['Usuario', 'Nombre', 'Contraseña']

const CACHE_EXPIRATION_SECONDS = 600
const CACHE_VERSION_KEY = 'BACKEND_CACHE_VERSION'
const DEFAULT_ACADEMIC_PERIOD = '2026 - II'

function getCache() {
  return CacheService.getScriptCache()
}

function getCacheVersion() {
  const cache = getCache()
  let version = cache.get(CACHE_VERSION_KEY)
  if (version) {
    return version
  }

  const props = PropertiesService.getScriptProperties()
  version = props.getProperty(CACHE_VERSION_KEY)
  if (version) {
    cache.put(CACHE_VERSION_KEY, version)
    return version
  }

  version = '1'
  props.setProperty(CACHE_VERSION_KEY, version)
  cache.put(CACHE_VERSION_KEY, version)
  return version
}

function bumpCacheVersion() {
  const props = PropertiesService.getScriptProperties()
  const currentVersion = Number(props.getProperty(CACHE_VERSION_KEY) || '1')
  const nextVersion = String(currentVersion + 1)
  props.setProperty(CACHE_VERSION_KEY, nextVersion)
  getCache().put(CACHE_VERSION_KEY, nextVersion)
}

function getCacheKey(action, params) {
  return `${CACHE_VERSION_KEY}:${getCacheVersion()}:${action}:${params}`
}

function getCachedResponse(action, params) {
  const cached = getCache().get(getCacheKey(action, params))
  return cached ? JSON.parse(cached) : null
}

function setCachedResponse(action, params, data) {
  getCache().put(
    getCacheKey(action, params),
    JSON.stringify(data),
    CACHE_EXPIRATION_SECONDS,
  )
}

function invalidateCache() {
  bumpCacheVersion()
}

function ensureSheetHeader(sheet, headerName) {
  const headers = sheet
    .getRange(1, 1, 1, Math.max(1, sheet.getLastColumn()))
    .getValues()[0]
    .map((header) => String(header || '').trim())

  const index = headers.indexOf(headerName)
  if (index !== -1) {
    return index
  }

  const newColumn = headers.length + 1
  sheet.getRange(1, newColumn).setValue(headerName)
  return newColumn - 1
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const atencionesSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_ATENCIONES,
      ATENCIONES_HEADERS,
    )
    const seguimientoAtencionSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento Atencion',
      SEGUIMIENTO_ATENCION_HEADERS,
    )
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )
    const cafeteriaSupervisionSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_CAFETERIA_SUPERVISION,
      CAFETERIA_SUPERVISION_HEADERS,
    )

    const timestamp = Utilities.formatDate(
      new Date(),
      'America/Lima',
      'dd/MM/yyyy, HH:mm:ss',
    )

    const action = String(data.action || '').trim()

    console.log('POST action:', action)

    const response = processPostAction(
      action,
      data,
      spreadsheet,
      atencionesSheet,
      seguimientoAtencionSheet,
      usuariosSheet,
      cafeteriaSupervisionSheet,
      timestamp,
    )

    return ContentService.createTextOutput(
      JSON.stringify(response),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error('Error en doPost:', error)

    const errorResponse = {
      success: false,
      message: 'Error al guardar los datos: ' + error.toString(),
      timestamp: new Date().toISOString(),
    }

    return ContentService.createTextOutput(
      JSON.stringify(errorResponse),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function processPostAction(
  action,
  data,
  spreadsheet,
  atencionesSheet,
  seguimientoAtencionSheet,
  usuariosSheet,
  cafeteriaSupervisionSheet,
  timestamp,
) {
  switch (action) {
    case 'registrarAtencionSolo':
      return handleRegistrarAtencionSolo(
        data,
        atencionesSheet,
        seguimientoAtencionSheet,
        usuariosSheet,
        timestamp,
      )
    case 'registrarAtencionCompleta':
      return handleRegistrarAtencionCompleta(
        data,
        atencionesSheet,
        seguimientoAtencionSheet,
        usuariosSheet,
        timestamp,
      )
    case 'crearUsuario':
      return handleCrearUsuario(data, usuariosSheet, atencionesSheet, timestamp)
    case 'actualizarUsuario':
      return handleActualizarUsuario(data, usuariosSheet, timestamp)
    case 'guardarDiscapacidad':
      return handleGuardarDiscapacidad(data, usuariosSheet, timestamp)
    case 'guardarGestante':
      return handleGuardarGestante(data, usuariosSheet, timestamp)
    case 'guardarSeguimientoDiscapacidad':
      return handleGuardarSeguimientoDiscapacidad(data, timestamp)
    case 'guardarSeguimientoGestante':
      return handleGuardarSeguimientoGestante(data, timestamp)
    case 'guardarSeguimientoAtencion':
      return handleGuardarSeguimientoAtencion(
        data,
        seguimientoAtencionSheet,
        timestamp,
      )
    case 'actualizarSeguimientoAtencion':
      return handleActualizarSeguimientoAtencion(
        data,
        seguimientoAtencionSheet,
        timestamp,
      )
    case 'eliminarSeguimientoAtencion':
      return handleEliminarSeguimientoAtencion(
        data,
        seguimientoAtencionSheet,
        timestamp,
      )
    case 'registrarSupervisionCafeteria':
      return handleRegistrarSupervisionCafeteria(
        data,
        cafeteriaSupervisionSheet,
        timestamp,
      )

    case 'eliminarSupervisionCafeteria':
      return handleEliminarSupervisionCafeteria(
        data,
        cafeteriaSupervisionSheet,
        timestamp,
      )
    case 'createSurveyConfig':
      return handleCreateSurveyConfig(data, spreadsheet, timestamp)
    case 'updateSurveyConfig':
      return handleUpdateSurveyConfig(data, spreadsheet, timestamp)
    case 'deleteSurveyConfig':
      return handleDeleteSurveyConfig(data, spreadsheet, timestamp)
    case 'saveSurveyResponse':
      return handleSaveSurveyResponse(data, spreadsheet, timestamp)
    case 'actualizarAtencion':
      return handleActualizarAtencion(data, atencionesSheet, timestamp)
    case 'enviarConstanciaAtencion':
      return handleEnviarConstanciaAtencion(data, atencionesSheet, timestamp)
    case 'exportarReporte':
      return handleExportarReporte(data, spreadsheet, timestamp)
    case 'login':
      return handleLoginAcceso(data, spreadsheet, timestamp)

    default:
      return {
        success: false,
        action: action || null,
        message: action
          ? `Acción no soportada: ${action}`
          : 'Falta action en el POST',
        timestamp,
      }
  }
}

function handleLoginAcceso(data, spreadsheet, timestamp) {
  const usuario = String(data.usuario || '').trim()
  const contrasena = String(data.contrasena || data.password || '').trim()

  if (!usuario || !contrasena) {
    return {
      success: false,
      action: 'login',
      message: 'Usuario y contraseña son requeridos',
      timestamp,
    }
  }

  const accesoSheet = getOrCreateSheet(
    spreadsheet,
    SHEET_NAME_ACCESO,
    ACCESO_HEADERS,
  )

  const rowsCount = accesoSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return {
      success: false,
      action: 'login',
      message: 'No hay usuarios habilitados en Acceso',
      timestamp,
    }
  }

  const rows = accesoSheet
    .getRange(2, 1, rowsCount, ACCESO_HEADERS.length)
    .getValues()

  for (let i = 0; i < rows.length; i += 1) {
    const rowUsuario = String(rows[i][0] || '').trim()
    const rowNombre = String(rows[i][1] || '').trim()
    const rowContrasena = String(rows[i][2] || '').trim()

    if (rowUsuario === usuario && rowContrasena === contrasena) {
      return {
        success: true,
        action: 'login',
        timestamp,
        user: {
          usuario: rowUsuario,
          nombre: rowNombre || rowUsuario,
        },
      }
    }
  }

  return {
    success: false,
    action: 'login',
    message: 'Usuario o contraseña incorrectos',
    timestamp,
  }
}

function handleCrearUsuario(data, usuariosSheet, atencionesSheet, timestamp) {
  const dni = String(data.dni || '').trim()
  if (!dni) {
    return {
      success: false,
      action: 'crearUsuario',
      message: 'DNI es requerido',
      timestamp,
    }
  }

  const existingUsers = findUsers(dni, usuariosSheet, null)
  const userExists = existingUsers.some((user) => user.dni === dni)
  if (userExists) {
    return {
      success: false,
      action: 'crearUsuario',
      message: 'Ya existe un usuario con este DNI',
      timestamp,
    }
  }

  const usuarioId = createNewUsuario(data, usuariosSheet, timestamp)
  invalidateCache()

  return {
    success: true,
    action: 'crearUsuario',
    message: 'Usuario guardado correctamente',
    timestamp,
    usuarioId,
  }
}

function handleActualizarUsuario(data, usuariosSheet, timestamp) {
  const usuarioId = String(data.usuarioId || data.id || '').trim()
  const dni = String(data.dni || '').trim()

  if (!usuarioId && !dni) {
    return {
      success: false,
      action: 'actualizarUsuario',
      message: 'Usuario ID o DNI es requerido',
      timestamp,
    }
  }

  const headers = usuariosSheet
    .getRange(1, 1, 1, USUARIOS_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header || '').trim())

  const idIndex = headers.indexOf('ID Usuario')
  const dniIndex = headers.indexOf('DNI')

  const lastRow = usuariosSheet.getLastRow()
  if (lastRow <= 1) {
    return {
      success: false,
      action: 'actualizarUsuario',
      message: 'No hay usuarios registrados',
      timestamp,
    }
  }

  const rows = usuariosSheet
    .getRange(2, 1, lastRow - 1, USUARIOS_HEADERS.length)
    .getValues()

  let targetRow = -1
  let targetRowValues = null
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowId = String(row[idIndex] || '').trim()
    const rowDni = String(row[dniIndex] || '').trim()
    const matches =
      (usuarioId && rowId === usuarioId) ||
      (!usuarioId && dni && rowDni === dni)

    if (matches) {
      targetRow = i + 2
      targetRowValues = row
      break
    }
  }

  if (targetRow === -1 || !targetRowValues) {
    return {
      success: false,
      action: 'actualizarUsuario',
      message: 'Usuario no encontrado para actualizar',
      timestamp,
    }
  }

  if (dni) {
    const hasDuplicateDni = rows.some((row, index) => {
      const rowNumber = index + 2
      if (rowNumber === targetRow) {
        return false
      }
      return String(row[dniIndex] || '').trim() === dni
    })

    if (hasDuplicateDni) {
      return {
        success: false,
        action: 'actualizarUsuario',
        message: 'Ya existe otro usuario con este DNI',
        timestamp,
      }
    }
  }

  const fullName = String(
    data.nombreCompleto ||
      `${data.apellidos || ''} ${data.nombres || ''}`.trim() ||
      targetRowValues[1] ||
      '',
  )

  const updatedRow = [
    String(usuarioId || targetRowValues[0] || ''),
    fullName,
    String(data.dni || targetRowValues[2] || ''),
    String(data.edad || targetRowValues[3] || ''),
    normalizeSexForSheet(data.sexo || targetRowValues[4] || ''),
    String(data.correoElectronico || data.email || targetRowValues[5] || ''),
    String(data.telefono || targetRowValues[6] || ''),
    String(data.nacionalidad || targetRowValues[7] || ''),
    String(data.rol || targetRowValues[8] || ''),
    String(data.carrera || targetRowValues[9] || ''),
    String(data.ciclo || targetRowValues[10] || ''),
    String(data.seccion || targetRowValues[11] || ''),
    String(data.areaDepartamento || targetRowValues[12] || ''),
    String(data.cargo || targetRowValues[13] || ''),
    String(data.viviendoCon || targetRowValues[14] || ''),
    String(data.tipoSeguro || targetRowValues[15] || ''),
    String(data.isPregnant || targetRowValues[16] || 'No'),
    String(data.hasDisability || targetRowValues[17] || 'No'),
    timestamp,
  ]

  usuariosSheet
    .getRange(targetRow, 1, 1, USUARIOS_HEADERS.length)
    .setValues([updatedRow])

  invalidateCache()

  return {
    success: true,
    action: 'actualizarUsuario',
    message: 'Usuario actualizado correctamente',
    timestamp,
    usuarioId: updatedRow[0],
  }
}

function handleRegistrarAtencionCompleta(
  data,
  atencionesSheet,
  seguimientoAtencionSheet,
  usuariosSheet,
  timestamp,
) {
  const dni = String(data.dni || '').trim()
  if (!dni) {
    return {
      success: false,
      action: 'registrarAtencionCompleta',
      message: 'DNI es requerido',
      timestamp,
    }
  }

  const existingUsers = findUsers(dni, usuariosSheet, null).filter(
    (user) => user.dni === dni,
  )
  if (existingUsers.length > 0) {
    return {
      success: false,
      action: 'registrarAtencionCompleta',
      message: 'Usuario ya existe con este DNI',
      timestamp,
    }
  }

  const usuarioId = createNewUsuario(data, usuariosSheet, timestamp)
  ensureSheetHeader(atencionesSheet, 'HORA DE SALIDA')
  const headers = atencionesSheet
    .getRange(1, 1, 1, ATENCIONES_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const orderIndex = headers.indexOf('N° ORDEN')

  let orderNumber = 20260000
  const lastRow = atencionesSheet.getLastRow()
  if (orderIndex !== -1 && lastRow > 1) {
    const orderValues = atencionesSheet
      .getRange(2, orderIndex + 1, lastRow - 1, 1)
      .getValues()
      .flat()
      .map((value) => Number(String(value || '').trim()))
      .filter((value) => !Number.isNaN(value) && value > 0)

    if (orderValues.length > 0) {
      orderNumber = Math.max(...orderValues) + 1
    }
  }

  const rowValuesMap = {
    'N° ORDEN': orderNumber,
    'FECHA DE ATENCIÓN': data.fechaAtencion || timestamp,
    'HORA DE SALIDA': formatSheetTime(data.horaSalida || timestamp),
    'ID Usuario': usuarioId,
    'Nombre Completo':
      data.nombreCompleto ||
      `${data.apellidos || ''} ${data.nombres || ''}`.trim(),
    EDAD: data.edad || '',
    DNI: data.dni || '',
    'N° DE CELULAR': data.telefono || '',
    'CORREO ELECTRONICO': data.correoElectronico || data.email || '',
    PROGRAMA: data.programa || data.carrera || '',
    CICLO: data.ciclo || '',
    PERIODO: data.periodo || '',
    SECCIÓN: data.seccion || '',
    'MOTIVO DE ATENCIÓN': data.motivoAtencion || '',
    'ÁREA PROBLEMÁTICA PRINCIPAL': String(
      data.areaProblematica || data.areaProblematic || '',
    ).trim(),
    'MEDIO DE CONTACTO': data.medioContacto || '',
    OBSERVACIONES: data.observaciones || '',
    RESULTADO: data.resultado || '',
  }

  const rowData = ATENCIONES_HEADERS.map((header) => rowValuesMap[header] || '')

  atencionesSheet.appendRow(rowData)
  atencionesSheet.autoResizeColumns(1, rowData.length)

  const now = new Date()
  const seguimientoRow = [
    Utilities.getUuid(),
    orderNumber,
    Utilities.formatDate(now, 'America/Lima', 'dd/MM/yyyy'),
    Utilities.formatDate(now, 'America/Lima', 'HH:mm'),
    'Pendiente',
    '',
    '',
  ]
  seguimientoAtencionSheet.appendRow(seguimientoRow)
  seguimientoAtencionSheet.autoResizeColumns(1, seguimientoRow.length)

  invalidateCache()

  return {
    success: true,
    action: 'registrarAtencionCompleta',
    message: 'Atención guardada correctamente',
    timestamp,
    recordId: atencionesSheet.getLastRow(),
    orden: orderNumber,
    usuarioId,
  }
}

function handleRegistrarSupervisionCafeteria(data, cafeteriaSheet, timestamp) {
  const fecha = String(data.fecha || '').trim()
  const hora = String(data.hora || '').trim()
  const concesionario = String(data.concesionario || '').trim()
  const supervisor = String(data.supervisor || '').trim()
  const periodo = String(data.periodo || '').trim()

  if (!fecha || !hora || !concesionario || !supervisor || !periodo) {
    return {
      success: false,
      action: 'registrarSupervisionCafeteria',
      message:
        'Fecha, hora, periodo, concesionario y supervisor son requeridos.',
      timestamp,
    }
  }

  const headers = cafeteriaSheet
    .getRange(1, 1, 1, CAFETERIA_SUPERVISION_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = cafeteriaSheet.getLastRow() - 1
  if (rowsCount > 0) {
    const rows = cafeteriaSheet
      .getRange(2, 1, rowsCount, CAFETERIA_SUPERVISION_HEADERS.length)
      .getValues()
    const normalizedPeriodo = periodo.toLowerCase()
    for (let i = 0; i < rows.length; i += 1) {
      const existingPeriodo = String(rows[i][headerIndex['PERIODO']] || '')
        .trim()
        .toLowerCase()
      if (existingPeriodo && existingPeriodo === normalizedPeriodo) {
        return {
          success: false,
          action: 'registrarSupervisionCafeteria',
          message: 'Ya existe una supervisión con ese periodo.',
          timestamp,
        }
      }
    }
  }

  const recordId = String(data.id || Utilities.getUuid()).trim()
  const formattedFecha = formatSheetDate(fecha)
  const formattedHora = formatSheetTime(hora)
  const registro = formatDateTime(timestamp)
  const rowData = [
    recordId,
    formattedFecha,
    formattedHora,
    String(data.periodo || '').trim(),
    concesionario,
    supervisor,
    String(
      data.higieneBasica === true
        ? 'SI'
        : data.higieneBasica === false
          ? 'NO'
          : '',
    ),
    String(
      data.limpiezaAmbiente === true
        ? 'SI'
        : data.limpiezaAmbiente === false
          ? 'NO'
          : '',
    ),
    String(
      data.signosETA === true ? 'SI' : data.signosETA === false ? 'NO' : '',
    ),
    String(
      data.calidadVariado === true
        ? 'SI'
        : data.calidadVariado === false
          ? 'NO'
          : '',
    ),
    String(
      data.fechaVencimiento === true
        ? 'SI'
        : data.fechaVencimiento === false
          ? 'NO'
          : '',
    ),
    String(
      data.conservacionAlimentos === true
        ? 'SI'
        : data.conservacionAlimentos === false
          ? 'NO'
          : '',
    ),
    String(
      data.amabilidad === true ? 'SI' : data.amabilidad === false ? 'NO' : '',
    ),
    String(
      data.tiempoServicio === true
        ? 'SI'
        : data.tiempoServicio === false
          ? 'NO'
          : '',
    ),
    String(
      data.calidadPrecio === true
        ? 'SI'
        : data.calidadPrecio === false
          ? 'NO'
          : '',
    ),
    String(
      data.preciosCompetitivos === true
        ? 'SI'
        : data.preciosCompetitivos === false
          ? 'NO'
          : '',
    ),
    String(
      data.estadoEquipamiento === true
        ? 'SI'
        : data.estadoEquipamiento === false
          ? 'NO'
          : '',
    ),
    String(data.observaciones || '').trim(),
    String(data.aprobado || '').trim(),
    registro,
  ]

  cafeteriaSheet.appendRow(rowData)
  cafeteriaSheet.autoResizeColumns(1, rowData.length)

  invalidateCache()

  return {
    success: true,
    action: 'registrarSupervisionCafeteria',
    message: 'Supervisión guardada correctamente',
    timestamp,
    id: recordId,
  }
}

function handleEliminarSupervisionCafeteria(data, cafeteriaSheet, timestamp) {
  const recordId = String(data.id || '').trim()
  if (!recordId) {
    return {
      success: false,
      action: 'eliminarSupervisionCafeteria',
      message: 'Id de supervisión es requerido para eliminar.',
      timestamp,
    }
  }

  const headers = cafeteriaSheet
    .getRange(1, 1, 1, CAFETERIA_SUPERVISION_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = cafeteriaSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return {
      success: false,
      action: 'eliminarSupervisionCafeteria',
      message: 'No se encontró ninguna supervisión para eliminar.',
      timestamp,
    }
  }

  const rows = cafeteriaSheet
    .getRange(2, 1, rowsCount, CAFETERIA_SUPERVISION_HEADERS.length)
    .getValues()

  let foundRowIndex = null
  for (let i = 0; i < rows.length; i += 1) {
    const rowId = String(rows[i][headerIndex['ID']] || '').trim()
    if (rowId === recordId) {
      foundRowIndex = i + 2
      break
    }
  }

  if (!foundRowIndex) {
    return {
      success: false,
      action: 'eliminarSupervisionCafeteria',
      message: 'Supervisión no encontrada para eliminar.',
      timestamp,
    }
  }

  cafeteriaSheet.deleteRow(foundRowIndex)
  invalidateCache()

  return {
    success: true,
    action: 'eliminarSupervisionCafeteria',
    message: 'Supervisión eliminada correctamente',
    timestamp,
    id: recordId,
  }
}

function handleRegistrarAtencionSolo(
  data,
  atencionesSheet,
  seguimientoAtencionSheet,
  usuariosSheet,
  timestamp,
) {
  const usuarioId = String(data.usuarioId || '').trim()
  if (!usuarioId) {
    return {
      success: false,
      action: 'registrarAtencionSolo',
      message: 'UsuarioId es requerido',
      timestamp,
    }
  }

  ensureSheetHeader(atencionesSheet, 'HORA DE SALIDA')
  const headers = atencionesSheet
    .getRange(1, 1, 1, ATENCIONES_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const orderIndex = headers.indexOf('N° ORDEN')

  let orderNumber = 20260000
  const lastRow = atencionesSheet.getLastRow()
  if (orderIndex !== -1 && lastRow > 1) {
    const orderValues = atencionesSheet
      .getRange(2, orderIndex + 1, lastRow - 1, 1)
      .getValues()
      .flat()
      .map((value) => Number(String(value || '').trim()))
      .filter((value) => !Number.isNaN(value) && value > 0)

    if (orderValues.length > 0) {
      orderNumber = Math.max(...orderValues) + 1
    }
  }

  const rowValuesMap = {
    'N° ORDEN': orderNumber,
    'FECHA DE ATENCIÓN': data.fechaAtencion || timestamp,
    'HORA DE SALIDA': formatSheetTime(timestamp),
    'ID Usuario': usuarioId,
    'Nombre Completo':
      data.nombreCompleto ||
      `${data.apellidos || ''} ${data.nombres || ''}`.trim(),
    EDAD: data.edad || '',
    DNI: data.dni || '',
    'N° DE CELULAR': data.telefono || '',
    'CORREO ELECTRONICO': data.correoElectronico || data.email || '',
    PROGRAMA: data.programa || data.carrera || '',
    CICLO: data.ciclo || '',
    PERIODO: data.periodo || '',
    SECCIÓN: data.seccion || '',
    'MOTIVO DE ATENCIÓN': data.motivoAtencion || '',
    'ÁREA PROBLEMÁTICA PRINCIPAL': String(
      data.areaProblematica || data.areaProblematic || '',
    ).trim(),
    'MEDIO DE CONTACTO': data.medioContacto || '',
    OBSERVACIONES: data.observaciones || '',
    RESULTADO: data.resultado || '',
  }

  const rowData = ATENCIONES_HEADERS.map((header) => rowValuesMap[header] || '')

  atencionesSheet.appendRow(rowData)
  atencionesSheet.autoResizeColumns(1, rowData.length)

  const now = new Date()
  const seguimientoRow = [
    Utilities.getUuid(),
    orderNumber,
    Utilities.formatDate(now, 'America/Lima', 'dd/MM/yyyy'),
    Utilities.formatDate(now, 'America/Lima', 'HH:mm'),
    'Pendiente',
    '',
    '',
  ]
  seguimientoAtencionSheet.appendRow(seguimientoRow)
  seguimientoAtencionSheet.autoResizeColumns(1, seguimientoRow.length)

  invalidateCache()

  return {
    success: true,
    action: 'registrarAtencionSolo',
    message: 'Atención guardada correctamente',
    timestamp,
    recordId: atencionesSheet.getLastRow(),
    orden: orderNumber,
    usuarioId,
  }
}

function handleActualizarAtencion(data, atencionesSheet, timestamp) {
  const orden = String(data.orden || '').trim()
  if (!orden) {
    return {
      success: false,
      action: 'actualizarAtencion',
      message: 'Falta el número de orden',
      timestamp,
    }
  }

  ensureSheetHeader(atencionesSheet, 'HORA DE SALIDA')
  const headers = atencionesSheet
    .getRange(1, 1, 1, atencionesSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = atencionesSheet.getLastRow() - 1
  const rows =
    rowsCount > 0
      ? atencionesSheet
          .getRange(2, 1, rowsCount, atencionesSheet.getLastColumn())
          .getValues()
      : []

  let foundRowIndex = null
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowOrden = String(row[headerIndex['N° ORDEN']] || '').trim()
    if (rowOrden === orden) {
      foundRowIndex = i + 2
      break
    }
  }

  if (!foundRowIndex) {
    return {
      success: false,
      action: 'actualizarAtencion',
      message: 'Atención no encontrada',
      timestamp,
    }
  }

  const existingRow = atencionesSheet
    .getRange(foundRowIndex, 1, 1, atencionesSheet.getLastColumn())
    .getValues()[0]
  if (Object.prototype.hasOwnProperty.call(data, 'observaciones')) {
    existingRow[headerIndex['OBSERVACIONES']] = String(
      data.observaciones || '',
    ).trim()
  }
  if (Object.prototype.hasOwnProperty.call(data, 'resultado')) {
    existingRow[headerIndex['RESULTADO']] = String(data.resultado || '').trim()
  }
  if (Object.prototype.hasOwnProperty.call(data, 'horaSalida')) {
    existingRow[headerIndex['HORA DE SALIDA']] = String(
      data.horaSalida || '',
    ).trim()
  }

  atencionesSheet
    .getRange(foundRowIndex, 1, 1, existingRow.length)
    .setValues([existingRow])

  invalidateCache()

  return {
    success: true,
    action: 'actualizarAtencion',
    message: 'Atención actualizada correctamente',
    timestamp,
    orden,
  }
}

function handleEnviarConstanciaAtencion(data, atencionesSheet, timestamp) {
  const correoElectronico = String(data.correoElectronico || '').trim()
  const orden = String(data.orden || '').trim()

  if (!correoElectronico) {
    return {
      success: false,
      action: 'enviarConstanciaAtencion',
      message: 'Falta el correo electrónico del paciente',
      timestamp,
    }
  }

  const fecha = new Date()
  const dia = Utilities.formatDate(fecha, 'America/Lima', 'dd')
  const mes = Utilities.formatDate(fecha, 'America/Lima', 'MM')
  const anio = Utilities.formatDate(fecha, 'America/Lima', 'yyyy')
  const mesTexto = Utilities.formatDate(fecha, 'America/Lima', 'MMMM')

  const pdfFolder = DriveApp.getFolderById(CONSTANCIA_FOLDER_ID)
  const fileName = orden
    ? `Constancia_${orden}.pdf`
    : `Constancia_${new Date().getTime()}.pdf`

  if (!data.pdfBase64) {
    return {
      success: false,
      action: 'enviarConstanciaAtencion',
      message: 'Falta pdfBase64 para generar la constancia',
      timestamp,
    }
  }

  const pdfBytes = Utilities.base64Decode(String(data.pdfBase64))
  const pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', fileName)
  const pdfFile = pdfFolder.createFile(pdfBlob)

  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  const urlConstancia = pdfFile.getUrl()

  ensureSheetHeader(atencionesSheet, 'URL Constancia')
  const headers = atencionesSheet
    .getRange(1, 1, 1, Math.max(1, atencionesSheet.getLastColumn()))
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const orderIndex = headers.indexOf('N° ORDEN')
  const rowsCount = atencionesSheet.getLastRow() - 1
  const rows =
    rowsCount > 0
      ? atencionesSheet
          .getRange(2, 1, rowsCount, atencionesSheet.getLastColumn())
          .getValues()
      : []

  let foundRowIndex = null
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowOrden = String(row[orderIndex] || '').trim()
    if (rowOrden === orden) {
      foundRowIndex = i + 2
      break
    }
  }

  if (foundRowIndex !== null) {
    const existingRow = atencionesSheet
      .getRange(foundRowIndex, 1, 1, atencionesSheet.getLastColumn())
      .getValues()[0]
    existingRow[headerIndex['URL Constancia']] = urlConstancia
    atencionesSheet
      .getRange(foundRowIndex, 1, 1, existingRow.length)
      .setValues([existingRow])
  }

  const htmlBody = `
<div style="font-family: Arial, sans-serif; background:#f5f3ff; padding:30px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #eee;">
    <div style="background:#673AB6; padding:20px; text-align:center;">
      <img src="https://res.cloudinary.com/detbcxpfb/image/upload/v1775600238/resultado_qprg0t.png"
           style="width:180px;" />
    </div>
    <div style="padding:30px;">
      <h2 style="color:#673AB6; margin-top:0;">Constancia de Atención de Enfermería</h2>
      <p style="color:#444; font-size:14px;">
        Estimado(a) estudiante, se ha generado su constancia de atención correspondiente al servicio de enfermería.
      </p>
      <div style="background:#f5f3ff; padding:15px; border-radius:10px; margin:20px 0;">
        <p style="margin:5px 0;"><strong>Estudiante:</strong> ${String(data.nombreCompleto || '').trim() || '—'}</p>
        <p style="margin:5px 0;"><strong>DNI:</strong> ${String(data.dni || '').trim() || '—'}</p>
        <p style="margin:5px 0;"><strong>Hora de salida:</strong> ${String(data.horaSalida || '').trim() || '—'}</p>
        <p style="margin:5px 0;"><strong>Programa:</strong> ${String(data.programa || '').trim() || '—'}</p>
        <p style="margin:5px 0;"><strong>Ciclo:</strong> ${String(data.ciclo || '').trim() || '—'}</p>
        <p style="margin:5px 0;"><strong>Sección:</strong> ${String(data.seccion || '').trim() || '—'}</p>
      </div>
      <p style="font-size:14px; color:#444;">
        Puede descargar su constancia en el siguiente enlace:
      </p>
      <div style="text-align:center; margin:25px 0;">
        <a href="${urlConstancia}"
           style="background:#673AB6; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">
          Descargar constancia
        </a>
      </div>
      <p style="font-size:13px; color:#666;">
        Fecha de atención: Tacna, ${dia} de ${mesTexto} del ${anio}
      </p>
      <p style="font-size:13px; color:#666;">
        Si tiene alguna consulta, puede comunicarse con el área de enfermería.
      </p>
    </div>
    <div style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#888;">
      Instituto de Educación Superior Neumann<br/>Servicio de Enfermería
    </div>
  </div>
</div>
`

  try {
    MailApp.sendEmail({
      to: correoElectronico,
      subject: `Constancia de atención - Orden ${orden}`,
      htmlBody,
    })
  } catch (error) {
    return {
      success: false,
      action: 'enviarConstanciaAtencion',
      message: 'No se pudo enviar el correo: ' + String(error),
      timestamp,
    }
  }

  return {
    success: true,
    action: 'enviarConstanciaAtencion',
    message: 'Constancia enviada correctamente',
    timestamp,
    orden,
    urlConstancia,
    fileId: pdfFile.getId(),
  }
}

function parseReportDate(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return null
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmyMatch) {
    const day = Number(dmyMatch[1])
    const month = Number(dmyMatch[2]) - 1
    const year = Number(dmyMatch[3])
    const date = new Date(year, month, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2]) - 1
    const day = Number(isoMatch[3])
    const date = new Date(year, month, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isReportDateInRange(dateValue, range) {
  if (!range || range === 'Todos') {
    return true
  }

  const date = parseReportDate(dateValue)
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

  if (range === 'Semestre actual') {
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

  return true
}

function isReportDateInExportRange(dateValue, range, startDate, endDate) {
  if (range !== 'Personalizado') {
    return isReportDateInRange(dateValue, range)
  }

  const date = parseReportDate(dateValue)
  if (!date) {
    return false
  }

  const start = parseReportDate(startDate)
  const end = parseReportDate(endDate)

  if (start && end) {
    return date >= start && date <= end
  }

  if (start) {
    return date >= start
  }

  if (end) {
    return date <= end
  }

  return true
}

function handleExportarReporte(data, spreadsheet, timestamp) {
  const atencionesSheet = getOrCreateSheet(
    spreadsheet,
    SHEET_NAME_ATENCIONES,
    ATENCIONES_HEADERS,
  )
  const seguimientoAtencionSheet = getOrCreateSheet(
    spreadsheet,
    'Seguimiento Atencion',
    SEGUIMIENTO_ATENCION_HEADERS,
  )
  const usuariosSheet = getOrCreateSheet(
    spreadsheet,
    SHEET_NAME_USUARIOS,
    USUARIOS_HEADERS,
  )

  const userHeaders = usuariosSheet
    .getRange(1, 1, 1, usuariosSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const userHeaderIndex = userHeaders.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const userRowsCount = usuariosSheet.getLastRow() - 1
  const userRows =
    userRowsCount > 0
      ? usuariosSheet
          .getRange(2, 1, userRowsCount, usuariosSheet.getLastColumn())
          .getValues()
      : []

  const usersById = {}
  userRows.forEach((row) => {
    const userId = String(row[userHeaderIndex['ID Usuario']] || '').trim()
    if (!userId) {
      return
    }
    usersById[userId] = row
  })

  const attendances = findAllAttendancesWithUserType(
    usuariosSheet,
    atencionesSheet,
    seguimientoAtencionSheet,
  )

  const filterType = String(data.filterType || '').trim()
  const filterStatus = String(data.filterStatus || '').trim()
  const filterFinalizedFollowUp = String(data.filterFinalizedFollowUp || '')
  const filterSearch = String(data.filterSearch || '')
    .trim()
    .toLowerCase()
  const filterDateRange = String(data.filterDateRange || 'Todos').trim()
  const exportRange = String(data.exportRange || 'Todos').trim()
  const exportStartDate = String(data.exportStartDate || '').trim()
  const exportEndDate = String(data.exportEndDate || '').trim()
  const includeStudentInfo = data.includeStudentInfo !== false
  const includeContactInfo = data.includeContactInfo !== false
  const includeGestationDisability = data.includeGestationDisability === true
  const includeFollowUps = data.includeFollowUps !== false

  const filtered = attendances.filter((attendance) => {
    const normalizedUserType = String(attendance.userType || '')
      .trim()
      .toLowerCase()
    const matchesType =
      !filterType ||
      filterType === 'Todos' ||
      (filterType === 'Estudiantes' &&
        normalizedUserType.includes('estudiante')) ||
      (filterType === 'Administrativos' &&
        normalizedUserType.includes('administr')) ||
      String(attendance.userType || '') === filterType

    const matchesStatus =
      !filterStatus ||
      filterStatus === 'Todos' ||
      String(attendance.resultado || '') === filterStatus

    const followUpCount =
      attendance.followUps && attendance.followUps.length
        ? attendance.followUps.length
        : 0
    const matchesFinalizedFollowUp =
      filterStatus !== 'Finalizado' ||
      !filterFinalizedFollowUp ||
      filterFinalizedFollowUp === 'Todos' ||
      (filterFinalizedFollowUp === 'Con seguimiento' && followUpCount > 0) ||
      (filterFinalizedFollowUp === 'Sin seguimiento' && followUpCount === 0)

    const matchesDateRange = isReportDateInRange(
      attendance.fechaAtencion,
      filterDateRange,
    )

    const matchesSearch =
      !filterSearch ||
      [
        attendance.nombreCompleto,
        attendance.correoElectronico,
        attendance.dni,
      ].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(filterSearch),
      )

    return (
      matchesType &&
      matchesStatus &&
      matchesFinalizedFollowUp &&
      matchesDateRange &&
      matchesSearch
    )
  })

  const exportable = filtered.filter((attendance) =>
    isReportDateInExportRange(
      attendance.fechaAtencion,
      exportRange,
      exportStartDate,
      exportEndDate,
    ),
  )

  const reportRows = exportable.map((attendance) => {
    const userRow = usersById[attendance.usuarioId] || []
    const row = {
      Orden: attendance.orden,
      'Fecha atención': attendance.fechaAtencion,
      'Tipo usuario': attendance.userType,
      'Nombre completo': attendance.nombreCompleto,
      DNI: attendance.dni,
      Programa: attendance.programa,
      Ciclo: attendance.ciclo,
      Sección: attendance.seccion,
      Periodo: attendance.periodo,
      'Motivo de atención': attendance.motivoAtencion,
      'Área problemática': attendance.areaProblematica,
      Resultado: attendance.resultado,
      Observaciones: attendance.observaciones,
    }

    if (includeContactInfo) {
      row['Correo electrónico'] = attendance.correoElectronico
    }

    if (includeStudentInfo && userRow.length > 0) {
      row.Edad = String(userRow[userHeaderIndex['Edad']] || '')
      row.Sexo = String(userRow[userHeaderIndex['Sexo']] || '')
      row.Nacionalidad = String(userRow[userHeaderIndex['Nacionalidad']] || '')
      row['Área / Departamento'] = String(
        userRow[userHeaderIndex['Área / Departamento']] || '',
      )
      row.Cargo = String(userRow[userHeaderIndex['Cargo']] || '')
    }

    if (includeGestationDisability && userRow.length > 0) {
      row.Embarazada = String(userRow[userHeaderIndex['Embarazada']] || '')
      row.Discapacidad = String(userRow[userHeaderIndex['Discapacidad']] || '')
    }

    if (includeFollowUps) {
      const followUps = attendance.followUps || []
      row.Seguimientos = followUps
        .map((followUp) => {
          const base = [
            followUp.fechaSeguimiento,
            followUp.hora,
            followUp.asistio,
            followUp.nivelCompromiso,
            followUp.observaciones,
          ]
            .filter(Boolean)
            .join(' | ')
          return base || ''
        })
        .filter((text) => text)
        .join(' / ')
    }

    return row
  })

  return {
    success: true,
    action: 'exportarReporte',
    timestamp,
    report: reportRows,
  }
}

function handleGuardarDiscapacidad(data, usuariosSheet, timestamp) {
  const usuarioId = String(data.usuarioId || data.id || '').trim()
  if (!usuarioId) {
    return {
      success: false,
      action: 'guardarDiscapacidad',
      message: 'UsuarioId es requerido',
      timestamp,
    }
  }

  const updatedUserId = updateUsuario(data, usuariosSheet, timestamp)
  if (!updatedUserId) {
    return {
      success: false,
      action: 'guardarDiscapacidad',
      message: 'Usuario no encontrado',
      timestamp,
    }
  }

  const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
  const discapacidadSheet = getOrCreateSheet(
    spreadsheet,
    'Estudiantes con discapacidad',
    DISCAPACIDAD_HEADERS,
  )

  const hasDisabilityValue = String(data.hasDisability || 'No')
    .trim()
    .toLowerCase()
  const hasDisability =
    hasDisabilityValue === 'sí' ||
    hasDisabilityValue === 'si' ||
    hasDisabilityValue === 'yes' ||
    hasDisabilityValue === 'true'

  if (hasDisability) {
    const discapacidadRow = [
      usuarioId,
      String(data.periodoRegistro || ''),
      String(data.dni || ''),
      String(data.nombres || '') || String(data.nombreCompleto || ''),
      String(data.disabilityType || ''),
      String(data.conadisCardNumber || ''),
      String(data.observaciones || ''),
      timestamp,
    ]

    const headers = discapacidadSheet
      .getRange(1, 1, 1, DISCAPACIDAD_HEADERS.length)
      .getValues()[0]
      .map((header) => String(header).trim())
    const headerIndex = headers.reduce((map, header, index) => {
      map[header] = index
      return map
    }, {})

    const rowsCount = discapacidadSheet.getLastRow() - 1
    const rows =
      rowsCount > 0
        ? discapacidadSheet
            .getRange(2, 1, rowsCount, discapacidadSheet.getLastColumn())
            .getValues()
        : []

    let foundRowIndex = null
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      const rowId = String(row[headerIndex['ID Usuario']] || '').trim()
      if (rowId === usuarioId) {
        foundRowIndex = i + 2
        break
      }
    }

    if (foundRowIndex) {
      discapacidadSheet
        .getRange(foundRowIndex, 1, 1, discapacidadRow.length)
        .setValues([discapacidadRow])
    } else {
      discapacidadSheet.appendRow(discapacidadRow)
    }
    discapacidadSheet.autoResizeColumns(1, discapacidadRow.length)
  }

  invalidateCache()

  return {
    success: true,
    action: 'guardarDiscapacidad',
    message: 'Información de discapacidad guardada correctamente',
    timestamp,
    usuarioId,
  }
}

function handleGuardarGestante(data, usuariosSheet, timestamp) {
  const usuarioId = String(data.usuarioId || data.id || '').trim()
  if (!usuarioId) {
    return {
      success: false,
      action: 'guardarGestante',
      message: 'UsuarioId es requerido',
      timestamp,
    }
  }

  const updatedUserId = updateUsuario(data, usuariosSheet, timestamp)
  if (!updatedUserId) {
    return {
      success: false,
      action: 'guardarGestante',
      message: 'Usuario no encontrado',
      timestamp,
    }
  }

  const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
  const gestantesSheet = getOrCreateSheet(
    spreadsheet,
    'Gestantes',
    GESTANTES_HEADERS,
  )

  const isPregnantValue = String(data.isPregnant || 'No')
    .trim()
    .toLowerCase()
  const isPregnant =
    isPregnantValue === 'sí' ||
    isPregnantValue === 'si' ||
    isPregnantValue === 'yes' ||
    isPregnantValue === 'true'

  if (isPregnant) {
    const gestanteRow = [
      usuarioId,
      String(data.periodo || ''),
      String(data.dni || ''),
      String(data.nombres || '') || String(data.nombreCompleto || ''),
      String(data.edad || ''),
      String(data.controlPrenatal || ''),
      String(data.fechaProbableParto || ''),
      String(data.telefono || ''),
      String(data.correoElectronico || ''),
      String(data.observaciones || ''),
      timestamp,
    ]

    const headers = gestantesSheet
      .getRange(1, 1, 1, GESTANTES_HEADERS.length)
      .getValues()[0]
      .map((header) => String(header).trim())
    const headerIndex = headers.reduce((map, header, index) => {
      map[header] = index
      return map
    }, {})

    const rowsCount = gestantesSheet.getLastRow() - 1
    const rows =
      rowsCount > 0
        ? gestantesSheet
            .getRange(2, 1, rowsCount, gestantesSheet.getLastColumn())
            .getValues()
        : []

    let foundRowIndex = null
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      const rowId = String(row[headerIndex['ID Usuario']] || '').trim()
      if (rowId === usuarioId) {
        foundRowIndex = i + 2
        break
      }
    }

    if (foundRowIndex) {
      gestantesSheet
        .getRange(foundRowIndex, 1, 1, gestanteRow.length)
        .setValues([gestanteRow])
    } else {
      gestantesSheet.appendRow(gestanteRow)
    }
    gestantesSheet.autoResizeColumns(1, gestanteRow.length)
  }

  invalidateCache()

  return {
    success: true,
    action: 'guardarGestante',
    message: 'Información de gestante guardada correctamente',
    timestamp,
    usuarioId,
  }
}

function handleGuardarSeguimientoDiscapacidad(data, timestamp) {
  const usuarioId = String(data.usuarioId || data.id || '').trim()
  if (!usuarioId) {
    return {
      success: false,
      action: 'guardarSeguimientoDiscapacidad',
      message: 'UsuarioId es requerido',
      timestamp,
    }
  }

  const periodoSeguimiento = String(data.periodoSeguimiento || '').trim()
  if (!periodoSeguimiento) {
    return {
      success: false,
      action: 'guardarSeguimientoDiscapacidad',
      message: 'Periodo de seguimiento es requerido',
      timestamp,
    }
  }

  const originalPeriodoSeguimiento = String(
    data.originalPeriodoSeguimiento || periodoSeguimiento,
  ).trim()

  const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
  const seguimientoSheet = getOrCreateSheet(
    spreadsheet,
    'Seguimiento discapacidad',
    SEGUIMIENTO_DISCAPACIDAD_HEADERS,
  )

  const headers = seguimientoSheet
    .getRange(1, 1, 1, SEGUIMIENTO_DISCAPACIDAD_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = seguimientoSheet.getLastRow() - 1
  const rows =
    rowsCount > 0
      ? seguimientoSheet
          .getRange(2, 1, rowsCount, seguimientoSheet.getLastColumn())
          .getValues()
      : []

  let foundRowIndex = null
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowUserId = String(row[headerIndex['ID Usuario']] || '').trim()
    const rowPeriodo = String(
      row[headerIndex['PERIODO SEGUIMIENTO']] || '',
    ).trim()
    if (rowUserId === usuarioId && rowPeriodo === originalPeriodoSeguimiento) {
      foundRowIndex = i + 2
      break
    }
  }

  const now = formatDateTime(new Date())
  const existingFechaRegistro = foundRowIndex
    ? formatDateTime(rows[foundRowIndex - 2][headerIndex['FECHA REGISTRO']])
    : ''
  const rowData = [
    usuarioId,
    periodoSeguimiento,
    String(data.dni || ''),
    String(data.nombres || data.nombreCompleto || ''),
    String(data.estudianteRegular || ''),
    String(data.carrera || data.programa || ''),
    String(data.ciclo || ''),
    String(data.seccion || ''),
    String(data.turno || ''),
    String(data.observaciones || ''),
    existingFechaRegistro || now,
  ]

  if (foundRowIndex) {
    seguimientoSheet
      .getRange(foundRowIndex, 1, 1, rowData.length)
      .setValues([rowData])
  } else {
    seguimientoSheet.appendRow(rowData)
  }

  seguimientoSheet.autoResizeColumns(1, rowData.length)

  invalidateCache()

  return {
    success: true,
    action: 'guardarSeguimientoDiscapacidad',
    message: foundRowIndex
      ? 'Seguimiento de discapacidad actualizado correctamente'
      : 'Seguimiento de discapacidad guardado correctamente',
    timestamp: now,
    usuarioId,
  }
}

function handleGuardarSeguimientoGestante(data, timestamp) {
  const usuarioId = String(data.usuarioId || data.id || '').trim()
  if (!usuarioId) {
    return {
      success: false,
      action: 'guardarSeguimientoGestante',
      message: 'UsuarioId es requerido',
      timestamp,
    }
  }

  const periodoSeguimiento = String(data.periodoSeguimiento || '').trim()
  if (!periodoSeguimiento) {
    return {
      success: false,
      action: 'guardarSeguimientoGestante',
      message: 'Periodo de seguimiento es requerido',
      timestamp,
    }
  }

  const originalPeriodoSeguimiento = String(
    data.originalPeriodoSeguimiento || periodoSeguimiento,
  ).trim()

  const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
  const seguimientoSheet = getOrCreateSheet(
    spreadsheet,
    'Seguimiento gestante',
    SEGUIMIENTO_GESTANTE_HEADERS,
  )

  const headers = seguimientoSheet
    .getRange(1, 1, 1, SEGUIMIENTO_GESTANTE_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = seguimientoSheet.getLastRow() - 1
  const rows =
    rowsCount > 0
      ? seguimientoSheet
          .getRange(2, 1, rowsCount, seguimientoSheet.getLastColumn())
          .getValues()
      : []

  let foundRowIndex = null
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowUserId = String(row[headerIndex['ID Usuario']] || '').trim()
    const rowPeriodo = String(
      row[headerIndex['PERIODO SEGUIMIENTO']] || '',
    ).trim()
    if (rowUserId === usuarioId && rowPeriodo === originalPeriodoSeguimiento) {
      foundRowIndex = i + 2
      break
    }
  }

  const now = timestamp
  const existingFechaRegistro = foundRowIndex
    ? formatDateTime(rows[foundRowIndex - 2][headerIndex['FECHA REGISTRO']])
    : ''
  const rowData = [
    usuarioId,
    periodoSeguimiento,
    String(data.dni || ''),
    String(data.nombres || data.nombreCompleto || ''),
    String(data.estudianteRegular || ''),
    String(data.carrera || ''),
    String(data.ciclo || ''),
    String(data.seccion || ''),
    String(data.turno || ''),
    String(data.controlPrenatal || ''),
    String(data.observaciones || ''),
    existingFechaRegistro || now,
  ]

  if (foundRowIndex) {
    seguimientoSheet
      .getRange(foundRowIndex, 1, 1, rowData.length)
      .setValues([rowData])
  } else {
    seguimientoSheet.appendRow(rowData)
  }

  seguimientoSheet.autoResizeColumns(1, rowData.length)

  invalidateCache()

  return {
    success: true,
    action: 'guardarSeguimientoGestante',
    message: foundRowIndex
      ? 'Seguimiento de gestante actualizado correctamente'
      : 'Seguimiento de gestante guardado correctamente',
    timestamp: now,
    usuarioId,
  }
}

function updateUsuario(data, usuariosSheet, timestamp) {
  const headerValues = usuariosSheet
    .getRange(1, 1, 1, usuariosSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headerValues.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = usuariosSheet.getLastRow() - 1
  const rows =
    rowsCount > 0
      ? usuariosSheet
          .getRange(2, 1, rowsCount, usuariosSheet.getLastColumn())
          .getValues()
      : []

  const usuarioId = String(data.usuarioId || data.id || '').trim()
  if (!usuarioId) {
    return null
  }

  let foundRow = null
  let foundRowIndex = null
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowId = String(row[headerIndex['ID Usuario']] || '').trim()
    if (rowId === usuarioId) {
      foundRow = row
      foundRowIndex = i + 2
      break
    }
  }

  if (!foundRowIndex) {
    return null
  }

  const shouldUpdateField = (fieldName) =>
    Object.prototype.hasOwnProperty.call(data, fieldName)

  const fullName = String(
    data.nombreCompleto ||
      `${data.apellidos || ''} ${data.nombres || ''}`.trim(),
  )

  const updatedRow = foundRow.map((existingValue, index) => {
    const header = headerValues[index]
    const trimmedExisting = String(existingValue || '').trim()

    switch (header) {
      case 'Nombre Completo':
        if (shouldUpdateField('nombreCompleto')) {
          return String(data.nombreCompleto || '').trim() || trimmedExisting
        }
        if (shouldUpdateField('nombres') || shouldUpdateField('apellidos')) {
          return fullName || trimmedExisting
        }
        return trimmedExisting
      case 'DNI':
        return shouldUpdateField('dni')
          ? String(data.dni || '').trim()
          : trimmedExisting
      case 'Edad':
        return shouldUpdateField('edad')
          ? String(data.edad || '').trim()
          : trimmedExisting
      case 'Sexo':
        return shouldUpdateField('sexo')
          ? String(data.sexo || '').trim()
          : trimmedExisting
      case 'Email':
        if (shouldUpdateField('correoElectronico')) {
          return String(data.correoElectronico || '').trim()
        }
        if (shouldUpdateField('email')) {
          return String(data.email || '').trim()
        }
        return trimmedExisting
      case 'Teléfono':
        return shouldUpdateField('telefono')
          ? String(data.telefono || '').trim()
          : trimmedExisting
      case 'Nacionalidad':
        return shouldUpdateField('nacionalidad')
          ? String(data.nacionalidad || '').trim()
          : trimmedExisting
      case 'Rol':
        return shouldUpdateField('rol')
          ? String(data.rol || '').trim()
          : trimmedExisting
      case 'Carrera':
        return shouldUpdateField('carrera')
          ? String(data.carrera || '').trim()
          : trimmedExisting
      case 'Ciclo':
        return shouldUpdateField('ciclo')
          ? String(data.ciclo || '').trim()
          : trimmedExisting
      case 'Sección':
        return shouldUpdateField('seccion')
          ? String(data.seccion || '').trim()
          : trimmedExisting
      case 'Área / Departamento':
        return shouldUpdateField('areaDepartamento')
          ? String(data.areaDepartamento || '').trim()
          : trimmedExisting
      case 'Cargo':
        return shouldUpdateField('cargo')
          ? String(data.cargo || '').trim()
          : trimmedExisting
      case 'Viviendo con':
        return shouldUpdateField('viviendoCon')
          ? String(data.viviendoCon || '').trim()
          : trimmedExisting
      case 'Tipo de Seguro':
        return shouldUpdateField('tipoSeguro')
          ? String(data.tipoSeguro || '').trim()
          : trimmedExisting
      case 'Embarazada':
        return shouldUpdateField('isPregnant')
          ? String(data.isPregnant || 'No').trim()
          : trimmedExisting
      case 'Discapacidad':
        return shouldUpdateField('hasDisability')
          ? String(data.hasDisability || 'No').trim()
          : trimmedExisting
      case 'Fecha de última actualización':
        return timestamp
      default:
        return trimmedExisting
    }
  })

  usuariosSheet
    .getRange(foundRowIndex, 1, 1, updatedRow.length)
    .setValues([updatedRow])

  return usuarioId
}

function createNewUsuario(data, usuariosSheet, timestamp) {
  const userId = String(data.usuarioId || data.id || Utilities.getUuid())

  const fullName = String(
    data.nombreCompleto ||
      `${data.apellidos || ''} ${data.nombres || ''}`.trim(),
  )

  const userRow = [
    userId,
    fullName,
    String(data.dni || ''),
    String(data.edad || ''),
    normalizeSexForSheet(data.sexo || ''),
    String(data.correoElectronico || data.email || ''),
    String(data.telefono || ''),
    String(data.nacionalidad || ''),
    String(data.rol || ''),
    String(data.carrera || ''),
    String(data.ciclo || ''),
    String(data.seccion || ''),
    String(data.areaDepartamento || ''),
    String(data.cargo || ''),
    String(data.viviendoCon || ''),
    String(data.tipoSeguro || ''),
    String(data.isPregnant || 'No'),
    String(data.hasDisability || 'No'),
    timestamp,
  ]

  usuariosSheet.appendRow(userRow)

  return userId
}

function doGet(e) {
  const action = e.parameter.action ? String(e.parameter.action).trim() : ''

  console.log('GET action:', action)

  if (action === 'listarUsuariosReporte') {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )
    const role = String(e.parameter.role || '')
      .trim()
      .toLowerCase()
    const onlyStudents = isTruthyParam(e.parameter.onlyStudents)
    const carrera = String(e.parameter.carrera || '').trim()
    const ciclo = String(e.parameter.ciclo || '').trim()
    const sexo = String(e.parameter.sexo || '').trim()
    const users = listSheetObjects(usuariosSheet, USUARIOS_HEADERS)
      .map((user) => {
        const formatted = { ...user }
        formatted['Fecha de última actualización'] = formatDateTime(
          user['Fecha de última actualización'] || '',
        )
        return formatted
      })
      .filter((user) => {
        const userRole = String(user.Rol || '')
          .trim()
          .toLowerCase()
        const matchesRole = (() => {
          if (role === 'admin') {
            return userRole.includes('admin')
          }
          if (role === 'estudiantes' || onlyStudents) {
            return userRole.includes('estudiante')
          }
          return true
        })()
        const matchesCarrera =
          !carrera ||
          carrera === 'Todos' ||
          String(user.Carrera || '').trim() === carrera
        const matchesCiclo =
          !ciclo ||
          ciclo === 'Todos' ||
          String(user.Ciclo || '').trim() === ciclo
        const matchesSexo =
          !sexo ||
          sexo === 'Todos' ||
          normalizeSexFilter(user.Sexo || '') === normalizeSexFilter(sexo)

        return matchesRole && matchesCarrera && matchesCiclo && matchesSexo
      })
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, action, users }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarConsultasReporte') {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const atencionesSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_ATENCIONES,
      ATENCIONES_HEADERS,
    )
    const seguimientoAtencionSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento Atencion',
      SEGUIMIENTO_ATENCION_HEADERS,
    )
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )
    const attendances = findAllAttendancesWithUserType(
      usuariosSheet,
      atencionesSheet,
      seguimientoAtencionSheet,
    )
    const dateRange = String(e.parameter.dateRange || 'Todos').trim()
    const startDate = String(e.parameter.startDate || '').trim()
    const endDate = String(e.parameter.endDate || '').trim()
    const onlyFollowUps = isTruthyParam(e.parameter.onlyFollowUps)
    const role = String(e.parameter.role || '')
      .trim()
      .toLowerCase()
    const ciclo = String(e.parameter.ciclo || '').trim()
    const programa = String(e.parameter.programa || '').trim()
    const periodo = String(e.parameter.periodo || '').trim()

    const filteredAttendances = attendances.filter((attendance) => {
      const matchesDateRange =
        dateRange === 'Personalizado'
          ? isReportDateInExportRange(
              attendance.fechaAtencion,
              dateRange,
              startDate,
              endDate,
            )
          : isReportDateInRange(attendance.fechaAtencion, dateRange)

      const matchesFollowUps =
        !onlyFollowUps || (attendance.followUps || []).length > 0
      const userType = String(attendance.userType || '')
        .trim()
        .toLowerCase()
      const matchesRole = (() => {
        if (!role || role === 'todos') {
          return true
        }
        if (role === 'estudiantes') {
          return userType.includes('estudiante')
        }
        if (role === 'administrativos') {
          return userType.includes('administr')
        }
        return true
      })()
      const matchesCiclo =
        !ciclo ||
        ciclo === 'Todos' ||
        String(attendance.ciclo || '').trim() === ciclo
      const matchesPrograma =
        !programa ||
        programa === 'Todos' ||
        String(attendance.programa || '').trim() === programa
      const matchesPeriodo =
        !periodo ||
        periodo === 'Todos' ||
        String(attendance.periodo || '').trim() === periodo

      return (
        matchesDateRange &&
        matchesFollowUps &&
        matchesRole &&
        matchesCiclo &&
        matchesPrograma &&
        matchesPeriodo
      )
    })
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        action,
        attendances: filteredAttendances,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarGestantesReporte') {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const gestantesSheet = getOrCreateSheet(
      spreadsheet,
      'Gestantes',
      GESTANTES_HEADERS,
    )
    const seguimientoSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento gestante',
      SEGUIMIENTO_GESTANTE_HEADERS,
    )

    const report = buildGestantesReportRows(gestantesSheet, seguimientoSheet)
    const startDate = String(e.parameter.startDate || '').trim()
    const endDate = String(e.parameter.endDate || '').trim()
    const withoutCurrentPeriodFollowUps = isTruthyParam(
      e.parameter.withoutCurrentPeriodFollowUps,
    )

    const filteredRows = report.rows.filter((row) => {
      const matchesDateRange =
        !startDate && !endDate
          ? true
          : isReportDateInExportRange(
              row['FECHA REGISTRO'],
              'Personalizado',
              startDate,
              endDate,
            )
      const currentFollowUp = row.followUpsByPeriod[DEFAULT_ACADEMIC_PERIOD]
      const matchesCurrentPeriod =
        !withoutCurrentPeriodFollowUps ||
        !hasMeaningfulFollowUp(currentFollowUp)

      return matchesDateRange && matchesCurrentPeriod
    })

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        action,
        gestantes: filteredRows,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarDiscapacidadReporte') {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const discapacidadSheet = getOrCreateSheet(
      spreadsheet,
      'Estudiantes con discapacidad',
      DISCAPACIDAD_HEADERS,
    )
    const seguimientoSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento discapacidad',
      SEGUIMIENTO_DISCAPACIDAD_HEADERS,
    )
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )
    const report = buildDiscapacidadReporteRows(
      usuariosSheet,
      discapacidadSheet,
      seguimientoSheet,
    )
    const startDate = String(e.parameter.startDate || '').trim()
    const endDate = String(e.parameter.endDate || '').trim()
    const withoutCurrentPeriodFollowUps = isTruthyParam(
      e.parameter.withoutCurrentPeriodFollowUps,
    )
    const filteredRows = report.rows.filter((row) => {
      const matchesDateRange =
        !startDate && !endDate
          ? true
          : isReportDateInExportRange(
              row['FECHA REGISTRO'],
              'Personalizado',
              startDate,
              endDate,
            )
      const currentFollowUp = row.followUpsByPeriod[DEFAULT_ACADEMIC_PERIOD]
      const matchesCurrentPeriod =
        !withoutCurrentPeriodFollowUps ||
        !hasMeaningfulFollowUp(currentFollowUp)

      return matchesDateRange && matchesCurrentPeriod
    })
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, action, discapacidad: filteredRows }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'buscarUsuario') {
    const query = String(e.parameter.query || '').trim()
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )
    const atencionesSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_ATENCIONES,
      ATENCIONES_HEADERS,
    )

    const users = findUsers(query, usuariosSheet, atencionesSheet)
    const payload = {
      success: true,
      action,
      users,
      query,
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'buscarUsuarioPorId') {
    const id = String(e.parameter.id || '').trim()
    const cached = getCachedResponse(action, id)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )

    const user = findUserById(id, usuariosSheet)
    const payload = {
      success: !!user,
      action,
      user: user || null,
      message: user ? 'Usuario encontrado' : 'Usuario no encontrado',
    }
    setCachedResponse(action, id, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'buscarDiscapacidadPorUsuarioId') {
    const usuarioId = String(e.parameter.usuarioId || '').trim()
    const cached = getCachedResponse(action, usuarioId)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const discapacidadSheet = getOrCreateSheet(
      spreadsheet,
      'Estudiantes con discapacidad',
      DISCAPACIDAD_HEADERS,
    )

    const discapacidadDetail = findDiscapacidadByUsuarioId(
      usuarioId,
      discapacidadSheet,
    )
    const payload = {
      success: true,
      action,
      discapacidadDetail: discapacidadDetail || null,
    }
    setCachedResponse(action, usuarioId, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'buscarGestantePorUsuarioId') {
    const usuarioId = String(e.parameter.usuarioId || '').trim()
    const cached = getCachedResponse(action, usuarioId)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const gestantesSheet = getOrCreateSheet(
      spreadsheet,
      'Gestantes',
      GESTANTES_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Seguimiento gestante',
      SEGUIMIENTO_GESTANTE_HEADERS,
    )

    const gestanteDetail = findGestanteByUsuarioId(usuarioId, gestantesSheet)
    const payload = {
      success: true,
      action,
      gestanteDetail: gestanteDetail || null,
    }
    setCachedResponse(action, usuarioId, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarSeguimientoDiscapacidadPorUsuarioId') {
    const usuarioId = String(e.parameter.usuarioId || '').trim()
    const cached = getCachedResponse(action, usuarioId)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const seguimientoSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento discapacidad',
      SEGUIMIENTO_DISCAPACIDAD_HEADERS,
    )

    const followUps = findSeguimientoDiscapacidadByUsuarioId(
      usuarioId,
      seguimientoSheet,
    )
    const payload = {
      success: true,
      action,
      followUps,
    }
    setCachedResponse(action, usuarioId, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarSeguimientoGestantePorUsuarioId') {
    const usuarioId = String(e.parameter.usuarioId || '').trim()
    const cached = getCachedResponse(action, usuarioId)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const seguimientoSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento gestante',
      SEGUIMIENTO_GESTANTE_HEADERS,
    )

    const followUps = findSeguimientoGestanteByUsuarioId(
      usuarioId,
      seguimientoSheet,
    )
    const payload = {
      success: true,
      action,
      followUps,
    }
    setCachedResponse(action, usuarioId, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarHistorialAtenciones') {
    const cached = getCachedResponse(action, 'all')
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const usuariosSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_USUARIOS,
      USUARIOS_HEADERS,
    )
    const atencionesSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_ATENCIONES,
      ATENCIONES_HEADERS,
    )
    const seguimientoAtencionSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento Atencion',
      SEGUIMIENTO_ATENCION_HEADERS,
    )

    const attendances = findAllAttendancesWithUserType(
      usuariosSheet,
      atencionesSheet,
      seguimientoAtencionSheet,
    )
    const payload = {
      success: true,
      action,
      attendances,
    }
    setCachedResponse(action, 'all', payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarAtencionesPorUsuario') {
    const usuarioId = String(e.parameter.usuarioId || '').trim()
    if (!usuarioId) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          action,
          attendances: [],
          message: 'Falta el ID del usuario',
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const cached = getCachedResponse(action, usuarioId)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const atencionesSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_ATENCIONES,
      ATENCIONES_HEADERS,
    )
    const seguimientoAtencionSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento Atencion',
      SEGUIMIENTO_ATENCION_HEADERS,
    )

    const attendances = findAttendancesByUsuarioId(
      usuarioId,
      atencionesSheet,
      seguimientoAtencionSheet,
    )
    const payload = {
      success: true,
      action,
      attendances,
    }
    setCachedResponse(action, usuarioId, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarSeguimientoAtencionPorOrden') {
    const orden = String(e.parameter.orden || '').trim()
    const cached = getCachedResponse(action, orden)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const seguimientoAtencionSheet = getOrCreateSheet(
      spreadsheet,
      'Seguimiento Atencion',
      SEGUIMIENTO_ATENCION_HEADERS,
    )

    const followUps = findSeguimientoAtencionByOrden(
      orden,
      seguimientoAtencionSheet,
    )
    const payload = {
      success: true,
      action,
      followUps,
    }
    setCachedResponse(action, orden, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'buscarAtencionPorOrden') {
    const orden = String(e.parameter.orden || '').trim()
    const cached = getCachedResponse(action, orden)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const atencionesSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_ATENCIONES,
      ATENCIONES_HEADERS,
    )

    const attendance = findAttendanceByOrden(orden, atencionesSheet)
    const payload = {
      success: !!attendance,
      action,
      attendance: attendance || null,
      message: attendance ? 'Atención encontrada' : 'Atención no encontrada',
    }
    setCachedResponse(action, orden, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listarSupervisionesCafeteria') {
    const cached = getCachedResponse(action, 'all')
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const cafeteriaSheet = getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_CAFETERIA_SUPERVISION,
      CAFETERIA_SUPERVISION_HEADERS,
    )

    const records = findAllCafeteriaSupervisions(cafeteriaSheet)
    const payload = {
      success: true,
      action,
      records,
    }
    setCachedResponse(action, 'all', payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listSurveyConfigs') {
    const cached = getCachedResponse(action, 'all')
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const configSheet = getOrCreateSheet(
      spreadsheet,
      'Configuracion Encuestas',
      SURVEY_CONFIG_HEADERS,
    )
    const configs = listSurveyConfigs(configSheet)
    const payload = {
      success: true,
      action,
      configs,
    }
    setCachedResponse(action, 'all', payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'getSurveyConfigById') {
    const id = String(e.parameter.id || '').trim()
    const cached = getCachedResponse(action, id)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const configSheet = getOrCreateSheet(
      spreadsheet,
      'Configuracion Encuestas',
      SURVEY_CONFIG_HEADERS,
    )
    const config = findSurveyConfigById(configSheet, id)
    const payload = {
      success: !!config,
      action,
      config: config || null,
      message: config
        ? 'Configuración encontrada'
        : 'Configuración no encontrada',
    }
    setCachedResponse(action, id, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  if (action === 'listSurveyResponses') {
    const type = String(e.parameter.type || '').trim()
    const period = String(e.parameter.period || '').trim()
    const configId = String(e.parameter.configId || '').trim()
    const cacheKey = configId || `${type}:${period}`
    const cached = getCachedResponse(action, cacheKey)
    if (cached) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ...cached,
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    const surveySheet = getSurveyResponseSheet(spreadsheet, type)
    if (!surveySheet) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          action,
          message: 'Tipo de encuesta no soportado',
          timestamp: new Date().toISOString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const responses = listSurveyResponses(surveySheet, type, period, configId)
    const payload = {
      success: true,
      action,
      responses,
    }
    setCachedResponse(action, cacheKey, payload)

    return ContentService.createTextOutput(
      JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  const response = {
    success: true,
    action: action || null,
    message: 'API de formulario de enfermería funcionando',
    timestamp: new Date().toISOString(),
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

function formatDateTime(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, 'America/Lima', 'dd/MM/yyyy, HH:mm')
  }

  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return ''
  }

  const isoDate = trimmed.match(/^\d{4}-\d{2}-\d{2}$/)
  if (isoDate) {
    const [year, month, day] = trimmed.split('-')
    return `${day}/${month}/${year}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'America/Lima', 'dd/MM/yyyy, HH:mm')
  }

  return trimmed
}

function formatSheetDate(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, 'America/Lima', 'dd/MM/yyyy')
  }

  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return ''
  }

  const isoDate = trimmed.match(/^\d{4}-\d{2}-\d{2}$/)
  if (isoDate) {
    const [year, month, day] = trimmed.split('-')
    return `${day}/${month}/${year}`
  }

  const timeOnly = trimmed.match(/^\d{1,2}:\d{2}(?::\d{2})?$/)
  if (timeOnly) {
    return timeOnly[0].slice(0, 5)
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'America/Lima', 'dd/MM/yyyy')
  }

  return trimmed
}

function formatSheetTime(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, 'America/Lima', 'HH:mm')
  }

  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return ''
  }

  const timeOnly = trimmed.match(/^\d{1,2}:\d{2}(?::\d{2})?$/)
  if (timeOnly) {
    return timeOnly[0].slice(0, 5)
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'America/Lima', 'HH:mm')
  }

  return trimmed
}

function extractAttendanceTime(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return ''
  }

  const trailingTime = trimmed.match(
    /(?:,|\s)([0-9]{1,2}:[0-9]{2})(?::[0-9]{2})?$/,
  )
  if (trailingTime) {
    return trailingTime[1].padStart(5, '0')
  }

  const timeOnly = trimmed.match(/^([0-9]{1,2}:[0-9]{2})(?::[0-9]{2})?$/)
  if (timeOnly) {
    return timeOnly[1].padStart(5, '0')
  }

  return formatSheetTime(trimmed)
}

function normalizeSexForSheet(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (normalized === 'm' || normalized.startsWith('masc')) {
    return 'M'
  }

  if (normalized === 'f' || normalized.startsWith('fem')) {
    return 'F'
  }

  return String(value || '').trim()
}

function normalizeSexFilter(value) {
  return normalizeSexForSheet(value).toUpperCase()
}

function findUsers(query, usuariosSheet, atencionesSheet) {
  const queryValue = String(query || '')
    .trim()
    .toLowerCase()

  const headers = usuariosSheet
    .getRange(1, 1, 1, usuariosSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = usuariosSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = usuariosSheet
    .getRange(2, 1, rowsCount, usuariosSheet.getLastColumn())
    .getValues()

  return rows
    .map((row) => {
      const id = String(row[headerIndex['ID Usuario']] || '').trim()
      return {
        id,
        nombreCompleto: String(
          row[headerIndex['Nombre Completo']] || '',
        ).trim(),
        dni: String(row[headerIndex['DNI']] || '').trim(),
        celular: String(row[headerIndex['Teléfono']] || '').trim(),
        correoElectronico: String(row[headerIndex['Email']] || '').trim(),
        nacionalidad: String(row[headerIndex['Nacionalidad']] || '').trim(),
        rol: String(row[headerIndex['Rol']] || '').trim(),
        carrera: String(row[headerIndex['Carrera']] || '').trim(),
        ciclo: String(row[headerIndex['Ciclo']] || '').trim(),
        seccion: String(row[headerIndex['Sección']] || '').trim(),
        areaDepartamento: String(
          row[headerIndex['Área / Departamento']] || '',
        ).trim(),
        cargo: String(row[headerIndex['Cargo']] || '').trim(),
        viviendoCon: String(row[headerIndex['Viviendo con']] || '').trim(),
        tipoSeguro: String(row[headerIndex['Tipo de Seguro']] || '').trim(),
        isPregnant: String(row[headerIndex['Embarazada']] || '').trim(),
        hasDisability: String(row[headerIndex['Discapacidad']] || '').trim(),
        fechaUltimaActualizacion: formatDateTime(
          row[headerIndex['Fecha de última actualización']] || '',
        ),
        edad: String(row[headerIndex['Edad']] || '').trim(),
        sexo: String(row[headerIndex['Sexo']] || '').trim(),
      }
    })
    .filter((user) => {
      if (!queryValue) {
        return true
      }
      const searchFields = [
        user.id,
        user.nombreCompleto,
        user.dni,
        user.correoElectronico,
        user.celular,
        user.nacionalidad,
        user.rol,
        user.carrera,
        user.ciclo,
        user.seccion,
      ]
      return searchFields.some((field) =>
        String(field).toLowerCase().includes(queryValue),
      )
    })
}

function findUserById(id, usuariosSheet) {
  const headers = usuariosSheet
    .getRange(1, 1, 1, usuariosSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = usuariosSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return null
  }

  const rows = usuariosSheet
    .getRange(2, 1, rowsCount, usuariosSheet.getLastColumn())
    .getValues()

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowId = String(row[headerIndex['ID Usuario']] || '').trim()
    if (rowId === id) {
      return {
        id: rowId,
        nombreCompleto: String(
          row[headerIndex['Nombre Completo']] || '',
        ).trim(),
        dni: String(row[headerIndex['DNI']] || '').trim(),
        edad: String(row[headerIndex['Edad']] || '').trim(),
        sexo: String(row[headerIndex['Sexo']] || '').trim(),
        correoElectronico: String(row[headerIndex['Email']] || '').trim(),
        telefono: String(row[headerIndex['Teléfono']] || '').trim(),
        nacionalidad: String(row[headerIndex['Nacionalidad']] || '').trim(),
        rol: String(row[headerIndex['Rol']] || '').trim(),
        carrera: String(row[headerIndex['Carrera']] || '').trim(),
        ciclo: String(row[headerIndex['Ciclo']] || '').trim(),
        seccion: String(row[headerIndex['Sección']] || '').trim(),
        areaDepartamento: String(
          row[headerIndex['Área / Departamento']] || '',
        ).trim(),
        cargo: String(row[headerIndex['Cargo']] || '').trim(),
        viviendoCon: String(row[headerIndex['Viviendo con']] || '').trim(),
        tipoSeguro: String(row[headerIndex['Tipo de Seguro']] || '').trim(),
        isPregnant: String(row[headerIndex['Embarazada']] || '').trim(),
        hasDisability: String(row[headerIndex['Discapacidad']] || '').trim(),
        fechaUltimaActualizacion: formatDateTime(
          row[headerIndex['Fecha de última actualización']] || '',
        ),
      }
    }
  }

  return null
}

function findAttendancesByUsuarioId(
  usuarioId,
  atencionesSheet,
  seguimientoAtencionSheet,
) {
  if (!usuarioId) {
    return []
  }

  ensureSheetHeader(atencionesSheet, 'HORA DE SALIDA')
  const headers = atencionesSheet
    .getRange(1, 1, 1, atencionesSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = atencionesSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = atencionesSheet
    .getRange(2, 1, rowsCount, atencionesSheet.getLastColumn())
    .getValues()

  return rows
    .map((row) => ({
      orden: String(row[headerIndex['N° ORDEN']] || '').trim(),
      fechaAtencion: formatSheetDate(
        row[headerIndex['FECHA DE ATENCIÓN']] || '',
      ),
      horaSalida: formatSheetTime(
        row[headerIndex['HORA DE SALIDA']] ||
          extractAttendanceTime(row[headerIndex['FECHA DE ATENCIÓN']] || ''),
      ),
      usuarioId: String(row[headerIndex['ID Usuario']] || '').trim(),
      nombreCompleto: String(row[headerIndex['Nombre Completo']] || '').trim(),
      edad: String(row[headerIndex['EDAD']] || '').trim(),
      dni: String(row[headerIndex['DNI']] || '').trim(),
      celular: String(row[headerIndex['N° DE CELULAR']] || '').trim(),
      correoElectronico: String(
        row[headerIndex['CORREO ELECTRONICO']] || '',
      ).trim(),
      programa: String(row[headerIndex['PROGRAMA']] || '').trim(),
      ciclo: String(row[headerIndex['CICLO']] || '').trim(),
      periodo: String(row[headerIndex['PERIODO']] || '').trim(),
      seccion: String(row[headerIndex['SECCIÓN']] || '').trim(),
      motivoAtencion: String(
        row[headerIndex['MOTIVO DE ATENCIÓN']] || '',
      ).trim(),
      areaProblematica: String(
        row[headerIndex['ÁREA PROBLEMÁTICA PRINCIPAL']] || '',
      ).trim(),
      medioContacto: String(row[headerIndex['MEDIO DE CONTACTO']] || '').trim(),
      observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
      resultado: String(row[headerIndex['RESULTADO']] || '').trim(),
      followUps: findSeguimientoAtencionByOrden(
        String(row[headerIndex['N° ORDEN']] || '').trim(),
        seguimientoAtencionSheet,
      ),
    }))
    .filter((row) => row.usuarioId === usuarioId)
}

function findAllAttendancesWithUserType(
  usuariosSheet,
  atencionesSheet,
  seguimientoAtencionSheet,
) {
  const userHeaders = usuariosSheet
    .getRange(1, 1, 1, usuariosSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const userHeaderIndex = userHeaders.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const userRowsCount = usuariosSheet.getLastRow() - 1
  const userRows =
    userRowsCount > 0
      ? usuariosSheet
          .getRange(2, 1, userRowsCount, usuariosSheet.getLastColumn())
          .getValues()
      : []

  const userRoleById = {}
  for (let i = 0; i < userRows.length; i += 1) {
    const row = userRows[i]
    const rowId = String(row[userHeaderIndex['ID Usuario']] || '').trim()
    if (!rowId) {
      continue
    }
    userRoleById[rowId] = String(row[userHeaderIndex['Rol']] || '').trim()
  }

  ensureSheetHeader(atencionesSheet, 'HORA DE SALIDA')
  const headers = atencionesSheet
    .getRange(1, 1, 1, atencionesSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = atencionesSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = atencionesSheet
    .getRange(2, 1, rowsCount, atencionesSheet.getLastColumn())
    .getValues()

  return rows.map((row) => {
    const usuarioId = String(row[headerIndex['ID Usuario']] || '').trim()
    const role = userRoleById[usuarioId] || ''
    const userType = getUserTypeFromRole(role)

    return {
      orden: String(row[headerIndex['N° ORDEN']] || '').trim(),
      fechaAtencion: formatDateTime(
        row[headerIndex['FECHA DE ATENCIÓN']] || '',
      ),
      horaAtencion: formatSheetTime(
        row[headerIndex['FECHA DE ATENCIÓN']] || '',
      ),
      horaSalida: formatSheetTime(
        row[headerIndex['HORA DE SALIDA']] ||
          extractAttendanceTime(row[headerIndex['FECHA DE ATENCIÓN']] || ''),
      ),
      usuarioId,
      nombreCompleto: String(row[headerIndex['Nombre Completo']] || '').trim(),
      dni: String(row[headerIndex['DNI']] || '').trim(),
      programa: String(row[headerIndex['PROGRAMA']] || '').trim(),
      ciclo: String(row[headerIndex['CICLO']] || '').trim(),
      periodo: String(row[headerIndex['PERIODO']] || '').trim(),
      seccion: String(row[headerIndex['SECCIÓN']] || '').trim(),
      motivoAtencion: String(
        row[headerIndex['MOTIVO DE ATENCIÓN']] || '',
      ).trim(),
      areaProblematica: String(
        row[headerIndex['ÁREA PROBLEMÁTICA PRINCIPAL']] || '',
      ).trim(),
      resultado: String(row[headerIndex['RESULTADO']] || '').trim(),
      observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
      correoElectronico: String(
        row[headerIndex['CORREO ELECTRONICO']] || '',
      ).trim(),
      userType,
      followUps: findSeguimientoAtencionByOrden(
        String(row[headerIndex['N° ORDEN']] || '').trim(),
        seguimientoAtencionSheet,
      ),
    }
  })
}

function getUserTypeFromRole(role) {
  const normalized = String(role || '')
    .trim()
    .toLowerCase()
  if (normalized.includes('estudiante')) {
    return 'Estudiante'
  }
  if (normalized.includes('administr') || normalized.includes('admin')) {
    return 'Administrativo'
  }
  if (normalized.includes('docente')) {
    return 'Docente'
  }
  return role || 'Otro'
}

function findDiscapacidadByUsuarioId(usuarioId, discapacidadSheet) {
  if (!usuarioId) {
    return null
  }

  const headers = discapacidadSheet
    .getRange(1, 1, 1, discapacidadSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = discapacidadSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return null
  }

  const rows = discapacidadSheet
    .getRange(2, 1, rowsCount, discapacidadSheet.getLastColumn())
    .getValues()

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowId = String(row[headerIndex['ID Usuario']] || '').trim()
    if (rowId === usuarioId) {
      return {
        usuarioId: rowId,
        periodoRegistro: String(
          row[headerIndex['PERIODO REGISTRO']] || '',
        ).trim(),
        disabilityType: String(row[headerIndex['DISCAPACIDAD']] || '').trim(),
        conadisCardNumber: String(
          row[headerIndex['CARNET - CONADIS']] || '',
        ).trim(),
        observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
      }
    }
  }

  return null
}

function findGestanteByUsuarioId(usuarioId, gestantesSheet) {
  if (!usuarioId) {
    return null
  }

  const headers = gestantesSheet
    .getRange(1, 1, 1, gestantesSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = gestantesSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return null
  }

  const rows = gestantesSheet
    .getRange(2, 1, rowsCount, gestantesSheet.getLastColumn())
    .getValues()

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowId = String(row[headerIndex['ID Usuario']] || '').trim()
    if (rowId === usuarioId) {
      return {
        usuarioId: rowId,
        periodoRegistrado: String(
          row[headerIndex['PERIODO REGISTRADO']] || '',
        ).trim(),
        controlPrenatal: String(
          row[headerIndex['CONTROL PRENATAL']] || '',
        ).trim(),
        fechaProbableParto: formatSheetDate(
          row[headerIndex['FECHA PROBABLE DE PARTO']] || '',
        ),
        estudianteRegular: String(
          row[headerIndex['ESTUDIANTE REGULAR']] || '',
        ).trim(),
        observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
      }
    }
  }

  return null
}

function findSeguimientoDiscapacidadByUsuarioId(usuarioId, seguimientoSheet) {
  if (!usuarioId) {
    return []
  }

  const headers = seguimientoSheet
    .getRange(1, 1, 1, seguimientoSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = seguimientoSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = seguimientoSheet
    .getRange(2, 1, rowsCount, seguimientoSheet.getLastColumn())
    .getValues()

  return rows
    .map((row) => ({
      usuarioId: String(row[headerIndex['ID Usuario']] || '').trim(),
      periodoSeguimiento: String(
        row[headerIndex['PERIODO SEGUIMIENTO']] || '',
      ).trim(),
      dni: String(row[headerIndex['DNI']] || '').trim(),
      nombres: String(row[headerIndex['NOMBRES']] || '').trim(),
      estudianteRegular: String(
        row[headerIndex['ESTUDIANTE REGULAR']] || '',
      ).trim(),
      carrera: String(row[headerIndex['CARRERA']] || '').trim(),
      ciclo: String(row[headerIndex['CICLO']] || '').trim(),
      turno: String(row[headerIndex['TURNO']] || '').trim(),
      observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
      fechaRegistro: formatDateTime(row[headerIndex['FECHA REGISTRO']] || ''),
    }))
    .filter((row) => row.usuarioId === usuarioId)
}

function findSeguimientoGestanteByUsuarioId(usuarioId, seguimientoSheet) {
  if (!usuarioId) {
    return []
  }

  const headers = seguimientoSheet
    .getRange(1, 1, 1, seguimientoSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = seguimientoSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = seguimientoSheet
    .getRange(2, 1, rowsCount, seguimientoSheet.getLastColumn())
    .getValues()

  return rows
    .map((row) => ({
      usuarioId: String(row[headerIndex['ID Usuario']] || '').trim(),
      periodoSeguimiento: String(
        row[headerIndex['PERIODO SEGUIMIENTO']] || '',
      ).trim(),
      dni: String(row[headerIndex['DNI']] || '').trim(),
      nombres: String(row[headerIndex['NOMBRES']] || '').trim(),
      estudianteRegular: String(
        row[headerIndex['ESTUDIANTE REGULAR']] || '',
      ).trim(),
      carrera: String(row[headerIndex['CARRERA']] || '').trim(),
      ciclo: String(row[headerIndex['CICLO']] || '').trim(),
      turno: String(row[headerIndex['TURNO']] || '').trim(),
      controlPrenatal: String(
        row[headerIndex['CONTROL PRENATAL']] || '',
      ).trim(),
      observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
      fechaRegistro: formatDateTime(row[headerIndex['FECHA REGISTRO']] || ''),
    }))
    .filter((row) => row.usuarioId === usuarioId)
}

function findAttendanceByOrden(orden, atencionesSheet) {
  ensureSheetHeader(atencionesSheet, 'HORA DE SALIDA')
  const headers = atencionesSheet
    .getRange(1, 1, 1, atencionesSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = atencionesSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return null
  }

  const rows = atencionesSheet
    .getRange(2, 1, rowsCount, atencionesSheet.getLastColumn())
    .getValues()

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowOrden = String(row[headerIndex['N° ORDEN']] || '').trim()
    if (rowOrden === orden) {
      return {
        orden: rowOrden,
        fechaAtencion: formatSheetDate(
          row[headerIndex['FECHA DE ATENCIÓN']] || '',
        ),
        horaSalida: formatSheetTime(
          row[headerIndex['HORA DE SALIDA']] ||
            extractAttendanceTime(row[headerIndex['FECHA DE ATENCIÓN']] || ''),
        ),
        usuarioId: String(row[headerIndex['ID Usuario']] || '').trim(),
        nombreCompleto: String(
          row[headerIndex['Nombre Completo']] || '',
        ).trim(),
        edad: String(row[headerIndex['EDAD']] || '').trim(),
        dni: String(row[headerIndex['DNI']] || '').trim(),
        celular: String(row[headerIndex['N° DE CELULAR']] || '').trim(),
        correoElectronico: String(
          row[headerIndex['CORREO ELECTRONICO']] || '',
        ).trim(),
        programa: String(row[headerIndex['PROGRAMA']] || '').trim(),
        ciclo: String(row[headerIndex['CICLO']] || '').trim(),
        periodo: String(row[headerIndex['PERIODO']] || '').trim(),
        motivoAtencion: String(
          row[headerIndex['MOTIVO DE ATENCIÓN']] || '',
        ).trim(),
        areaProblematica: String(
          row[headerIndex['ÁREA PROBLEMÁTICA PRINCIPAL']] || '',
        ).trim(),
        medioContacto: String(
          row[headerIndex['MEDIO DE CONTACTO']] || '',
        ).trim(),
        observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
        resultado: String(row[headerIndex['RESULTADO']] || '').trim(),
      }
    }
  }

  return null
}

function findSeguimientoAtencionByOrden(orden, seguimientoSheet) {
  if (!orden) {
    return []
  }

  const headers = seguimientoSheet
    .getRange(1, 1, 1, seguimientoSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = seguimientoSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = seguimientoSheet
    .getRange(2, 1, rowsCount, seguimientoSheet.getLastColumn())
    .getValues()

  return rows
    .map((row) => ({
      idSeguimiento: String(row[headerIndex['ID Seguimiento']] || '').trim(),
      idAtencion: String(row[headerIndex['ID Atencion']] || '').trim(),
      fechaSeguimiento: formatSheetDate(
        row[headerIndex['FECHA SEGUIMIENTO']] || '',
      ),
      hora: formatSheetTime(row[headerIndex['HORA']] || ''),
      asistio: String(row[headerIndex['ASISTIO']] || '').trim(),
      nivelCompromiso: String(
        row[headerIndex['NIVEL DE COMPROMISO']] || '',
      ).trim(),
      observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
    }))
    .filter((row) => row.idAtencion === orden)
}

function findSeguimientoAtencionById(idSeguimiento, seguimientoSheet) {
  if (!idSeguimiento) {
    return null
  }

  const headers = seguimientoSheet
    .getRange(1, 1, 1, seguimientoSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = seguimientoSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return null
  }

  const rows = seguimientoSheet
    .getRange(2, 1, rowsCount, seguimientoSheet.getLastColumn())
    .getValues()

  for (let i = 0; i < rows.length; i += 1) {
    if (
      String(rows[i][headerIndex['ID Seguimiento']] || '').trim() ===
      idSeguimiento
    ) {
      return {
        rowIndex: i + 2,
        row: rows[i],
      }
    }
  }

  return null
}

function handleActualizarSeguimientoAtencion(
  data,
  seguimientoAtencionSheet,
  timestamp,
) {
  const idSeguimiento = String(data.idSeguimiento || '').trim()
  if (!idSeguimiento) {
    return {
      success: false,
      action: 'actualizarSeguimientoAtencion',
      message: 'ID de seguimiento es requerido',
      timestamp,
    }
  }

  const found = findSeguimientoAtencionById(
    idSeguimiento,
    seguimientoAtencionSheet,
  )
  if (!found) {
    return {
      success: false,
      action: 'actualizarSeguimientoAtencion',
      message: 'Seguimiento no encontrado',
      timestamp,
    }
  }

  const headers = seguimientoAtencionSheet
    .getRange(1, 1, 1, seguimientoAtencionSheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const row = found.row.slice()
  row[headerIndex['FECHA SEGUIMIENTO']] = formatSheetDate(
    String(
      data.fechaSeguimiento || row[headerIndex['FECHA SEGUIMIENTO']] || '',
    ).trim(),
  )
  row[headerIndex['HORA']] = formatSheetTime(
    String(data.hora || row[headerIndex['HORA']] || '').trim(),
  )
  row[headerIndex['ASISTIO']] = String(
    data.asistio || row[headerIndex['ASISTIO']] || '',
  ).trim()
  row[headerIndex['NIVEL DE COMPROMISO']] = String(
    data.nivelCompromiso || row[headerIndex['NIVEL DE COMPROMISO']] || '',
  ).trim()
  row[headerIndex['OBSERVACIONES']] = String(
    data.observaciones || row[headerIndex['OBSERVACIONES']] || '',
  ).trim()

  seguimientoAtencionSheet
    .getRange(found.rowIndex, 1, 1, row.length)
    .setValues([row])

  invalidateCache()

  return {
    success: true,
    action: 'actualizarSeguimientoAtencion',
    message: 'Seguimiento actualizado correctamente',
    timestamp,
    idSeguimiento,
  }
}

function handleEliminarSeguimientoAtencion(
  data,
  seguimientoAtencionSheet,
  timestamp,
) {
  const idSeguimiento = String(data.idSeguimiento || '').trim()
  if (!idSeguimiento) {
    return {
      success: false,
      action: 'eliminarSeguimientoAtencion',
      message: 'ID de seguimiento es requerido',
      timestamp,
    }
  }

  const found = findSeguimientoAtencionById(
    idSeguimiento,
    seguimientoAtencionSheet,
  )
  if (!found) {
    return {
      success: false,
      action: 'eliminarSeguimientoAtencion',
      message: 'Seguimiento no encontrado',
      timestamp,
    }
  }

  seguimientoAtencionSheet.deleteRow(found.rowIndex)
  invalidateCache()

  return {
    success: true,
    action: 'eliminarSeguimientoAtencion',
    message: 'Seguimiento eliminado correctamente',
    timestamp,
    idSeguimiento,
  }
}

function handleGuardarSeguimientoAtencion(
  data,
  seguimientoAtencionSheet,
  timestamp,
) {
  const orden = String(data.orden || '').trim()
  const fechaSeguimiento = String(data.fechaSeguimiento || '').trim()
  const hora = String(data.hora || '').trim()
  const asistio = String(data.asistio || '').trim()
  const nivelCompromiso = String(data.nivelCompromiso || '').trim()
  const observaciones = String(data.observaciones || '').trim()

  if (!orden) {
    return {
      success: false,
      action: 'guardarSeguimientoAtencion',
      message: 'Orden de atención es requerida',
      timestamp,
    }
  }

  if (!fechaSeguimiento) {
    return {
      success: false,
      action: 'guardarSeguimientoAtencion',
      message: 'Fecha de seguimiento es requerida',
      timestamp,
    }
  }

  const followUpId = Utilities.getUuid()
  const followUpRow = [
    followUpId,
    orden,
    fechaSeguimiento,
    hora,
    asistio,
    nivelCompromiso,
    observaciones,
  ]

  seguimientoAtencionSheet.appendRow(followUpRow)
  seguimientoAtencionSheet.autoResizeColumns(1, followUpRow.length)
  invalidateCache()

  return {
    success: true,
    action: 'guardarSeguimientoAtencion',
    message: 'Seguimiento de atención guardado correctamente',
    timestamp,
    idSeguimiento: followUpId,
  }
}

function getOrCreateSheet(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name)
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name)
    console.log('Hoja creada:', name)
  }

  const currentHeaderRange = sheet.getRange(1, 1, 1, headers.length)
  const currentHeaderValues = currentHeaderRange
    .getValues()[0]
    .map((header) => String(header).trim())

  const headersDiffer =
    currentHeaderValues.length !== headers.length ||
    currentHeaderValues.some((header, index) => header !== headers[index])

  if (sheet.getLastRow() === 0 || headersDiffer) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold')
    sheet.autoResizeColumns(1, headers.length)
  }

  return sheet
}

function findAllCafeteriaSupervisions(cafeteriaSheet) {
  const headers = cafeteriaSheet
    .getRange(1, 1, 1, CAFETERIA_SUPERVISION_HEADERS.length)
    .getValues()[0]
    .map((header) => String(header).trim())
  const headerIndex = headers.reduce((map, header, index) => {
    map[header] = index
    return map
  }, {})

  const rowsCount = cafeteriaSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = cafeteriaSheet
    .getRange(2, 1, rowsCount, cafeteriaSheet.getLastColumn())
    .getValues()

  return rows.map((row) => ({
    id: String(row[headerIndex['ID']] || '').trim(),
    fecha: formatSheetDate(row[headerIndex['FECHA']] || ''),
    hora: formatSheetTime(row[headerIndex['HORA']] || ''),
    periodo: String(row[headerIndex['PERIODO']] || '').trim(),
    concesionario: String(row[headerIndex['CONCESIONARIO']] || '').trim(),
    supervisor: String(row[headerIndex['SUPERVISOR']] || '').trim(),
    higieneBasica: String(row[headerIndex['HIGIENE BASICA']] || '').trim(),
    limpiezaAmbiente: String(
      row[headerIndex['LIMPIEZA AMBIENTE']] || '',
    ).trim(),
    signosETA: String(row[headerIndex['SIGNOS ETA']] || '').trim(),
    calidadVariado: String(row[headerIndex['CALIDAD VARIADO']] || '').trim(),
    fechaVencimiento: String(
      row[headerIndex['FECHA VENCIMIENTO']] || '',
    ).trim(),
    conservacionAlimentos: String(
      row[headerIndex['CONSERVACION ALIMENTOS']] || '',
    ).trim(),
    amabilidad: String(row[headerIndex['AMABILIDAD']] || '').trim(),
    tiempoServicio: String(row[headerIndex['TIEMPO SERVICIO']] || '').trim(),
    calidadPrecio: String(row[headerIndex['CALIDAD PRECIO']] || '').trim(),
    preciosCompetitivos: String(
      row[headerIndex['PRECIOS COMPETITIVOS']] || '',
    ).trim(),
    estadoEquipamiento: String(
      row[headerIndex['ESTADO EQUIPAMIENTO']] || '',
    ).trim(),
    observaciones: String(row[headerIndex['OBSERVACIONES']] || '').trim(),
    aprobado: String(row[headerIndex['ESTADO']] || '').trim(),
    registradoEn: formatDateTime(row[headerIndex['REGISTRADO EN']] || ''),
  }))
}

function getSurveyResponseSheet(spreadsheet, type) {
  if (type === 'DatosClinicos') {
    return getOrCreateSheet(
      spreadsheet,
      'Encuesta Datos Clinicos',
      SURVEY_DATOS_CLINICOS_HEADERS,
    )
  }

  if (type === 'TamizajeSalud') {
    return getOrCreateSheet(
      spreadsheet,
      'Encuesta Tamizaje Salud',
      SURVEY_TAMIZAJE_SALUD_HEADERS,
    )
  }

  if (type === 'Satisfaccion') {
    return getOrCreateSheet(
      spreadsheet,
      'Encuesta Satisfaccion',
      SURVEY_SATISFACCION_HEADERS,
    )
  }

  return null
}

function getSurveyConfigSheet(spreadsheet) {
  return getOrCreateSheet(
    spreadsheet,
    'Configuracion Encuestas',
    SURVEY_CONFIG_HEADERS,
  )
}

function formatSurveyLink(type) {
  if (type === 'DatosClinicos') {
    return '#/survey-datos-clinicos/'
  }
  if (type === 'TamizajeSalud') {
    return '#/survey-tamizaje-salud/'
  }
  return '#/survey-satisfaccion/'
}

function parseBooleanFromString(value) {
  const text = String(value || '')
    .trim()
    .toUpperCase()
  if (text === 'SI' || text === 'TRUE') return true
  if (text === 'NO' || text === 'FALSE') return false
  return null
}

function formatBooleanForSheet(value) {
  if (typeof value === 'boolean') {
    return value ? 'SI' : 'NO'
  }
  const text = String(value || '')
    .trim()
    .toUpperCase()
  if (text === 'SI' || text === 'TRUE') return 'SI'
  if (text === 'NO' || text === 'FALSE') return 'NO'
  return ''
}

function buildSheetObject(keys, row) {
  const obj = {}
  keys.forEach((key, index) => {
    obj[key] = String(row[index] || '').trim()
  })
  return obj
}

function listSheetObjects(sheet, headers) {
  const rowsCount = sheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }
  const rows = sheet.getRange(2, 1, rowsCount, headers.length).getValues()
  return rows.map((row) => buildSheetObject(headers, row))
}

function isTruthyParam(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'si'
}

function hasMeaningfulFollowUp(followUp) {
  if (!followUp) {
    return false
  }

  return Object.keys(followUp).some((key) => String(followUp[key] || '').trim())
}

function buildDiscapacidadReporteRows(
  usuariosSheet,
  discapacidadSheet,
  seguimientoSheet,
) {
  const usuarios = listSheetObjects(usuariosSheet, USUARIOS_HEADERS)
  const usuariosById = usuarios.reduce((map, user) => {
    map[user['ID Usuario']] = user
    return map
  }, {})

  const discapacidadRows = listSheetObjects(
    discapacidadSheet,
    DISCAPACIDAD_HEADERS,
  )
  const seguimientoRows = listSheetObjects(
    seguimientoSheet,
    SEGUIMIENTO_DISCAPACIDAD_HEADERS,
  )

  const periodsSet = new Set()
  seguimientoRows.forEach((s) => {
    const p = String(s['PERIODO SEGUIMIENTO'] || '').trim()
    if (p) periodsSet.add(p)
  })
  const periods = Array.from(periodsSet)

  const seguimientosByUser = seguimientoRows.reduce((map, s) => {
    const id = String(s['ID Usuario'] || '').trim()
    if (!id) return map
    map[id] = map[id] || []
    map[id].push(s)
    return map
  }, {})

  const rows = discapacidadRows.map((row) => {
    const usuarioId = String(row['ID Usuario'] || '').trim()
    const user = usuariosById[usuarioId] || {}
    const userSeguimientos = seguimientosByUser[usuarioId] || []

    const followUpsByPeriod = {}
    periods.forEach((p) => {
      const fu = userSeguimientos.find(
        (s) => String(s['PERIODO SEGUIMIENTO'] || '').trim() === p,
      )
      if (fu) {
        followUpsByPeriod[p] = {
          'Estudiante regular': String(fu['ESTUDIANTE REGULAR'] || '').trim(),
          Carrera: String(fu['CARRERA'] || '').trim(),
          Ciclo: String(fu['CICLO'] || '').trim(),
          Turno: String(fu['TURNO'] || '').trim(),
          Observacion: String(fu['OBSERVACIONES'] || '').trim(),
        }
      } else {
        followUpsByPeriod[p] = {
          'Estudiante regular': '',
          Carrera: '',
          Ciclo: '',
          Turno: '',
          Observacion: '',
        }
      }
    })

    return {
      'PERIODO REGISTRO': String(row['PERIODO REGISTRO'] || '').trim(),
      DNI: String(row['DNI'] || user.DNI || '').trim(),
      NOMBRES: String(row['NOMBRES'] || user['Nombre Completo'] || '').trim(),
      DISCAPACIDAD: String(row['DISCAPACIDAD'] || '').trim(),
      'CARNET - CONADIS': String(row['CARNET - CONADIS'] || '').trim(),
      OBSERVACIONES: String(row['OBSERVACIONES'] || '').trim(),
      'FECHA REGISTRO': formatDateTime(row['FECHA REGISTRO'] || ''),
      CELULAR: String(
        user['Teléfono'] || user['Telefono'] || user['Teléfono'] || '',
      ).trim(),
      CORREO: String(user.Email || user['Correo electrónico'] || '').trim(),
      followUpsByPeriod,
    }
  })

  return {
    periods,
    rows,
  }
}

function buildGestantesReportRows(gestantesSheet, seguimientoSheet) {
  const gestantes = listSheetObjects(gestantesSheet, GESTANTES_HEADERS)
  const seguimientos = listSheetObjects(
    seguimientoSheet,
    SEGUIMIENTO_GESTANTE_HEADERS,
  )

  const periodsSet = new Set()
  seguimientos.forEach((s) => {
    const p = String(s['PERIODO SEGUIMIENTO'] || '').trim()
    if (p) periodsSet.add(p)
  })
  const periods = Array.from(periodsSet)

  const seguimientosByUser = seguimientos.reduce((map, s) => {
    const id = String(s['ID Usuario'] || '').trim()
    if (!id) return map
    map[id] = map[id] || []
    map[id].push(s)
    return map
  }, {})

  const rows = gestantes.map((g) => {
    const usuarioId = String(g['ID Usuario'] || '').trim()
    const userSeguimientos = seguimientosByUser[usuarioId] || []

    const followUpsByPeriod = {}
    periods.forEach((p) => {
      const fu = userSeguimientos.find(
        (s) => String(s['PERIODO SEGUIMIENTO'] || '').trim() === p,
      )
      if (fu) {
        followUpsByPeriod[p] = {
          'Estudiante regular': String(fu['ESTUDIANTE REGULAR'] || '').trim(),
          Carrera: String(fu['CARRERA'] || '').trim(),
          Ciclo: String(fu['CICLO'] || '').trim(),
          Turno: String(fu['TURNO'] || '').trim(),
          Observacion: String(fu['OBSERVACIONES'] || '').trim(),
        }
      } else {
        followUpsByPeriod[p] = {
          'Estudiante regular': '',
          Carrera: '',
          Ciclo: '',
          Turno: '',
          Observacion: '',
        }
      }
    })

    return {
      'PERIODO REGISTRADO': String(g['PERIODO REGISTRADO'] || '').trim(),
      DNI: String(g['DNI'] || '').trim(),
      NOMBRES: String(g['NOMBRES'] || g['NOMBRE'] || '').trim(),
      EDAD: String(g['EDAD'] || '').trim(),
      'CONTROL PRENATAL': String(g['CONTROL PRENATAL'] || '').trim(),
      'FECHA PROBABLE DE PARTO': formatSheetDate(
        String(g['FECHA PROBABLE DE PARTO'] || '').trim(),
      ),
      CELULAR: String(g['CELULAR'] || '').trim(),
      CORREO: String(g['CORREO'] || g['CORREO ELECTRONICO'] || '').trim(),
      'FECHA REGISTRO': formatDateTime(g['FECHA REGISTRO'] || ''),
      followUpsByPeriod,
    }
  })

  return {
    periods,
    rows,
  }
}

function convertSurveyConfigRow(row) {
  const config = buildSheetObject(
    ['id', 'type', 'period', 'link', 'isOpen', 'createdAt'],
    row,
  )
  config.isOpen = parseBooleanFromString(config.isOpen)
  return config
}

function convertSurveyResponseRow(type, row) {
  let keys = []
  if (type === 'DatosClinicos') {
    keys = [
      'id',
      'type',
      'period',
      'configId',
      'registeredAt',
      'programa',
      'ciclo',
      'seccion',
      'nombresApellidos',
      'fechaNacimiento',
      'edad',
      'sexo',
      'dni',
      'celular',
      'correoElectronico',
      'domicilio',
      'nacionalidad',
      'tipoSeguro',
      'contactoNombres',
      'contactoCelular',
      'parentesco',
      'padeceEnfermedad',
      'enfermedadNombre',
      'discapacidad',
      'discapacidadNombre',
      'carnetConadis',
      'tratamientoMedico',
      'tratamientoNombre',
      'alergico',
      'alergicoNombre',
      'vacunaCovid',
      'dosisCovid',
      'embarazada',
      'fpp',
      'semanasGestacion',
    ]
  } else if (type === 'TamizajeSalud') {
    keys = [
      'id',
      'type',
      'period',
      'configId',
      'registeredAt',
      'nombresApellidos',
      'edad',
      'dni',
      'celular',
      'correoElectronico',
      'programa',
      'ciclo',
      'seccion',
      'sexo',
      'pesoActual',
      'estaturaActual',
      'actividadFisica',
      'frecuenciaActividad',
      'comidasPorDia',
      'consumoFrutasVerduras',
      'alergiaIntolerancia',
      'funcionVegetales',
      'platoFavorito1',
      'platoFavorito2',
    ]
  } else if (type === 'Satisfaccion') {
    keys = [
      'id',
      'type',
      'period',
      'configId',
      'registeredAt',
      'correoElectronico',
      'nombresApellidos',
      'carreraProfesional',
      'ciclo',
      'seccion',
      'infoCharla',
      'servicioEnfermeria',
      'proximoTema',
      'recomendacion',
    ]
  }

  const response = buildSheetObject(keys, row)
  response.registeredAt = formatDateTime(response.registeredAt)
  response.fechaNacimiento = formatSheetDate(response.fechaNacimiento)
  response.fpp = formatSheetDate(response.fpp)
  if (type === 'DatosClinicos') {
    ;[
      'padeceEnfermedad',
      'discapacidad',
      'carnetConadis',
      'tratamientoMedico',
      'alergico',
      'vacunaCovid',
      'embarazada',
    ].forEach((key) => {
      response[key] = parseBooleanFromString(response[key])
    })
  }

  if (type === 'TamizajeSalud') {
    response.actividadFisica = parseBooleanFromString(response.actividadFisica)
  }

  return response
}

function listSurveyConfigs(configSheet) {
  const rowsCount = configSheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = configSheet
    .getRange(2, 1, rowsCount, configSheet.getLastColumn())
    .getValues()

  return rows.map(convertSurveyConfigRow)
}

function findRowIndexById(sheet, id) {
  const rowsCount = sheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return -1
  }

  const rows = sheet.getRange(2, 1, rowsCount, 1).getValues()
  for (let i = 0; i < rows.length; i += 1) {
    if (String(rows[i][0] || '').trim() === id) {
      return i + 2
    }
  }

  return -1
}

function findSurveyConfigById(configSheet, id) {
  const index = findRowIndexById(configSheet, id)
  if (index === -1) {
    return null
  }
  const row = configSheet
    .getRange(index, 1, 1, SURVEY_CONFIG_HEADERS.length)
    .getValues()[0]
  return convertSurveyConfigRow(row)
}

function listSurveyResponses(surveySheet, type, period, configId) {
  const rowsCount = surveySheet.getLastRow() - 1
  if (rowsCount <= 0) {
    return []
  }

  const rows = surveySheet
    .getRange(2, 1, rowsCount, surveySheet.getLastColumn())
    .getValues()

  return rows
    .map((row) => convertSurveyResponseRow(type, row))
    .filter((response) => {
      if (configId) {
        return response.configId === configId
      }
      if (period) {
        return response.period === period
      }
      return true
    })
}

function handleCreateSurveyConfig(data, spreadsheet, timestamp) {
  const type = String(data.type || '').trim()
  const period = String(data.period || '').trim()
  const isOpen = parseBooleanFromString(data.isOpen)

  if (!type || !period) {
    return {
      success: false,
      action: 'createSurveyConfig',
      message: 'Tipo y período son requeridos',
      timestamp,
    }
  }

  const configSheet = getSurveyConfigSheet(spreadsheet)
  const rowsCount = configSheet.getLastRow() - 1
  if (rowsCount > 0) {
    const existingRows = configSheet
      .getRange(2, 1, rowsCount, SURVEY_CONFIG_HEADERS.length)
      .getValues()
    const normalizedType = type.toLowerCase()
    const normalizedPeriod = period.toLowerCase()
    for (let i = 0; i < existingRows.length; i += 1) {
      const existingType = String(existingRows[i][1] || '')
        .trim()
        .toLowerCase()
      const existingPeriod = String(existingRows[i][2] || '')
        .trim()
        .toLowerCase()
      if (
        existingType === normalizedType &&
        existingPeriod === normalizedPeriod
      ) {
        return {
          success: false,
          action: 'createSurveyConfig',
          message:
            'Ya existe una configuración con ese período para este tipo de encuesta',
          timestamp,
        }
      }
    }
  }
  const id = String(Date.now())
  const link = `${formatSurveyLink(type)}${id}`
  const row = [id, type, period, link, formatBooleanForSheet(isOpen), timestamp]
  configSheet.appendRow(row)
  invalidateCache()

  return {
    success: true,
    action: 'createSurveyConfig',
    timestamp,
    config: {
      id,
      type,
      period,
      link,
      isOpen: Boolean(isOpen),
      createdAt: timestamp,
    },
  }
}

function handleUpdateSurveyConfig(data, spreadsheet, timestamp) {
  const id = String(data.id || '').trim()
  const configSheet = getSurveyConfigSheet(spreadsheet)
  const rowIndex = findRowIndexById(configSheet, id)

  if (rowIndex === -1) {
    return {
      success: false,
      action: 'updateSurveyConfig',
      message: 'Configuración no encontrada',
      timestamp,
    }
  }

  const existingRow = configSheet
    .getRange(rowIndex, 1, 1, SURVEY_CONFIG_HEADERS.length)
    .getValues()[0]
  const existingConfig = convertSurveyConfigRow(existingRow)
  const type = String(data.type || existingConfig.type).trim()
  const period = String(data.period || existingConfig.period).trim()
  const isOpen =
    data.isOpen === undefined
      ? existingConfig.isOpen
      : parseBooleanFromString(data.isOpen)
  const link = `${formatSurveyLink(type)}${id}`

  configSheet
    .getRange(rowIndex, 1, 1, SURVEY_CONFIG_HEADERS.length)
    .setValues([
      [
        id,
        type,
        period,
        link,
        formatBooleanForSheet(isOpen),
        existingConfig.createdAt || timestamp,
      ],
    ])
  invalidateCache()

  return {
    success: true,
    action: 'updateSurveyConfig',
    timestamp,
    config: {
      id,
      type,
      period,
      link,
      isOpen: Boolean(isOpen),
      createdAt: existingConfig.createdAt || timestamp,
    },
  }
}

function handleDeleteSurveyConfig(data, spreadsheet, timestamp) {
  const id = String(data.id || '').trim()
  const configSheet = getSurveyConfigSheet(spreadsheet)
  const rowIndex = findRowIndexById(configSheet, id)

  if (rowIndex === -1) {
    return {
      success: false,
      action: 'deleteSurveyConfig',
      message: 'Configuración no encontrada',
      timestamp,
    }
  }

  configSheet.deleteRow(rowIndex)
  invalidateCache()

  return {
    success: true,
    action: 'deleteSurveyConfig',
    timestamp,
    message: 'Configuración eliminada',
  }
}

function handleSaveSurveyResponse(data, spreadsheet, timestamp) {
  const type = String(data.type || '').trim()
  const period = String(data.period || '').trim()
  const configId = String(data.configId || '').trim()
  const surveySheet = getSurveyResponseSheet(spreadsheet, type)

  if (!surveySheet) {
    return {
      success: false,
      action: 'saveSurveyResponse',
      message: 'Tipo de encuesta no soportado',
      timestamp,
    }
  }

  if (!type || !period) {
    return {
      success: false,
      action: 'saveSurveyResponse',
      message: 'Tipo y período son requeridos',
      timestamp,
    }
  }

  const shouldUseLock =
    type === 'DatosClinicos' ||
    type === 'TamizajeSalud' ||
    type === 'Satisfaccion'

  const lock = shouldUseLock ? LockService.getScriptLock() : null

  if (lock) {
    lock.waitLock(30000)
  }

  try {
    const id = Utilities.getUuid()
    const values = [id, type, period, configId, timestamp]

    if (type === 'DatosClinicos') {
      values.push(
        String(data.programa || '').trim(),
        String(data.ciclo || '').trim(),
        String(data.seccion || '').trim(),
        String(data.nombresApellidos || '').trim(),
        String(data.fechaNacimiento || '').trim(),
        String(data.edad || '').trim(),
        String(data.sexo || '').trim(),
        String(data.dni || '').trim(),
        String(data.celular || '').trim(),
        String(data.correoElectronico || '').trim(),
        String(data.domicilio || '').trim(),
        String(data.nacionalidad || '').trim(),
        String(data.tipoSeguro || '').trim(),
        String(data.contactoNombres || '').trim(),
        String(data.contactoCelular || '').trim(),
        String(data.parentesco || '').trim(),
        formatBooleanForSheet(data.padeceEnfermedad),
        String(data.enfermedadNombre || '').trim(),
        formatBooleanForSheet(data.discapacidad),
        String(data.discapacidadNombre || '').trim(),
        formatBooleanForSheet(data.carnetConadis),
        formatBooleanForSheet(data.tratamientoMedico),
        String(data.tratamientoNombre || '').trim(),
        formatBooleanForSheet(data.alergico),
        String(data.alergicoNombre || '').trim(),
        formatBooleanForSheet(data.vacunaCovid),
        String(data.dosisCovid || '').trim(),
        formatBooleanForSheet(data.embarazada),
        String(data.fpp || '').trim(),
        String(data.semanasGestacion || '').trim(),
      )
    } else if (type === 'TamizajeSalud') {
      values.push(
        String(data.nombresApellidos || '').trim(),
        String(data.edad || '').trim(),
        String(data.dni || '').trim(),
        String(data.celular || '').trim(),
        String(data.correoElectronico || '').trim(),
        String(data.programa || '').trim(),
        String(data.ciclo || '').trim(),
        String(data.seccion || '').trim(),
        String(data.sexo || '').trim(),
        String(data.pesoActual || '').trim(),
        String(data.estaturaActual || '').trim(),
        formatBooleanForSheet(data.actividadFisica),
        String(data.frecuenciaActividad || '').trim(),
        String(data.comidasPorDia || '').trim(),
        String(data.consumoFrutasVerduras || '').trim(),
        String(data.alergiaIntolerancia || '').trim(),
        String(data.funcionVegetales || '').trim(),
        String(data.platoFavorito1 || '').trim(),
        String(data.platoFavorito2 || '').trim(),
      )
    } else if (type === 'Satisfaccion') {
      values.push(
        String(data.correoElectronico || '').trim(),
        String(data.nombresApellidos || '').trim(),
        String(data.carreraProfesional || '').trim(),
        String(data.ciclo || '').trim(),
        String(data.seccion || '').trim(),
        String(data.infoCharla || '').trim(),
        String(data.servicioEnfermeria || '').trim(),
        String(data.proximoTema || '').trim(),
        String(data.recomendacion || '').trim(),
      )
    }

    surveySheet.appendRow(values)
    invalidateCache()

    return {
      success: true,
      action: 'saveSurveyResponse',
      timestamp,
      responseId: id,
    }
  } catch (error) {
    return {
      success: false,
      action: 'saveSurveyResponse',
      message: 'No se pudo guardar la encuesta: ' + String(error),
      timestamp,
    }
  } finally {
    if (lock) {
      lock.releaseLock()
    }
  }
}

function setupSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID)
    getOrCreateSheet(spreadsheet, SHEET_NAME_ATENCIONES, ATENCIONES_HEADERS)
    getOrCreateSheet(
      spreadsheet,
      'Seguimiento Atencion',
      SEGUIMIENTO_ATENCION_HEADERS,
    )
    getOrCreateSheet(spreadsheet, SHEET_NAME_USUARIOS, USUARIOS_HEADERS)
    getOrCreateSheet(
      spreadsheet,
      SHEET_NAME_CAFETERIA_SUPERVISION,
      CAFETERIA_SUPERVISION_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Configuracion Encuestas',
      SURVEY_CONFIG_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Encuesta Datos Clinicos',
      SURVEY_DATOS_CLINICOS_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Encuesta Tamizaje Salud',
      SURVEY_TAMIZAJE_SALUD_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Encuesta Satisfaccion',
      SURVEY_SATISFACCION_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Estudiantes con discapacidad',
      DISCAPACIDAD_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Seguimiento discapacidad',
      SEGUIMIENTO_DISCAPACIDAD_HEADERS,
    )
    getOrCreateSheet(
      spreadsheet,
      'Seguimiento gestante',
      SEGUIMIENTO_GESTANTE_HEADERS,
    )
    getOrCreateSheet(spreadsheet, 'Gestantes', GESTANTES_HEADERS)
    console.log('Configuración completada')
  } catch (error) {
    console.error('Error en setupSheet:', error)
  }
}
