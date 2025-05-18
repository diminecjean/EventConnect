"use client";
import { Button } from "@/components/ui/button";
import { UserPlus, Check } from "lucide-react";
import { useConnections, ConnectionStatus } from "./useConnections";

interface ConnectionButtonProps {
  userId: string;
  status?: ConnectionStatus;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function ConnectionButton({
  userId,
  status: initialStatus,
  size = "sm",
  className,
}: ConnectionButtonProps) {
  const {
    connectionStatuses,
    sendConnectionRequest,
    shouldDisableConnectButton,
    isConnectionPending,
    getConnectionButtonText,
  } = useConnections();

  // Use passed status if available, otherwise check from hook
  const status = initialStatus || connectionStatuses[userId];

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating (important in lists)
    sendConnectionRequest(userId);
  };

  const getConnectionIcon = () => {
    if (status === "ACCEPTED") {
      return <Check size={16} className="mr-1" />;
    }

    return <UserPlus size={16} className="mr-1" />;
  };

  return (
    <Button
      size={size}
      variant={status === "ACCEPTED" ? "default" : "outline"}
      disabled={shouldDisableConnectButton(userId)}
      onClick={handleConnect}
      className={className}
    >
      {isConnectionPending(userId) ? (
        <span className="animate-pulse">Sending...</span>
      ) : (
        <>
          {getConnectionIcon()}
          {getConnectionButtonText(userId)}
        </>
      )}
    </Button>
  );
}
