import { initCalendar, renderCalendar, isLoading } from "./calendar.js"
import { saveOffer, getOffersForDate, deleteOffer, getAllOffers } from "./offers.js"
import { formatDateRange } from "./utils.js"

// Global state
const state = {
  currentDate: new Date(),
  selectedDate: null,
  editingOfferId: null,
}

// DOM Elements
const dateRangeElement = document.getElementById("dateRange")
const prevWeekButton = document.getElementById("prevWeek")
const nextWeekButton = document.getElementById("nextWeek")
const currentWeekButton = document.getElementById("currentWeek")
const calendarGrid = document.getElementById("calendar-grid")
const offerModal = document.getElementById("offer-modal")
const modalBackdrop = document.getElementById("modal-backdrop")
const closeModalButton = document.getElementById("close-modal")
const offerForm = document.getElementById("offer-form")
const offerDateInput = document.getElementById("offer-date")
const offerTitleInput = document.getElementById("offer-title")
const offerDescriptionInput = document.getElementById("offer-description")
const offerStartInput = document.getElementById("offer-start")
const offerEndInput = document.getElementById("offer-end")
const offerColorInput = document.getElementById("offer-color")
const deleteOfferButton = document.getElementById("delete-offer")
const editIdInput = document.getElementById("edit-id")
const modalTitleElement = document.getElementById("modal-title")

// Export state for use in other modules
export { state }

// Initialize calendar
initCalendar()
updateDateDisplay()
renderCalendar(state.currentDate)

// Update navigation buttons state
function updateNavigationButtonsState(isLoading) {
  prevWeekButton.disabled = isLoading
  nextWeekButton.disabled = isLoading
  currentWeekButton.disabled = isLoading

  // Add visual feedback for disabled state
  if (isLoading) {
    prevWeekButton.classList.add('disabled')
    nextWeekButton.classList.add('disabled')
    currentWeekButton.classList.add('disabled')
  } else {
    prevWeekButton.classList.remove('disabled')
    nextWeekButton.classList.remove('disabled')
    currentWeekButton.classList.remove('disabled')
  }
}

// Listen for calendar loading state changes
window.addEventListener('calendarLoadingStateChange', (event) => {
  updateNavigationButtonsState(event.detail.isLoading)
})

// Event Listeners
prevWeekButton.addEventListener("click", async () => {
  if (isLoading) return // Prevent click if loading
  
  const prevWeek = new Date(state.currentDate)
  prevWeek.setDate(prevWeek.getDate() - 7)
  state.currentDate = prevWeek
  updateDateDisplay()
  await renderCalendar(state.currentDate)
})

nextWeekButton.addEventListener("click", async () => {
  if (isLoading) return // Prevent click if loading
  
  const nextWeek = new Date(state.currentDate)
  nextWeek.setDate(nextWeek.getDate() + 7)
  state.currentDate = nextWeek
  updateDateDisplay()
  await renderCalendar(state.currentDate)
})

currentWeekButton.addEventListener("click", async () => {
  if (isLoading) return // Prevent click if loading
  
  state.currentDate = new Date()
  updateDateDisplay()
  await renderCalendar(state.currentDate)
})

calendarGrid.addEventListener("click", (e) => {
  // Handle add button click
  if (e.target.classList.contains("add-button")) {
    const dateString = e.target.getAttribute("data-date")
    openAddOfferModal(dateString)
  }

  // Handle offer item click
  if (e.target.closest(".offer-item")) {
    const offerItem = e.target.closest(".offer-item")
    const offerId = offerItem.getAttribute("data-id")
    const dateString = offerItem.getAttribute("data-date")
    openEditOfferModal(offerId, dateString)
  }
})

closeModalButton.addEventListener("click", closeModal)
modalBackdrop.addEventListener("click", closeModal)

offerForm.addEventListener("submit", (e) => {
  e.preventDefault()

  // Get form values
  const dateString = offerDateInput.value
  const title = offerTitleInput.value
  const description = offerDescriptionInput.value
  const startTime = offerStartInput.value
  const endTime = offerEndInput.value
  const color = offerColorInput.value

  // Validate form
  if (!title || !startTime || !endTime) {
    alert("Please fill out all required fields")
    return
  }

  // Save offer
  const offerId = editIdInput.value || crypto.randomUUID()
  const offer = {
    id: offerId,
    title,
    description,
    startTime,
    endTime,
    color,
    date: dateString,
  }

  saveOffer(offer)
  closeModal()
  renderCalendar(state.currentDate)
})

deleteOfferButton.addEventListener("click", () => {
  const offerId = editIdInput.value
  if (offerId) {
    deleteOffer(offerId)
    closeModal()
    renderCalendar(state.currentDate)
  }
})

// Helper functions
function updateDateDisplay() {
  const dateRange = formatDateRange(state.currentDate)
  dateRangeElement.textContent = dateRange
}

function openAddOfferModal(dateString) {
  // Reset form
  offerForm.reset()
  editIdInput.value = ""
  offerDateInput.value = dateString

  // Set default times
  offerStartInput.value = "09:00"
  offerEndInput.value = "17:00"
  offerColorInput.value = "blue"

  // Update modal title and hide delete button
  modalTitleElement.textContent = "Add Offer"
  deleteOfferButton.classList.remove("visible")

  // Open modal
  openModal()
}

function openEditOfferModal(offerId, dateString) {
  // Get offers for date
  const offers = getOffersForDate(dateString)
  const offer = offers.find((o) => o.id === offerId)

  if (!offer) return

  // Fill form
  editIdInput.value = offer.id
  offerDateInput.value = offer.date
  offerTitleInput.value = offer.title
  offerDescriptionInput.value = offer.description || ""
  offerStartInput.value = offer.startTime
  offerEndInput.value = offer.endTime
  offerColorInput.value = offer.color || "blue"

  // Update modal title and show delete button
  modalTitleElement.textContent = "Edit Offer"
  deleteOfferButton.classList.add("visible")

  // Open modal
  openModal()
}

function openModal() {
  offerModal.classList.add("active")
  modalBackdrop.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeModal() {
  offerModal.classList.remove("active")
  modalBackdrop.classList.remove("active")
  document.body.style.overflow = ""
}
