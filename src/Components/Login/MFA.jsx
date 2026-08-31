import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { updateValidation } from "../../Utils";

export default function MFAUser({ setIsLoading, updateAlert, setAlert }){
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [validations, setValidations] = useState([
        {
            field: "otp",
            message: ""
        }
    ]);

    async function handleOtpValidation(e){
        const searchParams = new URLSearchParams(location.search);
        e.preventDefault();
        setIsLoading(true);
        
        validations.forEach((validation) => {
            updateValidation(setValidations, validation.field, "");
        });

        const doLoginMFA = new URL(
            "/loginMFA",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const searchParams = new URLSearchParams(location.search);
            const clientId = searchParams.get("client_id");
            const scope = searchParams.get("scope");
            const redirectUri = searchParams.get("redirect_uri");

            const response = await fetch(doLoginMFA, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mfaCode: otp,
                    clientId,
                    scope,
                    redirectUri
                })
            });

            setOtp('');
            
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

                const searchParams = new URLSearchParams(location.search);
                const redirectUri = searchParams.get("redirect_uri");
                const authorizationCode = data.code;
                const redirect = new URL(redirectUri);
                redirect.searchParams.set("code", authorizationCode);
                if(searchParams.has("state")){
                    redirect.searchParams.set("state", searchParams.get("state"));
                }
                window.location.href = redirect.toString();
            }catch(e){
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            setOtp('');
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    return (
        <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleOtpValidation}>
            <p>Please enter the MFA code below to verify your identity and proceed with your login.</p>
            <div className="flex flex-col gap-y-1">
                <label htmlFor="otp">OTP Code</label>
                <input required type="text" id="otp" minLength={6} maxLength={6} placeholder="999999" autoComplete="one-time-code" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={otp} onChange={(e) => { setOtp(e.target.value); updateValidation(setValidations, "otp", ""); updateAlert(setAlert, "showAlert", false); }} />
                { validations.find((validation) => {return validation.field === "otp"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "otp"}).message}</p> : null }
                <Link to="/lost-mfa" className="text-blue-700 text-sm font-bold w-fit hover:text-blue-800 mt-1">Lost MFA</Link>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Validate</button>
        </form>
    );
}