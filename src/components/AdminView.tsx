import React, { useState } from "react";
import { ClassItem, Batch, Student } from "../types";
import { GoogleContactsModal } from "./GoogleContactsModal";
import {
  CalendarClock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  DoorOpen,
  Clock,
  Check,
  AlertCircle,
  X,
  Phone,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

interface AdminViewProps {
  classes: ClassItem[];
  batches: Batch[];
  students: Student[];
  onCreateBatch: (
    classData: { name: string; subject: string; grade: string; room: string },
    batchData: { startTime: string; endTime: string; days: string[] }
  ) => void;
  onUpdateBatch: (
    batchId: string,
    classId: string,
    classData: { name: string; subject: string; grade: string; room: string },
    batchData: { startTime: string; endTime: string; days: string[] }
  ) => void;
  onDeleteBatch: (batchId: string, classId: string) => void;
  onCreateStudent: (studentData: {
    name: string;
    phone: string;
    parentPhone: string;
    classIds: string[];
  }) => void;
  onUpdateStudent: (
    studentId: string,
    studentData: {
      name: string;
      phone: string;
      parentPhone: string;
      classIds: string[];
    }
  ) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchImportStudents: (
    classId: string,
    contacts: Array<{ name: string; phone: string; parentPhone: string }>
  ) => void;
  onOpenClass: (classId: string) => void;
}

const COMMON_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUBJECT_OPTIONS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Science & Math Combo",
  "Foundation",
];

export const AdminView: React.FC<AdminViewProps> = ({
  classes,
  batches,
  students,
  onCreateBatch,
  onUpdateBatch,
  onDeleteBatch,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchImportStudents,
  onOpenClass,
}) => {
  // Sub-tabs: "batches" or "students"
  const [activeSubTab, setActiveSubTab] = useState<"batches" | "students">("batches");

  // Search & Filters
  const [batchSearch, setBatchSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState<string>("all");

  // Modals state
  const [batchModalMode, setBatchModalMode] = useState<"create" | "edit" | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Batch Form State
  const [batchForm, setBatchForm] = useState({
    name: "",
    subject: "Physics",
    grade: "Class 11",
    room: "Room 101",
    startTime: "08:30",
    endTime: "10:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  });
  const [batchFormError, setBatchFormError] = useState<string | null>(null);

  // Batch Delete Confirmation
  const [batchToDelete, setBatchToDelete] = useState<{
    batchId: string;
    classId: string;
    className: string;
  } | null>(null);

  // Student Form State
  const [studentModalMode, setStudentModalMode] = useState<"create" | "edit" | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    phone: "",
    parentPhone: "",
    classIds: [] as string[],
  });
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // Student Delete Confirmation
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Google Contacts Modal
  const [isGoogleContactsOpen, setIsGoogleContactsOpen] = useState(false);
  const [googleTargetClassId, setGoogleTargetClassId] = useState<string>(
    classes[0]?.id || ""
  );

  // Open Create Batch Modal
  const handleOpenCreateBatch = () => {
    setBatchForm({
      name: "",
      subject: "Physics",
      grade: "Class 11",
      room: "Room 101",
      startTime: "08:30",
      endTime: "10:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    });
    setBatchFormError(null);
    setEditingBatchId(null);
    setEditingClassId(null);
    setBatchModalMode("create");
  };

  // Open Edit Batch Modal
  const handleOpenEditBatch = (batch: Batch) => {
    const targetClass = classes.find((c) => c.id === batch.classId);
    setBatchForm({
      name: targetClass?.name || "",
      subject: targetClass?.subject || "Physics",
      grade: targetClass?.grade || "Class 11",
      room: targetClass?.room || "Room 101",
      startTime: batch.startTime,
      endTime: batch.endTime,
      days: batch.days && batch.days.length > 0 ? batch.days : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    });
    setBatchFormError(null);
    setEditingBatchId(batch.id);
    setEditingClassId(batch.classId);
    setBatchModalMode("edit");
  };

  // Submit Batch Form
  const handleSaveBatchForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name.trim()) {
      setBatchFormError("Please enter a class / batch name");
      return;
    }
    if (!batchForm.startTime || !batchForm.endTime) {
      setBatchFormError("Please provide both start and end times");
      return;
    }
    if (batchForm.startTime >= batchForm.endTime) {
      setBatchFormError("Batch end time must be after start time");
      return;
    }
    if (batchForm.days.length === 0) {
      setBatchFormError("Please select at least one active day of the week");
      return;
    }

    if (batchModalMode === "create") {
      onCreateBatch(
        {
          name: batchForm.name.trim(),
          subject: batchForm.subject,
          grade: batchForm.grade,
          room: batchForm.room,
        },
        {
          startTime: batchForm.startTime,
          endTime: batchForm.endTime,
          days: batchForm.days,
        }
      );
    } else if (batchModalMode === "edit" && editingBatchId && editingClassId) {
      onUpdateBatch(
        editingBatchId,
        editingClassId,
        {
          name: batchForm.name.trim(),
          subject: batchForm.subject,
          grade: batchForm.grade,
          room: batchForm.room,
        },
        {
          startTime: batchForm.startTime,
          endTime: batchForm.endTime,
          days: batchForm.days,
        }
      );

      // WhatsApp Notification for Schedule Update
      const formatTo12Hour = (time: string) => {
        if (!time) return "";
        const [hour, min] = time.split(":");
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${min} ${ampm}`;
      };

      const message = `*Schedule Update: ${batchForm.name.trim()}*\n\n`
                    + `Subject: ${batchForm.subject}\n`
                    + `Grade: ${batchForm.grade}\n`
                    + `New Timings: ${formatTo12Hour(batchForm.startTime)} to ${formatTo12Hour(batchForm.endTime)}\n`
                    + `Days: ${batchForm.days.join(", ")}\n\n`
                    + `Please take note of the new schedule.`;
      
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }

    setBatchModalMode(null);
  };

  // Open Create Student Modal
  const handleOpenCreateStudent = () => {
    setStudentForm({
      name: "",
      phone: "",
      parentPhone: "",
      classIds: classes.length > 0 ? [classes[0].id] : [],
    });
    setStudentFormError(null);
    setEditingStudentId(null);
    setStudentModalMode("create");
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (student: Student) => {
    const enrolledClassIds = classes
      .filter((c) => c.students.includes(student.id))
      .map((c) => c.id);

    setStudentForm({
      name: student.name,
      phone: student.phone,
      parentPhone: student.parentPhone || student.phone,
      classIds: enrolledClassIds,
    });
    setStudentFormError(null);
    setEditingStudentId(student.id);
    setStudentModalMode("edit");
  };

  // Submit Student Form
  const handleSaveStudentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim()) {
      setStudentFormError("Please enter the student's name");
      return;
    }
    const cleanPhone = studentForm.phone.replace(/[^\d]/g, "");
    if (cleanPhone.length < 10) {
      setStudentFormError("Please enter a valid 10-digit student phone number");
      return;
    }

    const cleanParentPhone = (studentForm.parentPhone || studentForm.phone).replace(
      /[^\d]/g,
      ""
    );

    if (studentModalMode === "create") {
      onCreateStudent({
        name: studentForm.name.trim(),
        phone: cleanPhone,
        parentPhone: cleanParentPhone,
        classIds: studentForm.classIds,
      });
    } else if (studentModalMode === "edit" && editingStudentId) {
      onUpdateStudent(editingStudentId, {
        name: studentForm.name.trim(),
        phone: cleanPhone,
        parentPhone: cleanParentPhone,
        classIds: studentForm.classIds,
      });
    }

    setStudentModalMode(null);
  };

  // Toggle Day in Batch Form
  const toggleDay = (day: string) => {
    setBatchForm((prev) => {
      const exists = prev.days.includes(day);
      if (exists) {
        return { ...prev, days: prev.days.filter((d) => d !== day) };
      } else {
        return { ...prev, days: [...prev.days, day] };
      }
    });
  };

  // Toggle Class in Student Form
  const toggleStudentClass = (classId: string) => {
    setStudentForm((prev) => {
      const exists = prev.classIds.includes(classId);
      if (exists) {
        return { ...prev, classIds: prev.classIds.filter((id) => id !== classId) };
      } else {
        return { ...prev, classIds: [...prev.classIds, classId] };
      }
    });
  };

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    const c = classes.find((cls) => cls.id === b.classId);
    const searchLower = batchSearch.toLowerCase();
    const className = c?.name?.toLowerCase() || "";
    const subject = c?.subject?.toLowerCase() || "";
    const room = c?.room?.toLowerCase() || "";
    return (
      className.includes(searchLower) ||
      subject.includes(searchLower) ||
      room.includes(searchLower)
    );
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const searchLower = studentSearch.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchLower) ||
      s.phone.includes(searchLower) ||
      (s.parentPhone && s.parentPhone.includes(searchLower));

    if (!matchesSearch) return false;

    if (studentClassFilter === "all") return true;

    const targetClass = classes.find((c) => c.id === studentClassFilter);
    return targetClass ? targetClass.students.includes(s.id) : false;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Teacher Administration
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Management Portal
              <SlidersHorizontal className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Manage class schedules, room assignments, and student rosters with Google Contacts sync.
            </p>
          </div>

          {/* Quick Sub-Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl self-start sm:self-auto border border-slate-300/50 dark:border-slate-700/60">
            <button
              id="admin-tab-batches-btn"
              onClick={() => setActiveSubTab("batches")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "batches"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>Batches & Schedules</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {batches.length}
              </span>
            </button>
            <button
              id="admin-tab-students-btn"
              onClick={() => setActiveSubTab("students")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "students"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Registry</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {students.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          SUB-TAB 1: BATCHES & CLASS SCHEDULES
         ======================================================== */}
      {activeSubTab === "batches" && (
        <section aria-label="Batch Schedule Management" className="space-y-4">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by subject, class name, or room..."
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
            <button
              id="create-new-batch-btn"
              onClick={handleOpenCreateBatch}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Batch Schedule</span>
            </button>
          </div>

          {/* Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBatches.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                <CalendarClock className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  No matching batch schedules found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or click "Create New Batch Schedule" above to add a new class schedule.
                </p>
                <button
                  onClick={handleOpenCreateBatch}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Batch
                </button>
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const c = classes.find((cls) => cls.id === batch.classId);
                const enrolledCount = c ? c.students.length : 0;

                return (
                  <div
                    key={batch.id}
                    id={`batch-card-${batch.id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {c?.subject || "General"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
                          {c?.room || "Main Hall"}
                        </span>
                      </div>

                      {/* Class Name */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {c?.name || "Class"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {c?.grade || "Standard Batch"}
                      </p>

                      {/* Timing & Days */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>
                            {batch.startTime} - {batch.endTime}
                          </span>
                        </div>

                        {/* Days list */}
                        <div className="flex flex-wrap gap-1">
                          {COMMON_DAYS.map((day) => {
                            const isScheduled = batch.days?.includes(day);
                            return (
                              <span
                                key={day}
                                className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold transition-colors ${
                                  isScheduled
                                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-bold"
                                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-600"
                                }`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => c && onOpenClass(c.id)}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{enrolledCount} Students</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`edit-batch-${batch.id}-btn`}
                          onClick={() => handleOpenEditBatch(batch)}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          id={`delete-batch-${batch.id}-btn`}
                          onClick={() =>
                            setBatchToDelete({
                              batchId: batch.id,
                              classId: batch.classId,
                              className: c?.name || "Batch",
                            })
                          }
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          SUB-TAB 2: STUDENT MANAGEMENT MODULE
         ======================================================== */}
      {activeSubTab === "students" && (
        <section aria-label="Student Management Module" className="space-y-4">
          {/* Action Header & Tools */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by student name or phone..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>

                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
                >
                  <option value="all">All Classes ({students.length})</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.students.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="sync-google-contacts-btn"
                  onClick={() => setIsGoogleContactsOpen(true)}
                  className="min-h-[44px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {/* Google G Brand Icon */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sync Google Contacts</span>
                </button>

                <button
                  id="add-student-btn"
                  onClick={handleOpenCreateStudent}
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Showing {filteredStudents.length} of {students.length} students. Sync with Google Contacts to import student/parent numbers directly.
                </span>
              </div>
            </div>
          </div>

          {/* Student Cards List */}
          <div className="space-y-2.5">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  No matching students found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting the filter or search query, or add a student manually or from Google Contacts.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleOpenCreateStudent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Student
                  </button>
                  <button
                    onClick={() => setIsGoogleContactsOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer"
                  >
                    Sync Google Contacts
                  </button>
                </div>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const enrolledClasses = classes.filter((c) =>
                  c.students.includes(student.id)
                );

                return (
                  <div
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          student.avatarColor || "bg-indigo-600"
                        } text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {student.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            ID: {student.id.slice(-5)}
                          </span>
                        </div>

                        {/* Phone info */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>Student: +91 {student.phone}</span>
                          </span>
                          {student.parentPhone && student.parentPhone !== student.phone && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <span>Parent: +91 {student.parentPhone}</span>
                            </span>
                          )}
                        </div>

                        {/* Enrolled Classes Badges */}
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {enrolledClasses.length === 0 ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                              Not enrolled in any batch
                            </span>
                          ) : (
                            enrolledClasses.map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                              >
                                {c.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* WhatsApp Parent Button */}
                      <a
                        href={`https://wa.me/91${
                          student.parentPhone || student.phone
                        }?text=${encodeURIComponent(
                          `Hello, Greetings from Saraswat Coaching Center regarding ${student.name}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      {/* Edit Student */}
                      <button
                        id={`edit-student-${student.id}-btn`}
                        onClick={() => handleOpenEditStudent(student)}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit Student Info"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Delete Student */}
                      <button
                        id={`delete-student-${student.id}-btn`}
                        onClick={() => setStudentToDelete(student)}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100 text-xs font-semibold text-rose-700 dark:text-rose-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          MODAL: CREATE / EDIT CLASS & BATCH SCHEDULE
         ======================================================== */}
      {batchModalMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {batchModalMode === "create"
                      ? "Create Class Schedule"
                      : "Edit Class Schedule"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure subject, batch timing, and scheduled days
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatchModalMode(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchForm} className="p-5 overflow-y-auto space-y-4 flex-1">
              {batchFormError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{batchFormError}</span>
                </div>
              )}

              {/* Class Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Class / Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics 11th - Board & JEE"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              {/* Subject & Grade Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject *
                  </label>
                  <select
                    value={batchForm.subject}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Grade / Level
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Class 11, Class 12, Foundation"
                    value={batchForm.grade}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Batch Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={batchForm.startTime}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Batch End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={batchForm.endTime}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Days of the Week Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Scheduled Days of the Week *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_DAYS.map((day) => {
                    const isSelected = batchForm.days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBatchModalMode(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-batch-schedule-btn"
                  className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-xs transition-colors cursor-pointer"
                >
                  {batchModalMode === "create"
                    ? "Create Batch Schedule"
                    : "Update Batch Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DELETE BATCH CONFIRMATION
         ======================================================== */}
      {batchToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delete Batch Schedule?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {batchToDelete.className}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove this batch schedule? The class and its scheduled time slots will be removed from the active coaching monitor.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBatchToDelete(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-batch-btn"
                onClick={() => {
                  onDeleteBatch(batchToDelete.batchId, batchToDelete.classId);
                  setBatchToDelete(null);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT STUDENT
         ======================================================== */}
      {studentModalMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {studentModalMode === "create" ? "Add New Student" : "Edit Student Information"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter contact info and batch assignments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStudentModalMode(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentForm} className="p-5 overflow-y-auto space-y-4 flex-1">
              {studentFormError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{studentFormError}</span>
                </div>
              )}

              {/* Student Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              {/* Student Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Student Phone Number (10 digits) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={studentForm.phone}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, phone: e.target.value })
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Parent Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Parent / Guardian WhatsApp Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Same as student or alternate number"
                    value={studentForm.parentPhone}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, parentPhone: e.target.value })
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Used for automated WhatsApp absence notifications and updates.
                </p>
              </div>

              {/* Enrolled Classes Assignment */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assign to Classes / Batches
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-950">
                  {classes.map((cls) => {
                    const isChecked = studentForm.classIds.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStudentClass(cls.id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {cls.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                            ({cls.subject || "General"} - {cls.room || "Room 101"})
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentModalMode(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-student-btn"
                  className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-xs cursor-pointer"
                >
                  {studentModalMode === "create" ? "Add Student" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DELETE STUDENT CONFIRMATION
         ======================================================== */}
      {studentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delete Student?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {studentToDelete.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{studentToDelete.name}</strong> from the coaching center? This will remove them from all enrolled classes and attendance rosters.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-student-btn"
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GOOGLE CONTACTS SYNC INTEGRATION
         ======================================================== */}
      {isGoogleContactsOpen && (
        <GoogleContactsModal
          isOpen={isGoogleContactsOpen}
          onClose={() => setIsGoogleContactsOpen(false)}
          existingStudentPhones={students.map((s) => s.phone)}
          classes={classes}
          defaultClassId={googleTargetClassId}
          onImportStudents={(contacts, targetClassId) => {
            const classToEnroll = targetClassId || googleTargetClassId || classes[0]?.id;
            if (classToEnroll) {
              onBatchImportStudents(classToEnroll, contacts);
            }
            setIsGoogleContactsOpen(false);
          }}
        />
      )}
    </div>
  );
};
