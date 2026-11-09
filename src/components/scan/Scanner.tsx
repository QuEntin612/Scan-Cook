"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

type Props = {
  onDetected: (code: string) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

// Ouvre la caméra arrière et lit les codes-barres EAN-13 et EAN-8.
export default function Scanner({ onDetected, onCancel, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [starting, setStarting] = useState(true);

  // On garde les dernières fonctions reçues sans relancer la caméra à chaque affichage.
  const cb = useRef({ onDetected, onError });
  useEffect(() => {
    cb.current = { onDetected, onError };
  });

  useEffect(() => {
    let controls: IScannerControls | undefined;
    let stopped = false;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      cb.current.onError(
        "La caméra n'est pas disponible ici (elle ne marche qu'en HTTPS). Tape le code-barres ou le nom du produit.",
      );
      return;
    }

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 });

    reader
      .decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        videoRef.current!,
        (result, _err, ctrl) => {
          if (!result || stopped) return;
          stopped = true;
          ctrl.stop();
          if (navigator.vibrate) navigator.vibrate(80); // petit "bip" tactile
          cb.current.onDetected(result.getText());
        },
      )
      .then((c) => {
        controls = c;
        if (stopped) c.stop();
        else setStarting(false);
      })
      .catch((e: unknown) => {
        const name = e instanceof Error ? e.name : "";
        const message =
          name === "NotAllowedError" || name === "SecurityError"
            ? "Tu as refusé l'accès à la caméra. Tu peux l'autoriser dans les réglages du navigateur, ou taper le code-barres ou le nom du produit."
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "Aucune caméra trouvée sur cet appareil. Tape le code-barres ou le nom du produit."
              : name === "NotReadableError"
                ? "La caméra est déjà utilisée par une autre appli. Ferme-la puis réessaie."
                : "Impossible d'ouvrir la caméra. Tape le code-barres ou le nom du produit.";
        cb.current.onError(message);
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, []);

  return (
    <div className="scanner">
      <div className="scanner-view">
        <video ref={videoRef} className="scanner-video" muted playsInline aria-label="Image de la caméra" />
        <div className="scanner-frame" aria-hidden="true">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          <span className="scan-line" />
        </div>
        <p className="scanner-hint" role="status">
          {starting ? "Ouverture de la caméra…" : "Place le code-barres dans le cadre"}
        </p>
      </div>
      <button type="button" className="btn-secondary" onClick={onCancel}>
        Annuler
      </button>
    </div>
  );
}
