export function ConfirmModal({ headerText, contentText, actionConfirm, actionCancel }) {
    return (
        <div className="w-120">
            <div className="bg-gray-200 p-3">
                <p className="font-bold text-gray-500">{headerText}</p>
            </div>
            <div className="p-4 min-h-24">
                <p className="text-zinc-800">{contentText}</p>
            </div>
            <div className="flex justify-end p-3 bg-gray-200 gap-x-3">
                <a className="text-gray-500 font-bold hover:text-gray-600 hover:cursor-pointer" onClick={actionCancel}>Cancel</a>
                <a className="text-blue-800 font-bold hover:text-blue-900 hover:cursor-pointer" onClick={actionConfirm}>Confirm</a>
            </div>
        </div>
    );
}