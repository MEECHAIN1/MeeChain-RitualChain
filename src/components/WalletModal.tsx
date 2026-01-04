import React, { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import { translations } from "../utils/translations";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletName: string, address?: string) => void;
  lang: "en" | "th";
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  lang,
}) => {
  const { connect, connectors, error } = useConnect();
  const { address } = useAccount();
  const t = translations[lang];

  // เมื่อ address มีค่า ให้ส่งขึ้นไปยัง parent ผ่าน onConnect (เรียกครั้งเดียวเมื่อ address เปลี่ยน)
  useEffect(() => {
    if (address) {
      onConnect("wagmi", address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  if (!isOpen) return null;

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", background: "#fff" }}>
      <h3>{t.wallet.title}</h3>

      <div>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={!connector.ready}
            style={{ display: "block", marginBottom: 8 }}
          >
            Connect {connector.name}
            {!connector.ready ? " (not available)" : ""}
          </button>
        ))}
      </div>

      <hr />

      {/* Dev Connect: สำหรับ local dev (ไม่ต้องพึ่ง MetaMask/WalletConnect) */}
      <button
        onClick={() =>
          onConnect(
            "DevAccount",
            "0x71562b71999873db5b286dF957af199Ec94617F7"
          )
        }
        style={{ marginTop: 8, display: "block" }}
      >
        Connect Dev Account
      </button>

      {error && <div style={{ color: "red", marginTop: 8 }}>{String(error)}</div>}

      <div style={{ marginTop: 12 }}>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
