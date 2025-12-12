import { validateInput, generateSecureToken, sessionManager, authRateLimiter } from './security';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
  lastLogin?: number;
}

// Security: Disable mock mode in production
const MOCK_MODE = !import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.DEV;

let currentUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

function notifyListeners() {
  listeners.forEach(callback => callback(currentUser));
}

// Validate user data
function validateUserData(user: any): User | null {
  if (!user || typeof user !== 'object') {
    return null;
  }
  
  // Validate required fields
  if (!user.uid || !user.email || !user.displayName) {
    return null;
  }
  
  // Validate email format
  if (!validateInput('email', user.email)) {
    return null;
  }
  
  // Sanitize display name
  const sanitizedDisplayName = user.displayName
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 50); // Limit length
  
  return {
    uid: user.uid,
    email: user.email.toLowerCase(),
    displayName: sanitizedDisplayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified || false,
    lastLogin: Date.now()
  };
}

export async function signInWithGoogle(): Promise<User> {
  // Rate limiting
  if (!authRateLimiter.isAllowed('google_signin')) {
    throw new Error('Too many sign in attempts. Please try again later.');
  }

  if (MOCK_MODE) {
    // Mock user for development only
    const mockUser = {
      uid: 'mock-user-123',
      email: 'demo@mobilecoder.com',
      displayName: 'Demo User',
      photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0ea5e9&color=fff',
      emailVerified: true
    };
    
    const validatedUser = validateUserData(mockUser);
    if (!validatedUser) {
      throw new Error('Invalid user data');
    }
    
    currentUser = validatedUser;
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
    
    // Verify email is verified
    if (!result.user.emailVerified) {
      throw new Error('Please verify your email address before signing in.');
    }
    
    const userData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified
    };
    
    const validatedUser = validateUserData(userData);
    if (!validatedUser) {
      throw new Error('Invalid user data received');
    }
    
    currentUser = validatedUser;
    notifyListeners();
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    // Don't expose detailed error messages to user
    throw new Error('Authentication failed. Please try again.');
  }
}

export async function signInWithGithub(): Promise<User> {
  // Rate limiting
  if (!authRateLimiter.isAllowed('github_signin')) {
    throw new Error('Too many sign in attempts. Please try again later.');
  }

  if (MOCK_MODE) {
    const mockUser = {
      uid: 'mock-user-github',
      email: 'github@mobilecoder.com',
      displayName: 'GitHub User',
      photoURL: 'https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff',
      emailVerified: true
    };
    
    const validatedUser = validateUserData(mockUser);
    if (!validatedUser) {
      throw new Error('Invalid user data');
    }
    
    currentUser = validatedUser;
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
    
    if (!result.user.emailVerified) {
      throw new Error('Please verify your email address before signing in.');
    }
    
    const userData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified
    };
    
    const validatedUser = validateUserData(userData);
    if (!validatedUser) {
      throw new Error('Invalid user data received');
    }
    
    currentUser = validatedUser;
    notifyListeners();
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error('Authentication failed. Please try again.');
  }
}

export async function signInWithApple(): Promise<User> {
  // Rate limiting
  if (!authRateLimiter.isAllowed('apple_signin')) {
    throw new Error('Too many sign in attempts. Please try again later.');
  }

  if (MOCK_MODE) {
    const mockUser = {
      uid: 'mock-user-apple',
      email: 'apple@mobilecoder.com',
      displayName: 'Apple User',
      photoURL: 'https://ui-avatars.com/api/?name=Apple+User&background=000000&color=fff',
      emailVerified: true
    };
    
    const validatedUser = validateUserData(mockUser);
    if (!validatedUser) {
      throw new Error('Invalid user data');
    }
    
    currentUser = validatedUser;
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
    
    if (!result.user.emailVerified) {
      throw new Error('Please verify your email address before signing in.');
    }
    
    const userData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified
    };
    
    const validatedUser = validateUserData(userData);
    if (!validatedUser) {
      throw new Error('Invalid user data received');
    }
    
    currentUser = validatedUser;
    notifyListeners();
    return currentUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error('Authentication failed. Please try again.');
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
    throw new Error('Failed to sign out');
  }
}

// Session management
export function getCurrentSession(): User | null {
  return currentUser;
}

export function isEmailVerified(): boolean {
  return currentUser?.emailVerified || false;
}

export function refreshSession(): Promise<void> {
  // TODO: Implement token refresh logic
  return Promise.resolve();
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
