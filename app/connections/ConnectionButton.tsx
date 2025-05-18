"use client";
import { Button } from "@/components/ui/button";
import { UserPlus, Check } from "lucide-react";
import { useConnections, ConnectionStatus } from "./useConnections";
import { useEffect } from "react";

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
    checkConnectionStatuses,
  } = useConnections();

  // Use effect to check connection status when component mounts
  useEffect(() => {
    if (userId) {
      checkConnectionStatuses([userId]);
    }
  }, [userId, checkConnectionStatuses]);

  // Get the button text directly based on status
  const buttonText = initialStatus
    ? getButtonTextFromStatus(initialStatus)
    : getButtonTextFromStatus(connectionStatuses[userId]);

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating (important in lists)
    sendConnectionRequest(userId);
  };

  // Local helper function to get text based on status
  function getButtonTextFromStatus(status: ConnectionStatus) {
    if (!status) return "Connect";

    switch (status) {
      case "PENDING":
        return "Request Sent";
      case "ACCEPTED":
        return "Connected";
      case "REJECTED":
        return "Connect";
      default:
        return "Connect";
    }
  }

  const getConnectionIcon = () => {
    const currentStatus = initialStatus || connectionStatuses[userId];

    if (currentStatus === "ACCEPTED") {
      return <Check size={16} className="mr-1" />;
    }

    return <UserPlus size={16} className="mr-1" />;
  };

  return (
    <Button
      size={size}
      variant={
        (initialStatus || connectionStatuses[userId]) === "ACCEPTED"
          ? "default"
          : "outline"
      }
      disabled={shouldDisableConnectButton(userId)}
      onClick={handleConnect}
      className={className}
    >
      {isConnectionPending(userId) ? (
        <span className="animate-pulse">Sending...</span>
      ) : (
        <>
          {getConnectionIcon()}
          {buttonText}
        </>
      )}
    </Button>
  );
}
