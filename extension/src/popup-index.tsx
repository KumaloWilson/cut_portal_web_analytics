import { createRoot } from "react-dom/client"
import Popup from "./popup/Popup"
import React from "react"

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("root")
    if (container) {
        const root = createRoot(container)
        root.render(<Popup />)
    }
})

