import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';

// Teacher Views
import { TeacherOverview } from './components/TeacherDashboard/TeacherOverview';
import { WeeklyScheduleManager } from './components/TeacherDashboard/WeeklyScheduleManager';
import { StudentManagement } from './components/TeacherDashboard/StudentManagement';
import { ClassesManagement } from './components/TeacherDashboard/ClassesManagement';
import { LessonsManager } from './components/TeacherDashboard/LessonsManager';
import { AssignmentsTeacher } from './components/TeacherDashboard/AssignmentsTeacher';
import { LiveLessonsTeacher } from './components/TeacherDashboard/LiveLessonsTeacher';
import { ActivityLogView } from './components/TeacherDashboard/ActivityLogView';

// Student Views
import { StudentOverview } from './components/StudentDashboard/StudentOverview';
import { StudentWeeklySchedule } from './components/StudentDashboard/StudentWeeklySchedule';
import { StudentLessons } from './components/StudentDashboard/StudentLessons';
import { StudentAssignments } from './components/StudentDashboard/StudentAssignments';
import { StudentLiveSessions } from './components/StudentDashboard/StudentLiveSessions';
import { StudentActivityHistory } from './components/StudentDashboard/StudentActivityHistory';

// Shared Views
import { AcademicCalendar } from './components/Shared/AcademicCalendar';
import { ExamsTeacher } from './components/TeacherDashboard/ExamsTeacher';
import { StudentExams } from './components/StudentDashboard/StudentExams';

// Modals
import { AddStudentModal } from './components/Modals/AddStudentModal';
import { AddAssignmentModal } from './components/Modals/AddAssignmentModal';
import { AddLessonModal } from './components/Modals/AddLessonModal';
import { AddLiveLessonModal } from './components/Modals/AddLiveLessonModal';

const AppContent: React.FC = () => {
  const { currentUser, toastMessage } = useApp();

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Global Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showAddLiveModal, setShowAddLiveModal] = useState(false);

  // Cross-component deep links (e.g. clicking "Grade" from overview opens grading tab on that submission)
  const [activeGradingSubmissionId, setActiveGradingSubmissionId] = useState<string | null>(null);
  const [activeSolveAssignmentId, setActiveSolveAssignmentId] = useState<string | null>(null);

  // If no user is logged in, show the clean login page
  if (!currentUser) {
    return <LoginPage />;
  }

  const isTeacher = currentUser.role === 'teacher';

  const handleOpenGradeSubmission = (submissionId: string) => {
    setActiveGradingSubmissionId(submissionId);
    setActiveTab('assignments');
  };

  const handleOpenSolveAssignment = (assignmentId: string) => {
    setActiveSolveAssignmentId(assignmentId);
    setActiveTab('assignments');
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* Primary Header Navbar */}
      <div className="relative z-20">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddStudent={() => setShowAddStudentModal(true)}
        />
      </div>

      {/* Main Container Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TEACHER DASHBOARD VIEWS */}
        {isTeacher && (
          <>
            {activeTab === 'overview' && (
              <TeacherOverview
                setActiveTab={setActiveTab}
                onOpenAddStudent={() => setShowAddStudentModal(true)}
                onOpenAddAssignment={() => setShowAddAssignmentModal(true)}
                onOpenAddLesson={() => setShowAddLessonModal(true)}
                onOpenAddLive={() => setShowAddLiveModal(true)}
                onOpenGradeSubmission={handleOpenGradeSubmission}
              />
            )}

            {activeTab === 'schedule' && <WeeklyScheduleManager />}

            {activeTab === 'students' && (
              <StudentManagement onOpenAddStudent={() => setShowAddStudentModal(true)} />
            )}

            {activeTab === 'classes' && <ClassesManagement />}

            {activeTab === 'lessons' && (
              <LessonsManager onOpenAddLesson={() => setShowAddLessonModal(true)} />
            )}

            {activeTab === 'assignments' && (
              <AssignmentsTeacher
                onOpenAddAssignment={() => setShowAddAssignmentModal(true)}
                selectedSubmissionId={activeGradingSubmissionId}
                onClearSelectedSubmission={() => setActiveGradingSubmissionId(null)}
              />
            )}

            {activeTab === 'exams' && <ExamsTeacher />}

            {activeTab === 'live' && (
              <LiveLessonsTeacher onOpenAddLive={() => setShowAddLiveModal(true)} />
            )}

            {activeTab === 'calendar' && (
              <AcademicCalendar
                onOpenAddAssignment={() => setShowAddAssignmentModal(true)}
                onOpenAddLive={() => setShowAddLiveModal(true)}
              />
            )}

            {activeTab === 'activity' && <ActivityLogView />}
          </>
        )}

        {/* STUDENT DASHBOARD VIEWS */}
        {!isTeacher && (
          <>
            {activeTab === 'overview' && (
              <StudentOverview
                setActiveTab={setActiveTab}
                onOpenSolveAssignment={handleOpenSolveAssignment}
              />
            )}

            {activeTab === 'schedule' && <StudentWeeklySchedule />}

            {activeTab === 'lessons' && <StudentLessons />}

            {activeTab === 'assignments' && (
              <StudentAssignments
                initialSolveId={activeSolveAssignmentId}
                onClearInitialSolveId={() => setActiveSolveAssignmentId(null)}
              />
            )}

            {activeTab === 'exams' && <StudentExams />}

            {activeTab === 'live' && <StudentLiveSessions />}

            {activeTab === 'calendar' && (
              <AcademicCalendar onOpenSolveAssignment={handleOpenSolveAssignment} />
            )}

            {activeTab === 'activity' && <StudentActivityHistory />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            منصة <span className="text-emerald-700 font-bold">نور البيان</span> التعليمية العربية © {new Date().getFullYear()}
          </div>
          <div className="text-[11px] text-slate-400">
            بيئة تفاعلية متكاملة لإدارة الصفوف والشعب، الواجبات والتصحيح، والبث المباشر
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
      />

      <AddAssignmentModal
        isOpen={showAddAssignmentModal}
        onClose={() => setShowAddAssignmentModal(false)}
      />

      <AddLessonModal
        isOpen={showAddLessonModal}
        onClose={() => setShowAddLessonModal(false)}
      />

      <AddLiveLessonModal
        isOpen={showAddLiveModal}
        onClose={() => setShowAddLiveModal(false)}
      />

      {/* Short Success Message Floating Banner */}
      {toastMessage && (
        <div
          role="status"
          id="global-toast-notification"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600/95 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold backdrop-blur-xs border border-emerald-400/40 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none"
        >
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
