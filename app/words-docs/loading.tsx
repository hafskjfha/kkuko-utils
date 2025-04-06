import Spinner from "../components/Spinner";

export default function LoadingPage(){
    return(
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            <Spinner />
        </div>
    )
}