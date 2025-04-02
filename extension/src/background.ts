// Listen for navigation events
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    // Execute content script
    chrome.scripting
      .executeScript({
        target: { tabId: details.tabId },
        files: ["content.js"],
      })
      .catch((err) => console.error("Error executing content script:", err))
  },
  { url: [{ hostContains: "elearning.cut.ac.zw" }] },
)

// API endpoint
const API_ENDPOINT = "https://cutanalyticsapi.onrender.com/api"//"http://localhost:3000/api"

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "analytics_data") {
    // Store analytics data
    chrome.storage.local.set({ analyticsData: message.data })
    sendResponse({ status: "success" })
  } else if (message.type === "sync_data") {
    syncData()
      .then((response) => {
        sendResponse({ status: "success", data: response })
      })
      .catch((error) => {
        sendResponse({ status: "error", error: error.message })
      })
  } else if (message.type === "track_event") {
    // Send individual event to API immediately for real-time tracking
    sendEventToAPI(message.event)
      .then(() => {
        sendResponse({ status: "success" })
      })
      .catch((error) => {
        console.error("Error sending event to API:", error)
        // Store failed event for later retry
        storeFailedEvent(message.event)
        sendResponse({ status: "error", error: error.message })
      })
  }
  return true
})

// Send individual event to API
async function sendEventToAPI(event: any) {
  try {
    const response = await fetch(`${API_ENDPOINT}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending event to API:", error)
    storeFailedEvent(event)
    throw error
  }
}

// Store failed event for later retry
function storeFailedEvent(event: any) {
  chrome.storage.local.get(["failedEvents"], (result) => {
    const failedEvents = result.failedEvents || []
    failedEvents.push({
      event,
      timestamp: new Date().toISOString(),
    })
    chrome.storage.local.set({ failedEvents })
  })
}

// Set up alarm for periodic data sync
chrome.alarms.create("syncData", { periodInMinutes: 5 }) // Reduced from 15 to 5 minutes for more real-time updates

// Set up alarm for retrying failed events
chrome.alarms.create("retryFailedEvents", { periodInMinutes: 2 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncData") {
    syncData()
  } else if (alarm.name === "retryFailedEvents") {
    retryFailedEvents()
  }
})

// Retry failed events
async function retryFailedEvents() {
  chrome.storage.local.get(["failedEvents"], async (result) => {
    const failedEvents = result.failedEvents || []
    if (failedEvents.length === 0) return

    const newFailedEvents = []

    for (const item of failedEvents) {
      try {
        await sendEventToAPI(item.event)
        console.log("Successfully retried event:", item.event.event_type)
      } catch (error) {
        console.error("Error retrying event:", error)
        // Keep events that still failed for next retry
        newFailedEvents.push(item)
      }
    }

    chrome.storage.local.set({ failedEvents: newFailedEvents })
  })
}

// Sync data with backend
async function syncData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["analyticsData"], async (result) => {
      if (result.analyticsData) {
        try {
          // Send data to backend
          const response = await fetch(`${API_ENDPOINT}/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(result.analyticsData),
          })

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`)
          }

          const data = await response.json()
          console.log("Data synced successfully:", data)

          // Clear events that were successfully synced
          const analyticsData = result.analyticsData
          if (analyticsData && analyticsData.events) {
            analyticsData.events = []
            chrome.storage.local.set({ analyticsData })
          }

          resolve(data)
        } catch (error) {
          console.error("Error syncing data:", error)
          reject(error)
        }
      } else {
        resolve({ status: "no_data" })
      }
    })
  })
}

