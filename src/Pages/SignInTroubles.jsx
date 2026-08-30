import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useState } from "react";
import { GetMYAccountClient } from "../Utils";

const faqsSignInTroubles = [
    {
        question: "Forgot your password?",
        answer: (<>Dont worry, you can recover your password and regain access to your account. We will guide you through the steps to securely <Link to="/forgot-password" className="hover:text-blue-800 text-blue-700 font-bold">reset your password</Link>.</>)
    },
    {
        question: "Lost your activation email?",
        answer: (<>Don't worry. Simply sign in with your account as usual, and we'll guide you through the steps to activate your account and get started.</>)
    },
    {
        question: "Need to registar MFA after sign up?",
        answer: (<>Don't worry. Simply sign in with your account as usual, and we'll guide you through the steps to register your MFA and get started.</>)
    },
    {
        question: "Lost your MFA?",
        answer: (<>Lost access to your MFA? You can recover access to your account using one of your available recovery options. Sign in to get started, and we'll guide you through the recovery process.</>)
    }
]

export default function SignInTrouble(){

    const [troubleFaqId, setTroubleFaqId] = useState();

    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            <img src="/logo-big.svg" className="w-48" />
            <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-4 flex flex-col items-center w-116">
                <h1 className="text-slate-900 text-3xl font-bold">Sign In Troubles</h1>
                <div className="w-full mt-4">
                    { faqsSignInTroubles.map((faqTrouble, i) => {
                        return (
                            <div className="pb-4 border-b border-slate-300" key={i}>
                                <div className="flex justify-between items-center py-4 hover:cursor-pointer" onClick={() => { setTroubleFaqId(i === troubleFaqId ? null : i); }}>
                                    <p>{faqTrouble.question}</p>
                                    { troubleFaqId !== i ? <FaPlus className="w-4 h-4" /> : <FaMinus className="w-4 h-4" /> }
                                </div>
                                <p className={`text-slate-600 ${troubleFaqId !== i ? "hidden" : "block"}`}>{faqTrouble.answer}</p>
                            </div>
                        );
                    }) }
                </div>
                <Link to={"/oauth?" + GetMYAccountClient()} className="mt-4 text-sm hover:text-blue-800 text-blue-700 font-bold">Go back to sign in</Link>
            </div>
        </div>
    );
}