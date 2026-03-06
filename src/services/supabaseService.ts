import { createClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssnqbbpbxtvowjrexfcj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbnFiYnBieHR2b3dqcmV4ZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDExODYsImV4cCI6MjA3ODc3NzE4Nn0.gPGa41FTLiLcuNXjsb2NHSoJtU5mlS1RP5l7UyCb5h8';

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'user_data_backups';

// --- Auth Functions ---

export const signUp = (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
};

export const signIn = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = () => {
    return supabase.auth.signOut();
};

export const getSession = async (): Promise<{ session: Session | null }> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return { session: null };
    }
    return { session: data.session };
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
    return subscription;
};

// --- Data Functions ---

/**
 * Gets the current authenticated user.
 */
const getUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Sanitizes an object by removing circular references.
 */
const sanitizeData = (data: unknown) => {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(data, (_key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    }));
};

/**
 * Backs up the user's data to Supabase.
 * It uses 'upsert' to create a new record if one doesn't exist for the user,
 * or update it if it does.
 * @param data - The JSON object of the user's application data.
 */
export const backupData = async (user: User, data: Record<string, unknown>) => {
  if (!user) return { error: { message: "User not authenticated" } };

  try {
    const sanitizedData = sanitizeData(data);
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({ user_id: user.id, data: sanitizedData, last_updated: new Date().toISOString() }, { onConflict: 'user_id' });

    return { error };
  } catch (err) {
    console.error("Failed to sanitize or backup data:", err);
    return { error: { message: "Failed to backup data due to serialization error" } };
  }
};

/**
 * Restores the user's data from Supabase.
 */
export const restoreData = async (user: User) => {
  if (!user) return { data: null, error: { message: "User not authenticated" } };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('data')
    .eq('user_id', user.id)
    .single();

  return { data: data?.data, error };
};

/**
 * Retrieves the timestamp of the last successful backup.
 */
export const getLastSyncTime = async (): Promise<string | null> => {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('last_updated')
        .eq('user_id', user.id)
        .single();
    
    if (error || !data) {
        console.error('Error fetching last sync time:', error);
        return null;
    }

    return data.last_updated;
};