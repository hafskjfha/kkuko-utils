"use client";

import { supabase } from "../lib/supabaseClient";

export const fetcher = async () => {
    const { data, error } = await supabase.from("themes").select("*");
    if (error) throw error;
    return data;
}
