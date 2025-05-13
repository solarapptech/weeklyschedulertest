// Get Monday of the current week
function getMonday(date) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  const monday = new Date(date)
  monday.setDate(diff)
  return monday
}

// Format date range for display (e.g., "May 5 - May 11, 2025")
function formatDateRange(date) {
  const monday = getMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const options = { month: "long", day: "numeric", year: "numeric" }

  if (monday.getMonth() === sunday.getMonth() && monday.getFullYear() === sunday.getFullYear()) {
    // Same month and year
    return `${monday.toLocaleDateString("en-US", { month: "long" })} ${monday.getDate()} - ${sunday.getDate()}, ${monday.getFullYear()}`
  } else if (monday.getFullYear() === sunday.getFullYear()) {
    // Different month, same year
    return `${monday.toLocaleDateString("en-US", { month: "long" })} ${monday.getDate()} - ${sunday.toLocaleDateString("en-US", { month: "long" })} ${sunday.getDate()}, ${monday.getFullYear()}`
  } else {
    // Different month and year
    return `${monday.toLocaleDateString("en-US", { month: "long" })} ${monday.getDate()}, ${monday.getFullYear()} - ${sunday.toLocaleDateString("en-US", { month: "long" })} ${sunday.getDate()}, ${sunday.getFullYear()}`
  }
}

// Format time (e.g., "9:00 AM")
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":")
  const date = new Date()
  date.setHours(Number.parseInt(hours, 10))
  date.setMinutes(Number.parseInt(minutes, 10))

  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

// Format day of week (for mobile view)
function formatDayOfWeek(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[date.getDay()]
}

export { getMonday, formatDateRange, formatTime, isSameDay, formatDayOfWeek }
