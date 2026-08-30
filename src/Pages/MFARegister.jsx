import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaCopy } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { ConfirmModal } from "../Modals/Confirm";
import { useNavigate, useLocation } from "react-router-dom";
import AlertBox from "../Components/Alert";
import { GetMYAccountClient, updateAlert, updateValidation } from "../Utils";

export default function MFARegister(){
    const navigate = useNavigate();
    const location = useLocation();

    const [validations, setValidations] = useState([
        {
            field: "otp",
            message: ""
        }
    ]);
    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    const [isLoading, setIsLoading] = useState(true);
    const [mfaQRCode, setMfaQRCode] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [clipboardSuccess, setClipboardSuccess] = useState(false);
    const [regenerateSuccess, setRegenerateSuccess] = useState(false);
    const [modal, setModal] = useState(null);

    async function handleSubmit(e){
        e.preventDefault();

        setIsLoading(true);

        validations.forEach((validation) => {
            updateValidation(setValidations, validation.field, "");
        });

        const enableMFA = new URL(
            "/enableMFADevice",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const searchParams = new URLSearchParams(location.search);

            const response = await fetch(enableMFA, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mfaCode: otp
                })
            });
            
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
                    setOtp('');
                    return;
                }

                setOtp('');
                navigate('/finish-activation');
            }catch(e){
                setOtp('');
                updateValidation(setValidations, "generic", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            setOtp('');
            updateValidation(setValidations, "generic", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    async function copyMFAConfigKey(){
        const configUrl = new URL(mfaQRCode);
        const configParams = new URLSearchParams(configUrl.searchParams);
        await navigator.clipboard.writeText(configParams.get("secret"));

        setClipboardSuccess(true);
        setTimeout(() => setClipboardSuccess(false), 2000);
    }

    async function ConfirmRegenerateMFASecret(){
        setIsLoading(true);
        setModal(null);

        try {
            const regenateMFA = new URL(
                "/regenerateMFA",
                import.meta.env.VITE_AUTH_API_URL
            );

            const response = await fetch(regenateMFA, {
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

            setRegenerateSuccess(true);
            setTimeout(() => setRegenerateSuccess(false), 2000);
            setMfaQRCode(data.mfaQRCode);
            setIsLoading(false);
        } catch (e) {
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
            setIsLoading(false);
        }
    }

    function regenerateMFASecret(){
        setModal(<ConfirmModal actionCancel={() => { setModal(null); }} actionConfirm={ConfirmRegenerateMFASecret} contentText="Are you sure you want to generate a new MFA key? If you’ve already scanned the current key, it will no longer work, and you’ll need to set up your authenticator again." headerText="Generate MFA Secret" />);
    }

    useEffect(() => {
        async function mfaSettings() {
            try {
                const verifyMFA = new URL(
                    "/mfaSettings",
                    import.meta.env.VITE_AUTH_API_URL
                );

                const response = await fetch(verifyMFA, {
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

                updateAlert(setAlert, "hideContent", false);
                setName(data.name);
                setMfaQRCode(data.mfaQRCode);
                setIsLoading(false);
            } catch (e) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }

        mfaSettings();
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
            <div className="w-116 mt-8">
                <AlertBox alert={alert} />
                <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-4 flex flex-col items-center">
                    <h1 className="text-slate-900 text-3xl font-bold">Register MFA</h1>
                    { !alert.hideContent ? <>
                        <p className="mt-6 text-sm">Hi <strong>{name}</strong>, at SpaceLabs Cloud, MFA (Multi-Factor Authentication) is required. Please scan the QR code below using an app such as <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" className="hover:text-blue-800 text-blue-700 font-bold">Google Authenticator</a> or <a href="https://play.google.com/store/apps/details?id=com.azure.authenticator" target="_blank" className="hover:text-blue-800 text-blue-700 font-bold">Microsoft Authenticator</a>, then enter the code generated by the app below.</p>
                        <QRCode value={mfaQRCode} level="H" className="mt-6" size={130} />
                        { !clipboardSuccess ?
                        <div className="flex items-center gap-x-1 p-1 bg-gray-100 rounded mt-2 hover:cursor-pointer hover:bg-gray-200 select-none" onClick={() => { copyMFAConfigKey(); }}>
                            <FaCopy className="w-4 h-4 text-gray-800" />
                            <p className="text-gray-800 text-xs">Copy Configuration Key</p>
                        </div> :
                        <div className="flex items-center gap-x-1 p-1 bg-green-100 rounded mt-2 select-none">
                            <FaCheckCircle className="w-4 h-4 text-green-900" />
                            <p className="text-green-900 text-xs">Configuration Key Copied</p>
                        </div>
                        }
                        { !regenerateSuccess ?
                            <div className="flex items-center gap-x-1 p-1 bg-gray-100 rounded mt-1 hover:cursor-pointer hover:bg-gray-200 select-none" onClick={() => { regenerateMFASecret(); }}>
                                <IoReload className="w-4 h-4 text-gray-800" />
                                <p className="text-gray-800 text-xs">Generate New MFA Secret</p>
                            </div> :
                            <div className="flex items-center gap-x-1 p-1 bg-green-100 rounded mt-2 select-none">
                                <FaCheckCircle className="w-4 h-4 text-green-900" />
                                <p className="text-green-900 text-xs">New MFA Secret Generated</p>
                            </div>
                        }
                        <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-y-1">
                                <label htmlFor="otp">OTP Code</label>
                                <input required type="text" id="otp" minLength={6} maxLength={6} placeholder="999999" autoComplete="one-time-code" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={otp} onChange={(e) => { setOtp(e.target.value); updateAlert(setAlert, "showAlert", false); updateValidation(setValidations, "otp", ""); }} />
                                { validations.find((validation) => {return validation.field === "otp"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "otp"}).message}</p> : null }
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Finish Sign Up</button>
                        </form>
                    </> : null }
                    <p className="mt-4 text-sm">Have an account? <Link to={"/oauth?" + GetMYAccountClient()} className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}