import React, { useState, useEffect } from "react";
import { ClassItem, Student } from "../types";
import { GoogleContactsModal } from "./GoogleContactsModal";
import {
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  UserPlus,
  Send,
  Phone,
  Calendar,
  AlertTriangle,
  Check,
  ChevronDown,
  ExternalLink,
  BookOpen,
  X,
  Share2,
} from "lucide-react";

interface ClassWorkspaceViewProps {
  classes: ClassItem[];
  students: Student[];
  selectedClassId: string;
  onSelectClassId: (id: string) => void;
  onSubmitAttendance: (
    classId: string,
    records: { studentId: string; status: "present" | "absent" }[]
  ) => void;
  onAddStudentToClass: (classId: string, student: { name: string; phone: string }) => void;
  onBatchImportStudents: (
    classId: string,
    newStudents: { name: string; phone: string; parentPhone: string }[]
  ) => void;
  onOpenAssistantWithMessage: (prompt: string) => void;
}

export const ClassWorkspaceView: React.FC<ClassWorkspaceViewProps> = ({
  classes,
  students,
  selectedClassId,
  onSelectClassId,
  onSubmitAttendance,
  onAddStudentToClass,
  onBatchImportStudents,
  onOpenAssistantWithMessage,
}) => {
  const [activeTab, setActiveTab] = useState<"attendance" | "roster" | "history">("attendance");
  const [customNotifyMessage, setCustomNotifyMessage] = useState("");

  // Selected Class Object
  const currentClass =
    classes.find((c) => c.id === selectedClassId) || classes[0] || null;

  // Filter students belonging to this class
  const classStudents = currentClass
    ? students.filter((s) => currentClass.students.includes(s.id))
    : [];

  // Attendance state for current session: { [studentId]: "present" | "absent" }
  // PROMPT RULE: "DEFAULT STATE: All students are marked 'Present' (Green visual toggle)"
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent">>({});

  // Reset or initialize default state to "present" for all students when class changes
  useEffect(() => {
    if (currentClass) {
      const initialMap: Record<string, "present" | "absent"> = {};
      classStudents.forEach((student) => {
        initialMap[student.id] = "present";
      });
      setAttendanceMap(initialMap);
      setShowAbsentSummaryModal(false);
      setSubmittedAbsentStudents([]);
    }
  }, [selectedClassId, currentClass?.students.length]);

  // Submission outcome state
  const [showAbsentSummaryModal, setShowAbsentSummaryModal] = useState(false);
  const [submittedAbsentStudents, setSubmittedAbsentStudents] = useState<Student[]>([]);
  const [notifiedStudents, setNotifiedStudents] = useState<Set<string>>(new Set());

  // Google Contacts Modal state
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  // Manual Add Student Modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");

  // Toggle single student's attendance between Present & Absent
  const toggleAttendance = (studentId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "absent" ? "present" : "absent",
    }));
  };

  // Bulk toggles
  const markAllPresent = () => {
    const nextMap: Record<string, "present" | "absent"> = {};
    classStudents.forEach((s) => {
      nextMap[s.id] = "present";
    });
    setAttendanceMap(nextMap);
  };

  const markAllAbsent = () => {
    const nextMap: Record<string, "present" | "absent"> = {};
    classStudents.forEach((s) => {
      nextMap[s.id] = "absent";
    });
    setAttendanceMap(nextMap);
  };

  // Handle Attendance Submission
  const handleSubmit = () => {
    if (!currentClass) return;

    const records = classStudents.map((s) => ({
      studentId: s.id,
      status: attendanceMap[s.id] || "present",
    }));

    onSubmitAttendance(currentClass.id, records);

    // Identify absent students for the summary modal
    const absentees = classStudents.filter(
      (s) => attendanceMap[s.id] === "absent"
    );

    setSubmittedAbsentStudents(absentees);
    setShowAbsentSummaryModal(true);
  };

  // Helper to format clean WhatsApp link
  // PROMPT RULE: `https://wa.me/<phone>?text=Hello, [Name] was absent from coaching today.`
  const generateWhatsAppLink = (student: Student) => {
    // Strip non-digits
    const cleanPhone = (student.parentPhone || student.phone).replace(/[^\d]/g, "");
    let rawMessage = `Hello, ${student.name} was absent from coaching today.`;
    
    if (customNotifyMessage.trim()) {
      rawMessage = customNotifyMessage.replace(/\[Name\]/gi, student.name);
    }
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;
  };

  const handleNotifyParent = (student: Student) => {
    const url = generateWhatsAppLink(student);
    window.open(url, "_blank", "noopener,noreferrer");

    // Track as notified
    setNotifiedStudents((prev) => {
      const next = new Set(prev);
      next.add(student.id);
      return next;
    });
  };

  const handleNotifyAllParents = () => {
    submittedAbsentStudents.forEach((student, index) => {
      const url = generateWhatsAppLink(student);
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, index * 300); // Stagger popups to help prevent browser blocks
      
      setNotifiedStudents((prev) => {
        const next = new Set(prev);
        next.add(student.id);
        return next;
      });
    });
  };

  const handleManualAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPhone.trim() || !currentClass) return;

    onAddStudentToClass(currentClass.id, {
      name: newStudentName.trim(),
      phone: newStudentPhone.trim(),
    });

    setNewStudentName("");
    setNewStudentPhone("");
    setIsAddStudentOpen(false);
  };

  const presentCount = classStudents.filter(
    (s) => (attendanceMap[s.id] || "present") === "present"
  ).length;
  const absentCount = classStudents.length - presentCount;

  return (
    <div className="space-y-5 pb-24">
      {/* Class Selector Bar */}
      <header className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Class Workspace
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {currentClass?.name || "Select Class"}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Switch Class:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {classes.map((c) => (
                <button
                  key={c.id}
                  id={`class-pill-${c.id}`}
                  onClick={() => onSelectClassId(c.id)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    c.id === selectedClassId
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Room & Target context */}
        {currentClass && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-xs">
            <span>Room: <strong className="text-slate-900 dark:text-slate-100">{currentClass.room}</strong></span>
            <span>•</span>
            <span>Target: <strong className="text-slate-900 dark:text-slate-100">{currentClass.grade}</strong></span>
            <span>•</span>
            <span>Enrolled: <strong className="text-slate-900 dark:text-slate-100">{classStudents.length} Students</strong></span>
          </div>
        )}

        {/* Tab Switcher: [ Attendance | Roster ] (Prompt Requirement) */}
        <div
          id="workspace-tabs-container"
          role="tablist"
          className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl"
        >
          <button
            id="tab-attendance"
            role="tab"
            aria-selected={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "attendance"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Attendance</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "attendance"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {classStudents.length}
            </span>
          </button>

          <button
            id="tab-roster"
            role="tab"
            aria-selected={activeTab === "roster"}
            onClick={() => setActiveTab("roster")}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "roster"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Roster</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "roster"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {classStudents.length}
            </span>
          </button>

          <button
            id="tab-history"
            role="tab"
            aria-selected={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>History</span>
          </button>
        </div>
      </header>

      {/* ==================== ATTENDANCE TAB ==================== */}
      {activeTab === "attendance" && (
        <section aria-labelledby="tab-attendance" className="space-y-4">
          {/* Frictionless controls toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-3.5 h-3.5" />
                  {presentCount} Present
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                  <X className="w-3.5 h-3.5" />
                  {absentCount} Absent
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                Tap student card to toggle Present/Absent
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="mark-all-present-btn"
                onClick={markAllPresent}
                className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                id="mark-all-absent-btn"
                onClick={markAllAbsent}
                className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Students Attendance List (Frictionless UI) */}
          <div className="space-y-2.5">
            {classStudents.map((student, index) => {
              const isPresent = (attendanceMap[student.id] || "present") === "present";

              return (
                <div
                  key={student.id}
                  id={`attendance-row-${student.id}`}
                  onClick={() => toggleAttendance(student.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleAttendance(student.id);
                    }
                  }}
                  className={`min-h-[58px] p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all select-none cursor-pointer active:scale-99 ${
                    isPresent
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-300 dark:hover:border-emerald-700 ring-1 ring-emerald-100 dark:ring-emerald-950"
                      : "bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/80 hover:border-rose-300 dark:hover:border-rose-700 ring-1 ring-rose-100 dark:ring-rose-950"
                  }`}
                >
                  {/* Left: Avatar & Student Details */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        student.avatarColor || "bg-slate-700"
                      }`}
                    >
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+{student.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Visual Toggle Badge */}
                  <div className="flex items-center gap-3">
                    {isPresent ? (
                      <span
                        id={`status-toggle-present-${student.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition-all min-h-[44px]"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Present</span>
                      </span>
                    ) : (
                      <span
                        id={`status-toggle-absent-${student.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-xs transition-all min-h-[44px]"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Absent</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button (Prompt Requirement) */}
          <div className="pt-2 sticky bottom-20 z-20">
            <button
              id="submit-attendance-btn"
              onClick={handleSubmit}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Submit Attendance for {currentClass?.name}</span>
              <span className="text-xs font-normal text-slate-300 dark:text-slate-600">
                ({presentCount} Present / {absentCount} Absent)
              </span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== ROSTER TAB ==================== */}
      {activeTab === "roster" && (
        <section aria-labelledby="tab-roster" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Class Enrolled Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {classStudents.length} students enrolled in {currentClass?.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Google Contacts Import Button */}
              <button
                id="open-google-contacts-btn"
                onClick={() => setIsContactsModalOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Import Contacts</span>
              </button>

              <button
                id="manual-add-student-btn"
                onClick={() => setIsAddStudentOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Roster Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classStudents.map((student, idx) => {
              const totalClasses = student.attendanceRecord.length;
              const presentClasses = student.attendanceRecord.filter(
                (r) => r.status === "present"
              ).length;
              const attendanceRate =
                totalClasses > 0
                  ? Math.round((presentClasses / totalClasses) * 100)
                  : 100;

              return (
                <div
                  key={student.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          student.avatarColor || "bg-slate-700"
                        }`}
                      >
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>+{student.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          attendanceRate >= 85
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : attendanceRate >= 70
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {attendanceRate}%
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {presentClasses}/{totalClasses || 1} present
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Parent: +{student.parentPhone || student.phone}</span>
                    <button
                      onClick={() => handleNotifyParent(student)}
                      className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 min-h-[44px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== HISTORY TAB ==================== */}
      {activeTab === "history" && (
        <section aria-labelledby="tab-history" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Attendance History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View past attendance records for {currentClass?.name}.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {classStudents.map((student) => {
              // Filter student records for THIS class specifically
              const classRecords = student.attendanceRecord.filter(
                (r) => r.className === currentClass?.name
              ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              const presentCount = classRecords.filter((r) => r.status === "present").length;
              const totalCount = classRecords.length;
              const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

              return (
                <div key={student.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
                        style={{ backgroundColor: student.avatarColor || "#64748b" }}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {student.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                           <span>Total: {totalCount} classes</span>
                           <span>•</span>
                           <span className={`font-semibold ${rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                             {rate}% Attendance
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4">
                    {classRecords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {classRecords.map((r, i) => (
                           <div key={i} className={`flex flex-col gap-1 px-3 py-2 rounded-lg border text-[11px] min-w-[90px] text-center shrink-0 ${r.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'}`}>
                             <div className="font-semibold opacity-80">
                               {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                             </div>
                             <div className="font-bold uppercase tracking-wider">
                               {r.status}
                             </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">No attendance history available for this class yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== SUBMIT SUMMARY MODAL (PROMPT REQUIREMENT) ==================== */}
      {showAbsentSummaryModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="absent-summary-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="absent-summary-title" className="text-base font-bold text-white">
                    Attendance Submitted!
                  </h3>
                  <p className="text-xs text-slate-300">
                    {currentClass?.name} • {classStudents.length - submittedAbsentStudents.length} present,{" "}
                    {submittedAbsentStudents.length} absent
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAbsentSummaryModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
                aria-label="Close summary modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {submittedAbsentStudents.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    100% Attendance Today!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    All students are present in {currentClass?.name}. No parent absentee alerts required.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        {submittedAbsentStudents.length} Absent Students Detected
                      </span>
                      <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                        Customize your message below, then notify parents individually or all at once.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      <span>Custom WhatsApp Message (Optional)</span>
                    </label>
                    <textarea
                      placeholder="e.g. Hello, [Name] was absent today..."
                      value={customNotifyMessage}
                      onChange={(e) => setCustomNotifyMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 resize-none min-h-[60px]"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Use <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-sm">[Name]</span> to insert the student's name automatically.
                      </p>
                      <button
                        onClick={handleNotifyAllParents}
                        className="min-h-[32px] px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Notify All at Once</span>
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {submittedAbsentStudents.map((student) => {
                      const isNotified = notifiedStudents.has(student.id);
                      const cleanPhone = (student.parentPhone || student.phone).replace(
                        /[^\d]/g,
                        ""
                      );
                      const deepLink = generateWhatsAppLink(student);

                      return (
                        <div
                          key={student.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                              <span>{student.name}</span>
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                Absent
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>Parent: +{cleanPhone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              id={`notify-parent-whatsapp-${student.id}`}
                              href={deepLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setNotifiedStudents((prev) => new Set(prev).add(student.id));
                              }}
                              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                isNotified
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{isNotified ? "Notified (WhatsApp)" : "Notify Parent"}</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fast AI assistant link to draft custom parent message */}
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Want custom parent notification text?</span>
                    </span>
                    <button
                      onClick={() => {
                        setShowAbsentSummaryModal(false);
                        onOpenAssistantWithMessage(
                          `Draft a polite WhatsApp announcement to the parents of absent students (${submittedAbsentStudents
                            .map((s) => s.name)
                            .join(", ")}) for ${currentClass?.name}.`
                        );
                      }}
                      className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline min-h-[44px] flex items-center cursor-pointer"
                    >
                      Draft with AI Advisor
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-950/50">
              <button
                id="close-absent-summary-btn"
                onClick={() => setShowAbsentSummaryModal(false)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Student Dialog */}
      {isAddStudentOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-student-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 id="add-student-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Student to {currentClass?.name}
              </h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
                aria-label="Close Add Student Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varun Kapoor"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 919876543210"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 min-h-[44px]"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Used for automated WhatsApp absentee deep links
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Contacts Import Modal */}
      <GoogleContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        existingStudentPhones={classStudents.map((s) => s.phone)}
        onImportStudents={(newContacts) => {
          if (currentClass) {
            onBatchImportStudents(currentClass.id, newContacts);
          }
        }}
      />
    </div>
  );
};
