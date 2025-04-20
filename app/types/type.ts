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
    status: "ok" | "add" | "delete" | "eadd" | "edelete",
    maker?: string | undefined
}