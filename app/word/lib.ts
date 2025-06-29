"use client";

import { SCM } from "../lib/supabaseClient";

export const fetcher = async () => {
    const { data, error } = await SCM.get().allTheme();
    if (error) throw error;
    return data;
}
