import React, { useState } from "react";
import {
  googleSignIn,
  fetchGoogleContacts,
  GoogleContact,
  logoutGoogle,
} from "../lib/googleAuth";
import { ClassItem } from "../types";
import {
  Users,
  Search,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

interface GoogleContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (
    contacts: Array<{ name: string; phone: string; parentPhone: string }>,
    targetClassId?: string
  ) => void;
  existingStudentPhones: string[];
  classes?: ClassItem[];
  defaultClassId?: string;
}

export const GoogleContactsModal: React.FC<GoogleContactsModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  existingStudentPhones,
  classes,
  defaultClassId,
}) => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string>(
    defaultClassId || (classes && classes.length > 0 ? classes[0].id : "")
  );

  if (!isOpen) return null;

  const handleSignInAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const authResult = await googleSignIn();
      if (!authResult) {
        throw new Error("Google authentication was not completed.");
      }

      setIsAuthenticated(true);
      const fetched = await fetchGoogleContacts(authResult.accessToken);
      setContacts(fetched);

      // Pre-select contacts that aren't already enrolled
      const newIds = new Set<string>();
      fetched.forEach((c) => {
        if (!existingStudentPhones.includes(c.phoneNumber)) {
          newIds.add(c.resourceName);
        }
      });
      setSelectedContacts(newIds);
    } catch (err: any) {
      console.error("Contacts import error:", err);
      setError(
        err?.message ||
          "Could not fetch Google Contacts. Please ensure popup is permitted and permissions were accepted."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (resourceName: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(resourceName)) {
        next.delete(resourceName);
      } else {
        next.add(resourceName);
      }
      return next;
    });
  };

  const handleConfirmImport = () => {
    const toImport = contacts
      .filter((c) => selectedContacts.has(c.resourceName))
      .map((c) => ({
        name: c.name,
        phone: c.phoneNumber,
        parentPhone: c.phoneNumber,
      }));

    if (toImport.length > 0) {
      onImportStudents(toImport, selectedTargetClassId);
    }
    onClose();
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-contacts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 id="google-contacts-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sync with Google Contacts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your account to import student/parent numbers directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authorization Error</p>
                <p className="mt-0.5 text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          )}

          {!isAuthenticated ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div className="max-w-xs mx-auto space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Connect Google Contacts
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign in with Google to view and sync your saved student and parent contacts directly into your class roster.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                {/* Standard Official GSI Material Style Button */}
                <button
                  id="google-signin-contacts-btn"
                  onClick={handleSignInAndFetch}
                  disabled={loading}
                  className="min-h-[44px] inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-400" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
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
                  )}
                  <span>
                    {loading ? "Connecting to Google..." : "Sign in with Google"}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Read-only access with permission from your account</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Target Class Selector if classes provided */}
              {classes && classes.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Assign Selected Students to Class / Batch:</span>
                  </label>
                  <select
                    value={selectedTargetClassId}
                    onChange={(e) => setSelectedTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.subject || "General"} - {cls.room || "Room 101"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search contacts by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                <span>
                  Found {contacts.length} contacts ({selectedContacts.size} selected)
                </span>
                <button
                  onClick={() => {
                    if (selectedContacts.size === contacts.length) {
                      setSelectedContacts(new Set());
                    } else {
                      setSelectedContacts(
                        new Set(contacts.map((c) => c.resourceName))
                      );
                    }
                  }}
                  className="text-slate-900 dark:text-slate-200 font-semibold hover:underline cursor-pointer"
                >
                  {selectedContacts.size === contacts.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              {/* Contacts List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    No contacts found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const isSelected = selectedContacts.has(contact.resourceName);
                    const isAlreadyEnrolled = existingStudentPhones.includes(
                      contact.phoneNumber
                    );

                    return (
                      <div
                        key={contact.resourceName}
                        onClick={() => toggleSelect(contact.resourceName)}
                        className={`p-3 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/40"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950"
                                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{contact.name}</span>
                              {isAlreadyEnrolled && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded-sm font-normal">
                                  Already enrolled
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {contact.phoneNumber}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          +{contact.phoneNumber}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {isAuthenticated && (
            <button
              id="confirm-import-contacts-btn"
              onClick={handleConfirmImport}
              disabled={selectedContacts.size === 0}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              Import {selectedContacts.size} Students
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
