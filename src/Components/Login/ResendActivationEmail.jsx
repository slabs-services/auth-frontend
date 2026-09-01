import { updateValidation, updateAlert } from "../../Utils";
import AlertBox from "../Alert";

export default function ResetEmailValidation({ setIsLoading, setAlert, name }){
    async function resendValidationEmail(e){
        setIsLoading(true);

        const resendEmail = new URL(
            "/resendEmail",
            import.meta.env.VITE_AUTH_API_URL
        );

        try {
            const response = await fetch(resendEmail, {
                credentials: 'include'
            });

            if (response.status === 502) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await response.json();

                if (!response.ok) {
                    updateAlert(setAlert, "severity", data.severity);
                    updateAlert(setAlert, "showAlert", true);
                    updateAlert(setAlert, "message", data.message);
                    updateAlert(setAlert, "hideContent", data.hideContent);
                    setIsLoading(false);
                    return;
                }

                updateAlert(setAlert, "severity", 1); 
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", data.message);
                updateAlert(setAlert, "hideContent", true);
                setIsLoading(false);
            }catch(e){
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Unknown Error");
                setIsLoading(false);
                return;
            }
        }catch(e){
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
            setIsLoading(false);
            return;
        }
    }

    return (
        <div className="flex flex-col mt-6 w-full gap-y-4">
            <div className="flex justify-center">
                <img src="/email.svg" title="Email Validation" alt="Email Validation" className="w-46" />
            </div>
            <p>Hi, <strong>{name.split(" ")[0]}</strong>. We noticed that your email address has not yet been verified. If you’ve lost or can’t find the verification email, click the button below to resend it.</p>
            <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer" onClick={() => { resendValidationEmail(); }}>Resend Email</button>
        </div>
    );
}