export const updateValidation = (setValidations, key, value) => {
    setValidations(prev =>
        prev.map(item =>
            item.field === key
                ? { ...item, message: value }
                : item
        )
    );
};

export const updateAlert = (setAlert, key, value) => {
    setAlert(prev => ({
        ...prev,
        [key]: value
    }));
};

export const GetMYAccountClient = () => {
    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_MY_CLIENT_ID,
        scope: import.meta.env.VITE_MY_SCOPES,
        redirect_uri: import.meta.env.VITE_MY_REDIRECT
    });

    return params.toString();
}