import { useState } from "react";
import { useLocation } from "react-router-dom";
import { updateAlert } from "../Utils";
import { useUtilsContext } from "../Contexts/UtilsContext";

export default function useAuth(){
    const location = useLocation();
    const [name, setName] = useState('');
    const [applicationName, setApplicationName] = useState('');
    const [loginStep, setLoginStep] = useState(1);
    const { setIsLoading, setAlert } = useUtilsContext();

    async function validateOAuth() {
        updateAlert(setAlert, "hideContent", true);
        updateAlert(setAlert, "showAlert", false);
        setIsLoading(true);

        const searchParams = new URLSearchParams(location.search);
        const hasInvalidParams = !searchParams.has("client_id") || !searchParams.has("scope") || !searchParams.has("redirect_uri");

        if(hasInvalidParams){
            setIsLoading(false);
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Missing OAuth Parameters");
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
                    updateAlert(setAlert, "message", "Unknown Error.");
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

                setApplicationName(data.name);
                await GetLoginStep();
            } catch (e) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }catch(e){
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Invalid OAuth Client");
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
                updateAlert(setAlert, "message", "Unknown Error.");
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

            if(data.authStep === "valid-session"){
                updateAlert(setAlert, "hideContent", false);
                setLoginStep(3);
                setName(data.name);
                setIsLoading(false);
            }else if(data.authStep === "mfa-step"){
                updateAlert(setAlert, "hideContent", false);
                setLoginStep(2);
                setIsLoading(false);
            }else{
                updateAlert(setAlert, "hideContent", false);
                setIsLoading(false);
            }
        } catch (e) {
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
            setIsLoading(false);
        }
    }

    return {
        validateOAuth,
        setLoginStep,
        loginStep,
        name,
        setName,
        applicationName
    };
}