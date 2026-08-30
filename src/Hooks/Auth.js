import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function useAuth(){
    const location = useLocation();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [loginStep, setLoginStep] = useState(1);

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

    return {
        updateAlert,
        setIsLoading,
        isLoading,
        validateOAuth,
        setLoginStep,
        loginStep,
        name,
        alert
    };
}