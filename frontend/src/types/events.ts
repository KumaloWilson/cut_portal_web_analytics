export enum EventType {
    PAGE_VIEW = "page_view",
    BUTTON_CLICK = "button_click",
    FORM_SUBMIT = "form_submit",
    PAGE_EXIT = "page_exit",
    RESOURCE_ACCESS = "resource_access",
    VIDEO_INTERACTION = "video_interaction",
    QUIZ_ATTEMPT = "quiz_attempt",
}

export interface TrackingEvent {
    eventType: EventType
    url: string
    path: string
    details: Record<string, any>
    timestamp: string
    userId: string | null
}

