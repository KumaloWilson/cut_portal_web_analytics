// Add real-time status indicator
let lastSyncTime = 0
let syncStatus = "idle" // "idle", "syncing", "success", "error"

// Update UI with analytics data
function updateUI() {
  chrome.storage.local.get(["analyticsData", "trackingEnabled", "lastSyncTime", "syncStatus"], (result) => {
    const analyticsData = result.analyticsData
    const trackingEnabled = result.trackingEnabled !== false // Default to true
    lastSyncTime = result.lastSyncTime || 0
    syncStatus = result.syncStatus || "idle"

    if (analyticsData) {
      // Update student info
      if (analyticsData.student) {
        document.getElementById("student-name")!.textContent =
          `${analyticsData.student.first_name} ${analyticsData.student.surname}`
        document.getElementById("student-id")!.textContent = `ID: ${analyticsData.student.student_id}`
      }

      // Update session stats
      const session = analyticsData.current_session
      if (session) {
        // Calculate session duration
        const startTime = new Date(session.start_time)
        const lastActivity = new Date(session.last_activity)
        const durationMs = lastActivity.getTime() - startTime.getTime()
        const durationMinutes = Math.floor(durationMs / 60000)
        const durationSeconds = Math.floor((durationMs % 60000) / 1000)

        document.getElementById("session-duration")!.textContent =
          `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}`

        document.getElementById("pages-visited")!.textContent = session.pages_visited.toString()
      }

      // Update events count
      document.getElementById("events-tracked")!.textContent = analyticsData.events.length.toString()

      // Update last sync time
      if (lastSyncTime > 0) {
        const syncTimeAgo = Math.floor((Date.now() - lastSyncTime) / 1000)
        let syncTimeText = ""

        if (syncTimeAgo < 60) {
          syncTimeText = `${syncTimeAgo} seconds ago`
        } else if (syncTimeAgo < 3600) {
          syncTimeText = `${Math.floor(syncTimeAgo / 60)} minutes ago`
        } else {
          syncTimeText = `${Math.floor(syncTimeAgo / 3600)} hours ago`
        }

        document.getElementById("last-sync-time")!.textContent = syncTimeText
      } else {
        document.getElementById("last-sync-time")!.textContent = "Never"
      }

      // Update sync status
      const syncStatusElement = document.getElementById("sync-status")!
      syncStatusElement.className = `sync-status ${syncStatus}`

      switch (syncStatus) {
        case "syncing":
          syncStatusElement.textContent = "Syncing..."
          break
        case "success":
          syncStatusElement.textContent = "Synced"
          break
        case "error":
          syncStatusElement.textContent = "Sync failed"
          break
        default:
          syncStatusElement.textContent = "Idle"
      }
    }

    // Update tracking status
    const statusIndicator = document.getElementById("status-indicator")!
    const statusText = document.getElementById("status-text")!
    const toggleButton = document.getElementById("toggle-tracking")!

    if (trackingEnabled) {
      statusIndicator.className = "status-indicator active"
      statusText.textContent = "Tracking active"
      toggleButton.textContent = "Pause Tracking"
      toggleButton.className = "primary"
    } else {
      statusIndicator.className = "status-indicator inactive"
      statusText.textContent = "Tracking paused"
      toggleButton.textContent = "Resume Tracking"
      toggleButton.className = "secondary"
    }
  })
}

// Toggle tracking
document.getElementById("toggle-tracking")!.addEventListener("click", () => {
  chrome.storage.local.get(["trackingEnabled"], (result) => {
    const newState = result.trackingEnabled !== false ? false : true
    chrome.storage.local.set({ trackingEnabled: newState }, () => {
      updateUI()

      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "toggle_tracking",
            enabled: newState,
          })
        }
      })
    })
  })
})

// Sync data
document.getElementById("sync-data")!.addEventListener("click", () => {
  // Update sync status
  chrome.storage.local.set({ syncStatus: "syncing" })
  updateUI()

  chrome.runtime.sendMessage({ type: "sync_data" }, (response) => {
    if (response && response.status === "success") {
      // Update last sync time and status
      chrome.storage.local.set({
        lastSyncTime: Date.now(),
        syncStatus: "success",
      })

      alert("Data synced successfully!")
      updateUI()
    } else {
      // Update sync status to error
      chrome.storage.local.set({ syncStatus: "error" })
      alert("Failed to sync data. Please try again later.")
      updateUI()
    }
  })
})

// Clear data
document.getElementById("clear-data")!.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all local analytics data? This cannot be undone.")) {
    chrome.storage.local.remove(["analyticsData"], () => {
      alert("Local data cleared successfully.")
      updateUI()
    })
  }
})

// Update UI when popup opens
document.addEventListener("DOMContentLoaded", updateUI)

// Set up interval to update UI every second
setInterval(updateUI, 1000)

