import { useState } from "react";
import { updateValidation } from "../../Utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { updateAlert } from "../../Utils";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginUser({ setIsLoading, setLoginStep, setAlert, setName }){
    const navigate = useNavigate();
    const location = useLocation();

    const [validations, setValidations] = useState([
        {
            field: "email",
            message: ""
        },
        {
            field: "password",
            message: ""
        }
    ]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin(e){
        e.preventDefault();
        setIsLoading(true);
        
        validations.forEach((validation) => {
            updateValidation(setValidations, validation.field, "");
        });

        if(!email.trim().toLowerCase().includes("@") || !email.trim().toLowerCase().includes(".")){
            updateValidation(setValidations, "email", "Incorrect Email");
            setPassword('');
            setEmail('');
            setIsLoading(false);
            return;
        }

        if(password.length < 8){
            updateValidation(setValidations, "password", "Incorrect Password");
            setPassword('');
            setEmail('');
            setIsLoading(false);
            return;
        }

        const doLogin = new URL(
            "/login",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const response = await fetch(doLogin, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            setPassword('');
            setEmail('');

            if (response.status === 502) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
                setIsLoading(false);
                return;
            }
            
            try {
                const data = await response.json();

                if (!response.ok) {
                    if(data.field === "alert"){
                        updateAlert(setAlert, "severity", data.severity);
                        updateAlert(setAlert, "showAlert", true);
                        updateAlert(setAlert, "message", data.message);
                        updateAlert(setAlert, "hideContent", data.hideContent);
                    }else{
                        updateValidation(setValidations, data.field, data.message);
                    }
                    setIsLoading(false);
                    return;
                }

                if(data.needEmailValidation){
                    setLoginStep(4);
                    setName(data.name);
                    setIsLoading(false);
                }else if(data.needMFA){
                    navigate('/add-mfa');
                }else{
                    setLoginStep(2);
                    setIsLoading(false);
                }
            }catch(e){
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            setPassword('');
            setEmail('');
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    function clearFeedbackErrors(field) {
        updateValidation(setValidations, field, "");
        updateAlert(setAlert, "showAlert", false);
    }

    async function loginWithPasskey(){
        setIsLoading(true);

        try {
            const loginPasskeyConfig = new URL(
                "/loginPasskeyOptions",
                import.meta.env.VITE_AUTH_API_URL
            );

            const response = await fetch(loginPasskeyConfig);

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

            try{
                const authenticationResponse = await startAuthentication({
                    optionsJSON: data.options
                });
                await validatePasskeyAuth(authenticationResponse, data.srnValidation);
            }catch(err){
                updateAlert(setAlert, "severity", 2);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Passkey Authentication failed");
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

    async function validatePasskeyAuth(passkeyAuth, passkeySrn) {
        try {
            const searchParams = new URLSearchParams(location.search);
            const clientId = searchParams.get("client_id");
            const scope = searchParams.get("scope");
            const redirectUri = searchParams.get("redirect_uri");

            const loginPasskeyConfig = new URL(
                "/validatePasskeyAuth",
                import.meta.env.VITE_AUTH_API_URL
            );

            const response = await fetch(loginPasskeyConfig, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    passkeyAuth,
                    passkeyValidationSrn: passkeySrn,
                    clientId,
                    scope,
                    redirectUri
                })
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

            const authorizationCode = data.code;
            const redirect = new URL(redirectUri);
            redirect.searchParams.set("code", authorizationCode);
            if(searchParams.has("state")){
                redirect.searchParams.set("state", searchParams.get("state"));
            }
            window.location.href = redirect.toString();
        } catch (e) {
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
            setIsLoading(false);
        }  
    }

    return (
        <>
            <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleLogin}>
                <div className="flex flex-col gap-y-1">
                    <label htmlFor="email">Email address</label>
                    <input required type="email" id="email" placeholder="example@domain.com" autoComplete="email" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={email} onChange={(e) => { clearFeedbackErrors("email"); setEmail(e.target.value); }} />
                    { validations.find((validation) => {return validation.field === "email"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "email"}).message}</p> : null }
                </div>
                <div className="flex flex-col gap-y-1">
                    <label htmlFor="password">Password</label>
                    <input required type="password" id="password" autoComplete="current-password" placeholder="••••••••" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={password} onChange={(e) => { clearFeedbackErrors("password"); setPassword(e.target.value); }} />
                    { validations.find((validation) => {return validation.field === "password"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "password"}).message}</p> : null }
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Sign In</button>
            </form>
            <div className="w-full mt-1">
                <button onClick={() => { loginWithPasskey(); }} className="text-blue-700 text-sm font-bold hover:text-blue-800 hover:cursor-pointer">Sign in with passkey</button>
            </div>
        </>
    );
}