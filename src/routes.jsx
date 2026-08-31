import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Auth from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import MFARegister from "./Pages/MFARegister";
import SignInTrouble from "./Pages/SignInTroubles";
import VerifyEmail from "./Pages/VerifyEmail";
import FinishAccount from "./Pages/FinishAccount";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import LostMFA from "./Pages/LostMFA";
import ResetMFA from "./Pages/ResetMFA";
import { GetMYAccountClient } from "./Utils";

export default function Router(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={"/oauth?" + GetMYAccountClient()} replace />} />
                <Route path="/oauth" element={<Auth />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/add-mfa" element={<MFARegister />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/finish-activation" element={<FinishAccount />} />
                <Route path="/signin-trouble" element={<SignInTrouble />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/lost-mfa" element={<LostMFA />} />
                <Route path="/reset-mfa" element={<ResetMFA />} />
            </Routes>
        </BrowserRouter>
    );
}