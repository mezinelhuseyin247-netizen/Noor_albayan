export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password?: string; // stored for student credential cards & login
  name: string;
  role: UserRole;
  teacherId?: string; // Links student permanently to the teacher who created them
  avatar?: string; // base64 photo URL or avatar letter
  coverPhoto?: string; // base64 cover photo URL or gradient/preset
  bio?: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  classId?: string; // For students
  sectionId?: string; // For students (e.g. "شعبة أ")
  isOnline: boolean;
  isActive: boolean; // Account status: true = active, false = disabled/suspended by teacher
  lastActive: string;
  createdAt: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "الصف الأول الثانوي"
  stage: string; // e.g. "المرحلة الثانوية"
  gradeNumber: number;
  sections: string[]; // e.g. ["شعبة أ", "شعبة ب", "شعبة ج"]
  color: string;
  iconName?: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "اللغة العربية (لغتي الخالدة)", "الرياضيات"
  classId: string;
  icon: string;
  color: string;
  description: string;
  teacherName: string;
}

export interface ExternalLink {
  title: string;
  url: string;
  type?: 'youtube' | 'drive' | 'link' | 'pdf' | 'zoom';
}

export interface LessonAttachment {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  classId: string;
  sectionId?: string; // all or specific section
  title: string;
  content: string; // rich text / markdown
  summary?: string;
  videoUrl?: string; // YouTube embed or video link
  externalLinks: ExternalLink[];
  attachments: LessonAttachment[];
  createdAt: string;
  viewsCount?: number;
}

export interface Assignment {
  id: string;
  teacherId?: string; // Teacher who created the assignment
  subjectId: string;
  classId: string;
  sectionId?: string; // all or specific section
  title: string;
  description: string;
  instructions?: string;
  maxScore: number; // default 100
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  externalLink?: string; // optional external link
  externalLinkTitle?: string;
  referenceImageUrl?: string;
  images?: {
    id: string;
    name: string;
    url: string; // base64 or storage url
  }[]; // Multiple assignment worksheet/pages images uploaded by teacher
  files?: {
    id: string;
    name: string;
    url: string; // base64 or storage url
    size?: string;
    type?: string;
  }[]; // Multiple attached files/PDFs/documents
  attachmentName?: string;
  openedBy?: string[]; // IDs of students who opened the assignment
  createdAt: string;
  status?: 'published' | 'draft';
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  sectionId: string; // "الكل" or specific section name like "شعبة أ"
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes?: number; // duration in minutes
  instructions: string; // Teacher instructions / notes
  maxScore: number; // e.g. 100
  pdfFile?: {
    name: string;
    url: string; // base64 or link
    size?: string;
  };
  images: {
    id: string;
    name: string;
    url: string; // base64
  }[];
  openedBy?: string[]; // Student IDs who opened the exam
  createdAt: string;
  status?: 'published' | 'draft';
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  classId: string;
  sectionId: string;
  submittedAt: string;
  answerImages: {
    id: string;
    name: string;
    url: string; // base64 uploaded from device gallery/files
  }[];
  studentNotes?: string;
  status: 'submitted' | 'graded';
  score?: number; // Teacher entered score
  percentage?: number; // percentage (score / maxScore) * 100
  teacherNotes?: string;
  gradedAt?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  submittedAt: string;
  solutionText: string;
  solutionImageUrl?: string; // single image backward-compatibility
  solutionImages?: {
    id: string;
    name: string;
    url: string; // base64 uploaded from device gallery/files
  }[]; // Multiple solution images (pages/answers)
  solutionFiles?: {
    id: string;
    name: string;
    url: string; // base64 or storage url
    size?: string;
    type?: string;
  }[]; // Multiple attached solution files/PDFs
  status: 'submitted' | 'late' | 'graded' | 'returned';
  score?: number; // 0 to 100
  teacherFeedback?: string;
  gradedAt?: string;
}

export interface LiveLesson {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  sectionId?: string;
  platform: 'google_meet' | 'zoom' | 'teams' | 'other';
  meetingUrl: string;
  meetingId?: string;
  passcode?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  description?: string;
  teacherName: string;
}

export interface StudentActivity {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  type: 'login' | 'logout' | 'view_lesson' | 'open_assignment' | 'submit_assignment' | 'join_live';
  details: string;
  timestamp: string;
  relatedId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // target user or 'all' or 'teacher'
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'live' | 'lesson' | 'system';
  read: boolean;
  timestamp: string;
  linkTab?: string;
}

export type DayOfWeek = 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';

export interface WeeklyScheduleItem {
  id: string;
  day: DayOfWeek;
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:45"
  classId: string;
  sectionId?: string; // specific section or "جميع الشُعب"
  subjectId?: string;
  subjectName: string;
  lessonTitle?: string;
  teacherName: string;
  roomOrLink?: string;
  notes?: string;
  color?: string;
  createdAt: string;
}
