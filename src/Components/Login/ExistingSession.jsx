import { useLocation } from "react-router-dom";
import { ConfirmModal } from "../../Modals/Confirm";

export default function ExistingSession({ setModal, updateAlert, setAlert, setIsLoading, name, setLoginStep }){
    const location = useLocation();

    function getInitials(name){
        const nameSplit = name.split(" ");
        if(nameSplit.length === 1){
            return nameSplit[0].substring(0,1);
        }else{
            return nameSplit[0].substring(0,1) + nameSplit[nameSplit.length-1].substring(0,1);
        }
    }

    function openChangeAccountModal(){
        setModal(<ConfirmModal actionCancel={() => { setModal(null); }} actionConfirm={LogoutAccount} contentText="Are you sure you want to sign out of this account and continue signing in with a different one?" headerText="Switch account" />);
    }

    function LoginWithCurrentUser(){
        updateAlert(setAlert, "hideContent", true);
        setIsLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const redirectUri = searchParams.get("redirect_uri");
        const authorizationCode = "abc123"; // falta o authorization token
        const redirect = new URL(redirectUri);
        redirect.searchParams.set("code", authorizationCode);
        window.location.href = redirect.toString();
    }

    async function LogoutAccount(){
        setModal(null);
        setIsLoading(true);

        try {
            const logoutSession = new URL(
                "/logout",
                import.meta.env.VITE_AUTH_API_URL
            );

            const response = await fetch(logoutSession, {
                method: "DELETE",
                credentials: "include"
            });

            if (response.status === 502) {
                updateAlert(setAlert, "severity", 3);
                updateAlert(setAlert, "showAlert", true);
                updateAlert(setAlert, "message", "Authentication service is temporarily unavailable.");
                setIsLoading(false);
                return;
            }

            setLoginStep(1);
            setIsLoading(false);
        } catch (e) {
            updateAlert(setAlert, "severity", 3);
            updateAlert(setAlert, "showAlert", true);
            updateAlert(setAlert, "message", "Unable to connect to the authentication service.");
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="p-4 aspect-square rounded-full bg-blue-600 flex items-center justify-center mt-4">
                <p className="text-white font-bold text-4xl">{getInitials(name)}</p>
            </div>
            <p className="mt-4">Hi, <strong>{name.split(" ")[0]}</strong>! Would you like to continue signing in with this account? If this is the account you want to use, click continue below to proceed with the sign-in process.</p>
            <div className="flex w-full gap-x-2 mt-4">
                <button className="border-blue-600 border hover:border-blue-700 text-blue-600 hover:text-blue-700 p-2 rounded hover:cursor-pointer w-full" onClick={() => { openChangeAccountModal(); }}>Change Account</button>
                <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white hover:cursor-pointer w-full" onClick={() => { LoginWithCurrentUser(); }}>Sign In</button>
            </div>
        </>
    );
}