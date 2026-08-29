import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { ConfirmModal } from "../Modals/Confirm";
import { useNavigate } from "react-router-dom";

export default function MFARegister(){
    const navigate = useNavigate();

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
                        updateAlert("severity", data.severity);
                        updateAlert("showAlert", true);
                        updateAlert("message", data.message);
                        updateAlert("hideContent", data.hideContent);
                    }else{
                        updateValidation(data.field, data.message);
                    }
                    setIsLoading(false);
                    setOtp('');
                    return;
                }

                setOtp('');
                navigate('/finish-activation');
            }catch(e){
                setOtp('');
                updateValidation("generic", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            setOtp('');
            updateValidation("generic", "Authentication service is temporarily unavailable.");
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

    async function ConfirmMFASecret(){
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
                updateAlert("severity", "3");
                updateAlert("showAlert", true);
                updateAlert("message", "Authentication service is temporarily unavailable.");
                setIsLoading(false);
                return;
            }

            let data = null;

            try {
                data = await response.json();
            } catch (e) {
                updateAlert("severity", "3");
                updateAlert("showAlert", true);
                updateAlert("message", "Unknown Error");
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                updateAlert("severity", "3");
                updateAlert("showAlert", true);
                updateAlert("message", data.message);
                setIsLoading(false);
                return;
            }

            setRegenerateSuccess(true);
            setTimeout(() => setRegenerateSuccess(false), 2000);
            setMfaQRCode(data.mfaQRCode);
            setIsLoading(false);
        } catch (e) {
            updateAlert("severity", "3");
            updateAlert("showAlert", true);
            updateAlert("message", "Unable to connect to the authentication service.");
            setIsLoading(false);
        }
    }

    function regenerateMFASecret(){
        setModal(<ConfirmModal actionCancel={() => { setModal(null); }} actionConfirm={ConfirmMFASecret} contentText="Are you sure you want to generate a new MFA key? If you’ve already scanned the current key, it will no longer work, and you’ll need to set up your authenticator again." headerText="Generate MFA Secret" />);
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
                    updateAlert("severity", "3");
                    updateAlert("showAlert", true);
                    updateAlert("message", "Authentication service is temporarily unavailable.");
                    setIsLoading(false);
                    return;
                }

                let data = null;

                try {
                    data = await response.json();
                } catch (e) {
                    updateAlert("severity", "3");
                    updateAlert("showAlert", true);
                    updateAlert("message", "Unknown Error");
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    updateAlert("severity", "3");
                    updateAlert("showAlert", true);
                    updateAlert("message", data.message);
                    setIsLoading(false);
                    return;
                }

                updateAlert("hideContent", false);
                setName(data.name);
                setMfaQRCode(data.mfaQRCode);
                setIsLoading(false);
            } catch (e) {
                updateAlert("severity", "3");
                updateAlert("showAlert", true);
                updateAlert("message", "Unable to connect to the authentication service.");
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
                                <input required type="text" id="otp" minLength={6} maxLength={6} placeholder="999999" autoComplete="one-time-code" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={otp} onChange={(e) => { setOtp(e.target.value); updateValidation("otp", ""); }} />
                                { validations.find((validation) => {return validation.field === "otp"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "otp"}).message}</p> : null }
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Finish Sign Up</button>
                        </form>
                    </> : null }
                    <p className="mt-4 text-sm">Have an account? <Link to="/oauth" className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}