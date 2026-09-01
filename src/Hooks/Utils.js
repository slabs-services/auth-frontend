import { useState } from "react";

export default function useUtils(){
    const [applicationName, setApplicationName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [alert, setAlert] = useState({
        showAlert: false,
        severity: 0,
        message: "",
        hideContent: true
    });

    return {
        setIsLoading,
        isLoading,
        alert,
        setAlert,
        setApplicationName,
        applicationName
    };
}