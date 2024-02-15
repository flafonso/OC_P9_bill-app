const monthsFrShort = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc."
]

export function reverseFormatDate(dateStr) {
  const [da, mo, ye] = dateStr.split(" ")
  const date = new Date()
  const moIndex = monthsFrShort.indexOf(mo)
  if (moIndex === -1) {
    throw Error(`Unknown month: ${mo}`)
  }
  date.setFullYear(ye, moIndex, da)
  return date
}

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  console.log(month)
  return `${parseInt(da)} ${month} ${ye.toString()}`
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    default :
      return "Refused"
  }
}