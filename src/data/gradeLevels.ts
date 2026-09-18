export interface PredefinedGrade {
  gradeNumber: number; // 1 to 12
  name: string; // e.g. "الصف الأول", "الصف الثاني", etc.
  stage: 'المرحلة الابتدائية' | 'المرحلة المتوسطة' | 'المرحلة الثانوية';
  stageShort: 'ابتدائي' | 'متوسط' | 'ثانوي';
  suggestedSections: string[];
  color: string;
}

// All 12 grades from 1st to 12th as ready-made choices for the teacher
export const PREDEFINED_GRADES: PredefinedGrade[] = [
  {
    gradeNumber: 1,
    name: 'الصف الأول',
    stage: 'المرحلة الابتدائية',
    stageShort: 'ابتدائي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-emerald-600 to-teal-700',
  },
  {
    gradeNumber: 2,
    name: 'الصف الثاني',
    stage: 'المرحلة الابتدائية',
    stageShort: 'ابتدائي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-emerald-600 to-teal-700',
  },
  {
    gradeNumber: 3,
    name: 'الصف الثالث',
    stage: 'المرحلة الابتدائية',
    stageShort: 'ابتدائي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-emerald-600 to-teal-700',
  },
  {
    gradeNumber: 4,
    name: 'الصف الرابع',
    stage: 'المرحلة الابتدائية',
    stageShort: 'ابتدائي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-teal-600 to-cyan-700',
  },
  {
    gradeNumber: 5,
    name: 'الصف الخامس',
    stage: 'المرحلة الابتدائية',
    stageShort: 'ابتدائي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-teal-600 to-cyan-700',
  },
  {
    gradeNumber: 6,
    name: 'الصف السادس',
    stage: 'المرحلة الابتدائية',
    stageShort: 'ابتدائي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-teal-600 to-cyan-700',
  },
  {
    gradeNumber: 7,
    name: 'الصف السابع',
    stage: 'المرحلة المتوسطة',
    stageShort: 'متوسط',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-blue-600 to-indigo-700',
  },
  {
    gradeNumber: 8,
    name: 'الصف الثامن',
    stage: 'المرحلة المتوسطة',
    stageShort: 'متوسط',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-blue-600 to-indigo-700',
  },
  {
    gradeNumber: 9,
    name: 'الصف التاسع',
    stage: 'المرحلة المتوسطة',
    stageShort: 'متوسط',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-blue-600 to-indigo-700',
  },
  {
    gradeNumber: 10,
    name: 'الصف العاشر',
    stage: 'المرحلة الثانوية',
    stageShort: 'ثانوي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-indigo-600 to-purple-700',
  },
  {
    gradeNumber: 11,
    name: 'الصف الحادي عشر',
    stage: 'المرحلة الثانوية',
    stageShort: 'ثانوي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-indigo-600 to-purple-700',
  },
  {
    gradeNumber: 12,
    name: 'الصف الثاني عشر',
    stage: 'المرحلة الثانوية',
    stageShort: 'ثانوي',
    suggestedSections: ['شعبة أ', 'شعبة ب'],
    color: 'from-purple-600 to-rose-700',
  },
];
