import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function MFARegister(){
    const [validations, setValidations] = useState([
        {
            field: "otp",
            message: ""
        },
        {
            field: "generic",
            message: ""
        }
    ]);

    const [mfaQRCode, setMfaQRCode] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState('');

    const updateItem = (key, value) => {
        setValidations(prev =>
            prev.map(item =>
            item.field === key
                ? { ...item, message: value }
                : item
            )
        );
    };

    async function handleSubmit(e){
        e.preventDefault();

        setIsLoading(true);
        validations.forEach((validation) => {
            updateItem(validation.field, "");
        });

        const enableMFA = new URL(
            "/enableMFADevice",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const searchParams = new URLSearchParams(location.search);

            const response = await fetch(enableMFA, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mfaCode: otp,
                    activationKey: searchParams.get("activationKey")
                })
            });
            
            try {
                const data = await response.json();

                if (!response.ok) {
                    updateItem(data.field, data.message);
                    setIsLoading(false);
                    setOtp('');
                    return;
                }

                setOtp('');
                setIsLoading(false);
                setShowSuccess(data.message);
            }catch(e){
                setOtp('');
                updateItem("generic", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            setOtp('');
            updateItem("generic", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    useEffect(() => {
        async function validateEmail() {
            const searchParams = new URLSearchParams(location.search);

            if(!searchParams.has("activationKey")){
                setIsLoading(false);
                updateItem("generic", "Missing Activation Key");
                return;
            }
        
            try {
                const verifyEmail = new URL(
                    "/verifyEmail",
                    import.meta.env.VITE_AUTH_API_URL
                );

                verifyEmail.searchParams.append('activationKey', searchParams.get("activationKey"));

                const response = await fetch(verifyEmail);

                if (response.status === 502) {
                    updateItem("generic", "Authentication service is temporarily unavailable.");
                    setIsLoading(false);
                    return;
                }

                let data = null;

                try {
                    data = await response.json();
                } catch (e) {
                    updateItem("generic", "Unknown Error");
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    updateItem(data.field, data.message);
                    setIsLoading(false);
                    return;
                }

                setName(data.name);
                setShowSuccess(data.message);
                setMfaQRCode(data.mfaQRCode);
                setIsLoading(false);
            } catch (e) {
                updateItem("generic", "Unable to connect to the authentication service.");
                setIsLoading(false);
            }
        }

        validateEmail();
    }, []);


    return (
        <div className="bg-gray-50 w-full h-full absolute flex items-center justify-center flex-col font-roboto">
            { isLoading ? <div className="w-full h-full absolute bg-black/50 flex items-center justify-center">
                <img src="/loading.svg" title="Loading" alt="Loading" className="w-16 animate-spin" />
            </div> : null }
            <img src="/logo-big.svg" className="w-48" />
            <div className="w-116 mt-8">
                { showSuccess !== "" ? <div className="bg-green-50 border border-green-100 rounded p-4 shadow-xs flex items-center flex-col">
                    <FaCheckCircle className="w-8 h-8 text-green-900" />
                    <p className="text-green-900 mt-4">{showSuccess}</p>
                </div> : null }
                <div className="p-8 bg-white rounded-lg border border-slate-300 shadow-xs mt-4 flex flex-col items-center">
                    { validations.find((validation) => {return validation.field === "generic"}).message !== "" ? <div className="bg-red-50 border border-red-900 rounded p-4 shadow-xs flex flex-col items-center mt-6 w-full">
                        <MdError className="w-8 h-8 text-red-900" />
                        <p className="text-red-900 mt-4">{validations.find((validation) => {return validation.field === "generic"}).message}</p>
                    </div> :
                    <>
                    <h1 className="text-slate-900 text-3xl font-bold">Register MFA</h1>
                    <p className="mt-6 text-sm">Hi <strong>{name}</strong>, at SpaceLabs Cloud, MFA (Multi-Factor Authentication) is required. Please scan the QR code below using an app such as <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" className="hover:text-blue-800 text-blue-700 font-bold">Google Authenticator</a> or <a href="https://play.google.com/store/apps/details?id=com.azure.authenticator" target="_blank" className="hover:text-blue-800 text-blue-700 font-bold">Microsoft Authenticator</a>, then enter the code generated by the app below.</p>
                    <QRCode value={mfaQRCode} level="H" className="mt-6" size={130} />
                    <form className="flex flex-col mt-6 w-full gap-y-4" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-y-1">
                            <label htmlFor="otp">OTP Code</label>
                            <input required type="text" id="otp" minLength={6} maxLength={6} placeholder="999999" autoComplete="one-time-code" autoCorrect="off" autoCapitalize="off" className="p-1 border rounded border-slate-400 outline-none focus:border-blue-600 text-slate-900" value={otp} onChange={(e) => { setOtp(e.target.value); updateItem("otp", ""); }} />
                            { validations.find((validation) => {return validation.field === "otp"}).message !== "" ? <p className="text-red-600">{validations.find((validation) => {return validation.field === "otp"}).message}</p> : null }
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" type="submit">Finish Sign Up</button>
                    </form>
                    </> }
                    <p className="mt-4 text-sm">Have an account? <Link to="/oauth" className="hover:text-blue-800 text-blue-700 font-bold">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}