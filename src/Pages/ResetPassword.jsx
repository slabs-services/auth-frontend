import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AlertBox from "../Components/Alert";
import { GetMYAccountClient, updateAlert, updateValidation } from "../Utils";

export default function ResetPassword(){
    const location = useLocation();
    
    const [validations, setValidations] = useState([
        {
            field: "password",
            message: ""
        },
        {
            field: "repassword",
            message: ""
        }
    ]);

    const [password, setPassword] = useState('');
    const [repassword, setRepassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    useEffect(() => {
        async function validatePasswordReset() {
            const searchParams = new URLSearchParams(location.search);

            if(!searchParams.has("recoverKey")){
                setIsLoading(false);
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Missing Recovery Key");
                return;
            }
        
            try {
                const verifyRecoverKey = new URL(
                    "/recoverSettings",
                    import.meta.env.VITE_AUTH_API_URL
                );

                verifyRecoverKey.searchParams.append('recoverKey', searchParams.get("recoverKey"));

                const response = await fetch(verifyRecoverKey, {
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

        validatePasswordReset();
    }, [location.search]);

    async function handleSubmit(e){
        e.preventDefault();
        setIsLoading(true);
        validations.forEach((validation) => {
            updateValidation(setValidations, validation.field, "");
        });

        if(password.length < 8){
            updateValidation(setValidations, "password", "Password must be 8+ characters");
            setPassword('');
            setRepassword('');
            setIsLoading(false);
            return;
        }

        if(password !== repassword){
            updateValidation(setValidations, "repassword", "Passwords not match");
            setPassword('');
            setRepassword('');
            setIsLoading(false);
            return;
        }

        const resetPassword = new URL(
            "/resetPassword",
            import.meta.env.VITE_AUTH_API_URL
        );

        const searchParams = new URLSearchParams(location.search);
        const recoverKey = searchParams.get("recoverKey");

        try {
            const response = await fetch(resetPassword, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    recoverKey,
                    password
                })
            });

            setPassword('');
            setRepassword('');
            
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
            setPassword('');
            setRepassword('');
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

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-8 flex flex-col items-center w-116">
                <h1 className="text-slate-900 text-3xl font-bold">Change Password</h1>
                <AlertBox alert={alert} />
                { !alert.hideContent ?
                <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleSubmit}>
                    <p>Hi <strong>{name}</strong>, it's time to set a new password. Choose a strong password and confirm it below to keep your account secure.</p>
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="password">Password</label>
                        <input required type="password" id="password" autoComplete="new-password" placeholder="••••••••" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={password} onChange={(e) => { clearFeedbackErrors(e.target.id); setPassword(e.target.value); }} />
                        { validations.find((validation) => {return validation.field === "password"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "password"}).message}</p> : null }
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="repassword">Repeat Password</label>
                        <input required type="password" id="repassword" autoComplete="new-password" placeholder="••••••••" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={repassword} onChange={(e) => { clearFeedbackErrors(e.target.id); setRepassword(e.target.value); }} />
                        { validations.find((validation) => {return validation.field === "repassword"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "repassword"}).message}</p> : null }
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Change</button>
                </form> : null }
                <p className="mt-4 text-sm">Have an account? <Link to={"/oauth?" + GetMYAccountClient()} className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
            </div>
        </div>
    );
}