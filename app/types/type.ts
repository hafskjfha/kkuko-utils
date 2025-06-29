export type SixCharString = `${string}${string}${string}${string}${string}${string}`;
export type FiveCharString = `${string}${string}${string}${string}${string}`;
export type ErrorMessage = {
    ErrName:string | null;
    ErrMessage: string | null;
    ErrStackRace:string | undefined | null;
    HTTPStatus? : string | number | null;
    HTTPData?: string | null;
    inputValue: string | null;
}

export type UserInfo = {
    nickname: string,
    role: "r1" | "r2" | "r3" | "r4" | "admin",
    id: string,
    contribution: number
}

export type WordData = {
    word: string,
    status: "ok" | "add" | "delete",
    maker?: string | undefined | null
}
export interface LoadingState {
    isLoading: boolean;
    progress: number;
    currentTask: string;
}

export interface DocsLogData {
    readonly word: string;
    readonly docs_id: number;
    readonly add_by: string | null;
    readonly type: "add" | "delete";
}

export interface WordLogData {
    readonly word: string;
    readonly make_by: string | null;
    readonly processed_by: string | null;
    readonly r_type: "add" | "delete";
    readonly state: "approved" | "rejected";
}

export type addWordQueryType = {
    word: string;
    noin_canuse: boolean;
    added_by: string | null;
}

export type addWordThemeQueryType = {
    word_id: number;
    theme_id: number;
}