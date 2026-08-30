import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function MFAUser({ setIsLoading, updateAlert }){
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
            updateValidation(validation.field, "");
        });

        const doLoginMFA = new URL(
            "/loginMFA",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const response = await fetch(doLoginMFA, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mfaCode: otp
                })
            });

            setOtp('');
            
            try {
                const data = await response.json();

                if (!response.ok) {
                    if(data.field === "alert"){
                        updateAlert("severity", data.severity);
                        updateAlert("showAlert", true);
                        updateAlert("message", data.message);
                        updateAlert("hideContent", data.hideContent);
                    }else{
                        updateValidation(data.field, data.message);
                    }
                    setIsLoading(false);
                    return;
                }

                updateAlert("hideContent", true);
                const searchParams = new URLSearchParams(location.search);
                const redirectUri = searchParams.get("redirect_uri");
                const authorizationCode = "abc123"; // falta o authorization token
                const redirect = new URL(redirectUri);
                redirect.searchParams.set("code", authorizationCode);
                window.location.href = redirect.toString();
            }catch(e){
                updateAlert("severity", 3);
                updateAlert("showAlert", true);
                updateAlert("message", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            setOtp('');
            updateAlert("severity", 3);
            updateAlert("showAlert", true);
            updateAlert("message", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    const updateValidation = (key, value) => {
        setValidations(prev =>
            prev.map(item =>
            item.field === key
                ? { ...item, message: value }
                : item
            )
        );
    };

    return (
        <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleOtpValidation}>
            <div className="flex flex-col gap-y-1">
                <label htmlFor="otp">OTP Code</label>
                <input required type="text" id="otp" minLength={6} maxLength={6} placeholder="999999" autoComplete="one-time-code" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={otp} onChange={(e) => { setOtp(e.target.value); updateValidation("otp", ""); updateAlert("showAlert", false); }} />
                { validations.find((validation) => {return validation.field === "otp"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "otp"}).message}</p> : null }
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Validate</button>
        </form>
    );
}