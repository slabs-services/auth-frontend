import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import MFARegister from "./Pages/MFARegister";
import SignInTrouble from "./Pages/SignInTroubles";
import VerifyEmail from "./Pages/VerifyEmail";

export default function Router(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/oauth" element={<Auth />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/add-mfa" element={<MFARegister />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/signin-trouble" element={<SignInTrouble />} />
            </Routes>
        </BrowserRouter>
    );
}