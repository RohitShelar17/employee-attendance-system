package com.company.attendance.enums;

/**
 * What happened.
 *
 * <p>The type drives the icon and grouping only. The words a person reads are
 * written once, when the event happens, and stored on the row — see the note
 * on the notifications table about why they are never regenerated.
 */
public enum NotificationType {

    // Something needs a decision from the recipient.
    LEAVE_APPROVAL_REQUESTED(NotificationCategory.APPROVAL),
    REGULARIZATION_APPROVAL_REQUESTED(NotificationCategory.APPROVAL),
    WFH_APPROVAL_REQUESTED(NotificationCategory.APPROVAL),

    // The recipient's own request was decided.
    LEAVE_APPROVED(NotificationCategory.LEAVE),
    LEAVE_REJECTED(NotificationCategory.LEAVE),
    REGULARIZATION_APPROVED(NotificationCategory.REQUEST),
    REGULARIZATION_REJECTED(NotificationCategory.REQUEST),
    WFH_APPROVED(NotificationCategory.REQUEST),
    WFH_REJECTED(NotificationCategory.REQUEST),

    // Withdrawn or cancelled by the applicant — the approver should stop waiting.
    REQUEST_WITHDRAWN(NotificationCategory.APPROVAL),

    ATTENDANCE_MISSING_PUNCH_OUT(NotificationCategory.ATTENDANCE),
    ATTENDANCE_MARKED_ABSENT(NotificationCategory.ATTENDANCE),

    SYSTEM_ANNOUNCEMENT(NotificationCategory.SYSTEM);

    private final NotificationCategory category;

    NotificationType(NotificationCategory category) {
        this.category = category;
    }

    public NotificationCategory getCategory() {
        return category;
    }
}
