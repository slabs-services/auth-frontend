import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import AlertBox from "../Components/Alert";

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
                    updateAlert("severity", data.severity);
                    updateAlert("showAlert", true);
                    updateAlert("message", data.message);
                    updateAlert("hideContent", data.hideContent);
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
                <AlertBox alert={alert} />
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