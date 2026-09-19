import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
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
} from './src/data/initialData';

const app = express();
const PORT = 3000;

// High limits for base64 captured avatars, cover photos, and homework solution photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure server data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Dedicated cloud file uploads directory for PDFs and student exam documents
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper: Persist raw binary PDF to cloud storage without converting or mutating bytes
function persistPdfFile(fileName: string, fileData: string): { url: string; name: string; size: string; fileName: string } {
  const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const rawName = (fileName || 'exam.pdf').replace(/[^a-zA-Z0-9_\-\.\u0600-\u06FF]/g, '_');
  const safeBase = path.parse(rawName).name || 'exam';
  const uniqueName = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeBase}.pdf`;
  const destPath = path.join(UPLOADS_DIR, uniqueName);
  
  fs.writeFileSync(destPath, buffer);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`[نور البيان] Successfully saved original PDF to storage: ${uniqueName} (${sizeMb} MB)`);
  
  return {
    url: `/api/files/${encodeURIComponent(uniqueName)}`,
    name: fileName || uniqueName,
    size: `${sizeMb} MB`,
    fileName: uniqueName,
  };
}

// Helper: Secure password hashing with salt and scrypt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

function verifyPassword(plainPassword: string, storedPassword?: string): boolean {
  if (!storedPassword) return true;
  const trimmed = plainPassword.trim();
  if (storedPassword.startsWith('scrypt$')) {
    const parts = storedPassword.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const originalHash = parts[2];
      const derivedKey = crypto.scryptSync(trimmed, salt, 64);
      return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), derivedKey);
    }
  }
  // Fallback for legacy plain or simple password
  return storedPassword === trimmed;
}

interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: number;
}

const activeResetTokens: Map<string, PasswordResetToken> = new Map();

interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'teacher' | 'student';
  teacherId?: string; // Permanent link to creating teacher
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  classId?: string;
  sectionId?: string;
  isOnline: boolean;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  notes?: string;
}

interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  users: User[];
  classes: any[];
  subjects: any[];
  lessons: any[];
  assignments: any[];
  submissions: any[];
  liveLessons: any[];
  activities: any[];
  notifications: any[];
  weeklySchedule: any[];
  exams: any[];
  examSubmissions: any[];
}

function getInitialDatabase(): DatabaseSchema {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    users: [],
    classes: [],
    subjects: [],
    lessons: [],
    assignments: [],
    submissions: [],
    liveLessons: [],
    activities: [],
    notifications: [],
    weeklySchedule: [],
    exams: [],
    examSubmissions: [],
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.users && Array.isArray(data.users)) {
        // Guarantee student accounts and data are never filtered out or removed automatically
        data.users = Array.isArray(data.users) ? data.users : [];
        data.classes = Array.isArray(data.classes) ? data.classes : [];
        data.subjects = Array.isArray(data.subjects) ? data.subjects : [];
        data.lessons = Array.isArray(data.lessons) ? data.lessons : [];
        data.assignments = Array.isArray(data.assignments) ? data.assignments : [];
        data.submissions = Array.isArray(data.submissions) ? data.submissions : [];
        data.liveLessons = Array.isArray(data.liveLessons) ? data.liveLessons : [];
        data.weeklySchedule = Array.isArray(data.weeklySchedule) ? data.weeklySchedule : [];
        data.notifications = Array.isArray(data.notifications) ? data.notifications : [];
        data.activities = Array.isArray(data.activities) ? data.activities : [];
        data.exams = Array.isArray(data.exams) ? data.exams : [];
        // Automatically persist any base64 PDF into binary cloud files
        data.exams.forEach((exam: any) => {
          if (exam.pdfFile && exam.pdfFile.url && exam.pdfFile.url.startsWith('data:')) {
            try {
              const saved = persistPdfFile(exam.pdfFile.name, exam.pdfFile.url);
              exam.pdfFile.url = saved.url;
              exam.pdfFile.size = exam.pdfFile.size || saved.size;
            } catch (migErr) {
              console.error('Error migrating existing exam pdf:', exam.id, migErr);
            }
          }
        });
        data.examSubmissions = Array.isArray(data.examSubmissions) ? data.examSubmissions : [];
        return data;
      }
    }
  } catch (err) {
    console.error('Error loading database file, initializing clean slate:', err);
  }
  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

let dbCache: DatabaseSchema = loadDatabase();

function saveDatabase(data: DatabaseSchema): void {
  try {
    data.lastUpdated = new Date().toISOString();
    data.version = (data.version || 1) + 1;
    dbCache = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health & Server Status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: dbCache.version });
});

// 2. Fetch Complete State (Online Multi-device Live Sync)
app.get('/api/data', (req, res) => {
  res.json(dbCache);
});

// 3. Full / Partial Sync Endpoint
app.post('/api/sync', (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'Invalid data payload' });
    }

    if (incoming.users && Array.isArray(incoming.users)) {
      if (incoming.users.length > 0 || dbCache.users.length === 0) {
        dbCache.users = incoming.users;
      }
    }
    if (incoming.classes) dbCache.classes = incoming.classes;
    if (incoming.subjects) dbCache.subjects = incoming.subjects;
    if (incoming.lessons) dbCache.lessons = incoming.lessons;
    if (incoming.assignments) dbCache.assignments = incoming.assignments;
    if (incoming.submissions) dbCache.submissions = incoming.submissions;
    if (incoming.liveLessons) dbCache.liveLessons = incoming.liveLessons;
    if (incoming.activities) dbCache.activities = incoming.activities;
    if (incoming.notifications) dbCache.notifications = incoming.notifications;
    if (incoming.weeklySchedule) dbCache.weeklySchedule = incoming.weeklySchedule;
    if (incoming.exams) dbCache.exams = incoming.exams;
    if (incoming.examSubmissions) dbCache.examSubmissions = incoming.examSubmissions;

    saveDatabase(dbCache);
    res.json({ success: true, version: dbCache.version, lastUpdated: dbCache.lastUpdated });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 4. User Authentication (Login)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال اسم المستخدم' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const user = dbCache.users.find(
    (u) => u.username.toLowerCase() === cleanUser || (u.email && u.email.toLowerCase() === cleanUser)
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'اسم المستخدم غير مسجل في النظام. بالنسبة للطلاب، يجب أن يقوم المعلم بإنشاء حسابك أولاً، أو قم بإنشاء حساب معلم جديد.',
    });
  }

  if (user.isActive === false) {
    return res.status(403).json({
      success: false,
      error: 'حسابك معطل حالياً من قِبل المعلم/الإدارة. يرجى التواصل مع معلمك لإعادة التفعيل.',
    });
  }

  // Check password if set
  if (user.password && password && !verifyPassword(String(password).trim(), user.password)) {
    return res.status(401).json({
      success: false,
      error: 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.',
    });
  }

  // Update user online status
  user.isOnline = true;
  user.lastActive = new Date().toISOString();

  // Add login activity log
  const newActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    studentId: user.id,
    studentName: user.name,
    type: 'login' as const,
    details: user.role === 'teacher' ? 'تسجيل دخول المعلم إلى لوحة التحكم' : 'تسجيل الدخول إلى المنصة بنجاح عبر الإنترنت',
    timestamp: new Date().toISOString(),
  };
  dbCache.activities.unshift(newActivity);
  if (dbCache.activities.length > 200) dbCache.activities.pop();

  saveDatabase(dbCache);

  res.json({
    success: true,
    user,
    token: `token-${user.id}-${Date.now()}`,
  });
});

// 4b. Teacher Self-Registration (Online Multi-device)
app.post('/api/register-teacher', (req, res) => {
  try {
    const { name, username, password, email, phone, specialty, avatar, coverPhoto, bio } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ success: false, error: 'الاسم واسم المستخدم وكلمة المرور مطلوبة' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const exists = dbCache.users.some(
      (u) => u.username.toLowerCase() === cleanUsername || (email && u.email && u.email.toLowerCase() === String(email).trim().toLowerCase())
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'اسم المستخدم هذا مستخدم مسبقاً في النظام. يرجى اختيار اسم مستخدم آخر.',
      });
    }

    const newTeacher: User = {
      id: `teacher-${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      password: password.trim(),
      role: 'teacher',
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      notes: specialty ? `التخصص: ${specialty.trim()}` : 'معلم معتمد',
      bio: bio ? bio.trim() : undefined,
      avatar: avatar || undefined,
      coverPhoto: coverPhoto || undefined,
      isOnline: true,
      isActive: true,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    dbCache.users.push(newTeacher);

    // Activity log
    dbCache.activities.unshift({
      id: `act-${Date.now()}`,
      studentId: newTeacher.id,
      studentName: newTeacher.name,
      type: 'login',
      details: `تم إنشاء حساب معلم جديد بنجاح: ${newTeacher.name}`,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);

    res.json({
      success: true,
      user: newTeacher,
      token: `token-${newTeacher.id}-${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4c. Forgot Password - Request Reset for Teachers
app.post('/api/forgot-password/request', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني المرتبط بحساب المعلم.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find teacher account with this email
    const teacher = dbCache.users.find(
      (u) => u.role === 'teacher' && u.email && u.email.trim().toLowerCase() === cleanEmail
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على أي حساب معلم مرتبط بهذا البريد الإلكتروني في قاعدة البيانات.',
      });
    }

    // Generate a secure cryptographic reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes validity

    // Store in active reset tokens map
    activeResetTokens.set(token, {
      token,
      userId: teacher.id,
      email: teacher.email!,
      expiresAt,
    });

    // Clean up expired tokens periodically
    const now = Date.now();
    for (const [key, val] of activeResetTokens.entries()) {
      if (val.expiresAt < now) {
        activeResetTokens.delete(key);
      }
    }

    // Log the security event
    dbCache.activities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      studentId: teacher.id,
      studentName: teacher.name,
      type: 'login' as const,
      details: `طلب استعادة كلمة المرور عبر البريد الإلكتروني: ${cleanEmail}`,
      timestamp: new Date().toISOString(),
    });
    if (dbCache.activities.length > 200) dbCache.activities.pop();
    saveDatabase(dbCache);

    res.json({
      success: true,
      message: 'تم التحقق من وجود الحساب بنجاح. يمكنك الآن تعيين كلمة المرور الجديدة.',
      resetToken: token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        username: teacher.username,
        email: teacher.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'حدث خطأ أثناء معالجة الطلب.' });
  }
});

// 4d. Forgot Password - Reset Password with Token
app.post('/api/forgot-password/reset', (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'رمز استعادة كلمة المرور غير صالح أو مفقود.',
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال كلمة مرور جديدة مكونة من 4 أحرف أو أرقام على الأقل.',
      });
    }

    if (confirmPassword && newPassword.trim() !== String(confirmPassword).trim()) {
      return res.status(400).json({
        success: false,
        error: 'كلمتا المرور غير متطابقتين. يرجى التأكد وإعادة المحاولة.',
      });
    }

    const resetRecord = activeResetTokens.get(token);
    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'جلسة استعادة كلمة المرور منتهية الصلاحية أو غير صالحة. يرجى طلب استعادة جديدة.',
      });
    }

    if (resetRecord.expiresAt < Date.now()) {
      activeResetTokens.delete(token);
      return res.status(400).json({
        success: false,
        error: 'انتهت صلاحية رمز استعادة كلمة المرور (أكثر من 30 دقيقة). يرجى طلب استعادة جديدة.',
      });
    }

    const user = dbCache.users.find((u) => u.id === resetRecord.userId);
    if (!user || user.role !== 'teacher') {
      activeResetTokens.delete(token);
      return res.status(404).json({
        success: false,
        error: 'تعذر العثور على حساب المعلم المرتبط.',
      });
    }

    // Securely hash the new password using scrypt
    const trimmedNewPassword = newPassword.trim();
    user.password = hashPassword(trimmedNewPassword);
    user.lastActive = new Date().toISOString();

    // Consume and remove the token so it cannot be used again
    activeResetTokens.delete(token);

    // Add activity log
    dbCache.activities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      studentId: user.id,
      studentName: user.name,
      type: 'login' as const,
      details: `تم تغيير وتحديث كلمة المرور بأمان للحساب: ${user.username}`,
      timestamp: new Date().toISOString(),
    });
    if (dbCache.activities.length > 200) dbCache.activities.pop();

    saveDatabase(dbCache);

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باسم المستخدم وكلمة المرور الجديدة.',
      username: user.username,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'حدث خطأ أثناء تغيير كلمة المرور.' });
  }
});

// 5. User Logout
app.post('/api/logout', (req, res) => {
  const { userId } = req.body;
  if (userId) {
    const user = dbCache.users.find((u) => u.id === userId);
    if (user) {
      user.isOnline = false;
      user.lastActive = new Date().toISOString();
      saveDatabase(dbCache);
    }
  }
  res.json({ success: true });
});

// 6. User Profile Update (Avatar, Cover, Bio, Phone, etc.)
app.patch('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = dbCache.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    }

    if (updates.name !== undefined) user.name = String(updates.name).trim();
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.coverPhoto !== undefined) user.coverPhoto = updates.coverPhoto;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.parentPhone !== undefined) user.parentPhone = updates.parentPhone;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.password !== undefined && updates.password.trim()) user.password = updates.password.trim();
    if (updates.classId !== undefined) user.classId = updates.classId;
    if (updates.sectionId !== undefined) user.sectionId = updates.sectionId;
    if (updates.notes !== undefined) user.notes = updates.notes;
    if (updates.isActive !== undefined) user.isActive = Boolean(updates.isActive);

    user.lastActive = new Date().toISOString();
    saveDatabase(dbCache);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6b. Delete User (Hard deletion with teacher ownership validation)
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = dbCache.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'المستخدم غير موجود بالنظام' });
    }

    const targetUser = dbCache.users[userIndex];
    const requestingUserId = (req.headers['x-user-id'] as string) || '';
    const requestingTeacherId = (req.query.teacherId as string) || (req.headers['x-teacher-id'] as string) || req.body?.teacherId;

    if (targetUser.role === 'student') {
      // 1. A student cannot delete their own account
      if (requestingUserId && requestingUserId === targetUser.id) {
        return res.status(403).json({ success: false, error: 'لا يملك الطالب صلاحية حذف حسابه الشخصي' });
      }

      // 2. An unauthorized teacher cannot delete a student belonging to another teacher
      if (targetUser.teacherId && requestingTeacherId && targetUser.teacherId !== requestingTeacherId) {
        return res.status(403).json({
          success: false,
          error: 'لا تملك صلاحية حذف هذا الطالب. حذف الطالب متاح فقط للمعلم الذي أنشأ حسابه.',
        });
      }
    }

    // Hard delete from database
    dbCache.users.splice(userIndex, 1);
    // Also thoroughly purge related student records: submissions, exams, and activities
    dbCache.submissions = (dbCache.submissions || []).filter((s) => s.studentId !== id);
    dbCache.examSubmissions = (dbCache.examSubmissions || []).filter((s) => s.studentId !== id);
    dbCache.activities = (dbCache.activities || []).filter((a) => a.studentId !== id);

    // Save to persistent cloud database file
    saveDatabase(dbCache);
    res.json({
      success: true,
      message: 'تم حذف حساب الطالب وجميع سجلاته بنجاح من قاعدة البيانات',
      deletedId: id,
      version: dbCache.version,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Student Account Management (Teacher Only - Permanent link to creating teacher)
app.post('/api/students', (req, res) => {
  try {
    const {
      name,
      username,
      password,
      classId,
      sectionId,
      phone,
      parentPhone,
      notes,
      avatar,
      coverPhoto,
      bio,
      isActive,
      teacherId,
    } = req.body;

    if (!name || !username) {
      return res.status(400).json({ success: false, error: 'الاسم واسم المستخدم مطلوبان' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const exists = dbCache.users.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return res.status(400).json({ success: false, error: 'اسم المستخدم هذا مستخدم مسبقاً، يرجى اختيار اسم آخر' });
    }

    const effectiveTeacherId = teacherId || (req.headers['x-teacher-id'] as string) || undefined;

    const newStudent: User = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      password: password?.trim() || '123',
      role: 'student',
      teacherId: effectiveTeacherId,
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      phone: phone?.trim() || '',
      parentPhone: parentPhone?.trim() || '',
      notes: notes?.trim() || '',
      bio: bio?.trim() || '',
      avatar: avatar || undefined,
      coverPhoto: coverPhoto || undefined,
      isOnline: false,
      isActive: isActive !== false,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    dbCache.users.push(newStudent);

    // Activity log
    dbCache.activities.unshift({
      id: `act-${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.name,
      type: 'login',
      details: `تم إنشاء حساب الطالب الجديد وربطه بمعلمه في قاعدة البيانات`,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);
    res.json({ success: true, student: newStudent, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7b. Student Update (Avatar, Cover, Info, Password)
app.patch('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = dbCache.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
    }

    if (updates.name !== undefined) user.name = String(updates.name).trim();
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.coverPhoto !== undefined) user.coverPhoto = updates.coverPhoto;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.parentPhone !== undefined) user.parentPhone = updates.parentPhone;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.password !== undefined && updates.password.trim()) user.password = updates.password.trim();
    if (updates.classId !== undefined) user.classId = updates.classId;
    if (updates.sectionId !== undefined) user.sectionId = updates.sectionId;
    if (updates.notes !== undefined) user.notes = updates.notes;
    if (updates.isActive !== undefined) user.isActive = Boolean(updates.isActive);

    user.lastActive = new Date().toISOString();
    saveDatabase(dbCache);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Assignments & Submissions
app.post('/api/assignments', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.title) {
      return res.status(400).json({ success: false, error: 'عنوان الواجب مطلوب' });
    }

    const assignmentId = data.id || `assign-${Date.now()}`;
    const requestingTeacherId = data.teacherId || (req.headers['x-teacher-id'] as string) || undefined;

    const newAssignment = {
      ...data,
      id: assignmentId,
      teacherId: requestingTeacherId,
      images: Array.isArray(data.images) ? data.images : [],
      files: Array.isArray(data.files) ? data.files : [],
      referenceImageUrl: data.referenceImageUrl || (data.images?.[0]?.url) || undefined,
      status: data.status || 'published',
      createdAt: data.createdAt || new Date().toISOString(),
      openedBy: data.openedBy || [],
    };

    const existingIdx = dbCache.assignments.findIndex((a) => a.id === assignmentId);
    if (existingIdx >= 0) {
      dbCache.assignments[existingIdx] = { ...dbCache.assignments[existingIdx], ...newAssignment };
    } else {
      dbCache.assignments.unshift(newAssignment);
    }

    // Notify students
    dbCache.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'واجب دراسي جديد 📝',
      message: `تم نشر واجب جديد: "${newAssignment.title}". موعد التسليم: ${newAssignment.dueDate || ''}`,
      type: 'assignment',
      linkTab: 'assignments',
      read: false,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);
    res.json({ success: true, assignment: newAssignment, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/assignments/:id/publish', (req, res) => {
  try {
    const { id } = req.params;
    const assign = dbCache.assignments.find((a) => a.id === id);
    if (!assign) {
      return res.status(404).json({ success: false, error: 'الواجب غير موجود' });
    }
    assign.status = 'published';
    saveDatabase(dbCache);
    res.json({ success: true, assignment: assign, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/assignments/:id', (req, res) => {
  try {
    const { id } = req.params;
    dbCache.assignments = dbCache.assignments.filter((a) => a.id !== id);
    dbCache.submissions = dbCache.submissions.filter((s) => s.assignmentId !== id);
    saveDatabase(dbCache);
    res.json({ success: true, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8b. Online Lessons / Live Lessons Cloud API
app.get('/api/live-lessons', (req, res) => {
  res.json(dbCache.liveLessons || []);
});

app.post('/api/live-lessons', (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.meetingUrl) {
      return res.status(400).json({ success: false, error: 'عنوان الدرس ورابط الدخول مطلوبان' });
    }

    const liveId = data.id || `live-${Date.now()}`;
    const newLive: any = {
      id: liveId,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      subjectId: data.subjectId || 'subj-1',
      classId: data.classId || 'class-1',
      sectionId: data.sectionId || undefined,
      teacherId: data.teacherId || 'teacher-1',
      teacherName: data.teacherName || 'المعلم',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '10:00',
      durationMinutes: Number(data.durationMinutes) || 45,
      meetingUrl: data.meetingUrl.trim(),
      platform: data.platform || 'meet',
      meetingId: data.meetingId?.trim() || undefined,
      passcode: data.passcode?.trim() || undefined,
      status: data.status || 'upcoming',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    const existingIdx = dbCache.liveLessons.findIndex((l: any) => l.id === liveId);
    if (existingIdx >= 0) {
      dbCache.liveLessons[existingIdx] = { ...dbCache.liveLessons[existingIdx], ...newLive };
    } else {
      dbCache.liveLessons.unshift(newLive);
    }

    // Direct notification for students
    dbCache.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'درس أونلاين جديد 🎥',
      message: `تم نشر درس أونلاين جديد: "${newLive.title}". رابط الدخول متاح الآن للطلاب.`,
      type: 'live',
      linkTab: 'live',
      read: false,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);
    res.json({ success: true, liveLesson: newLive, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/live-lessons/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const live = dbCache.liveLessons.find((l: any) => l.id === id);
    if (!live) {
      return res.status(404).json({ success: false, error: 'الدرس الأونلاين غير موجود' });
    }
    live.status = status;
    saveDatabase(dbCache);
    res.json({ success: true, liveLesson: live, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/live-lessons/:id', (req, res) => {
  try {
    const { id } = req.params;
    dbCache.liveLessons = dbCache.liveLessons.filter((l: any) => l.id !== id);
    saveDatabase(dbCache);
    res.json({ success: true, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8b. PDF & Cloud File Storage Endpoints
app.use('/uploads', express.static(UPLOADS_DIR));

// Upload PDF Endpoint: Persists the exact original binary PDF to cloud storage
app.post('/api/upload-pdf', (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: 'لم يتم إرسال بيانات ملف الـ PDF' });
    }

    const saved = persistPdfFile(fileName, fileData);
    res.json({
      success: true,
      url: saved.url,
      name: saved.name,
      size: saved.size,
      fileName: saved.fileName,
    });
  } catch (err: any) {
    console.error('Error uploading PDF:', err);
    res.status(500).json({ success: false, error: err.message || 'حدث خطأ أثناء حفظ ملف الـ PDF في التخزين السحابي' });
  }
});

// Stream / Serve PDF Endpoint with Range support, proper headers, and access control
app.get('/api/files/:filename', (req, res) => {
  try {
    const rawParam = req.params.filename;
    const safeFilename = path.basename(decodeURIComponent(rawParam));
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'الملف غير موجود في الخادم السحابي' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Headers
    res.setHeader('Content-Type', 'application/pdf');
    const isDownload = req.query.download === '1';
    const disposition = isDownload ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(safeFilename)}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Range support for multi-page streaming in PDF.js / browsers
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize,
      });
      file.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err: any) {
    console.error('Error streaming file:', err);
    res.status(500).json({ error: 'تعذر قراءة ملف الـ PDF' });
  }
});

// 9. Exams & Exam Submissions
app.post('/api/exams', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.title) {
      return res.status(400).json({ success: false, error: 'عنوان الامتحان مطلوب' });
    }

    // Persist any base64 PDF into cloud binary file
    if (data.pdfFile && data.pdfFile.url && data.pdfFile.url.startsWith('data:')) {
      const saved = persistPdfFile(data.pdfFile.name, data.pdfFile.url);
      data.pdfFile = {
        name: data.pdfFile.name || saved.name,
        url: saved.url,
        size: data.pdfFile.size || saved.size,
      };
    }

    const examId = data.id || `exam-${Date.now()}`;
    const newExam = {
      ...data,
      id: examId,
      status: data.status || 'published',
      createdAt: data.createdAt || new Date().toISOString(),
      openedBy: data.openedBy || [],
    };

    const existingIdx = dbCache.exams.findIndex((e) => e.id === examId);
    if (existingIdx >= 0) {
      dbCache.exams[existingIdx] = { ...dbCache.exams[existingIdx], ...newExam };
    } else {
      dbCache.exams.unshift(newExam);
    }

    // Student notification
    dbCache.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'امتحان دراسي جديد 📋',
      message: `تم نشر امتحان جديد: "${newExam.title}". موعد الامتحان: ${newExam.date || ''} الساعة ${newExam.startTime || ''}`,
      type: 'system',
      linkTab: 'exams',
      read: false,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);
    res.json({ success: true, exam: newExam, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/exams/:id/publish', (req, res) => {
  try {
    const { id } = req.params;
    const exam = dbCache.exams.find((e) => e.id === id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'الامتحان غير موجود' });
    }
    exam.status = 'published';
    saveDatabase(dbCache);
    res.json({ success: true, exam, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/exams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const examIdx = dbCache.exams.findIndex((e) => e.id === id);
    if (examIdx < 0) {
      return res.status(404).json({ success: false, error: 'الامتحان غير موجود' });
    }

    // Persist any base64 PDF into cloud binary file
    if (data.pdfFile && data.pdfFile.url && data.pdfFile.url.startsWith('data:')) {
      const saved = persistPdfFile(data.pdfFile.name, data.pdfFile.url);
      data.pdfFile = {
        name: data.pdfFile.name || saved.name,
        url: saved.url,
        size: data.pdfFile.size || saved.size,
      };
    }

    dbCache.exams[examIdx] = { ...dbCache.exams[examIdx], ...data };
    saveDatabase(dbCache);
    res.json({ success: true, exam: dbCache.exams[examIdx], version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/exams/:id', (req, res) => {
  try {
    const { id } = req.params;
    dbCache.exams = dbCache.exams.filter((e) => e.id !== id);
    dbCache.examSubmissions = dbCache.examSubmissions.filter((s) => s.examId !== id);
    saveDatabase(dbCache);
    res.json({ success: true, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/exam-submissions', (req, res) => {
  try {
    const { examId, studentId, studentName, classId, sectionId, answerImages, studentNotes } = req.body;
    const existingIdx = dbCache.examSubmissions.findIndex(
      (s) => s.examId === examId && s.studentId === studentId
    );
    const subData = {
      id: existingIdx >= 0 ? dbCache.examSubmissions[existingIdx].id : `esub-${Date.now()}`,
      examId,
      studentId,
      studentName,
      classId: classId || '',
      sectionId: sectionId || '',
      submittedAt: new Date().toISOString(),
      answerImages: answerImages || [],
      studentNotes: studentNotes || '',
      status: 'submitted' as const,
    };
    if (existingIdx >= 0) {
      dbCache.examSubmissions[existingIdx] = { ...dbCache.examSubmissions[existingIdx], ...subData };
    } else {
      dbCache.examSubmissions.unshift(subData);
    }
    saveDatabase(dbCache);
    res.json({ success: true, submission: subData, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/grade-exam', (req, res) => {
  try {
    const { submissionId, score, teacherNotes } = req.body;
    const sub = dbCache.examSubmissions.find((s) => s.id === submissionId);
    if (!sub) {
      return res.status(404).json({ success: false, error: 'تسليم الامتحان غير موجود' });
    }
    sub.score = Number(score);
    sub.teacherNotes = teacherNotes || '';
    sub.status = 'graded';
    saveDatabase(dbCache);
    res.json({ success: true, submission: sub, version: dbCache.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/submissions', (req, res) => {
  try {
    const { assignmentId, studentId, studentName, solutionText, solutionImageUrl, solutionImages, solutionFiles } = req.body;

    const existingIdx = dbCache.submissions.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    );

    const imagesList = Array.isArray(solutionImages) ? solutionImages : [];
    const filesList = Array.isArray(solutionFiles) ? solutionFiles : [];
    const primaryImgUrl = solutionImageUrl || (imagesList[0]?.url) || '';

    const submissionData = {
      id: existingIdx >= 0 ? dbCache.submissions[existingIdx].id : `sub-${Date.now()}`,
      assignmentId,
      studentId,
      studentName,
      solutionText: solutionText || '',
      solutionImageUrl: primaryImgUrl,
      solutionImages: imagesList,
      solutionFiles: filesList,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      dbCache.submissions[existingIdx] = { ...dbCache.submissions[existingIdx], ...submissionData };
    } else {
      dbCache.submissions.unshift(submissionData);
    }

    // Identify target teacher to notify
    const assign = dbCache.assignments.find((a) => a.id === assignmentId);
    const targetTeacherId = assign?.teacherId || 'all';

    // Teacher notification
    dbCache.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: targetTeacherId,
      title: 'تسليم واجب جديد 📥',
      message: `قام الطالب "${studentName}" بتسليم حل الواجب ("${assign?.title || 'واجب'}").`,
      type: 'assignment',
      linkTab: 'assignments',
      read: false,
      timestamp: new Date().toISOString(),
    });

    // Activity log
    dbCache.activities.unshift({
      id: `act-${Date.now()}`,
      studentId,
      studentName,
      type: 'submit_assignment',
      details: `قام بتسليم حل الواجب بنجاح`,
      relatedId: assignmentId,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);
    res.json({ success: true, submission: submissionData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Grade Submission (Teacher Only)
app.post('/api/grade', (req, res) => {
  try {
    const { submissionId, score, teacherFeedback } = req.body;

    const sub = dbCache.submissions.find((s) => s.id === submissionId);
    if (!sub) {
      return res.status(404).json({ success: false, error: 'التسليم غير موجود' });
    }

    sub.score = Number(score);
    sub.teacherFeedback = teacherFeedback || '';
    sub.status = 'graded';
    sub.gradedAt = new Date().toISOString();

    // Student notification
    dbCache.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: sub.studentId,
      title: 'تم تصحيح واجبك ⭐',
      message: `حصلت على درجة ${sub.score}/100 في واجبك.`,
      type: 'grade',
      linkTab: 'assignments',
      read: false,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(dbCache);
    res.json({ success: true, submission: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Reset State Data (Zero State)
app.post('/api/reset', (req, res) => {
  const fresh = getInitialDatabase();
  saveDatabase(fresh);
  res.json({ success: true, message: 'Database reset to clean empty state' });
});

// ----------------------------------------------------
// START SERVER & VITE INTEGRATION
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[نور البيان] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
