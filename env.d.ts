// env.d.ts
namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_SUPABASE_URL: string;
        SUPABASE_SERVICE_KEY: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    }
}