import { ClassItem, Student, Batch, AttendanceAnalyticsDay } from "./types";

export const initialStudents: Student[] = [
  {
    id: "s1",
    name: "Aarav Sharma",
    phone: "919876543210",
    parentPhone: "919876543210",
    avatarColor: "bg-blue-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-11", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-12", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-13", status: "absent", className: "Class 12 Physics" },
      { date: "2026-09-14", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-15", status: "present", className: "Class 12 Physics" },
    ],
  },
  {
    id: "s2",
    name: "Priya Patel",
    phone: "919823456781",
    parentPhone: "919823456781",
    avatarColor: "bg-emerald-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-11", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-12", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-13", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-14", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-15", status: "present", className: "Class 12 Physics" },
    ],
  },
  {
    id: "s3",
    name: "Rohan Verma",
    phone: "919934567892",
    parentPhone: "919934567892",
    avatarColor: "bg-amber-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-11", status: "absent", className: "Class 12 Physics" },
      { date: "2026-09-12", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-13", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-14", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-15", status: "present", className: "Class 12 Physics" },
    ],
  },
  {
    id: "s4",
    name: "Sneha Mukherjee",
    phone: "919745678903",
    parentPhone: "919745678903",
    avatarColor: "bg-purple-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-11", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-12", status: "absent", className: "Class 12 Physics" },
      { date: "2026-09-13", status: "absent", className: "Class 12 Physics" },
      { date: "2026-09-14", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-15", status: "present", className: "Class 12 Physics" },
    ],
  },
  {
    id: "s5",
    name: "Kabir Singh",
    phone: "919656789014",
    parentPhone: "919656789014",
    avatarColor: "bg-rose-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-11", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-12", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-13", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-14", status: "present", className: "Class 12 Physics" },
      { date: "2026-09-15", status: "present", className: "Class 12 Physics" },
    ],
  },
  {
    id: "s6",
    name: "Ananya Iyer",
    phone: "919567890125",
    parentPhone: "919567890125",
    avatarColor: "bg-indigo-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 11 Chemistry" },
      { date: "2026-09-12", status: "present", className: "Class 11 Chemistry" },
      { date: "2026-09-14", status: "present", className: "Class 11 Chemistry" },
    ],
  },
  {
    id: "s7",
    name: "Dev Malhotra",
    phone: "919478901236",
    parentPhone: "919478901236",
    avatarColor: "bg-teal-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 11 Chemistry" },
      { date: "2026-09-12", status: "absent", className: "Class 11 Chemistry" },
      { date: "2026-09-14", status: "present", className: "Class 11 Chemistry" },
    ],
  },
  {
    id: "s8",
    name: "Ishita Gupta",
    phone: "919389012347",
    parentPhone: "919389012347",
    avatarColor: "bg-cyan-500",
    attendanceRecord: [
      { date: "2026-09-10", status: "present", className: "Class 11 Chemistry" },
      { date: "2026-09-12", status: "present", className: "Class 11 Chemistry" },
      { date: "2026-09-14", status: "present", className: "Class 11 Chemistry" },
    ],
  },
  {
    id: "s9",
    name: "Arjun Reddy",
    phone: "919290123458",
    parentPhone: "919290123458",
    avatarColor: "bg-orange-500",
    attendanceRecord: [
      { date: "2026-09-11", status: "present", className: "Class 10 Mathematics" },
      { date: "2026-09-13", status: "present", className: "Class 10 Mathematics" },
      { date: "2026-09-15", status: "present", className: "Class 10 Mathematics" },
    ],
  },
  {
    id: "s10",
    name: "Meera Nair",
    phone: "919101234569",
    parentPhone: "919101234569",
    avatarColor: "bg-pink-500",
    attendanceRecord: [
      { date: "2026-09-11", status: "present", className: "Class 10 Mathematics" },
      { date: "2026-09-13", status: "absent", className: "Class 10 Mathematics" },
      { date: "2026-09-15", status: "present", className: "Class 10 Mathematics" },
    ],
  },
];

export const initialClasses: ClassItem[] = [
  {
    id: "c1",
    name: "Class 12 Physics",
    subject: "Physics",
    grade: "Grade 12 (JEE/CBSE)",
    room: "Room 101 - Newton Hall",
    students: ["s1", "s2", "s3", "s4", "s5"],
  },
  {
    id: "c2",
    name: "Class 11 Chemistry",
    subject: "Chemistry",
    grade: "Grade 11 (NEET/CBSE)",
    room: "Room 103 - Curie Lab",
    students: ["s6", "s7", "s8", "s1"],
  },
  {
    id: "c3",
    name: "Class 10 Mathematics",
    subject: "Mathematics",
    grade: "Grade 10 Foundation",
    room: "Room 102 - Ramanujan Room",
    students: ["s9", "s10", "s3", "s5"],
  },
];

export const initialBatches: Batch[] = [
  {
    id: "b1",
    classId: "c1", // Class 12 Physics
    startTime: "08:30",
    endTime: "10:00",
    days: ["Mon", "Wed", "Fri", "Sat"],
  },
  {
    id: "b2",
    classId: "c2", // Class 11 Chemistry
    startTime: "10:30",
    endTime: "12:00",
    days: ["Mon", "Tue", "Thu", "Sat"],
  },
  {
    id: "b3",
    classId: "c3", // Class 10 Mathematics
    startTime: "16:00",
    endTime: "17:30",
    days: ["Mon", "Wed", "Fri"],
  },
];

export const initialWeeklyAttendance: AttendanceAnalyticsDay[] = [
  { day: "Mon", attendanceRate: 92, presentCount: 23, totalStudents: 25 },
  { day: "Tue", attendanceRate: 88, presentCount: 22, totalStudents: 25 },
  { day: "Wed", attendanceRate: 96, presentCount: 24, totalStudents: 25 },
  { day: "Thu", attendanceRate: 84, presentCount: 21, totalStudents: 25 },
  { day: "Fri", attendanceRate: 90, presentCount: 22, totalStudents: 25 },
  { day: "Sat", attendanceRate: 94, presentCount: 23, totalStudents: 25 },
  { day: "Sun", attendanceRate: 78, presentCount: 19, totalStudents: 25 },
];
