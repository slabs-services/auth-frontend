import { useState } from "react";
import { updateValidation } from "../../Utils";

export default function LoginUser({ setIsLoading, updateAlert, setLoginStep, setAlert }){
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

                setLoginStep(2);
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

    return (
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
    );
}