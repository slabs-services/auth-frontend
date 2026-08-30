import { MdError, MdWarning } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function AlertBox({ alert }){
    return (
        <>
            { alert.showAlert ?
            <>
                { alert.severity === 1 ?
                    <div className="bg-green-50 border border-green-100 rounded p-4 shadow-xs flex flex-col items-center mt-6 w-full">
                        <FaCheckCircle className="w-8 h-8 text-green-900" />
                        <p className="text-green-900 mt-4">{alert.message}</p>
                    </div> : alert.severity === 2 ?
                    <div className="bg-yellow-50 border border-yellow-900 rounded p-4 shadow-xs flex items-center flex-col mt-6 w-full">
                        <MdWarning className="w-8 h-8 text-yellow-900" />
                        <p className="text-yellow-900 mt-4">{alert.message}</p>
                    </div>
                    :
                    <div className="bg-red-50 border border-red-900 rounded p-4 shadow-xs flex items-center flex-col mt-6 w-full">
                        <MdError className="w-8 h-8 text-red-900" />
                        <p className="text-red-900 mt-4">{alert.message}</p>
                    </div>
                }
            </> : null }
        </>
    );
}