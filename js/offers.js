// Local storage key
const OFFERS_STORAGE_KEY = "weekly-offers"

// Get all offers
function getAllOffers() {
  const offersJson = localStorage.getItem(OFFERS_STORAGE_KEY)
  return offersJson ? JSON.parse(offersJson) : []
}

// Save all offers
function saveAllOffers(offers) {
  localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers))
}

// Get offers for a specific date
async function getOffersForDate(dateString, signal) {
  try {
    const response = await fetch(`${wpApiSettings.root}weekly-offers/v1/offers/date/${dateString}`, {
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": wpApiSettings.nonce,
      },
      signal // Pass the abort signal to the fetch request
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch offers for date")
    }
    
    return await response.json()
  } catch (error) {
    // If the error is an abort error, rethrow it to be handled by the caller
    if (error.name === 'AbortError') {
      throw error
    }
    console.error("Error fetching offers for date:", error)
    return []
  }
}

// Get offers for multiple dates
async function getOffersForDates(dateStrings, signal) {
  try {
    const response = await fetch(`${wpApiSettings.root}weekly-offers/v1/offers/dates`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": wpApiSettings.nonce,
      },
      body: JSON.stringify(dateStrings),
      signal // Pass the abort signal to the fetch request
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch offers for dates")
    }
    
    return await response.json()
  } catch (error) {
    // If the error is an abort error, rethrow it to be handled by the caller
    if (error.name === 'AbortError') {
      throw error
    }
    console.error("Error fetching offers for dates:", error)
    return {}
  }
}

// Save an offer
function saveOffer(offer) {
  const allOffers = getAllOffers()

  // Check if offer already exists
  const existingIndex = allOffers.findIndex((o) => o.id === offer.id)

  if (existingIndex !== -1) {
    // Update existing offer
    allOffers[existingIndex] = offer
  } else {
    // Add new offer
    allOffers.push(offer)
  }

  saveAllOffers(allOffers)
  return offer
}

// Delete an offer
function deleteOffer(offerId) {
  const allOffers = getAllOffers()
  const updatedOffers = allOffers.filter((offer) => offer.id !== offerId)
  saveAllOffers(updatedOffers)
}

export { getAllOffers, getOffersForDate, getOffersForDates, saveOffer, deleteOffer }
