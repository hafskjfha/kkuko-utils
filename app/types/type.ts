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