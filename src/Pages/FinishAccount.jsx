import { useEffect, useState } from "react";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { Link } from "react-router-dom";

export default function FinishAccount(){
    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');

    const updateAlert = (key, value) => {
        setAlert(prev => ({
            ...prev,
            [key]: value
        }));
    };

    useEffect(() => {
        async function finishActivation() {
            try {
                const verifyMFA = new URL(
                    "/finishAccount",
                    import.meta.env.VITE_AUTH_API_URL
                );

                const response = await fetch(verifyMFA, {
                    credentials: "include"
                });

                if (response.status === 502) {
                    updateAlert("severity", 3);
                    updateAlert("showAlert", true);
                    updateAlert("message", "Authentication service is temporarily unavailable.");
                    setIsLoading(false);
                    return;
                }

                let data = null;

                try {
                    data = await response.json();
                } catch (e) {
                    updateAlert("severity", 3);
                    updateAlert("showAlert", true);
                    updateAlert("message", "Unknown Error");
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    updateAlert("severity", 3);
                    updateAlert("showAlert", true);
                    updateAlert("message", data.message);
                    setIsLoading(false);
                    return;
                }

                updateAlert("hideContent", false);
                setName(data.name);
                setIsLoading(false);
            } catch (e) {
                updateAlert("severity", 3);
                updateAlert("showAlert", true);
                updateAlert("message", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }

        finishActivation();
    }, []);

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="w-116 mt-8">
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
                <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-4 flex flex-col items-center">
                    <h1 className="text-slate-900 text-3xl font-bold">Activation</h1>
                    { !alert.hideContent ? <>
                        <img src="/success.svg" title="Success" alt="Success" className="w-46 mt-6" />
                        <p className="mt-6">Congratulations, <strong>{name}</strong>! 🎉 Your account has been successfully activated, and multi-factor authentication (MFA) is now enabled. Your SpaceLabs Cloud account is fully set up and ready to use. Thank you for choosing SpaceLabs — welcome aboard!</p>
                        <Link to="/" className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer w-full mt-4 text-center">Go to my account</Link>
                    </> : <p className="mt-4 text-sm">Have an account? <Link to="/oauth" className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p> }
                </div>
            </div>
        </div>
    );
}