import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App safely without re-initializing
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Contacts read scope
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might have expired or refreshed; keep auth state
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Could not retrieve Google Contacts access token");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Contacts Sign-in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GoogleContact {
  resourceName: string;
  name: string;
  phoneNumber: string;
  email?: string;
}

export const fetchGoogleContacts = async (
  token: string
): Promise<GoogleContact[]> => {
  const url =
    "https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses&pageSize=100";
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch contacts (${res.status})`
    );
  }

  const data = await res.json();
  const connections = data.connections || [];

  return connections
    .map((person: any) => {
      const name = person.names?.[0]?.displayName || "Unknown Contact";
      const rawPhone = person.phoneNumbers?.[0]?.value || "";
      // Clean phone number (strip spaces, dashes, parentheses)
      const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
      const email = person.emailAddresses?.[0]?.value;

      return {
        resourceName: person.resourceName,
        name,
        phoneNumber: cleanPhone,
        email,
      };
    })
    .filter((c: GoogleContact) => c.name && c.phoneNumber);
};
