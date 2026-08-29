import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

export default function Auth(){
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
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
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

    function handleSubmit(e){
        e.preventDefault();

        // if(password.length < 8){
        //     updateItem("password", "Incorrect Password");
        //     setPassword('');
        //     return;
        // }
    }

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
                        updateAlert("severity", 3);
                        updateAlert("showAlert", true);
                        updateAlert("message", data.message);
                        setIsLoading(false);
                        return;
                    }

                    updateAlert("hideContent", false);
                    setIsLoading(false);
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

        validateOAuth();
    }, []);

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-8 flex flex-col items-center w-116">
                <h1 className="text-slate-900 text-3xl font-bold">Sign In</h1>
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
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="email">Email address</label>
                        <input required type="email" id="email" placeholder="example@domain.com" autoComplete="email" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={email} onChange={(e) => { setEmail(e.target.value); }} />
                        { validations.find((validation) => {return validation.field === "email"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "email"}).message}</p> : null }
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="password">Password</label>
                        <input required type="password" id="password" autoComplete="current-password" placeholder="••••••••" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={password} onChange={(e) => { setPassword(e.target.value); }} />
                        { validations.find((validation) => {return validation.field === "password"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "password"}).message}</p> : null }
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Sign In</button>
                </form> : null }
                <Link to="/signin-trouble" className="text-blue-700 text-sm font-bold w-fit hover:text-blue-800 mt-4">Having trouble signing in?</Link>
                <p className="mt-2 text-sm">Don't have an account? <Link to="/signup" className="hover:text-blue-800 text-blue-700 font-bold">Sign up</Link></p>
            </div>
        </div>
    );
}