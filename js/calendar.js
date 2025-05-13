import { getOffersForDates } from "./offers.js"
import { state } from "./app.js"
import { getMonday, formatDayOfWeek, isSameDay } from "./utils.js"

// DOM Elements
const calendarGrid = document.getElementById("calendar-grid")

// Add abort controller for managing fetch requests
let currentFetchController = null

// Loading state
let isLoading = false
let dayCellsCreated = 0

// Initialize calendar
function initCalendar() {
  // Initial setup if needed
}

// Render calendar for a specific date
async function renderCalendar(date) {
  // Prevent new render if previous render isn't complete
  if (isLoading) {
    return
  }

  // Set loading state to true
  isLoading = true
  dayCellsCreated = 0
  
  // Dispatch loading state change event
  window.dispatchEvent(new CustomEvent('calendarLoadingStateChange', { detail: { isLoading: true } }))

  // Cancel any ongoing fetch requests
  if (currentFetchController) {
    currentFetchController.abort()
  }
  
  // Create new abort controller for this render
  currentFetchController = new AbortController()
  const signal = currentFetchController.signal

  try {
    // Clear calendar grid first
    while (calendarGrid.firstChild) {
      calendarGrid.removeChild(calendarGrid.firstChild)
    }

    // Get Monday of the week
    const monday = getMonday(date)

    // Create array of dates for the week
    const weekDates = []
    const dayCells = []
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday)
      currentDate.setDate(monday.getDate() + i)
      weekDates.push(currentDate.toISOString().split('T')[0])
      
      // Create day cell structure (without offers yet)
      const dayCell = createEmptyDayCell(currentDate)
      dayCells.push(dayCell)
      calendarGrid.appendChild(dayCell)
      dayCellsCreated++
    }

    // Only proceed with fetching offers if all day cells are created
    if (dayCellsCreated === 7) {
      // Fetch all offers for the week in a single request
      const weekOffers = await getOffersForDates(weekDates, signal)

      // Only proceed if this is still the current fetch request
      if (!signal.aborted) {
        // Update each day cell with its offers
        dayCells.forEach((dayCell, index) => {
          const dateString = weekDates[index]
          const offers = weekOffers[dateString] || []
          updateDayCellOffers(dayCell, offers)
        })
      }
    }
  } catch (error) {
    // Only show error if it's not an abort error
    if (error.name !== 'AbortError') {
      console.error("Error rendering calendar:", error)
      // Show error state in calendar
      calendarGrid.innerHTML = '<div class="error-message">Error loading calendar. Please try refreshing the page.</div>'
    }
  } finally {
    // Set loading state to false
    isLoading = false
    // Dispatch loading state change event
    window.dispatchEvent(new CustomEvent('calendarLoadingStateChange', { detail: { isLoading: false } }))
  }
}

// Create an empty day cell without offers
function createEmptyDayCell(date) {
  const dayCell = document.createElement("div")
  dayCell.className = "day-cell"

  // Add today class if it's today
  const today = new Date()
  if (isSameDay(date, today)) {
    dayCell.classList.add("today")
  }

  // Check if date is in different month than current view center
  if (date.getMonth() !== state.currentDate.getMonth()) {
    dayCell.classList.add("different-month")
  }

  // Create day header
  const dayHeader = document.createElement("div")
  dayHeader.className = "day-header"

  // Day number
  const dayNumber = document.createElement("div")
  dayNumber.className = "day-number"
  dayNumber.textContent = date.getDate()

  // Add day of week for mobile
  const dayOfWeek = document.createElement("span")
  dayOfWeek.className = "weekday-name"
  dayOfWeek.textContent = formatDayOfWeek(date)
  dayNumber.prepend(dayOfWeek, " ")

  // Add button
  const addButton = document.createElement("button")
  addButton.className = "add-button"
  addButton.innerHTML = "+"
  addButton.setAttribute("data-date", date.toISOString().split("T")[0])

  dayHeader.appendChild(dayNumber)
  dayHeader.appendChild(addButton)
  dayCell.appendChild(dayHeader)

  // Add empty offers container
  const offersContainer = document.createElement("div")
  offersContainer.className = "offers-container"
  dayCell.appendChild(offersContainer)

  return dayCell
}

// Update a day cell with offers
function updateDayCellOffers(dayCell, offers) {
  const offersContainer = dayCell.querySelector(".offers-container")
  offersContainer.innerHTML = "" // Clear existing offers

  if (offers.length === 0) {
    const noOffers = document.createElement("div")
    noOffers.className = "no-offers"
    noOffers.textContent = "No offers"
    offersContainer.appendChild(noOffers)
  } else {
    // Sort offers by start time
    const sortedOffers = offers.sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Add offers to container
    sortedOffers.forEach((offer) => {
      const offerItem = createOfferItem(offer)
      offersContainer.appendChild(offerItem)
    })
  }
}

// Create an offer item
function createOfferItem(offer) {
  const offerItem = document.createElement("div")
  offerItem.className = `offer-item ${offer.color || "blue"}`
  offerItem.setAttribute("data-id", offer.id)
  offerItem.setAttribute("data-date", offer.date)

  const offerTitle = document.createElement("div")
  offerTitle.className = "offer-title"
  offerTitle.textContent = offer.title

  // Add card icon if card attributes exist
  if (offer.cardAttributes) {
    const cardIcon = document.createElement("span")
    cardIcon.className = "card-icon"
    cardIcon.innerHTML = "&#x1F0CF;" // Playing card emoji
    cardIcon.title = `Card #${offer.cardAttributes.cardNumber}`
    offerTitle.appendChild(cardIcon)
  }

  const offerTime = document.createElement("div")
  offerTime.className = "offer-time"
  offerTime.textContent = `${offer.startTime} - ${offer.endTime}`

  offerItem.appendChild(offerTitle)
  offerItem.appendChild(offerTime)

  return offerItem
}

export { initCalendar, renderCalendar, isLoading }