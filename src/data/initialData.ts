import {
  User,
  ClassRoom,
  Subject,
  Lesson,
  Assignment,
  AssignmentSubmission,
  LiveLesson,
  StudentActivity,
  NotificationItem,
  WeeklyScheduleItem,
} from '../types';

// Clean Slate: Zero demo data. Everything is added genuinely by the teacher.
export const INITIAL_CLASSES: ClassRoom[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_LESSONS: Lesson[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [];
export const INITIAL_LIVE_LESSONS: LiveLesson[] = [];
export const INITIAL_ACTIVITIES: StudentActivity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_SCHEDULE: WeeklyScheduleItem[] = [];
