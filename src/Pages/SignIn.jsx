import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoginUser from "../Components/Login/Login";
import MFAUser from "../Components/Login/MFA";
import ExistingSession from "../Components/Login/ExistingSession";
import AlertBox from "../Components/Alert";
import useAuth from "../Hooks/Auth";

export default function Auth(){
    const [modal, setModal] = useState(null);
    const { isLoading, setIsLoading, updateAlert, validateOAuth, loginStep, name, setLoginStep, alert } = useAuth();

    useEffect(() => {
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
                    <ExistingSession name={name} setIsLoading={setIsLoading} setModal={setModal} updateAlert={updateAlert} setLoginStep={setLoginStep} />
                }
                </> : null }
                <Link to="/signin-trouble" className="text-blue-700 text-sm font-bold w-fit hover:text-blue-800 mt-4">Having trouble signing in?</Link>
                { loginStep === 1 ? <p className="mt-2 text-sm">Don't have an account? <Link to="/signup" className="hover:text-blue-800 text-blue-700 font-bold">Sign up</Link></p> : null }
            </div>
        </div>
    );
}