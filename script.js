// Global state
const state = {
  currentDate: new Date(),
  selectedDate: null,
  editingOfferId: null,
}

// Add these new variables at the top with other state variables
let products = []
let cardData = []
let isLoading = false
let currentPage = 1
let hasMoreProducts = true

// Constants
const OFFERS_STORAGE_KEY = "weekly-offers"

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
const productsCountElement = document.getElementById("productsCount")
const onlineProductsCountElement = document.getElementById("onlineProductsCount")
const productSelect = document.getElementById("product-select")

// Product Attributes Button
const productAttributesBtn = document.getElementById("product-attributes-btn")
const attributesForm = document.getElementById("attributes-form")
const backToMainBtn = document.getElementById("back-to-main")
const offerFormElement = document.getElementById("offer-form")

// Card attribute display elements
const cardImage = document.getElementById("card-image")
const cardNumberElement = document.getElementById("card-number")
const cardLanguageElement = document.getElementById("card-language")
const cardRarityElement = document.getElementById("card-rarity")
const cardPsaRatingElement = document.getElementById("card-psa-rating")
const cardPsaValueElement = document.getElementById("card-psa-value")
const cardValuePercentageElement = document.getElementById("card-value-percentage")
const cardViewCountElement = document.getElementById("card-view-count")
const productPermalinkElement = document.getElementById("product-permalink")

// Initialize calendar
initCalendar()
updateDateDisplay()
renderCalendar(state.currentDate)

// Event Listeners
// Modify the event listeners to use async/await
prevWeekButton.addEventListener("click", () => {
  const prevWeek = new Date(state.currentDate)
  prevWeek.setDate(prevWeek.getDate() - 7)
  state.currentDate = prevWeek
  updateDateDisplay()
  renderCalendar(state.currentDate).catch((err) => console.error("Error rendering calendar:", err))
})

nextWeekButton.addEventListener("click", () => {
  const nextWeek = new Date(state.currentDate)
  nextWeek.setDate(nextWeek.getDate() + 7)
  state.currentDate = nextWeek
  updateDateDisplay()
  renderCalendar(state.currentDate).catch((err) => console.error("Error rendering calendar:", err))
})

currentWeekButton.addEventListener("click", () => {
  state.currentDate = new Date()
  updateDateDisplay()
  renderCalendar(state.currentDate).catch((err) => console.error("Error rendering calendar:", err))
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
    openEditOfferModal(offerId, dateString).catch((err) => console.error("Error opening edit modal:", err))
  }
})

closeModalButton.addEventListener("click", closeModal)
modalBackdrop.addEventListener("click", closeModal)

offerForm.addEventListener("submit", (e) => {
  e.preventDefault()

  // Get form values
  const dateString = offerDateInput.value
  const title = offerTitleInput.value
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
    startTime,
    endTime,
    color,
    date: dateString,
  }

  // Add product information to the offer
  const selectedProductId = Number.parseInt(productSelect.value)
  if (selectedProductId) {
    const selectedProduct = products.find((p) => p.id === selectedProductId)
    const selectedCard = cardData.find((card) => card.id === selectedProductId)

    if (selectedProduct) {
      offer.productId = selectedProduct.id
      offer.productName = selectedProduct.name
    }

    if (selectedCard) {
      offer.cardAttributes = {
        cardNumber: selectedCard.cardNumber,
        language: selectedCard.language,
        rarity: selectedCard.rarity,
        psaRating: selectedCard.psaRating,
        psaValue: selectedCard.psaValue,
        image: selectedCard.image,
        permalink: selectedCard.permalink,
        viewCount: selectedCard.viewCount,
      }
    }
  }

  saveOffer(offer)
    .then(() => {
      closeModal()
      return renderCalendar(state.currentDate)
    })
    .catch((err) => console.error("Error saving offer:", err))
})

deleteOfferButton.addEventListener("click", () => {
  const offerId = editIdInput.value
  if (offerId) {
    deleteOffer(offerId)
      .then(() => {
        closeModal()
        return renderCalendar(state.currentDate)
      })
      .catch((err) => console.error("Error deleting offer:", err))
  }
})

// Show attributes form
productAttributesBtn.addEventListener("click", () => {
  attributesForm.classList.add("active")
  offerFormElement.classList.add("slide-left")
})

// Back to main form
backToMainBtn.addEventListener("click", () => {
  attributesForm.classList.remove("active")
  offerFormElement.classList.remove("slide-left")
})

// Calendar Functions
function initCalendar() {
  // Initial setup if needed
}

// Modify the renderCalendar function to use async/await
async function renderCalendar(date) {
  // Clear calendar grid
  calendarGrid.innerHTML = ""

  // Get Monday of the week
  const monday = getMonday(date)

  // Create an array to hold all day cell promises
  const dayCellPromises = []

  // Create day cells for the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday)
    currentDate.setDate(monday.getDate() + i)

    // Create day cell and add to promises array
    dayCellPromises.push(createDayCell(currentDate))
  }

  // Wait for all day cells to be created before appending to the grid
  const dayCells = await Promise.all(dayCellPromises)

  // Append all day cells to the grid at once
  dayCells.forEach((dayCell) => {
    calendarGrid.appendChild(dayCell)
  })

  // Update online products count
  await updateOnlineProductsCount()
}

// Modify the createDayCell function to use async/await
async function createDayCell(date) {
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

  // Offers container
  const offersContainer = document.createElement("div")
  offersContainer.className = "offers-container"

  // Get offers for this date
  const dateString = date.toISOString().split("T")[0]
  const offers = await getOffersForDate(dateString)

  if (offers.length === 0) {
    const noOffers = document.createElement("div")
    noOffers.className = "no-offers"
    noOffers.textContent = "No offers"
    offersContainer.appendChild(noOffers)
  } else {
    // Sort offers by start time
    offers.sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Add offers to container
    offers.forEach((offer) => {
      const offerItem = createOfferItem(offer)
      offersContainer.appendChild(offerItem)
    })
  }

  dayCell.appendChild(offersContainer)
  return dayCell
}

// Add this function to check if the current UTC time is between start and end times
function isOfferOnline(startTime, endTime) {
  // Get current UTC time
  const now = new Date()
  const currentHours = now.getUTCHours()
  const currentMinutes = now.getUTCMinutes()

  // Parse start and end times
  const [startHours, startMinutes] = startTime.split(":").map(Number)
  const [endHours, endMinutes] = endTime.split(":").map(Number)

  // Convert to minutes for easier comparison
  const currentTimeInMinutes = currentHours * 60 + currentMinutes
  const startTimeInMinutes = startHours * 60 + startMinutes
  const endTimeInMinutes = endHours * 60 + endMinutes

  // Check if current time is between start and end times
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes
}

// Modify the createOfferItem function to include the online status
function createOfferItem(offer) {
  const offerItem = document.createElement("div")
  offerItem.className = `offer-item ${offer.color || "blue"}`
  offerItem.setAttribute("data-id", offer.id)
  offerItem.setAttribute("data-date", offer.date)

  const offerTitle = document.createElement("div")
  offerTitle.className = "offer-title"
  offerTitle.textContent = offer.title

  const productName = document.createElement("div")
  productName.className = "product-name"
  productName.textContent = offer.productName || ""

  const offerTime = document.createElement("div")
  offerTime.className = "offer-time"
  offerTime.textContent = `${offer.startTime} - ${offer.endTime}`

  // Add online status indicator
  const onlineStatus = document.createElement("div")
  onlineStatus.className = "online-status"

  if (isOfferOnline(offer.startTime, offer.endTime)) {
    onlineStatus.textContent = "Online"
    onlineStatus.classList.add("status-online")
  } else {
    onlineStatus.textContent = "Not Online"
    onlineStatus.classList.add("status-offline")
  }

  offerItem.appendChild(offerTitle)
  offerItem.appendChild(productName)
  offerItem.appendChild(offerTime)
  offerItem.appendChild(onlineStatus)

  return offerItem
}

// Function to update the online products count
// Function to get all online products

// API endpoint to get online products
// This would typically be a server-side function, but for this example
// we'll create a function that can be called from the browser console
// Replace the window.getOnlineProductsAPI function with this improved version
window.getOnlineProductsAPI = async () => {
  try {
    // Use a cached promise to prevent multiple simultaneous requests
    if (!window.onlineProductsPromise) {
      window.onlineProductsPromise = getOnlineProducts()

      // Clear the cache after a short delay to allow for fresh data on subsequent requests
      setTimeout(() => {
        window.onlineProductsPromise = null
      }, 500) // Cache for 0.5 seconds
    }

    // Await the promise (either new or cached)
    const onlineProductsData = await window.onlineProductsPromise

    // If we got no data or an error occurred, return empty results
    if (!onlineProductsData || !onlineProductsData.offers) {
      return { count: 0, offers: [] }
    }

    // Enhance the offers with product details
    const enhancedOffers = onlineProductsData.offers.map((offer) => {
      // Find the product details
      let productDetails = null
      if (offer.productId) {
        const product = products.find((p) => p.id === offer.productId)
        const card = cardData.find((c) => c.id === offer.productId)

        if (product) {
          productDetails = {
            id: product.id,
            name: product.name,
            cardAttributes: offer.cardAttributes || {},
            image: card?.image || null,
            permalink: card?.permalink || null,
          }
        }
      }

      return {
        id: offer.id,
        title: offer.title,
        date: offer.date,
        startTime: offer.startTime,
        endTime: offer.endTime,
        color: offer.color,
        product: productDetails,
        isOnline: true, // By definition, all offers returned are online
      }
    })

    return {
      count: enhancedOffers.length,
      offers: enhancedOffers,
    }
  } catch (error) {
    console.error("Error in getOnlineProductsAPI:", error)
    return { count: 0, offers: [] }
  }
}

// Modal Functions
function openAddOfferModal(dateString) {
  // Reset form
  offerForm.reset()
  editIdInput.value = ""
  offerDateInput.value = dateString

  // Set default times
  offerStartInput.value = "09:00"
  offerEndInput.value = "17:00"
  offerColorInput.value = "blue"

  // Reset card attributes display
  resetCardAttributesDisplay()

  // Update modal title and hide delete button
  modalTitleElement.textContent = "Add Offer"
  deleteOfferButton.classList.remove("visible")

  // Reset form position
  attributesForm.classList.remove("active")
  offerFormElement.classList.remove("slide-left")

  // Fetch products if not already loaded
  if (products.length === 0) {
    fetchProducts()
  }

  // Open modal
  openModal()
}

// Modify the openEditOfferModal function to use async/await
async function openEditOfferModal(offerId, dateString) {
  // Get offers for date
  const offers = await getOffersForDate(dateString)
  const offer = offers.find((o) => o.id === offerId)

  if (!offer) return

  // Fill form
  editIdInput.value = offer.id
  offerDateInput.value = offer.date
  offerTitleInput.value = offer.title
  offerColorInput.value = offer.color || "blue"
  offerStartInput.value = offer.startTime
  offerEndInput.value = offer.endTime

  // Set product select if product exists
  if (offer.productId) {
    productSelect.value = offer.productId

    // Find and display card attributes
    const selectedCard = cardData.find((card) => card.id === offer.productId)
    if (selectedCard) {
      updateCardAttributesDisplay(selectedCard)
    } else {
      resetCardAttributesDisplay()
    }
  } else {
    productSelect.value = ""
    resetCardAttributesDisplay()
  }

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

  // Reset form position
  setTimeout(() => {
    attributesForm.classList.remove("active")
    offerFormElement.classList.remove("slide-left")
  }, 300)
}

// Replace the Storage Functions section with these API functions

// API Functions
async function getAllOffers() {
  try {
    const response = await fetch(`http://localhost/lamac.com/wp-json/weekly-offers/v1/offers`, {
      headers: {
        "X-WP-Nonce": wpApiSettings.nonce,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch offers")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching offers:", error)
    return []
  }
}

async function getOffersForDate(dateString) {
  try {
    const response = await fetch(`http://localhost/lamac.com/wp-json/weekly-offers/v1/offers/date/${dateString}`, {
      headers: {
        "X-WP-Nonce": wpApiSettings.nonce,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch offers for date")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching offers for date:", error)
    return []
  }
}

async function saveOffer(offer) {
  try {
    const response = await fetch("http://localhost/lamac.com/wp-json/weekly-offers/v1/offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": wpApiSettings.nonce, // WordPress nonce for security
      },
      body: JSON.stringify(offer),
    })

    if (!response.ok) {
      throw new Error("Failed to save offer")
    }

    // Update online products count
    updateOnlineProductsCount()

    return await response.json()
  } catch (error) {
    console.error("Error saving offer:", error)
    alert("Failed to save offer. Please try again.")
    return null
  }
}

async function deleteOffer(offerId) {
  try {
    const response = await fetch(`http://localhost/lamac.com/wp-json/weekly-offers/v1/offers/${offerId}`, {
      method: "DELETE",
      headers: {
        "X-WP-Nonce": wpApiSettings.nonce, // WordPress nonce for security
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete offer")
    }

    // Update online products count
    updateOnlineProductsCount()

    return await response.json()
  } catch (error) {
    console.error("Error deleting offer:", error)
    alert("Failed to delete offer. Please try again.")
    return null
  }
}

// Function to get all online products
async function getOnlineProducts() {
  try {
    const response = await fetch("http://localhost/lamac.com/wp-json/weekly-offers/v1/offers/online", {
      headers: {
        "X-WP-Nonce": wpApiSettings.nonce,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch online offers")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching online offers:", error)
    return { count: 0, offers: [] }
  }
}

// Also update the updateOnlineProductsCount function to use the new API
async function updateOnlineProductsCount() {
  try {
    const onlineProductsData = await window.getOnlineProductsAPI()
    onlineProductsCountElement.textContent = `Online Products: ${onlineProductsData.count}`
  } catch (error) {
    console.error("Error updating online products count:", error)
    onlineProductsCountElement.textContent = "Online Products: Error"
  }
}

// Utility Functions
function getMonday(date) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  const monday = new Date(date)
  monday.setDate(diff)
  return monday
}

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

function formatDayOfWeek(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[date.getDay()]
}

function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function updateDateDisplay() {
  const dateRange = formatDateRange(state.currentDate)
  dateRangeElement.textContent = dateRange
}

async function fetchProducts() {
  if (isLoading || !hasMoreProducts) return

  isLoading = true
  try {
    const response = await fetch(
      `http://localhost/lamac.com/wp-json/wc/store/products?per_page=20&page=${currentPage}`,
      {
        headers: {
          "X-WP-Nonce": wpApiSettings.nonce,
        },
      },
    )
    const newProducts = await response.json()

    if (newProducts && newProducts.length > 0) {
      const newCards = newProducts.map((product) => {
        const cardNo = product.attributes[0]?.terms[0]?.name
        const language = product.attributes[1]?.terms[0]?.name
        const rarity = product.attributes[2]?.terms[0]?.name
        const psa = product.attributes[3]?.terms[0]?.name
        const value = product.attributes[4]?.terms[0]?.name

        return {
          id: product.id,
          title: product.name,
          image:
            product.images && product.images.length > 0
              ? product.images[0].src
              : "http://localhost/lamac.com/wp-content/uploads/woocommerce-placeholder.png",
          cardNumber: cardNo || "N/A",
          language: language || "",
          rarity: rarity || "",
          psaRating: psa ? "PSA " + psa : "",
          psaValue: psa ? "PSA " + psa : "",
          valuePercentage: value || "",
          viewCount: Math.floor(Math.random() * 200) + " Views",
          permalink: product.permalink,
        }
      })

      products = [...products, ...newProducts]
      cardData = [...cardData, ...newCards]
      currentPage++
      hasMoreProducts = newProducts.length === 20

      // Update products count display
      productsCountElement.textContent = `Available Products: ${products.length}`

      // Update online products count
      updateOnlineProductsCount()

      // Update product select options
      updateProductSelect()
    } else {
      hasMoreProducts = false
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    productsCountElement.textContent = "Error loading products"
  } finally {
    isLoading = false
  }
}

function updateProductSelect() {
  productSelect.innerHTML = '<option value="">Select a product...</option>'

  products.forEach((product) => {
    const option = document.createElement("option")
    option.value = product.id
    option.textContent = product.name
    productSelect.appendChild(option)
  })
}

// Initialize products when the page loads
fetchProducts()

productSelect.addEventListener("change", function () {
  const selectedProductId = Number.parseInt(this.value)
  if (selectedProductId) {
    const selectedCard = cardData.find((card) => card.id === selectedProductId)
    if (selectedCard) {
      updateCardAttributesDisplay(selectedCard)
    }
  } else {
    resetCardAttributesDisplay()
  }
})

// Add function to update card attributes display
function updateCardAttributesDisplay(card) {
  cardImage.src = card.image
  cardImage.alt = card.title
  cardNumberElement.textContent = card.cardNumber || "-"
  cardLanguageElement.textContent = card.language || "-"
  cardRarityElement.textContent = card.rarity || "-"
  cardPsaRatingElement.textContent = card.psaRating || "-"
  cardPsaValueElement.textContent = card.psaValue || "-"
  cardValuePercentageElement.textContent = card.valuePercentage || "-"
  cardViewCountElement.textContent = card.viewCount || "-"

  if (card.permalink) {
    productPermalinkElement.href = card.permalink
    productPermalinkElement.classList.remove("disabled")
  } else {
    productPermalinkElement.href = "#"
    productPermalinkElement.classList.add("disabled")
  }
}

// Add function to reset card attributes display
function resetCardAttributesDisplay() {
  cardImage.src = "http://localhost/lamac.com/wp-content/uploads/woocommerce-placeholder.png"
  cardImage.alt = "Card preview"
  cardNumberElement.textContent = "-"
  cardLanguageElement.textContent = "-"
  cardRarityElement.textContent = "-"
  cardPsaRatingElement.textContent = "-"
  cardPsaValueElement.textContent = "-"
  cardValuePercentageElement.textContent = "-"
  cardViewCountElement.textContent = "-"
  productPermalinkElement.href = "#"
  productPermalinkElement.classList.add("disabled")
}

// Update the window.api object to use the new function
window.api = {
  getOnlineProducts: async () => {
    return await window.getOnlineProductsAPI()
  },
}

// Initialize the online products count
updateOnlineProductsCount()

// Declare wpApiSettings
var wpApiSettings = {
  nonce: "<?php echo wp_create_nonce( 'wp_rest' ); ?>", // Replace with the actual nonce value
}

// Initialize the calendar with async/await
async function initApp() {
  initCalendar()
  updateDateDisplay()

  try {
    // Initialize products first
    await fetchProducts()

    // Then render the calendar
    await renderCalendar(state.currentDate)

    // Initialize online products count
    await updateOnlineProductsCount()
  } catch (err) {
    console.error("Error initializing app:", err)
  }
}

// Call the init function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initApp().catch((err) => console.error("Error initializing app:", err))
})
