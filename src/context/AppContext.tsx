import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Exam,
  ExamSubmission,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_LESSONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_LIVE_LESSONS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCHEDULE,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  students: User[];
  allStudents?: User[];
  teachers: User[];
  classes: ClassRoom[];
  subjects: Subject[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  liveLessons: LiveLesson[];
  activities: StudentActivity[];
  notifications: NotificationItem[];
  weeklySchedule: WeeklyScheduleItem[];
  exams: Exam[];
  examSubmissions: ExamSubmission[];

  // Online Cloud Sync Status
  isOnlineSynced: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTimestamp: string;
  forceServerSync: () => Promise<void>;
  
  // Auth
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  registerTeacher: (data: { name: string; username: string; password: string; email?: string; phone?: string; specialty?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string; resetToken?: string; teacher?: { id: string; name: string; username: string; email?: string } }>;
  resetPasswordWithToken: (token: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string; message?: string; username?: string }>;
  logout: () => void;
  quickSwitchUser: (userId: string) => void;
  
  // Student Management
  addStudent: (data: Omit<User, 'id' | 'role' | 'isOnline' | 'isActive' | 'lastActive' | 'createdAt'> & { isActive?: boolean; teacherId?: string }) => { success: boolean; error?: string; student?: User };
  updateStudent: (studentId: string, data: Partial<User>) => void;
  toggleStudentStatus: (studentId: string) => void;
  resetStudentPassword: (studentId: string, newPassword: string) => void;
  deleteStudent: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Class & Section Management
  addClass: (data: Omit<ClassRoom, 'id'>) => ClassRoom;
  updateClass: (classId: string, data: Partial<ClassRoom>) => void;
  deleteClass: (classId: string) => void;
  addSectionToClass: (classId: string, sectionName: string) => void;
  
  // Subjects & Lessons
  addSubject: (data: Omit<Subject, 'id'>) => void;
  addLesson: (data: Omit<Lesson, 'id' | 'createdAt'>) => void;
  updateLesson: (lessonId: string, data: Partial<Lesson>) => void;
  deleteLesson: (lessonId: string) => void;

  // Weekly Schedule (البرنامج الأسبوعي)
  addScheduleItem: (data: Omit<WeeklyScheduleItem, 'id' | 'createdAt'>) => void;
  updateScheduleItem: (id: string, data: Partial<WeeklyScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  
  // Assignments & Grading
  createAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; assignment?: Assignment }>;
  addAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; assignment?: Assignment }>;
  publishAssignment: (assignmentId: string) => Promise<{ success: boolean; error?: string }>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  submitAssignment: (
    assignmentId: string,
    solutionText: string,
    solutionImageUrl?: string,
    solutionImages?: { id: string; name: string; url: string }[],
    solutionFiles?: { id: string; name: string; url: string; size?: string; type?: string }[]
  ) => Promise<void>;
  gradeSubmission: (submissionId: string, score: number, teacherFeedback: string) => Promise<void>;
  recordAssignmentOpen: (assignmentId: string) => void;
  
  // Exams (الامتحانات)
  createExam: (data: Omit<Exam, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; exam?: Exam }>;
  addExam: (data: Omit<Exam, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; exam?: Exam }>;
  publishExam: (examId: string) => Promise<{ success: boolean; error?: string }>;
  updateExam: (examId: string, data: Partial<Omit<Exam, 'id' | 'createdAt'>>) => Promise<{ success: boolean; error?: string }>;
  deleteExam: (examId: string) => Promise<void>;
  recordExamOpen: (examId: string) => void;
  submitExamAnswer: (examId: string, answerImages: { id: string; name: string; url: string }[], studentNotes?: string) => Promise<void>;
  gradeExamSubmission: (submissionId: string, score: number, teacherNotes?: string) => Promise<void>;

  // Live Sessions
  createLiveLesson: (data: Omit<LiveLesson, 'id'>) => Promise<{ success: boolean; error?: string; liveLesson?: LiveLesson }>;
  addLiveLesson: (data: Omit<LiveLesson, 'id'>) => Promise<{ success: boolean; error?: string; liveLesson?: LiveLesson }>;
  updateLiveLessonStatus: (id: string, status: LiveLesson['status']) => void;
  deleteLiveLesson: (id: string) => void;
  
  // Notifications & Activities
  logActivity: (type: StudentActivity['type'], details: string, relatedId?: string, targetStudentId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDemoData: () => void;

  // Feedback Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEYS = {
  USERS: 'noor_bayan_users_v2',
  CLASSES: 'noor_bayan_classes_v2',
  SUBJECTS: 'noor_bayan_subjects_v2',
  LESSONS: 'noor_bayan_lessons_v2',
  ASSIGNMENTS: 'noor_bayan_assignments_v2',
  SUBMISSIONS: 'noor_bayan_submissions_v2',
  LIVE_LESSONS: 'noor_bayan_live_v2',
  ACTIVITIES: 'noor_bayan_activities_v2',
  NOTIFICATIONS: 'noor_bayan_notifs_v2',
  SCHEDULE: 'noor_bayan_schedule_v2',
  EXAMS: 'noor_bayan_exams_v2',
  EXAM_SUBMISSIONS: 'noor_bayan_exam_submissions_v2',
  CURRENT_USER_ID: 'noor_bayan_curr_user_v2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage quota warning', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [classes, setClasses] = useState<ClassRoom[]>(() => loadFromStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS));
  const [lessons, setLessons] = useState<Lesson[]>(() => loadFromStorage(STORAGE_KEYS.LESSONS, INITIAL_LESSONS));
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS));
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => loadFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS));
  const [liveLessons, setLiveLessons] = useState<LiveLesson[]>(() => loadFromStorage(STORAGE_KEYS.LIVE_LESSONS, INITIAL_LIVE_LESSONS));
  const [activities, setActivities] = useState<StudentActivity[]>(() => loadFromStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleItem[]>(() => loadFromStorage(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE));
  const [exams, setExams] = useState<Exam[]>(() => loadFromStorage(STORAGE_KEYS.EXAMS, []));
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>(() => loadFromStorage(STORAGE_KEYS.EXAM_SUBMISSIONS, []));

  // Sync state trackers
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isOnlineSynced, setIsOnlineSynced] = useState<boolean>(true);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>(() => new Date().toISOString());

  // Current logged in user
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'teacher-1';
  });

  // Global Toast Message (e.g. "تم النشر بنجاح")
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  const isInitialSyncDone = useRef(false);
  const serverVersionRef = useRef<number>(0);
  const localMutationPending = useRef(false);

  // Sync state to local storage backup
  useEffect(() => saveToStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLASSES, classes), [classes]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SUBJECTS, subjects), [subjects]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LESSONS, lessons), [lessons]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments), [assignments]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions), [submissions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LIVE_LESSONS, liveLessons), [liveLessons]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ACTIVITIES, activities), [activities]);
  useEffect(() => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications), [notifications]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SCHEDULE, weeklySchedule), [weeklySchedule]);
  useEffect(() => saveToStorage(STORAGE_KEYS.EXAMS, exams), [exams]);
  useEffect(() => saveToStorage(STORAGE_KEYS.EXAM_SUBMISSIONS, examSubmissions), [examSubmissions]);

  // Helper to push updates to server
  const pushStateToServer = useCallback(async (payload: any) => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.version) serverVersionRef.current = data.version;
        setSyncStatus('synced');
        setIsOnlineSynced(true);
        setLastSyncTimestamp(new Date().toISOString());
      } else {
        setSyncStatus('offline');
      }
    } catch (err) {
      console.warn('Network sync offline or degraded:', err);
      setSyncStatus('offline');
      setIsOnlineSynced(false);
    }
  }, []);

  // Fetch complete state from online server (Multi-device live synchronization)
  const fetchStateFromServer = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const data = await res.json();

      if (data && data.version && data.version > serverVersionRef.current) {
        serverVersionRef.current = data.version;

        if (data.users) setUsers(data.users);
        if (data.classes) setClasses(data.classes);
        if (data.subjects) setSubjects(data.subjects);
        if (data.lessons) setLessons(data.lessons);
        if (data.assignments) setAssignments(data.assignments);
        if (data.submissions) setSubmissions(data.submissions);
        if (data.liveLessons) setLiveLessons(data.liveLessons);
        if (data.activities) setActivities(data.activities);
        if (data.notifications) setNotifications(data.notifications);
        if (data.weeklySchedule) setWeeklySchedule(data.weeklySchedule);
        if (data.exams) setExams(data.exams);
        if (data.examSubmissions) setExamSubmissions(data.examSubmissions);

        setSyncStatus('synced');
        setIsOnlineSynced(true);
        setLastSyncTimestamp(new Date().toISOString());
      } else if (isInitial && data) {
        if (data.users) setUsers(data.users);
        if (data.classes) setClasses(data.classes);
        if (data.subjects) setSubjects(data.subjects);
        if (data.lessons) setLessons(data.lessons);
        if (data.assignments) setAssignments(data.assignments);
        if (data.submissions) setSubmissions(data.submissions);
        if (data.liveLessons) setLiveLessons(data.liveLessons);
        if (data.activities) setActivities(data.activities);
        if (data.notifications) setNotifications(data.notifications);
        if (data.weeklySchedule) setWeeklySchedule(data.weeklySchedule);
        if (data.exams) setExams(data.exams);
        if (data.examSubmissions) setExamSubmissions(data.examSubmissions);
        if (data.version) serverVersionRef.current = data.version;

        setSyncStatus('synced');
        setIsOnlineSynced(true);
      }
    } catch (err) {
      console.warn('Could not fetch server state:', err);
      setSyncStatus('offline');
      setIsOnlineSynced(false);
    }
  }, []);

  // Initial load and periodic multi-client background polling
  useEffect(() => {
    fetchStateFromServer(true).then(() => {
      isInitialSyncDone.current = true;
    });

    // Poll server every 3.5 seconds so changes from another phone/PC reflect live
    const interval = setInterval(() => {
      if (!localMutationPending.current) {
        fetchStateFromServer(false);
      }
    }, 3500);

    const onFocus = () => {
      fetchStateFromServer(false);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchStateFromServer]);

  const forceServerSync = async () => {
    setSyncStatus('syncing');
    await fetchStateFromServer(true);
  };

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  // Students permanently linked to the teacher who created them
  // - A teacher only sees their own students (a new teacher begins with an empty student list)
  // - A student only sees peer students under the same teacher
  const students = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'teacher') {
      return users.filter(
        (u) => u.role === 'student' && (u.teacherId === currentUser.id || (!u.teacherId && currentUser.id === 'teacher-1'))
      );
    }
    return users.filter(
      (u) => u.role === 'student' && (!currentUser.teacherId || u.teacherId === currentUser.teacherId)
    );
  }, [users, currentUser]);

  const allStudents = useMemo(() => users.filter((u) => u.role === 'student'), [users]);
  const teachers = users.filter((u) => u.role === 'teacher');

  // Log activity helper
  const logActivity = useCallback((
    type: StudentActivity['type'],
    details: string,
    relatedId?: string,
    targetStudentId?: string
  ) => {
    const actStudentId = targetStudentId || (currentUser?.role === 'student' ? currentUser.id : null);
    const targetUser = users.find(u => u.id === actStudentId);
    
    if (!actStudentId || !targetUser) return;

    const newAct: StudentActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId: actStudentId,
      studentName: targetUser.name,
      type,
      details,
      timestamp: new Date().toISOString(),
      relatedId,
    };

    setActivities(prev => {
      const next = [newAct, ...prev.slice(0, 150)];
      pushStateToServer({ activities: next });
      return next;
    });

    // Update user's lastActive timestamp & online status
    setUsers(prev => {
      const next = prev.map(u => {
        if (u.id === actStudentId) {
          return { ...u, isOnline: true, lastActive: new Date().toISOString() };
        }
        return u;
      });
      pushStateToServer({ users: next });
      return next;
    });
  }, [currentUser, users, pushStateToServer]);

  // Auth: Login via online server endpoint
  const login = async (username: string, password?: string) => {
    const trimmedUser = username.trim().toLowerCase();
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: password?.trim() }),
      });
      
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        // Sync local users
        setUsers(prev => prev.map(u => u.id === data.user.id ? data.user : u));
        setCurrentUserId(data.user.id);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, data.user.id);
        setSyncStatus('synced');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.' };
      }
    } catch {
      // Fallback offline validation
      const user = users.find(u => u.username.toLowerCase() === trimmedUser);
      if (!user) {
        return { success: false, error: 'اسم المستخدم غير موجود بالنظام. يرجى مراجعة المعلم للحصول على بيانات حسابك.' };
      }
      if (password && user.password && user.password !== password.trim()) {
        return { success: false, error: 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.' };
      }
      if (!user.isActive) {
        return { success: false, error: 'عذرًا، هذا الحساب معطل حاليًا من قِبل إدارة المنصة والمعلم. يرجى التواصل مع معلمك لإعادة تفعيله.' };
      }

      const updatedUsers = users.map(u => u.id === user.id ? { ...u, isOnline: true, lastActive: new Date().toISOString() } : u);
      setUsers(updatedUsers);
      pushStateToServer({ users: updatedUsers });
      setCurrentUserId(user.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      return { success: true };
    }
  };

  // Auth: Teacher Self-Registration via online server endpoint
  const registerTeacher = async (data: {
    name: string;
    username: string;
    password: string;
    email?: string;
    phone?: string;
    specialty?: string;
  }) => {
    const trimmedUser = data.username.trim().toLowerCase();

    try {
      const res = await fetch('/api/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          username: trimmedUser,
          password: data.password.trim(),
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.user) {
        setUsers((prev) => {
          const next = [...prev.filter((u) => u.id !== resData.user.id), resData.user];
          return next;
        });
        setCurrentUserId(resData.user.id);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, resData.user.id);
        setSyncStatus('synced');
        return { success: true, user: resData.user };
      } else {
        return {
          success: false,
          error: resData.error || 'تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى.',
        };
      }
    } catch {
      // Local fallback
      const existing = users.find((u) => u.username.toLowerCase() === trimmedUser);
      if (existing) {
        return { success: false, error: 'اسم المستخدم مستخدم مسبقاً، يرجى اختيار اسم مستخدم آخر.' };
      }

      const newTeacher: User = {
        id: `teacher-${Date.now()}`,
        name: data.name.trim(),
        username: trimmedUser,
        password: data.password.trim(),
        role: 'teacher',
        email: data.email?.trim(),
        phone: data.phone?.trim(),
        notes: data.specialty ? `التخصص: ${data.specialty.trim()}` : 'معلم معتمد',
        avatar: data.name.trim().charAt(0),
        isOnline: true,
        isActive: true,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const nextUsers = [...users, newTeacher];
      setUsers(nextUsers);
      pushStateToServer({ users: nextUsers });
      setCurrentUserId(newTeacher.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newTeacher.id);
      return { success: true, user: newTeacher };
    }
  };

  // Auth: Request Password Reset for Teachers (Email-based)
  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          resetToken: data.resetToken,
          teacher: data.teacher,
        };
      } else {
        return {
          success: false,
          error: data.error || 'لم يتم العثور على أي حساب معلم مرتبط بهذا البريد الإلكتروني.',
        };
      }
    } catch {
      // Local fallback for when offline
      const cleanEmail = email.trim().toLowerCase();
      const teacher = users.find(
        (u) => u.role === 'teacher' && u.email && u.email.trim().toLowerCase() === cleanEmail
      );
      if (teacher) {
        const localToken = `local-token-${Date.now()}`;
        return {
          success: true,
          message: 'تم العثور على الحساب. يرجى إدخال كلمة المرور الجديدة.',
          resetToken: localToken,
          teacher: {
            id: teacher.id,
            name: teacher.name,
            username: teacher.username,
            email: teacher.email,
          },
        };
      }
      return {
        success: false,
        error: 'لم يتم العثور على أي حساب معلم مرتبط بهذا البريد الإلكتروني في قاعدة البيانات.',
      };
    }
  };

  // Auth: Reset Password with Token
  const resetPasswordWithToken = async (token: string, newPassword: string, confirmPassword?: string) => {
    try {
      const res = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
        }
        // Refresh state from server to sync updated user
        fetchStateFromServer(false);
        return {
          success: true,
          message: data.message,
          username: data.username,
        };
      } else {
        return {
          success: false,
          error: data.error || 'تعذر تعيين كلمة المرور الجديدة.',
        };
      }
    } catch {
      // Local fallback
      return {
        success: false,
        error: 'تعذر الاتصال بالخادم السحابي، يرجى المحاولة مرة أخرى.',
      };
    }
  };

  // Auth: Logout
  const logout = () => {
    const activeId = currentUserId;
    if (activeId) {
      fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeId }),
      }).catch(() => {});

      const updatedUsers = users.map(u => u.id === activeId ? { ...u, isOnline: false, lastActive: new Date().toISOString() } : u);
      setUsers(updatedUsers);
      pushStateToServer({ users: updatedUsers });
    }
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  };

  // Quick switch for testing roles easily
  const quickSwitchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    if (!target.isActive && target.role === 'student') {
      alert(`تنبيه: حساب الطالب "${target.name}" معطل حاليًا من قبل المعلم ولا يمكنه الدخول حتى يتم تفعيله.`);
      return;
    }

    const updatedUsers = users.map(u => u.id === userId ? { ...u, isOnline: true, lastActive: new Date().toISOString() } : u);
    setUsers(updatedUsers);
    pushStateToServer({ users: updatedUsers });

    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);

    if (target.role === 'student') {
      logActivity('login', 'دخول الطالب إلى المنصة', undefined, target.id);
    }
  };

  // Student CRUD (Teacher Only - permanently linked to creating teacher)
  const addStudent = (data: Omit<User, 'id' | 'role' | 'isOnline' | 'isActive' | 'lastActive' | 'createdAt'> & { isActive?: boolean; teacherId?: string }) => {
    const usernameClean = data.username.trim().toLowerCase();
    const existing = users.find(u => u.username.toLowerCase() === usernameClean);
    if (existing) {
      return { success: false, error: 'اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم مستخدم آخر.' };
    }

    const assignedTeacherId = data.teacherId || (currentUser?.role === 'teacher' ? currentUser.id : undefined);

    const newStudent: User = {
      id: `student-${Date.now()}`,
      username: usernameClean,
      password: data.password || '123',
      name: data.name.trim(),
      role: 'student',
      teacherId: assignedTeacherId,
      classId: data.classId,
      sectionId: data.sectionId || 'شعبة أ',
      phone: data.phone,
      notes: data.notes,
      isOnline: false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, newStudent];
    setUsers(nextUsers);
    saveToStorage(STORAGE_KEYS.USERS, nextUsers);
    pushStateToServer({ users: nextUsers });

    // Directly persist to backend cloud storage
    fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-teacher-id': assignedTeacherId || '',
      },
      body: JSON.stringify({ ...data, teacherId: assignedTeacherId }),
    }).catch(() => {});

    return { success: true, student: newStudent };
  };

  const updateStudent = (studentId: string, data: Partial<User>) => {
    const next = users.map(u => (u.id === studentId ? { ...u, ...data } : u));
    setUsers(next);
    pushStateToServer({ users: next });
    fetch(`/api/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  const toggleStudentStatus = (studentId: string) => {
    const next = users.map(u => {
      if (u.id === studentId) {
        const nextState = !u.isActive;
        return {
          ...u,
          isActive: nextState,
          isOnline: nextState ? u.isOnline : false,
        };
      }
      return u;
    });
    setUsers(next);
    pushStateToServer({ users: next });
  };

  const resetStudentPassword = (studentId: string, newPassword: string) => {
    const next = users.map(u => (u.id === studentId ? { ...u, password: newPassword } : u));
    setUsers(next);
    pushStateToServer({ users: next });
  };

  const deleteStudent = async (studentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const teacherId = currentUser?.role === 'teacher' ? currentUser.id : '';
      const res = await fetch(`/api/users/${studentId}?teacherId=${encodeURIComponent(teacherId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherId,
          'x-user-id': currentUser?.id || '',
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'تعذر حذف حساب الطالب');
      }

      const nextUsers = users.filter(u => u.id !== studentId);
      setUsers(nextUsers);
      saveToStorage(STORAGE_KEYS.USERS, nextUsers);

      const nextSubmissions = submissions.filter(s => s.studentId !== studentId);
      setSubmissions(nextSubmissions);
      saveToStorage(STORAGE_KEYS.SUBMISSIONS, nextSubmissions);

      const nextExamSubs = examSubmissions.filter(s => s.studentId !== studentId);
      setExamSubmissions(nextExamSubs);
      saveToStorage(STORAGE_KEYS.EXAM_SUBMISSIONS, nextExamSubs);

      await pushStateToServer({ users: nextUsers, submissions: nextSubmissions, examSubmissions: nextExamSubs });
      showToast('تم حذف الطالب بنجاح من قاعدة البيانات');
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting student:', err);
      // Local fallback
      const nextUsers = users.filter(u => u.id !== studentId);
      setUsers(nextUsers);
      saveToStorage(STORAGE_KEYS.USERS, nextUsers);
      await pushStateToServer({ users: nextUsers });
      showToast('تم حذف الطالب بنجاح');
      return { success: true };
    }
  };

  // Class Management
  const addClass = (data: Omit<ClassRoom, 'id'>): ClassRoom => {
    const newClass: ClassRoom = {
      ...data,
      id: `class-${Date.now()}`,
    };
    const next = [...classes, newClass];
    setClasses(next);
    pushStateToServer({ classes: next });
    return newClass;
  };

  const updateClass = (classId: string, data: Partial<ClassRoom>) => {
    const next = classes.map(c => (c.id === classId ? { ...c, ...data } : c));
    setClasses(next);
    pushStateToServer({ classes: next });
  };

  const deleteClass = (classId: string) => {
    const next = classes.filter(c => c.id !== classId);
    setClasses(next);
    pushStateToServer({ classes: next });
  };

  const addSectionToClass = (classId: string, sectionName: string) => {
    const next = classes.map(c => {
      if (c.id === classId && !c.sections.includes(sectionName)) {
        return { ...c, sections: [...c.sections, sectionName] };
      }
      return c;
    });
    setClasses(next);
    pushStateToServer({ classes: next });
  };

  // Subjects & Lessons
  const addSubject = (data: Omit<Subject, 'id'>) => {
    const newSubj: Subject = {
      ...data,
      id: `subj-${Date.now()}`,
    };
    const next = [...subjects, newSubj];
    setSubjects(next);
    pushStateToServer({ subjects: next });
  };

  const addLesson = (data: Omit<Lesson, 'id' | 'createdAt'>) => {
    const newLesson: Lesson = {
      ...data,
      id: `lesson-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
    };
    const nextLessons = [newLesson, ...lessons];
    setLessons(nextLessons);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'درس تعليمي جديد 📖',
      message: `تمت إضافة درس جديد: "${data.title}"`,
      type: 'lesson',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'lessons',
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);

    pushStateToServer({ lessons: nextLessons, notifications: nextNotifs });
  };

  const updateLesson = (lessonId: string, data: Partial<Lesson>) => {
    const next = lessons.map(l => (l.id === lessonId ? { ...l, ...data } : l));
    setLessons(next);
    pushStateToServer({ lessons: next });
  };

  const deleteLesson = (lessonId: string) => {
    const next = lessons.filter(l => l.id !== lessonId);
    setLessons(next);
    pushStateToServer({ lessons: next });
  };

  // Weekly Schedule Methods (البرنامج الأسبوعي)
  const addScheduleItem = (data: Omit<WeeklyScheduleItem, 'id' | 'createdAt'>) => {
    const newItem: WeeklyScheduleItem = {
      ...data,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const next = [...weeklySchedule, newItem];
    setWeeklySchedule(next);
    pushStateToServer({ weeklySchedule: next });
  };

  const updateScheduleItem = (id: string, data: Partial<WeeklyScheduleItem>) => {
    const next = weeklySchedule.map(item => (item.id === id ? { ...item, ...data } : item));
    setWeeklySchedule(next);
    pushStateToServer({ weeklySchedule: next });
  };

  const deleteScheduleItem = (id: string) => {
    const next = weeklySchedule.filter(item => item.id !== id);
    setWeeklySchedule(next);
    pushStateToServer({ weeklySchedule: next });
  };

  // Assignments
  const createAssignment = async (data: Omit<Assignment, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string; assignment?: Assignment }> => {
    try {
      const assignmentId = `assign-${Date.now()}`;
      const requestingTeacherId = currentUser?.role === 'teacher' ? currentUser.id : undefined;
      const imagesList = Array.isArray(data.images) ? data.images : [];
      const primaryImg = data.referenceImageUrl || (imagesList[0]?.url) || undefined;

      const newAssign: Assignment = {
        ...data,
        id: assignmentId,
        teacherId: requestingTeacherId,
        images: imagesList,
        referenceImageUrl: primaryImg,
        status: data.status || 'published',
        createdAt: new Date().toISOString(),
        openedBy: [],
      };
      const nextAssigns = [newAssign, ...assignments.filter(a => a.id !== assignmentId)];
      setAssignments(nextAssigns);
      saveToStorage(STORAGE_KEYS.ASSIGNMENTS, nextAssigns);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: 'واجب دراسي جديد 📝',
        message: `تم نشر واجب جديد: "${data.title}". موعد التسليم: ${data.dueDate}`,
        type: 'assignment',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'assignments',
      };
      const nextNotifs = [newNotif, ...notifications];
      setNotifications(nextNotifs);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, nextNotifs);

      // Direct save to /api/assignments
      try {
        const resp = await fetch('/api/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-teacher-id': requestingTeacherId || '',
          },
          body: JSON.stringify(newAssign),
        });
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success) {
            setSyncStatus('synced');
            setIsOnlineSynced(true);
            return { success: true, assignment: resData.assignment || newAssign };
          }
        }
      } catch (netErr) {
        console.warn('Direct /api/assignments failed, fallback to full sync:', netErr);
      }

      await pushStateToServer({ assignments: nextAssigns, notifications: nextNotifs });
      return { success: true, assignment: newAssign };
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      return { success: false, error: err?.message || 'تعذر نشر الواجب سحابياً' };
    }
  };

  const publishAssignment = async (assignmentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const nextAssigns = assignments.map(a => a.id === assignmentId ? { ...a, status: 'published' as const } : a);
      setAssignments(nextAssigns);
      saveToStorage(STORAGE_KEYS.ASSIGNMENTS, nextAssigns);

      try {
        await fetch(`/api/assignments/${assignmentId}/publish`, { method: 'PATCH' });
      } catch (e) {
        // fallback
      }
      await pushStateToServer({ assignments: nextAssigns });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'تعذر نشر الواجب' };
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    const nextAssigns = assignments.filter(a => a.id !== assignmentId);
    const nextSubs = submissions.filter(s => s.assignmentId !== assignmentId);
    setAssignments(nextAssigns);
    setSubmissions(nextSubs);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, nextAssigns);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, nextSubs);

    try {
      await fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
    } catch (e) {
      // fallback
    }
    await pushStateToServer({ assignments: nextAssigns, submissions: nextSubs });
  };

  const submitAssignment = async (
    assignmentId: string,
    solutionText: string,
    solutionImageUrl?: string,
    solutionImages?: { id: string; name: string; url: string }[],
    solutionFiles?: { id: string; name: string; url: string; size?: string; type?: string }[]
  ) => {
    if (!currentUser || currentUser.role !== 'student') return;

    const assign = assignments.find(a => a.id === assignmentId);
    const existingIndex = submissions.findIndex(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);

    const imagesList = Array.isArray(solutionImages) ? solutionImages : [];
    const filesList = Array.isArray(solutionFiles) ? solutionFiles : [];
    const primaryImgUrl = solutionImageUrl || (imagesList[0]?.url) || undefined;

    const submissionData: AssignmentSubmission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub-${Date.now()}`,
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      submittedAt: new Date().toISOString(),
      solutionText: solutionText || '',
      solutionImageUrl: primaryImgUrl,
      solutionImages: imagesList,
      solutionFiles: filesList,
      status: 'submitted',
    };

    let nextSubs: AssignmentSubmission[];
    if (existingIndex >= 0) {
      nextSubs = submissions.map((s, idx) => (idx === existingIndex ? submissionData : s));
    } else {
      nextSubs = [submissionData, ...submissions];
    }
    setSubmissions(nextSubs);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, nextSubs);

    // Notify teacher
    const targetTeacherId = assign?.teacherId || currentUser.teacherId || 'all';
    const teacherNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: targetTeacherId,
      title: 'تسليم واجب جديد 📥',
      message: `قام الطالب "${currentUser.name}" بتسليم حل واجب: "${assign?.title || 'الواجب'}".`,
      type: 'assignment',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'assignments',
    };
    const nextNotifs = [teacherNotif, ...notifications];
    setNotifications(nextNotifs);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, nextNotifs);

    // Persist submission directly to backend
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          solutionText,
          solutionImageUrl: primaryImgUrl,
          solutionImages: imagesList,
          solutionFiles: filesList,
        }),
      });
    } catch {}

    pushStateToServer({ submissions: nextSubs, notifications: nextNotifs });

    // Log activity
    logActivity(
      'submit_assignment',
      `سلّم حل واجب: ${assign?.title || 'واجب'} مع كراسة الحل والملاحظات`,
      assignmentId,
      currentUser.id
    );
  };

  const gradeSubmission = (submissionId: string, score: number, teacherFeedback: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const assign = assignments.find(a => a.id === sub.assignmentId);

    const nextSubs = submissions.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          score,
          teacherFeedback,
          status: 'graded' as const,
          gradedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setSubmissions(nextSubs);

    const studentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: sub.studentId,
      title: 'تم تصحيح واجبك! ⭐',
      message: `حصلت على درجة ${score}/100 في واجب: "${assign?.title || 'الواجب'}". تفقد الملاحظات.`,
      type: 'grade',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'assignments',
    };
    const nextNotifs = [studentNotif, ...notifications];
    setNotifications(nextNotifs);

    pushStateToServer({ submissions: nextSubs, notifications: nextNotifs });
  };

  const recordAssignmentOpen = (assignmentId: string) => {
    if (!currentUser || currentUser.role !== 'student') return;
    const assign = assignments.find(a => a.id === assignmentId);
    
    const nextAssigns = assignments.map(a => {
      if (a.id === assignmentId) {
        const opened = a.openedBy || [];
        if (!opened.includes(currentUser.id)) {
          return { ...a, openedBy: [...opened, currentUser.id] };
        }
      }
      return a;
    });
    setAssignments(nextAssigns);
    pushStateToServer({ assignments: nextAssigns });

    logActivity(
      'open_assignment',
      `فتح صفحة تفاصيل الواجب: ${assign?.title || 'واجب'}`,
      assignmentId,
      currentUser.id
    );
  };

  // Exam Methods (الامتحانات)
  const createExam = async (data: Omit<Exam, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string; exam?: Exam }> => {
    try {
      const examId = `exam-${Date.now()}`;
      const newExam: Exam = {
        ...data,
        id: examId,
        status: data.status || 'published',
        createdAt: new Date().toISOString(),
        openedBy: [],
      };
      const nextExams = [newExam, ...exams.filter(e => e.id !== examId)];
      setExams(nextExams);
      saveToStorage(STORAGE_KEYS.EXAMS, nextExams);

      const subjectObj = subjects.find(s => s.id === data.subjectId);
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: 'امتحان دراسي جديد 📋',
        message: `تم نشر امتحان جديد: "${data.title}" لمادة ${subjectObj?.name || ''}. موعد الامتحان: ${data.date} الساعة ${data.startTime}`,
        type: 'system',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'exams',
      };
      const nextNotifs = [newNotif, ...notifications];
      setNotifications(nextNotifs);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, nextNotifs);

      // Direct save to /api/exams
      try {
        const resp = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExam),
        });
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success) {
            setSyncStatus('synced');
            setIsOnlineSynced(true);
            return { success: true, exam: resData.exam || newExam };
          }
        }
      } catch (netErr) {
        console.warn('Direct /api/exams failed, fallback to full sync:', netErr);
      }

      await pushStateToServer({ exams: nextExams, notifications: nextNotifs });
      return { success: true, exam: newExam };
    } catch (err: any) {
      console.error('Failed to create exam:', err);
      return { success: false, error: err?.message || 'تعذر نشر الامتحان سحابياً' };
    }
  };

  const publishExam = async (examId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const nextExams = exams.map(e => e.id === examId ? { ...e, status: 'published' as const } : e);
      setExams(nextExams);
      saveToStorage(STORAGE_KEYS.EXAMS, nextExams);

      try {
        await fetch(`/api/exams/${examId}/publish`, { method: 'PATCH' });
      } catch (e) {
        // fallback
      }
      await pushStateToServer({ exams: nextExams });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'تعذر نشر الامتحان' };
    }
  };

  const updateExam = async (examId: string, data: Partial<Omit<Exam, 'id' | 'createdAt'>>): Promise<{ success: boolean; error?: string }> => {
    try {
      const nextExams = exams.map(e => (e.id === examId ? { ...e, ...data } : e));
      setExams(nextExams);
      saveToStorage(STORAGE_KEYS.EXAMS, nextExams);

      try {
        await fetch(`/api/exams/${examId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (e) {
        // fallback
      }
      await pushStateToServer({ exams: nextExams });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'تعذر تحديث الامتحان' };
    }
  };

  const deleteExam = async (examId: string) => {
    const nextExams = exams.filter(e => e.id !== examId);
    const nextSubs = examSubmissions.filter(s => s.examId !== examId);
    setExams(nextExams);
    setExamSubmissions(nextSubs);
    saveToStorage(STORAGE_KEYS.EXAMS, nextExams);
    saveToStorage(STORAGE_KEYS.EXAM_SUBMISSIONS, nextSubs);

    try {
      await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
    } catch (e) {
      // fallback
    }
    await pushStateToServer({ exams: nextExams, examSubmissions: nextSubs });
  };

  const recordExamOpen = (examId: string) => {
    if (!currentUser || currentUser.role !== 'student') return;
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    const opened = exam.openedBy || [];
    if (opened.includes(currentUser.id)) return;

    const nextOpened = [...opened, currentUser.id];
    const nextExams = exams.map(e => (e.id === examId ? { ...e, openedBy: nextOpened } : e));
    setExams(nextExams);
    pushStateToServer({ exams: nextExams });

    logActivity(
      'open_assignment',
      `فتح ورقة الامتحان: "${exam.title}" واطّلع على الأسئلة والتعليمات`,
      examId,
      currentUser.id
    );
  };

  const submitExamAnswer = (
    examId: string,
    answerImages: { id: string; name: string; url: string }[],
    studentNotes?: string
  ) => {
    if (!currentUser || currentUser.role !== 'student') return;
    const exam = exams.find(e => e.id === examId);
    const existingIndex = examSubmissions.findIndex(
      s => s.examId === examId && s.studentId === currentUser.id
    );

    const submissionData: ExamSubmission = {
      id: existingIndex >= 0 ? examSubmissions[existingIndex].id : `exam-sub-${Date.now()}`,
      examId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      classId: currentUser.classId || exam?.classId || '',
      sectionId: currentUser.sectionId || exam?.sectionId || '',
      submittedAt: new Date().toISOString(),
      answerImages,
      studentNotes,
      status: 'submitted',
    };

    let nextSubs: ExamSubmission[];
    if (existingIndex >= 0) {
      nextSubs = examSubmissions.map((s, idx) => (idx === existingIndex ? submissionData : s));
    } else {
      nextSubs = [submissionData, ...examSubmissions];
    }
    setExamSubmissions(nextSubs);

    // Notify teacher
    const teacherNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'teacher-1',
      title: 'تسليم إجابة امتحان 📄',
      message: `قام الطالب "${currentUser.name}" برفع وتسليم إجابات امتحان "${exam?.title || 'الامتحان'}" (${answerImages.length} صورة من كراسة الإجابة).`,
      type: 'system',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'exams',
    };
    const nextNotifs = [teacherNotif, ...notifications];
    setNotifications(nextNotifs);

    pushStateToServer({ examSubmissions: nextSubs, notifications: nextNotifs });

    logActivity(
      'submit_assignment',
      `سلّم إجابة امتحان "${exam?.title || 'الامتحان'}" ورفع ${answerImages.length} صور من كراسة الإجابة`,
      examId,
      currentUser.id
    );
  };

  const gradeExamSubmission = (submissionId: string, score: number, teacherNotes?: string) => {
    const sub = examSubmissions.find(s => s.id === submissionId);
    if (!sub) return;
    const exam = exams.find(e => e.id === sub.examId);
    const maxScore = exam?.maxScore || 100;
    const percentage = Math.round((score / maxScore) * 100);

    const nextSubs = examSubmissions.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          score,
          percentage,
          teacherNotes,
          status: 'graded' as const,
          gradedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setExamSubmissions(nextSubs);

    // Notify student
    const studentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: sub.studentId,
      title: 'تم تصحيح الامتحان ورصد الدرجة 🎯',
      message: `تم رصد نتيجة امتحان "${exam?.title || 'الامتحان'}": درجتك هي ${score}/${maxScore} (${percentage}%).`,
      type: 'grade',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'exams',
    };
    const nextNotifs = [studentNotif, ...notifications];
    setNotifications(nextNotifs);

    pushStateToServer({ examSubmissions: nextSubs, notifications: nextNotifs });
  };

  // Live Lessons
  const createLiveLesson = async (data: Omit<LiveLesson, 'id'>): Promise<{ success: boolean; error?: string; liveLesson?: LiveLesson }> => {
    try {
      const liveId = `live-${Date.now()}`;
      const newLive: LiveLesson = {
        ...data,
        id: liveId,
      };

      // Call dedicated cloud API endpoint
      const res = await fetch('/api/live-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLive),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل حفظ الدرس في الخادم السحابي');
      }

      const resData = await res.json();
      const savedLive = resData.liveLesson || newLive;

      const nextLives = [savedLive, ...liveLessons.filter(l => l.id !== liveId)];
      setLiveLessons(nextLives);
      saveToStorage(STORAGE_KEYS.LIVE_LESSONS, nextLives);

      const liveNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: 'درس أونلاين جديد 🎥',
        message: `تم نشر درس أونلاين جديد: "${data.title}". رابط الدخول متاح الآن للطلاب.`,
        type: 'live',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'live',
      };
      const nextNotifs = [liveNotif, ...notifications];
      setNotifications(nextNotifs);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, nextNotifs);

      if (resData.version) {
        serverVersionRef.current = resData.version;
      }
      setIsOnlineSynced(true);
      setSyncStatus('synced');

      return { success: true, liveLesson: savedLive };
    } catch (err: any) {
      console.error('Error creating live lesson:', err);
      // Fallback local save + pushStateToServer
      const fallbackLive: LiveLesson = {
        ...data,
        id: `live-${Date.now()}`,
      };
      const nextLives = [fallbackLive, ...liveLessons];
      setLiveLessons(nextLives);
      saveToStorage(STORAGE_KEYS.LIVE_LESSONS, nextLives);
      await pushStateToServer({ liveLessons: nextLives });
      return { success: true, liveLesson: fallbackLive };
    }
  };

  const updateLiveLessonStatus = async (id: string, status: LiveLesson['status']) => {
    const next = liveLessons.map(l => (l.id === id ? { ...l, status } : l));
    setLiveLessons(next);
    saveToStorage(STORAGE_KEYS.LIVE_LESSONS, next);
    try {
      await fetch(`/api/live-lessons/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      // fallback
    }
    pushStateToServer({ liveLessons: next });
  };

  const deleteLiveLesson = async (id: string) => {
    const next = liveLessons.filter(l => l.id !== id);
    setLiveLessons(next);
    saveToStorage(STORAGE_KEYS.LIVE_LESSONS, next);
    try {
      await fetch(`/api/live-lessons/${id}`, { method: 'DELETE' });
    } catch (e) {
      // fallback
    }
    pushStateToServer({ liveLessons: next });
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    const next = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    setNotifications(next);
    pushStateToServer({ notifications: next });
  };

  const markAllNotificationsAsRead = () => {
    const next = notifications.map(n => ({ ...n, read: true }));
    setNotifications(next);
    pushStateToServer({ notifications: next });
  };

  // Reset to clean slate
  const resetToDemoData = () => {
    if (window.confirm('هل أنت متأكد من إعادة ضبط المنصة السحابية؟')) {
      fetch('/api/reset', { method: 'POST' })
        .then(() => fetchStateFromServer(true))
        .catch(() => {
          setUsers(INITIAL_USERS);
          setClasses(INITIAL_CLASSES);
          setSubjects(INITIAL_SUBJECTS);
          setLessons(INITIAL_LESSONS);
          setAssignments(INITIAL_ASSIGNMENTS);
          setSubmissions(INITIAL_SUBMISSIONS);
          setLiveLessons(INITIAL_LIVE_LESSONS);
          setActivities(INITIAL_ACTIVITIES);
          setNotifications(INITIAL_NOTIFICATIONS);
          setWeeklySchedule(INITIAL_SCHEDULE);
          setCurrentUserId(null);
        });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        students,
        allStudents,
        teachers,
        classes,
        subjects,
        lessons,
        assignments,
        submissions,
        liveLessons,
        activities,
        notifications,
        weeklySchedule,
        exams,
        examSubmissions,
        isOnlineSynced,
        syncStatus,
        lastSyncTimestamp,
        forceServerSync,
        login,
        registerTeacher,
        requestPasswordReset,
        resetPasswordWithToken,
        logout,
        quickSwitchUser,
        addStudent,
        updateStudent,
        toggleStudentStatus,
        resetStudentPassword,
        deleteStudent,
        addClass,
        updateClass,
        deleteClass,
        addSectionToClass,
        addSubject,
        addLesson,
        updateLesson,
        deleteLesson,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        createAssignment,
        addAssignment: createAssignment,
        publishAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        recordAssignmentOpen,
        createExam,
        addExam: createExam,
        publishExam,
        updateExam,
        deleteExam,
        recordExamOpen,
        submitExamAnswer,
        gradeExamSubmission,
        createLiveLesson,
        addLiveLesson: createLiveLesson,
        updateLiveLessonStatus,
        deleteLiveLesson,
        logActivity,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDemoData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
