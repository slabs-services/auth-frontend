import { useEffect, useState } from "react";
import { GetMYAccountClient, updateAlert, updateValidation } from "../Utils";
import AlertBox from "../Components/Alert";
import { Link } from "react-router-dom";

export default function LostMFA(){
    const [name, setName] = useState("");
    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getLostMFASettings(){
            try {
                const lostMFASettings = new URL(
                    "/lostMFASettings",
                    import.meta.env.VITE_AUTH_API_URL
                );

                const response = await fetch(lostMFASettings, {
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

                setName(data.name);
                updateAlert(setAlert, "hideContent", false);
                setIsLoading(false);
            } catch (e) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }
        
        getLostMFASettings();
    }, []);

    async function sendMFARecover(e){
        setIsLoading(true);

        const lostMFA = new URL(
            "/lostMFA",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const response = await fetch(lostMFA, {
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            try {
                const data = await response.json();

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
                updateAlert(setAlert, "hideContent", true);
                setIsLoading(false);
            }catch(e){
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-8 flex flex-col items-center w-116">
                <h1 className="text-slate-900 text-3xl font-bold">Lost MFA</h1>
                <AlertBox alert={alert} />
                { !alert.hideContent ? 
                <div className="flex flex-col mt-6 w-full gap-y-4">
                    <div className="flex justify-center">
                        <img src="/email.svg" title="MFA Recover" alt="MFA Recover" className="w-46" />
                    </div>
                    <p>Hi, <strong>{name.split(" ")[0]}</strong>. To start the reset of MFA associated with your account. If you’ve lost access to your MFA, click the button below to receive a secure recovery email and follow the steps to reset it.</p>
                    <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" onClick={() => { sendMFARecover(); }}>Send MFA Recovery Email</button>
                </div> : null }
                <p className="mt-4 text-sm">Have an account? <Link to={"/oauth?" + GetMYAccountClient()} className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
            </div>
        </div>









    );
}