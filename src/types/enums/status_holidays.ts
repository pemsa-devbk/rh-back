/**
 * 1. El empleado solicita sus vacaciones (Solicitud)
 * 2. RRHH Aprueba las vacaciones (junto a su jefe) (Aprobada)
 * 3. El empleado esta de vacaciones (Curso)
 * 4. Finalizan las vacaciones (Finalizada)
 */
/** Vacaciones pasadas
 * 1. RRHH realiza el proceso de vacaciones pasadas (Finalizada)
 */
/** Cancelación
 * 1. El empleado solicita sus vacaciones (solicitud)
 * 2. RRHH Aprueba las vacaciones
 * 3. El empleado cancel las vacaciones (Cancelada)
 */
/**
 * 1. El empelado solicita sus vacaciones (solicitud)
 * 2. RRHH No autoriza las vacaciones (rechazada)
 */
export enum  StatusHoliday {
    SOLICITUD = 0,
    APROBADA = 1,
    RECHAZADA = 2,
    CURSO = 3,
    FINALIZADA = 4,
    CANCELADA = 5

    // pendiente = 0,
    // curso = 1,
    // cancelado = 2,
    // finalizada = 3,
}