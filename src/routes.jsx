import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import MFARegister from "./Pages/MFARegister";
import SignInTrouble from "./Pages/SignInTroubles";
import VerifyEmail from "./Pages/VerifyEmail";
import FinishAccount from "./Pages/FinishAccount";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

export default function Router(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/oauth" element={<Auth />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/add-mfa" element={<MFARegister />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/finish-activation" element={<FinishAccount />} />
                <Route path="/signin-trouble" element={<SignInTrouble />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </BrowserRouter>
    );
}