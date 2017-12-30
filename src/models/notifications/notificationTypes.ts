export enum InsidrNotificationTypes {
    // question notifications
    NEW_QUESTION = "net.insidr.routing.EmailQuestionToExpertNotification",
    QUESTION_ESCALATE_BY_POSTER = "net.insidr.question.EscalatedQuestionByCustomerNotification",
    QUESTION_ESCALATE_BY_EXPERT = "net.insidr.routing.EmailQuestionToExpertNotification.EscalatedQuestionByExpertNotification",
    QUESTION_FLAG = "net.insidr.question.QuestionFlagNotification",
    QUESTION_CLOSE = "net.insidr.question.ClosedQuestionNotification",

    // response notifications
    RESPONSE_BY_EXPERT = "net.insidr.response.FirstResponseNotification",
    RESPONSE_COMMENT_BY_EXPERT = "net.insidr.response.AnswerNotification",
    RESPONSE_COMMENT_BY_POSTER = "net.insidr.response.NewApprovedResponseMessageNotification",
    RESPONSE_VIEWDED_BY_POSTER = "net.insidr.response.ResponseViewedByPosterNotification",

    RESPONSE_ACCEPT_BY_POSTER = "net.insidr.response.BestResponseNotification",
    RESPONSE_ACCEPT_BY_EXPERT = "net.insidr.response.ExpertEngagedWithResponseNotification",

    // rating
    RESPONSE_RATE_POSITIVE = "net.insidr.response.PositiveHappinessResponseNotification",
    RESPONSE_RATE_NEGATIVE = "net.insidr.response.NegativeHappinessResponseNotification",
    RESPONSE_TETIMONIAL = "net.insidr.testimonial.NewTestimonialNotification",

    // company
    COMPANY_BLOCKING_TASK = "net.insidr.question.NewCompanyBlockingTaskNotificatio",
}

export enum WebSocketNotificationTypes {
    CONNECTION_NEW = "CONNECTION_NEW",
    CONNECTION_CLOSED = "CONNECTION_CLOSE",
    CONNECTION_DROPPED = "CONNECTION_DROPPED",

    SEND_MESSAGE_TO_EXPERT = "SEND_MESSAGE_EXPERT",
    SEND_MESSAGE_TO_POSTER = "SEND_MESSAGE_TO_POSTER",
}
