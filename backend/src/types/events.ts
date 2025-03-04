export enum EventType {
    PAGE_VIEW = "page_view",
    BUTTON_CLICK = "button_click",
    FORM_SUBMIT = "form_submit",
    PAGE_EXIT = "page_exit",
    RESOURCE_ACCESS = "resource_access",
    VIDEO_INTERACTION = "video_interaction",
    QUIZ_ATTEMPT = "quiz_attempt",
    LOGIN = "login",
    LOGOUT = "logout",
    SEARCH = "search",
    NAVIGATION = "navigation",
    DOWNLOAD = "download",
    UPLOAD = "upload",
    COMMENT = "comment",
    DISCUSSION_POST = "discussion_post",
    ASSIGNMENT_SUBMISSION = "assignment_submission",
    NOTIFICATION_CLICK = "notification_click",
    ERROR = "error",
}

export interface TrackingEvent {
    eventType: EventType
    url: string
    path: string
    details: Record<string, any>
    timestamp: string
    userId: string | null
    sessionId?: string | null
    deviceInfo?: Record<string, any>
    browserInfo?: Record<string, any>
    ipAddress?: string
    referrer?: string
    duration?: number
}

