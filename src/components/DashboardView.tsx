import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ClassItem,
  Batch,
  Student,
  AttendanceAnalyticsDay,
} from "../types";
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarOff,
} from "lucide-react";

interface DashboardViewProps {
  classes: ClassItem[];
  batches: Batch[];
  students: Student[];
  weeklyAttendance: AttendanceAnalyticsDay[];
  holidayBatchIds: string[];
  currentTimeStr: string;
  onOpenClass: (classId: string) => void;
  onOpenSchedule: () => void;
  onOpenAssistant: (initialPrompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  batches,
  students,
  weeklyAttendance,
  holidayBatchIds,
  currentTimeStr,
  onOpenClass,
  onOpenSchedule,
  onOpenAssistant,
}) => {
  const isFullHoliday = holidayBatchIds.length === batches.length && batches.length > 0;
  const isHoliday = holidayBatchIds.length > 0;

  // Helper to parse "HH:MM" into minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const currentMinutes = toMinutes(currentTimeStr);

  // Find next batch or ongoing batch
  const enrichedBatches = batches.map((batch) => {
    const classObj = classes.find((c) => c.id === batch.classId);
    const startMin = toMinutes(batch.startTime);
    const endMin = toMinutes(batch.endTime);
    const isBatchHoliday = holidayBatchIds.includes(batch.id);
    const isOngoing = !isBatchHoliday && currentMinutes >= startMin && currentMinutes <= endMin;
    const isPast = currentMinutes > endMin;
    const isUpcoming = !isBatchHoliday && currentMinutes < startMin;
    const minutesUntilStart = startMin - currentMinutes;

    return {
      ...batch,
      className: classObj?.name || "Coaching Batch",
      room: classObj?.room || "Room 101",
      studentCount: classObj?.students.length || 0,
      startMin,
      endMin,
      isOngoing,
      isPast,
      isUpcoming,
      minutesUntilStart,
      isBatchHoliday,
    };
  });

  // Determine dynamic message for the summary card:
  // "You have 3 batches today. Next batch: [Class Name] in 15 mins."
  const ongoing = enrichedBatches.find((b) => b.isOngoing);
  const nextUpcoming = enrichedBatches
    .filter((b) => b.isUpcoming)
    .sort((a, b) => a.startMin - b.startMin)[0];

  let nextBatchSummaryText = "";
  if (isFullHoliday) {
    nextBatchSummaryText = "Holiday in effect (Chutti). All batches paused for today.";
  } else if (ongoing) {
    const minLeft = ongoing.endMin - currentMinutes;
    nextBatchSummaryText = `Next batch: ${ongoing.className} is ONGOING now (ends in ${minLeft}m).`;
  } else if (nextUpcoming) {
    if (nextUpcoming.minutesUntilStart <= 60) {
      nextBatchSummaryText = `Next batch: ${nextUpcoming.className} in ${nextUpcoming.minutesUntilStart} mins.`;
    } else {
      const hours = Math.floor(nextUpcoming.minutesUntilStart / 60);
      const mins = nextUpcoming.minutesUntilStart % 60;
      nextBatchSummaryText = `Next batch: ${nextUpcoming.className} at ${nextUpcoming.startTime} (in ${hours}h ${mins}m).`;
    }
  } else {
    nextBatchSummaryText = "All batches completed for today. Great job, Keshav!";
  }

  // Calculate average attendance %
  const totalAvgAttendance = Math.round(
    weeklyAttendance.reduce((acc, curr) => acc + curr.attendanceRate, 0) /
      weeklyAttendance.length
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header Greeting */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Offline Coaching Center System
          </span>
          <h1
            id="dashboard-greeting-title"
            className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Welcome, Keshav!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Here is your coaching center overview and attendance status for today.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} •{" "}
              <strong className="text-slate-900 dark:text-slate-100">{currentTimeStr}</strong>
            </span>
          </div>
          {isFullHoliday && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <CalendarOff className="w-3.5 h-3.5" />
              Chutti Active
            </span>
          )}
        </div>
      </header>

      {/* Primary Summary Card: Exact Prompt Requirement */}
      <section
        id="dashboard-summary-card"
        aria-labelledby="summary-card-heading"
        className={`relative overflow-hidden rounded-xl border p-5 transition-all shadow-sm ${
          isFullHoliday
            ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200"
            : ongoing
            ? "bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800"
            : "bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white border-slate-800 dark:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                id="summary-card-heading"
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isFullHoliday
                    ? "bg-rose-200/80 text-rose-900"
                    : ongoing
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                Today's Overview
              </span>
              {ongoing && !isFullHoliday && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Live Now
                </span>
              )}
            </div>

            <p className="text-lg md:text-xl font-bold tracking-tight">
              You have {batches.length} batches today.
            </p>

            <p
              className={`text-sm md:text-base font-medium ${
                isFullHoliday
                  ? "text-rose-900 dark:text-rose-300"
                  : ongoing
                  ? "text-emerald-950 dark:text-emerald-200"
                  : "text-slate-300"
              }`}
            >
              {nextBatchSummaryText}
            </p>
          </div>

          <div
            className={`p-3 rounded-xl hidden sm:flex items-center justify-center shrink-0 ${
              isFullHoliday
                ? "bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                : ongoing
                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-800 text-amber-400"
            }`}
          >
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        {/* Quick batch jump button */}
        <div className="mt-4 pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="opacity-80">
            {ongoing
              ? `Currently teaching in ${ongoing.room}`
              : nextUpcoming
              ? `Next room: ${nextUpcoming.room}`
              : "Review rosters and attendance below"}
          </span>
          <button
            id="view-full-schedule-btn"
            onClick={onOpenSchedule}
            className={`inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isFullHoliday
                ? "bg-rose-200/80 text-rose-900 hover:bg-rose-300"
                : ongoing
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
            }`}
          >
            <span>View Smart Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* KPI Stats Row */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Across {classes.length} class batches</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Weekly Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalAvgAttendance}%</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Consistent rate</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Today's Batches</span>
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {batches.length - holidayBatchIds.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isFullHoliday ? "Holiday Chutti" : holidayBatchIds.length > 0 ? `${holidayBatchIds.length} batches on holiday` : "All batches scheduled"}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Center Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
            {isFullHoliday ? "Holiday" : "In Session"}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Offline coaching</span>
        </div>
      </section>

      {/* Attendance Analytics BarChart (Prompt Requirement) */}
      <section
        id="weekly-attendance-chart-card"
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Average Attendance This Week
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily percentage of students present across all coaching batches
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-900 dark:bg-slate-200" />
            <span>Attendance %</span>
          </div>
        </div>

        {/* Recharts BarChart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyAttendance}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: "#64748b", opacity: 0.3 }}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as AttendanceAnalyticsDay;
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs shadow-md border border-slate-800 dark:border-slate-700">
                        <p className="font-bold text-slate-100">{data.day}</p>
                        <p className="text-emerald-400 font-semibold mt-0.5">
                          {data.attendanceRate}% Attendance
                        </p>
                        <p className="text-slate-300 text-[11px]">
                          {data.presentCount} of {data.totalStudents} students present
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="attendanceRate"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              >
                {weeklyAttendance.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.attendanceRate >= 90
                        ? "#0f172a"
                        : entry.attendanceRate >= 80
                        ? "#334155"
                        : "#64748b"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Target benchmark: 85%+
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Average: {totalAvgAttendance}%
          </span>
        </div>
      </section>

      {/* Batches Quick Access / Jump to Attendance */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Today's Batches ({batches.length})
          </h2>
          <button
            onClick={onOpenSchedule}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline cursor-pointer"
          >
            Manage Schedule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {enrichedBatches.map((batch) => (
            <div
              key={batch.id}
              className={`rounded-xl border p-4 transition-all shadow-xs flex flex-col justify-between ${
                batch.isBatchHoliday
                  ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                  : batch.isOngoing
                  ? "bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-300 dark:ring-emerald-800"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {batch.startTime} - {batch.endTime}
                  </span>

                  {batch.isBatchHoliday ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      Chutti
                    </span>
                  ) : batch.isOngoing ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                      Ongoing
                    </span>
                  ) : batch.isPast ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                      In {batch.minutesUntilStart}m
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {batch.className}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{batch.room}</p>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{batch.studentCount} enrolled students</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  id={`jump-attendance-${batch.classId}`}
                  onClick={() => onOpenClass(batch.classId)}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
                >
                  <span>Mark Attendance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fast Gemini Assistant CTA Card */}
      <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white">
            <Sparkles className="w-3 h-3" />
            <span>Low-Latency Gemini 3.1 Flash-Lite</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Need help drafting parent WhatsApp broadcasts or exam schedules?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Ask your Saraswat AI Assistant for instant notices, attendance recovery strategies, or lesson advice.
          </p>
        </div>

        <button
          onClick={() => onOpenAssistant("Draft a polite absentee follow-up message for parents")}
          className="min-h-[44px] shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Advisor</span>
        </button>
      </section>
    </div>
  );
};
