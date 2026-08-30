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