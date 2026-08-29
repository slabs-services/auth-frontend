import { useState } from "react";
import { Link } from "react-router-dom";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

export default function ForgotPassword(){
    const [validations, setValidations] = useState([
        {
            field: "email",
            message: ""
        }
    ]);

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: false
    });

    const updateValidation = (key, value) => {
        setValidations(prev =>
            prev.map(item =>
            item.field === key
                ? { ...item, message: value }
                : item
            )
        );
    };

    const updateAlert = (key, value) => {
        setAlert(prev => ({
            ...prev,
            [key]: value
        }));
    };

    async function handleSubmit(e){
        e.preventDefault();
        setIsLoading(true);
        validations.forEach((validation) => {
            updateValidation(validation.field, "");
        });

        const forgotPassword = new URL(
            "/forgotPassword",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const response = await fetch(forgotPassword, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            });
            
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

                updateAlert("severity", 1); 
                updateAlert("showAlert", true);
                updateAlert("message", data.message);
                updateAlert("hideContent", true);
                setIsLoading(false);
            }catch(e){
                updateAlert("severity", 3);
                updateAlert("showAlert", true);
                updateAlert("message", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            updateAlert("severity", 3);
            updateAlert("showAlert", true);
            updateAlert("message", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    function clearFeedbackErrors(field) {
        updateValidation(field, "");
    }

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-8 flex flex-col items-center w-116">
                <h1 className="text-slate-900 text-3xl font-bold">Forgot Password</h1>
                { alert.showAlert ?
                <>
                    { alert.severity === 1 ?
                    <div className="bg-green-50 border border-green-100 rounded p-4 shadow-xs flex flex-col items-center mt-6 w-full">
                        <FaCheckCircle className="w-8 h-8 text-green-900" />
                        <p className="text-green-900 mt-4">{alert.message}</p>
                    </div> : alert.severity === 2 ?
                    <div className="bg-yellow-50 border border-yellow-900 rounded p-4 shadow-xs flex items-center flex-col mt-6 w-full">
                        <MdWarning className="w-8 h-8 text-yellow-900" />
                        <p className="text-yellow-900 mt-4">{alert.message}</p>
                    </div>
                    :
                    <div className="bg-red-50 border border-red-900 rounded p-4 shadow-xs flex items-center flex-col mt-6 w-full">
                        <MdError className="w-8 h-8 text-red-900" />
                        <p className="text-red-900 mt-4">{alert.message}</p>
                    </div>
                    }
                </> : null }
                { !alert.hideContent ? 
                <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleSubmit}>
                    <p>Forgot your password? Don't worry! Let's get you back into your account. Start by entering your email address, and we'll guide you through the recovery process.</p>
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="email">Email address</label>
                        <input required type="email" id="email" placeholder="example@domain.com" autoComplete="email" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={email} onChange={(e) => { clearFeedbackErrors(e.target.id); setEmail(e.target.value); }} />
                        { validations.find((validation) => {return validation.field === "email"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "email"}).message}</p> : null }
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Recover Password</button>
                </form> : null }
                <p className="mt-4 text-sm">Have an account? <Link to="/oauth" className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
            </div>
        </div>
    );
}