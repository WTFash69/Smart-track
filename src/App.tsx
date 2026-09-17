/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  initialClasses,
  initialStudents,
  initialBatches,
  initialWeeklyAttendance,
} from "./mockData";
import {
  ClassItem,
  Student,
  Batch,
  ViewTab,
  AttendanceAnalyticsDay,
} from "./types";
import { Navigation } from "./components/Navigation";
import { DashboardView } from "./components/DashboardView";
import { ScheduleView } from "./components/ScheduleView";
import { ClassWorkspaceView } from "./components/ClassWorkspaceView";
import { GeminiChatbot } from "./components/GeminiChatbot";
import { AdminView } from "./components/AdminView";
import {
  GraduationCap,
  Sparkles,
  CalendarOff,
  Bell,
  Clock,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react";

export default function App() {
  // Theme State with localStorage and system preference fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Top-Level State Management (Exact Mock Data Structures)
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [weeklyAttendance, setWeeklyAttendance] = useState<AttendanceAnalyticsDay[]>(
    initialWeeklyAttendance
  );

  // App routing state (State-based simulated multi-page application)
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");
  const [selectedClassId, setSelectedClassId] = useState<string>("c1");

  // Global Holiday State
  const [holidayBatchIds, setHolidayBatchIds] = useState<string[]>([]);
  const isHoliday = holidayBatchIds.length > 0;
  const isFullHoliday = holidayBatchIds.length === batches.length && batches.length > 0;

  // Time Simulator & Live Clock State
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [liveTime, setLiveTime] = useState<string>(() => {
    const now = new Date();
    return now.toTimeString().substring(0, 5); // "HH:MM"
  });

  // Assistant Prompt pre-fill state
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(
    undefined
  );

  // Clock ticker every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now.toTimeString().substring(0, 5));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const effectiveCurrentTime = simulatedTime || liveTime;

  // Helper to convert "HH:MM" to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const currentMinutes = toMinutes(effectiveCurrentTime);

  // Count how many batches are ongoing right now
  const ongoingBatches = batches.filter((b) => {
    if (holidayBatchIds.includes(b.id)) return false;
    const start = toMinutes(b.startTime);
    const end = toMinutes(b.endTime);
    return currentMinutes >= start && currentMinutes <= end;
  });

  // Handler: Submit Attendance
  const handleSubmitAttendance = (
    classId: string,
    records: { studentId: string; status: "present" | "absent" }[]
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const targetClass = classes.find((c) => c.id === classId);
    const className = targetClass?.name || "Class";

    // Update students state with the new attendance entry
    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        const found = records.find((r) => r.studentId === s.id);
        if (found) {
          const filtered = s.attendanceRecord.filter((r) => r.date !== todayStr);
          return {
            ...s,
            attendanceRecord: [
              ...filtered,
              {
                date: todayStr,
                status: found.status,
                className,
              },
            ],
          };
        }
        return s;
      })
    );

    // Update weekly attendance chart for today (e.g., Sat/Today)
    const presentCount = records.filter((r) => r.status === "present").length;
    const totalCount = records.length;
    const newRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayDayName = days[new Date().getDay()];

    setWeeklyAttendance((prev) =>
      prev.map((day) =>
        day.day === todayDayName
          ? {
              ...day,
              attendanceRate: newRate,
              presentCount,
              totalStudents: totalCount,
            }
          : day
      )
    );
  };

  // Handler: Add Single Student to a Class (Roster quick-add)
  const handleAddStudentToClass = (
    classId: string,
    studentData: { name: string; phone: string }
  ) => {
    const newId = `s-${Date.now()}`;
    const avatarColors = [
      "bg-blue-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-rose-600",
      "bg-teal-600",
    ];
    const randomColor =
      avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newStudent: Student = {
      id: newId,
      name: studentData.name,
      phone: studentData.phone.replace(/[^\d]/g, ""),
      parentPhone: studentData.phone.replace(/[^\d]/g, ""),
      avatarColor: randomColor,
      attendanceRecord: [
        {
          date: new Date().toISOString().split("T")[0],
          status: "present",
        },
      ],
    };

    setStudents((prev) => [newStudent, ...prev]);

    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, students: [...c.students, newId] } : c
      )
    );
  };

  // Handler: Batch Import Students from Google Contacts
  const handleBatchImportStudents = (
    classId: string,
    newContacts: { name: string; phone: string; parentPhone: string }[]
  ) => {
    const avatarColors = [
      "bg-blue-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-rose-600",
    ];

    const createdStudents: Student[] = newContacts.map((contact, idx) => ({
      id: `s-import-${Date.now()}-${idx}`,
      name: contact.name,
      phone: contact.phone.replace(/[^\d]/g, ""),
      parentPhone: contact.parentPhone.replace(/[^\d]/g, ""),
      avatarColor: avatarColors[idx % avatarColors.length],
      attendanceRecord: [],
    }));

    const newIds = createdStudents.map((s) => s.id);

    setStudents((prev) => [...createdStudents, ...prev]);

    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, students: [...c.students, ...newIds] } : c
      )
    );
  };

  // ==========================================
  // Administrative Handlers (Batches & Students)
  // ==========================================

  // Handler: Create Batch & Class Schedule
  const handleCreateBatch = (
    classData: { name: string; subject: string; grade: string; room: string },
    batchData: { startTime: string; endTime: string; days: string[] }
  ) => {
    const newClassId = `c-${Date.now()}`;
    const newBatchId = `b-${Date.now()}`;

    const newClass: ClassItem = {
      id: newClassId,
      name: classData.name,
      subject: classData.subject,
      grade: classData.grade,
      room: classData.room,
      students: [],
    };

    const newBatch: Batch = {
      id: newBatchId,
      classId: newClassId,
      startTime: batchData.startTime,
      endTime: batchData.endTime,
      days: batchData.days,
    };

    setClasses((prev) => [...prev, newClass]);
    setBatches((prev) => [...prev, newBatch]);
  };

  // Handler: Update Batch & Class Schedule
  const handleUpdateBatch = (
    batchId: string,
    classId: string,
    classData: { name: string; subject: string; grade: string; room: string },
    batchData: { startTime: string; endTime: string; days: string[] }
  ) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? {
              ...c,
              name: classData.name,
              subject: classData.subject,
              grade: classData.grade,
              room: classData.room,
            }
          : c
      )
    );

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              startTime: batchData.startTime,
              endTime: batchData.endTime,
              days: batchData.days,
            }
          : b
      )
    );
  };

  // Handler: Delete Batch & Class
  const handleDeleteBatch = (batchId: string, classId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    if (selectedClassId === classId) {
      const remaining = classes.filter((c) => c.id !== classId);
      if (remaining.length > 0) setSelectedClassId(remaining[0].id);
    }
  };

  // Handler: Create Student in Management Portal
  const handleCreateStudent = (studentData: {
    name: string;
    phone: string;
    parentPhone: string;
    classIds: string[];
  }) => {
    const newStudentId = `s-${Date.now()}`;
    const avatarColors = [
      "bg-blue-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-rose-600",
      "bg-teal-600",
    ];
    const randomColor =
      avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newStudent: Student = {
      id: newStudentId,
      name: studentData.name,
      phone: studentData.phone.replace(/[^\d]/g, ""),
      parentPhone: (studentData.parentPhone || studentData.phone).replace(
        /[^\d]/g,
        ""
      ),
      avatarColor: randomColor,
      attendanceRecord: [],
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Add student ID to selected classes
    setClasses((prev) =>
      prev.map((cls) => {
        if (studentData.classIds.includes(cls.id)) {
          return {
            ...cls,
            students: cls.students.includes(newStudentId)
              ? cls.students
              : [...cls.students, newStudentId],
          };
        }
        return cls;
      })
    );
  };

  // Handler: Update Student Info & Enrolled Classes
  const handleUpdateStudent = (
    studentId: string,
    studentData: {
      name: string;
      phone: string;
      parentPhone: string;
      classIds: string[];
    }
  ) => {
    const cleanPhone = studentData.phone.replace(/[^\d]/g, "");
    const cleanParentPhone = (
      studentData.parentPhone || studentData.phone
    ).replace(/[^\d]/g, "");

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              name: studentData.name,
              phone: cleanPhone,
              parentPhone: cleanParentPhone,
            }
          : s
      )
    );

    // Update class rosters
    setClasses((prev) =>
      prev.map((cls) => {
        const shouldBeInClass = studentData.classIds.includes(cls.id);
        const isCurrentlyInClass = cls.students.includes(studentId);

        if (shouldBeInClass && !isCurrentlyInClass) {
          return { ...cls, students: [...cls.students, studentId] };
        } else if (!shouldBeInClass && isCurrentlyInClass) {
          return {
            ...cls,
            students: cls.students.filter((id) => id !== studentId),
          };
        }
        return cls;
      })
    );
  };

  // Handler: Delete Student from Registry and all Classes
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setClasses((prev) =>
      prev.map((cls) => ({
        ...cls,
        students: cls.students.filter((id) => id !== studentId),
      }))
    );
  };

  // Navigation helpers
  const handleOpenClassWorkspace = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentTab("workspace");
  };

  const handleOpenAssistantWithPrompt = (prompt?: string) => {
    if (prompt) setAssistantPrompt(prompt);
    setCurrentTab("assistant");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900 transition-colors duration-200">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Saraswat Coaching
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Keshav Sir
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Attendance & Batch Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHoliday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <CalendarOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isFullHoliday ? "Chutti Active" : "Partial Chutti"}</span>
              </span>
            )}

            {/* Dark / Light Theme Switcher */}
            <button
              id="theme-switcher-btn"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 inline-flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={() => handleOpenAssistantWithPrompt()}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              aria-label="Open AI Coaching Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pt-4">
        {currentTab === "dashboard" && (
          <DashboardView
            classes={classes}
            batches={batches}
            students={students}
            weeklyAttendance={weeklyAttendance}
            holidayBatchIds={holidayBatchIds}
            currentTimeStr={effectiveCurrentTime}
            onOpenClass={handleOpenClassWorkspace}
            onOpenSchedule={() => setCurrentTab("schedule")}
            onOpenAssistant={handleOpenAssistantWithPrompt}
          />
        )}

        {currentTab === "schedule" && (
          <ScheduleView
            batches={batches}
            classes={classes}
            holidayBatchIds={holidayBatchIds}
            onUpdateHolidayBatches={setHolidayBatchIds}
            currentTimeStr={effectiveCurrentTime}
            isSimulatedTime={simulatedTime !== null}
            onSetSimulatedTime={setSimulatedTime}
            onOpenClass={handleOpenClassWorkspace}
          />
        )}

        {currentTab === "workspace" && (
          <ClassWorkspaceView
            classes={classes}
            students={students}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            onSubmitAttendance={handleSubmitAttendance}
            onAddStudentToClass={handleAddStudentToClass}
            onBatchImportStudents={handleBatchImportStudents}
            onOpenAssistantWithMessage={handleOpenAssistantWithPrompt}
          />
        )}

        {currentTab === "admin" && (
          <AdminView
            classes={classes}
            batches={batches}
            students={students}
            onCreateBatch={handleCreateBatch}
            onUpdateBatch={handleUpdateBatch}
            onDeleteBatch={handleDeleteBatch}
            onCreateStudent={handleCreateStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBatchImportStudents={handleBatchImportStudents}
            onOpenClass={handleOpenClassWorkspace}
          />
        )}

        {currentTab === "assistant" && (
          <GeminiChatbot
            classes={classes}
            students={students}
            batches={batches}
            initialPrompt={assistantPrompt}
            onClearInitialPrompt={() => setAssistantPrompt(undefined)}
          />
        )}
      </main>

      {/* Persistent Mobile-First Bottom Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isHoliday={isHoliday}
        isFullHoliday={isFullHoliday}
        ongoingBatchCount={ongoingBatches.length}
      />
    </div>
  );
}

