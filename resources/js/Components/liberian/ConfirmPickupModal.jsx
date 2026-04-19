// resources/js/Components/liberian/ConfirmPickupModal.jsx
import { X, AlertCircle } from 'lucide-react';

export default function ConfirmPickupModal({ isOpen, onClose, onConfirm, loan }) {
  if (!isOpen || !loan) return null;

  const handleConfirm = async () => {
    await onConfirm(loan);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Confirmer le retrait
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Confirmez-vous que <strong>{loan.user?.name}</strong> a bien récupéré le livre :
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-2">
                {loan.copy?.book?.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Date limite de retrait : {loan.pickup_deadline ? new Date(loan.pickup_deadline).toLocaleString() : 'Non définie'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
          >
            Confirmer le retrait
          </button>
        </div>
      </div>
    </div>
  );
}