declare global{
    type ErrorMessage = {
        ErrName:string | null;
        ErrMessage: string | null;
        ErrStackRace:string | undefined | null;
        HTTPStatus? : string | number | null;
        HTTPData?: string | null;
        inputValue: string | null;
    }
}

export {};