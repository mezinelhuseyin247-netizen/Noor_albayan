import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom } from '../../types';
import { PREDEFINED_GRADES, PredefinedGrade } from '../../data/gradeLevels';
import {
  Layers,
  Plus,
  Users,
  Trash2,
  School,
  CheckCircle2,
  Sparkles,
  Info,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ClassesManagement: React.FC = () => {
  const { classes, students, addClass, deleteClass, addSectionToClass } = useApp();

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('الصف الأول');
  const [newClassStage, setNewClassStage] = useState('المرحلة الابتدائية');
  const [newClassGrade, setNewClassGrade] = useState(1);
  const [newSectionsInput, setNewSectionsInput] = useState('شعبة أ, شعبة ب');
  const [selectedGradePreset, setSelectedGradePreset] = useState<number | null>(1);
  const [showPresetDirectory, setShowPresetDirectory] = useState(true);

  // Add Section to existing class state
  const [activeClassForSection, setActiveClassForSection] = useState<ClassRoom | null>(null);
  const [newSectionName, setNewSectionName] = useState('');

  const handleSelectPreset = (preset: PredefinedGrade) => {
    setSelectedGradePreset(preset.gradeNumber);
    setNewClassName(preset.name);
    setNewClassStage(preset.stage);
    setNewClassGrade(preset.gradeNumber);
    setNewSectionsInput(preset.suggestedSections.join(', '));
  };

  const handleOpenModalWithPreset = (preset: PredefinedGrade) => {
    handleSelectPreset(preset);
    setShowAddClassModal(true);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const sections = newSectionsInput
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    addClass({
      name: newClassName.trim(),
      stage: newClassStage,
      gradeNumber: Number(newClassGrade) || 1,
      sections: sections.length > 0 ? sections : ['شعبة أ'],
      color:
        PREDEFINED_GRADES.find((g) => g.gradeNumber === Number(newClassGrade))?.color ||
        'from-emerald-600 to-teal-700',
    });

    setNewClassName('الصف الأول');
    setNewSectionsInput('شعبة أ, شعبة ب');
    setSelectedGradePreset(null);
    setShowAddClassModal(false);
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassForSection || !newSectionName.trim()) return;

    addSectionToClass(activeClassForSection.id, newSectionName.trim());
    setNewSectionName('');
    setActiveClassForSection(null);
  };

  // Group predefined grades by educational stage
  const primaryGrades = PREDEFINED_GRADES.filter((g) => g.stage === 'المرحلة الابتدائية');
  const middleGrades = PREDEFINED_GRADES.filter((g) => g.stage === 'المرحلة المتوسطة');
  const secondaryGrades = PREDEFINED_GRADES.filter((g) => g.stage === 'المرحلة الثانوية');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">إدارة الصفوف والشعب الدراسية</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                الصفوف الدراسية (من الصف الأول إلى الثاني عشر) جاهزة للاختيار، مع إضافة وتخصيص الشعب وإدارة الطلاب
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            handleSelectPreset(PREDEFINED_GRADES[0]);
            setShowAddClassModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ إنشاء صف دراسي جديد</span>
        </button>
      </div>

      {/* Predefined Grades (1 - 12) Ready Selection Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-linear-to-l from-emerald-50/50 via-teal-50/30 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>الخيارات الجاهزة للصفوف الدراسية (من الأول إلى الثاني عشر)</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  12 صف دراسي
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                خيارات قياسية جاهزة لجميع المراحل التعليمية. عند إنشاء الصف تكون جميع بياناته فارغة تماماً لتقوم بإضافة الشعب والمواد والطلاب بنفسك.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPresetDirectory(!showPresetDirectory)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            title={showPresetDirectory ? 'طي القائمة' : 'عرض القائمة'}
          >
            {showPresetDirectory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showPresetDirectory && (
          <div className="p-5 space-y-5">
            {/* Stage 1: Primary (1 - 6) */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-bold text-slate-800">المرحلة الابتدائية (الصفوف 1 - 6)</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {primaryGrades.map((preset) => {
                  const existingClass = classes.find((c) => c.name.trim() === preset.name.trim() || c.gradeNumber === preset.gradeNumber);
                  const isCreated = Boolean(existingClass);
                  const studentCount = isCreated ? students.filter((s) => s.classId === existingClass?.id).length : 0;

                  return (
                    <div
                      key={preset.gradeNumber}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        isCreated
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">صف {preset.gradeNumber}</span>
                          {isCreated && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.2 rounded-full border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>مُنشأ</span>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1">{preset.name}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {isCreated ? (
                          <span className="text-[10px] text-emerald-800 font-semibold">
                            {existingClass?.sections.length} شعب • {studentCount} طالب
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenModalWithPreset(preset)}
                            className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إنشاء الصف</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 2: Middle / Intermediate (7 - 9) */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="text-xs font-bold text-slate-800">المرحلة المتوسطة / الإعدادية (الصفوف 7 - 9)</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {middleGrades.map((preset) => {
                  const existingClass = classes.find((c) => c.name.trim() === preset.name.trim() || c.gradeNumber === preset.gradeNumber);
                  const isCreated = Boolean(existingClass);
                  const studentCount = isCreated ? students.filter((s) => s.classId === existingClass?.id).length : 0;

                  return (
                    <div
                      key={preset.gradeNumber}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        isCreated
                          ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">صف {preset.gradeNumber}</span>
                          {isCreated && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-white px-1.5 py-0.2 rounded-full border border-blue-200 shadow-2xs">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>مُنشأ</span>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1">{preset.name}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {isCreated ? (
                          <span className="text-[10px] text-blue-800 font-semibold">
                            {existingClass?.sections.length} شعب • {studentCount} طالب
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenModalWithPreset(preset)}
                            className="w-full py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إنشاء الصف</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 3: Secondary (10 - 12) */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h4 className="text-xs font-bold text-slate-800">المرحلة الثانوية (الصفوف 10 - 12)</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {secondaryGrades.map((preset) => {
                  const existingClass = classes.find((c) => c.name.trim() === preset.name.trim() || c.gradeNumber === preset.gradeNumber);
                  const isCreated = Boolean(existingClass);
                  const studentCount = isCreated ? students.filter((s) => s.classId === existingClass?.id).length : 0;

                  return (
                    <div
                      key={preset.gradeNumber}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        isCreated
                          ? 'bg-purple-50/60 border-purple-300 ring-1 ring-purple-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">صف {preset.gradeNumber}</span>
                          {isCreated && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-700 bg-white px-1.5 py-0.2 rounded-full border border-purple-200 shadow-2xs">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>مُنشأ</span>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1">{preset.name}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {isCreated ? (
                          <span className="text-[10px] text-purple-800 font-semibold">
                            {existingClass?.sections.length} شعب • {studentCount} طالب
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenModalWithPreset(preset)}
                            className="w-full py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إنشاء الصف</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Created Classes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              الصفوف الدراسية النشطة في المنصة ({classes.length})
            </h3>
          </div>
          {classes.length > 0 && (
            <span className="text-xs text-slate-500">
              إجمالي الشعب: {classes.reduce((acc, c) => acc + c.sections.length, 0)} شعبة
            </span>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">لم يتم إنشاء أي صفوف دراسية بعد</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                جميع الصفوف من الصف الأول إلى الصف الثاني عشر جاهزة في الدليل أعلاه. اضغط على "إنشاء الصف" لأي صف تريده، وستكون بياناته فارغة تماماً لتضيف الطلاب والشعب بنفسك.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleSelectPreset(PREDEFINED_GRADES[0]);
                setShowAddClassModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء أول صف دراسي (مثال: الصف الأول)</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id);

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  {/* Header Bar */}
                  <div className="p-5 bg-linear-to-r from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                        {cls.stage}
                      </span>
                      <span className="text-xs text-slate-300 font-bold">{classStudents.length} طالب مسجل</span>
                    </div>
                    <h3 className="text-base font-bold mt-2 text-white flex items-center gap-2">
                      <School className="w-4 h-4 text-emerald-400" />
                      <span>{cls.name}</span>
                    </h3>
                  </div>

                  {/* Sections Body */}
                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">الشعب الدراسية التابعة ({cls.sections.length}):</span>
                      <button
                        type="button"
                        onClick={() => setActiveClassForSection(cls)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                      >
                        <Plus className="w-3 h-3" />
                        <span>إضافة شعبة</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {cls.sections.map((section) => {
                        const sectionCount = classStudents.filter((s) => s.sectionId === section).length;

                        return (
                          <div
                            key={section}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-right flex flex-col justify-between"
                          >
                            <div className="font-bold text-xs text-slate-900">{section}</div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>{sectionCount} طلاب مسجلين</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>معرف الصف: <code className="text-[10px] bg-slate-200 px-1 rounded-sm">{cls.id}</code></span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من رغبتك في حذف ${cls.name}؟`)) {
                          deleteClass(cls.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="حذف الصف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create New Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">إنشاء صف دراسي جديد</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Notice */}
            <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>ملاحظة هامة:</strong> يتم إنشاء الصف بدون أي بيانات تلقائية (صفر طلاب، صفر واجبات، صفر دروس)، لتقوم أنت بإضافة الشعب والمواد والطلاب بنفسك.
              </div>
            </div>

            {/* Quick Presets Selection: Grades 1 to 12 */}
            <div className="mb-4">
              <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>اختر من الخيارات الجاهزة للصفوف (من الأول إلى الثاني عشر):</span>
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                {/* Primary */}
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 px-1">المرحلة الابتدائية:</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {primaryGrades.map((preset) => {
                      const isSelected = selectedGradePreset === preset.gradeNumber || newClassName === preset.name;
                      const isAlreadyCreated = classes.some((c) => c.name.trim() === preset.name.trim());

                      return (
                        <button
                          key={preset.gradeNumber}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition text-center flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-400'
                              : isAlreadyCreated
                              ? 'bg-white text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          <span>{preset.name}</span>
                          {isAlreadyCreated && <span className="text-[9px] opacity-75">مُنشأ</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Middle */}
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-blue-800 px-1">المرحلة المتوسطة:</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {middleGrades.map((preset) => {
                      const isSelected = selectedGradePreset === preset.gradeNumber || newClassName === preset.name;
                      const isAlreadyCreated = classes.some((c) => c.name.trim() === preset.name.trim());

                      return (
                        <button
                          key={preset.gradeNumber}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition text-center flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-400'
                              : isAlreadyCreated
                              ? 'bg-white text-slate-400 border-slate-200 hover:bg-blue-50 hover:text-blue-800'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-800'
                          }`}
                        >
                          <span>{preset.name}</span>
                          {isAlreadyCreated && <span className="text-[9px] opacity-75">مُنشأ</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary */}
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-purple-800 px-1">المرحلة الثانوية:</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {secondaryGrades.map((preset) => {
                      const isSelected = selectedGradePreset === preset.gradeNumber || newClassName === preset.name;
                      const isAlreadyCreated = classes.some((c) => c.name.trim() === preset.name.trim());

                      return (
                        <button
                          key={preset.gradeNumber}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition text-center flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-1 ring-purple-400'
                              : isAlreadyCreated
                              ? 'bg-white text-slate-400 border-slate-200 hover:bg-purple-50 hover:text-purple-800'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-800'
                          }`}
                        >
                          <span>{preset.name}</span>
                          {isAlreadyCreated && <span className="text-[9px] opacity-75">مُنشأ</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الصف الدراسي</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="مثال: الصف الأول"
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المرحلة التعليمية</label>
                <select
                  value={newClassStage}
                  onChange={(e) => setNewClassStage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-medium bg-white"
                >
                  <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
                  <option value="المرحلة المتوسطة">المرحلة المتوسطة / الإعدادية</option>
                  <option value="المرحلة الثانوية">المرحلة الثانوية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشعب الدراسية (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={newSectionsInput}
                  onChange={(e) => setNewSectionsInput(e.target.value)}
                  placeholder="مثال: شعبة أ, شعبة ب, شعبة ج"
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">افصل بين أسماء الشعب بفاصلة (، أو ,)</p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition"
                >
                  إنشاء الصف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Section to Class */}
      {activeClassForSection && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" />
              <span>إضافة شعبة إلى {activeClassForSection.name}</span>
            </h3>

            <form onSubmit={handleAddSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الشعبة الجديدة</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="مثال: شعبة ج أو شعبة 3"
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveClassForSection(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  إضافة الشعبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
