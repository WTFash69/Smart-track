export interface AttendanceEntry {
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
  batchId?: string;
  className?: string;
  notifiedParent?: boolean;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  attendanceRecord: AttendanceEntry[];
  avatarColor?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  subject?: string;
  grade?: string;
  room?: string;
  students: string[]; // student ids
}

export interface Batch {
  id: string;
  classId: string;
  startTime: string; // "HH:MM" in 24hr format, e.g. "08:00"
  endTime: string;   // "HH:MM" in 24hr format, e.g. "09:30"
  days?: string[];   // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
}

export type ViewTab = "dashboard" | "schedule" | "workspace" | "assistant" | "admin";

export interface AttendanceAnalyticsDay {
  day: string;
  attendanceRate: number; // percentage, e.g. 92
  presentCount: number;
  totalStudents: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "assistant";
  content: string;
  timestamp: string;
}
