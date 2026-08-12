import { onRequest as __api_calendar_ics_js_onRequest } from "C:\\Users\\Peter Sladkarov\\Documents\\TEXIMV AN\\functions\\api\\calendar.ics.js"
import { onRequest as __api_events_js_onRequest } from "C:\\Users\\Peter Sladkarov\\Documents\\TEXIMV AN\\functions\\api\\events.js"
import { onRequest as __api_send_js_onRequest } from "C:\\Users\\Peter Sladkarov\\Documents\\TEXIMV AN\\functions\\api\\send.js"

export const routes = [
    {
      routePath: "/api/calendar.ics",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_calendar_ics_js_onRequest],
    },
  {
      routePath: "/api/events",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_events_js_onRequest],
    },
  {
      routePath: "/api/send",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_send_js_onRequest],
    },
  ]