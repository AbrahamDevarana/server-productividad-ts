import dayjs from "dayjs"
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/es'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(tz)
dayjs.locale('es')
dayjs.extend(utc)
dayjs.extend(LocalizedFormat)
dayjs.tz.setDefault("America/Mexico_City")

dayjs.extend(quarterOfYear)

export default dayjs