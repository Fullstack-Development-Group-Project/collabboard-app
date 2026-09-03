import { useEffect, useState } from "react";

function DatabaseNotification() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("database-offline", handleOffline);
    return () => window.removeEventListener("database-offline", handleOffline);
  }, []);

  if (!isOffline) return null;

  return (
    <div
      style={{
        backgroundColor: "#ffecb3",
        color: "#856404",
        padding: "10px",
        textAlign: "center",
        fontWeight: "bold",
        position: "sticky",
        top: 0,
        zIndex: 9999,
      }}
    >
      ⚠️ MongoDB authentication failed or database is unreachable. Server is currently using the memory store.
    </div>
  );
}

export default DatabaseNotification;
