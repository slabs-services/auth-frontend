import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AlertBox from "../Components/Alert";
import { GetMYAccountClient, updateAlert } from "../Utils";

export default function VerifyEmail(){
    const location = useLocation();
    
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    useEffect(() => {
        async function validateEmail() {
            const searchParams = new URLSearchParams(location.search);

            if(!searchParams.has("activationKey")){
                setIsLoading(false);
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Missing Activation Key");
                return;
            }
        
            try {
                const verifyEmail = new URL(
                    "/verifyEmail",
                    import.meta.env.VITE_AUTH_API_URL
                );

                verifyEmail.searchParams.append('activationKey', searchParams.get("activationKey"));

                const response = await fetch(verifyEmail, {
                    credentials: "include"
                });

                if (response.status === 502) {
                    updateAlert(setAlert, "severity", 3);
                    updateAlert(setAlert, "showAlert", true);
                    updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
                    setIsLoading(false);
                    return;
                }

                let data = null;

                try {
                    data = await response.json();
                } catch (e) {
                    updateAlert(setAlert, "severity", 3);
                    updateAlert(setAlert, "showAlert", true);
                    updateAlert(setAlert, "message", "Unknown Error");
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    updateAlert(setAlert, "severity", data.severity);
                    updateAlert(setAlert, "showAlert", true);
                    updateAlert(setAlert, "message", data.message);
                    updateAlert(setAlert, "hideContent", data.hideContent);
                    setIsLoading(false);
                    return;
                }

                updateAlert(setAlert, "severity", 1);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", data.message);
                updateAlert(setAlert, "hideContent", false);
                setName(data.name);
                setIsLoading(false);
            } catch (e) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }

        validateEmail();
    }, [location.search]);

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="w-116 mt-8">
                <AlertBox alert={alert} />
                <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-4 flex flex-col items-center">
                    <h1 className="text-slate-900 text-3xl font-bold">Email Verification</h1>
                    { !alert.hideContent ? <>
                        <p className="mt-6 text-sm">Hi <strong>{name}</strong>, your SpaceLabs account is almost ready. Complete your MFA setup to finish activating your account.</p>
                        <Link to="/add-mfa" className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer mt-6 w-full text-center">Create MFA</Link>
                    </> : null }
                    <p className="mt-4 text-sm">Have an account? <Link to={"/oauth?" + GetMYAccountClient()} className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}