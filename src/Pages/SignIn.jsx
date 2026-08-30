import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { ConfirmModal } from "../Modals/Confirm";
import LoginUser from "../Components/Login/Login";
import MFAUser from "../Components/Login/MFA";
import ExistingSession from "../Components/Login/ExistingSession";
import AlertBox from "../Components/Alert";

export default function Auth(){
    const location = useLocation();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [loginStep, setLoginStep] = useState(1);
    const [modal, setModal] = useState(null);

    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    const updateAlert = (key, value) => {
        setAlert(prev => ({
            ...prev,
            [key]: value
        }));
    };

    useEffect(() => {
        async function validateOAuth() {
            const searchParams = new URLSearchParams(location.search);
            const hasInvalidParams = !searchParams.has("client_id") || !searchParams.has("scope") || !searchParams.has("redirect_uri");

            if(hasInvalidParams){
                setIsLoading(false);
                updateAlert("severity", 3);
                updateAlert("showAlert", true);
                updateAlert("message", "Missing OAuth Parameters");
                return;
            }
        
            try {
                const redirectURI = new URL(searchParams.get("redirect_uri"));
                try {
                    const oauthCheck = new URL(
                        "/oauth",
                        import.meta.env.VITE_AUTH_API_URL
                    );

                    oauthCheck.searchParams.append('client_id', searchParams.get("client_id"));
                    oauthCheck.searchParams.append('scope', searchParams.get("scope"));
                    oauthCheck.searchParams.append('redirect_uri', searchParams.get("redirect_uri"));

                    const response = await fetch(oauthCheck);

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
                        updateAlert("message", "Unknown Error.");
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

                    await GetLoginStep();
                } catch (e) {
                    updateAlert("severity", 3);
                    updateAlert("showAlert", true);
                    updateAlert("message", "Unable to connect to the authentication service.");
                    setIsLoading(false);
                }
            }catch(e){
                updateAlert("severity", 3);
                updateAlert("showAlert", true);
                updateAlert("message", "Invalid OAuth Client");
                setIsLoading(false);
            }
        }

        async function GetLoginStep() {
            try {
                const loginStep = new URL(
                    "/loginStep",
                    import.meta.env.VITE_AUTH_API_URL
                );

                const response = await fetch(loginStep, {
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
                    updateAlert("message", "Unknown Error.");
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

                if(data.authStep === "valid-session"){
                    updateAlert("hideContent", false);
                    setLoginStep(3);
                    setName(data.name);
                    setIsLoading(false);
                }else if(data.authStep === "mfa-step"){
                    updateAlert("hideContent", false);
                    setLoginStep(2);
                    setIsLoading(false);
                }else if(data.authStep === "not-authenticated"){
                    updateAlert("hideContent", false);
                    setIsLoading(false);
                }
            } catch (e) {
                updateAlert("severity", 3);
                updateAlert("showAlert", true);
                updateAlert("message", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }

        validateOAuth();
    }, []);

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            { modal ?
            <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <div className="shadow bg-white rounded overflow-hidden">
                    { modal }
                </div>
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-8 flex flex-col items-center w-116">
                <h1 className="text-slate-900 text-3xl font-bold">Sign In</h1>
                <AlertBox alert={alert} />
                { !alert.hideContent ?
                <>
                { loginStep === 1 ?
                    <LoginUser setIsLoading={setIsLoading} setLoginStep={setLoginStep} updateAlert={updateAlert} />
                : loginStep === 2 ?
                    <MFAUser setIsLoading={setIsLoading} updateAlert={updateAlert} />
                :
                    <ExistingSession name={name} setIsLoading={setIsLoading} setModal={setModal} updateAlert={updateAlert} />
                }
                </> : null }
                <Link to="/signin-trouble" className="text-blue-700 text-sm font-bold w-fit hover:text-blue-800 mt-4">Having trouble signing in?</Link>
                { loginStep === 1 ? <p className="mt-2 text-sm">Don't have an account? <Link to="/signup" className="hover:text-blue-800 text-blue-700 font-bold">Sign up</Link></p> : null }
            </div>
        </div>
    );
}