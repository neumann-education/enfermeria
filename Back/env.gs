function setupEnv() {
  const scriptProps = PropertiesService.getScriptProperties()
  const defaultSheetId = '1xCo8KhoZmPWAkVNiIM-6MlcRBNRc161Ozmt2e-nOkl4'
  const defaultSheetName = 'Atenciones'
  const defaultSheetNameUsuarios = 'Usuarios'
  const defaultSheetNameCafeteriaSupervision = 'Supervision Cafeteria'
  const defaultSheetNameAcceso = 'Acceso'
  const defaultConstanciaFolderId = '1igzNJN0QZbynKek255939veMhujsXHys'

  const sheetId = scriptProps.getProperty('SHEET_ID') || defaultSheetId
  const sheetName = scriptProps.getProperty('SHEET_NAME') || defaultSheetName
  const sheetNameUsuarios =
    scriptProps.getProperty('SHEET_NAME_USUARIOS') || defaultSheetNameUsuarios
  const sheetNameCafeteriaSupervision =
    scriptProps.getProperty('SHEET_NAME_CAFETERIA_SUPERVISION') ||
    defaultSheetNameCafeteriaSupervision
  const sheetNameAcceso =
    scriptProps.getProperty('SHEET_NAME_ACCESO') || defaultSheetNameAcceso
  const constanciaFolderId =
    scriptProps.getProperty('CONSTANCIA_FOLDER_ID') || defaultConstanciaFolderId

  // Escribe de vuelta los valores en script properties para poder llamarlos dinámicamente si quisieras
  scriptProps.setProperty('SHEET_ID', sheetId)
  scriptProps.setProperty('SHEET_NAME', sheetName)
  scriptProps.setProperty('SHEET_NAME_USUARIOS', sheetNameUsuarios)
  scriptProps.setProperty(
    'SHEET_NAME_CAFETERIA_SUPERVISION',
    sheetNameCafeteriaSupervision,
  )
  scriptProps.setProperty('SHEET_NAME_ACCESO', sheetNameAcceso)
  scriptProps.setProperty('CONSTANCIA_FOLDER_ID', constanciaFolderId)

  return {
    SHEET_ID: sheetId,
    SHEET_NAME: sheetName,
    SHEET_NAME_USUARIOS: sheetNameUsuarios,
    SHEET_NAME_CAFETERIA_SUPERVISION: sheetNameCafeteriaSupervision,
    SHEET_NAME_ACCESO: sheetNameAcceso,
    CONSTANCIA_FOLDER_ID: constanciaFolderId,
  }
}
