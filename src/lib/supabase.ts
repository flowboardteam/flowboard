import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

export const isMissingTableError = (error: any) => {
    if (!error) return false;

    const message = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return error.code === "42P01" || /could not find the table|does not exist|relation .* does not exist/i.test(message);
};