// Mock auth for development without Firebase
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

const MOCK_MODE = !import.meta.env.VITE_FIREBASE_API_KEY;

let currentUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

function notifyListeners() {
  listeners.forEach(callback => callback(currentUser));
}

export async function signInWithGoogle(): Promise<User> {
  if (MOCK_MODE) {
    // Mock user for development
    currentUser = {
      uid: 'mock-user-123',
      email: 'demo@mobilecoder.com',
      displayName: 'Demo User',
      photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0ea5e9&color=fff'
    };
    notifyListeners();
    return currentUser;
  }

  // Real Firebase implementation
  const { initializeApp } = await import('firebase/app');
  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || undefined,
    };
    notifyListeners();
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

export async function signInWithGithub(): Promise<User> {
  if (MOCK_MODE) {
    currentUser = {
      uid: 'mock-user-github',
      email: 'github@mobilecoder.com',
      displayName: 'GitHub User',
      photoURL: 'https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff'
    };
    notifyListeners();
    return currentUser;
  }

  const { initializeApp } = await import('firebase/app');
  const { getAuth, GithubAuthProvider, signInWithPopup } = await import('firebase/auth');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GithubAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || undefined,
    };
    notifyListeners();
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with GitHub');
  }
}

export async function signInWithApple(): Promise<User> {
  if (MOCK_MODE) {
    currentUser = {
      uid: 'mock-user-apple',
      email: 'apple@mobilecoder.com',
      displayName: 'Apple User',
      photoURL: 'https://ui-avatars.com/api/?name=Apple+User&background=000000&color=fff'
    };
    notifyListeners();
    return currentUser;
  }

  const { initializeApp } = await import('firebase/app');
  const { getAuth, OAuthProvider, signInWithPopup } = await import('firebase/auth');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new OAuthProvider('apple.com');

  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || undefined,
    };
    notifyListeners();
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Apple');
  }
}

export async function signOut(): Promise<void> {
  if (MOCK_MODE) {
    currentUser = null;
    notifyListeners();
    return;
  }

  const firebase = await import('firebase/app');
  const firebaseAuth = await import('firebase/auth');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebaseAuth.getAuth(app);

  try {
    await firebaseAuth.signOut(auth);
    currentUser = null;
    notifyListeners();
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  listeners.push(callback);
  callback(currentUser);

  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}
