import { useEffect, useState } from "react";
import "./ConflictModal.css";

export default function ConflictModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleConflict = () => {
      setIsOpen(true);
    };

    window.addEventListener("api-conflict", handleConflict);

    return () => {
      window.removeEventListener("api-conflict", handleConflict);
    };
  }, []);

  if (!isOpen) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="conflict-modal-overlay">
      <div className="conflict-modal-content">
        <div className="conflict-modal-header">
          <h3>Update Conflict Detected</h3>
          <button className="conflict-close-button" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="conflict-modal-body">
          <p>
            Someone else modified this board while you were viewing it. Your
            recent changes could not be saved to prevent overwriting their work.
          </p>
          <p>
            Please refresh the data to see the latest changes and try again.
          </p>
        </div>
        <div className="conflict-modal-footer">
          <button className="conflict-btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="conflict-btn-primary" onClick={handleRefresh}>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
