// import { defineManifest } from "@crxjs/vite-plugin"

// export default defineManifest({
//   manifest_version: 3,
//   name: "CUT eLearning Analytics",
//   version: "1.0.0",
//   description: "Tracks student interactions on CUT's eLearning portal for analytics purposes",
//   permissions: ["storage", "activeTab", "scripting", "webNavigation"],
//   host_permissions: ["https://elearning.cut.ac.zw/*"],
//   background: {
//     service_worker: "src/background.ts",
//     type: "module",
//   },
//   content_scripts: [
//     {
//       matches: ["https://elearning.cut.ac.zw/*"],
//       js: ["src/content.ts"],
//     },
//   ],
//   action: {
//     default_popup: "src/popup.html",
//     default_icon: {
//       "16": "icons/icon16.png",
//       "32": "icons/icon32.png",
//       "48": "icons/icon48.png",
//       "128": "icons/icon128.png",
//     },
//   },
// })

