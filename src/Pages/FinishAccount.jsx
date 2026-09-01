import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertBox from "../Components/Alert";
import { GetMYAccountClient, updateAlert } from "../Utils";
import { useUtilsContext } from "../Contexts/UtilsContext";

export default function FinishAccount(){
    const navigate = useNavigate();
    const { isLoading, setIsLoading, alert, setAlert } = useUtilsContext();
    const [name, setName] = useState('');

    useEffect(() => {
        async function finishActivation() {
            updateAlert(setAlert, "hideContent", true);
            updateAlert(setAlert, "showAlert", false);
            setIsLoading(true);
        
            try {
                const finishAccount = new URL(
                    "/finishAccount",
                    import.meta.env.VITE_AUTH_API_URL
                );

                const response = await fetch(finishAccount, {
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

        finishActivation();
    }, []);

    async function convertSession(){
        setIsLoading(true);

        const convertSessionRequest = new URL(
            "/convertSession",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const response = await fetch(convertSessionRequest, {
                credentials: 'include'
            });

            if (response.status === 502) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                const data = await response.json();
                updateAlert(setAlert, "severity", data.severity);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", data.message);
                updateAlert(setAlert, "hideContent", data.hideContent);
                setIsLoading(false);
            }else{
                navigate(`/oauth?${GetMYAccountClient()}`);
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
            <div className="w-116 mt-8">
                <AlertBox alert={alert} />
                <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-4 flex flex-col items-center">
                    <h1 className="text-slate-900 text-3xl font-bold">Activation</h1>
                    { !alert.hideContent ? <>
                        <img src="/success.svg" title="Success" alt="Success" className="w-46 mt-6" />
                        <p className="mt-6">Congratulations, <strong>{name}</strong>! 🎉 Your account has been successfully activated, and multi-factor authentication (MFA) is now enabled. Your SpaceLabs Cloud account is fully set up and ready to use. Thank you for choosing SpaceLabs — welcome aboard!</p>
                        <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer w-full mt-4 text-center" onClick={() => { convertSession(); }}>Go to my account</button>
                    </> : <p className="mt-4 text-sm">Have an account? <Link to={"/oauth?" + GetMYAccountClient()} className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p> }
                </div>
            </div>
        </div>
    );
}