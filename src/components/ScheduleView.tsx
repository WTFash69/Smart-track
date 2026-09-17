import React, { useState } from "react";
import { Batch, ClassItem } from "../types";
import {
  CalendarClock,
  Clock,
  CalendarOff,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  X,
  MessageSquare,
} from "lucide-react";

interface ScheduleViewProps {
  batches: Batch[];
  classes: ClassItem[];
  holidayBatchIds: string[];
  onUpdateHolidayBatches: (ids: string[]) => void;
  currentTimeStr: string;
  isSimulatedTime: boolean;
  onSetSimulatedTime: (time: string | null) => void;
  onOpenClass: (classId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  batches,
  classes,
  holidayBatchIds,
  onUpdateHolidayBatches,
  currentTimeStr,
  isSimulatedTime,
  onSetSimulatedTime,
  onOpenClass,
}) => {
  const [showTimeControls, setShowTimeControls] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [tempHolidayBatches, setTempHolidayBatches] = useState<string[]>([]);
  const [holidayMessage, setHolidayMessage] = useState("Today is a holiday (Chhutti). There will be no classes.");

  const isFullHoliday = holidayBatchIds.length === batches.length && batches.length > 0;
  const isHoliday = holidayBatchIds.length > 0;

  // Convert "HH:MM" to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const currentMinutes = toMinutes(currentTimeStr);

  const handleToggleHoliday = () => {
    if (isHoliday) {
      onUpdateHolidayBatches([]);
    } else {
      setTempHolidayBatches(batches.map((b) => b.id));
      setShowHolidayModal(true);
    }
  };

  // Quick preset test times to verify batches:
  // Batch 1: 08:30 - 10:00 (e.g. test at 09:00)
  // Batch 2: 10:30 - 12:00 (e.g. test at 11:00)
  // Batch 3: 16:00 - 17:30 (e.g. test at 16:45)
  const timePresets = [
    { label: "08:45 AM (Physics Live)", time: "08:45" },
    { label: "11:15 AM (Chemistry Live)", time: "11:15" },
    { label: "04:30 PM (Math Live)", time: "16:30" },
    { label: "07:00 PM (After Hours)", time: "19:00" },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Title and Global Mark Holiday Toggle */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Real-Time Class Monitor
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Smart Schedule
            <CalendarClock className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Automated batch status matching current time with start and end windows.
          </p>
        </div>

        {/* Global "Mark Holiday" Toggle (Prompt Requirement) */}
        <div
          id="global-holiday-control"
          className={`flex items-center justify-between sm:justify-end gap-3 p-3 rounded-xl border transition-all ${
            isHoliday
              ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 ring-2 ring-rose-200 dark:ring-rose-950"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isHoliday ? "bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <CalendarOff className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Mark Holiday (Chutti)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {isFullHoliday ? "All batches on Chutti" : isHoliday ? `${holidayBatchIds.length} batches on Chutti` : "Coaching batches active"}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
            <input
              id="mark-holiday-toggle"
              type="checkbox"
              checked={isHoliday}
              onChange={handleToggleHoliday}
              className="sr-only peer"
              aria-label="Toggle Holiday Chutti Mode"
            />
            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>
      </header>

      {/* Holiday Announcement Banner if active */}
      {isHoliday && (
        <div
          id="holiday-active-banner"
          className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-4 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-rose-950 dark:text-rose-100">
              {isFullHoliday ? "Center Closed for Holiday (Chutti Active)" : "Partial Holiday (Chutti) Active"}
            </h2>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              {isFullHoliday ? "All batch schedules are currently paused." : `${holidayBatchIds.length} batch schedules are currently paused.`} WhatsApp parent notifications and absentee logs will reflect the holiday. You can toggle off Holiday above whenever classes resume.
            </p>
          </div>
        </div>
      )}

      {/* Clock and Time Simulator Section (allows testing Ongoing status anytime) */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current Reference Time
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                <span>
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} • {currentTimeStr}
                </span>
                {isSimulatedTime ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    Simulated Time Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    Live System Clock
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSimulatedTime && (
              <button
                id="reset-live-time-btn"
                onClick={() => onSetSimulatedTime(null)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Live Clock</span>
              </button>
            )}

            <button
              onClick={() => setShowTimeControls(!showTimeControls)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>{showTimeControls ? "Hide Time Tester" : "Test Times (Demo)"}</span>
            </button>
          </div>
        </div>

        {/* Time Simulator Presets */}
        {showTimeControls && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Quickly test the automated <strong>Ongoing</strong>, <strong>Upcoming</strong>, and <strong>Completed</strong> batch badges by jumping time:
            </p>
            <div className="flex flex-wrap gap-2">
              {timePresets.map((preset) => (
                <button
                  key={preset.time}
                  onClick={() => onSetSimulatedTime(preset.time)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentTimeStr === preset.time
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Batches List (Core Requirement) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Batches for Today ({batches.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isFullHoliday
              ? "All batches marked Chutti"
              : isHoliday
              ? `${holidayBatchIds.length} batches marked Chutti`
              : "Automated status by start & end time"}
          </span>
        </div>

        <div className="space-y-3">
          {batches.map((batch, index) => {
            const classObj = classes.find((c) => c.id === batch.classId);
            const startMin = toMinutes(batch.startTime);
            const endMin = toMinutes(batch.endTime);
            const isBatchHoliday = holidayBatchIds.includes(batch.id);
            const isOngoing =
              !isBatchHoliday && currentMinutes >= startMin && currentMinutes <= endMin;
            const isPast = currentMinutes > endMin;
            const isUpcoming = !isBatchHoliday && currentMinutes < startMin;
            const minsUntil = startMin - currentMinutes;

            return (
              <div
                key={batch.id}
                id={`batch-card-${batch.id}`}
                className={`rounded-xl border p-4 md:p-5 transition-all shadow-xs ${
                  isBatchHoliday
                    ? "bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                    : isOngoing
                    ? "bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-200 dark:ring-emerald-900 shadow-sm"
                    : isPast
                    ? "bg-slate-50/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Timings & Class Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        {batch.startTime} - {batch.endTime}
                      </span>

                      {/* Status Badges */}
                      {isBatchHoliday ? (
                        <span
                          id={`batch-status-chutti-${batch.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                          Chutti
                        </span>
                      ) : isOngoing ? (
                        <span
                          id={`batch-status-ongoing-${batch.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs animate-pulse"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                          Ongoing
                        </span>
                      ) : isPast ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
                          Upcoming in {minsUntil > 60 ? `${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m` : `${minsUntil}m`}
                        </span>
                      )}

                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Batch #{index + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {classObj?.name || "Coaching Class"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span>Room: <strong className="text-slate-900 dark:text-slate-100">{classObj?.room || "Room 101"}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-900 dark:text-slate-100">{classObj?.grade || "Senior Batch"}</strong></span>
                      <span>•</span>
                      <span>{classObj?.students.length || 0} Students enrolled</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      id={`open-workspace-btn-${batch.classId}`}
                      onClick={() => onOpenClass(batch.classId)}
                      className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isOngoing && !isBatchHoliday
                          ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isOngoing && !isBatchHoliday ? "Take Live Attendance" : "Open Class"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Additional schedule context */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Days: {batch.days?.join(", ") || "Mon, Wed, Fri"}
                  </span>
                  <span>
                    {isOngoing && !isBatchHoliday
                      ? `${endMin - currentMinutes} minutes remaining in session`
                      : isPast
                      ? "Session concluded"
                      : isBatchHoliday
                      ? "Cancelled today (Chutti)"
                      : `Starts at ${batch.startTime}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selective Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400">
                  <CalendarOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Mark Holiday (Chhutti)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the batches on holiday today and notify them.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Batch selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Batches on Holiday
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 rounded-xl border border-slate-200 dark:border-slate-800 p-2">
                  {batches.map((b) => {
                    const c = classes.find((cls) => cls.id === b.classId);
                    return (
                      <label key={b.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={tempHolidayBatches.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempHolidayBatches((prev) => [...prev, b.id]);
                            } else {
                              setTempHolidayBatches((prev) => prev.filter((id) => id !== b.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-pointer"
                        />
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{c?.name}</div>
                          <div className="text-xs text-slate-500">{b.startTime} - {b.endTime}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  WhatsApp Notification Message
                </label>
                <textarea
                  value={holidayMessage}
                  onChange={(e) => setHolidayMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-500 resize-none min-h-[80px]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button
                onClick={() => {
                  onUpdateHolidayBatches(tempHolidayBatches);
                  setShowHolidayModal(false);
                  
                  // Notify logic via separate tabs
                  tempHolidayBatches.forEach((batchId, index) => {
                    const batch = batches.find((b) => b.id === batchId);
                    if (batch) {
                      const classObj = classes.find((c) => c.id === batch.classId);
                      if (classObj) {
                        const url = `https://wa.me/?text=${encodeURIComponent(holidayMessage + `\n\n- ${classObj.name} Batch`)}`;
                        setTimeout(() => {
                           window.open(url, "_blank", "noopener,noreferrer");
                        }, index * 300);
                      }
                    }
                  });
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notify & Save Holiday</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
