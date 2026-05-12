import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserFish } from '../hooks/useUserFish';
import { processFishImage } from '../utils/processFishImage';
import './UserFishModal.css';

// ──────────────────────────────────────────────────────────────────────
// Lets the user upload up to MAX_USER_FISH images. Each upload is
// auto-trimmed of its white/transparent border and downscaled before it
// goes to localStorage. Existing fish are listed with a delete button.
// ──────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserFishModal({ open, onClose }: Props) {
  const { fish, add, remove, max } = useUserFish();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const full = fish.length >= max;

  const onPick = () => {
    if (full || busy) return;
    fileInputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so picking the same file again still fires onChange
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('please pick an image file');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const dataUrl = await processFishImage(file);
      add(dataUrl);
    } catch {
      setErr('couldn\'t process that image. try another?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="userFishOverlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="userFishBox"
            onClick={e => e.stopPropagation()}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="userFishClose" onClick={onClose} aria-label="close">×</button>

            <p className="userFishLabel">[ your aquarium ]</p>
            <h2 className="userFishTitle">drop a fish in</h2>
            <p className="userFishHint">
              upload an image and it&apos;ll drift through the aquarium. it&apos;s saved only on
              this browser. {fish.length} / {max} slots used.
            </p>

            {fish.length > 0 && (
              <div className="userFishList">
                {fish.map(f => (
                  <div className="userFishCard" key={f.id}>
                    <img src={f.dataUrl} alt="" className="userFishThumb" />
                    <button
                      className="userFishRemove"
                      onClick={() => remove(f.id)}
                      title="remove this fish"
                      aria-label="remove fish"
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="userFishActions">
              <button
                className="userFishBtn userFishBtnPrimary"
                onClick={onPick}
                disabled={full || busy}
              >
                {busy ? 'processing…' : full ? 'full — remove one first' : '+ add a fish'}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onFile}
                style={{ display: 'none' }}
              />
              <button className="userFishBtn" onClick={onClose}>close</button>
            </div>

            {err && <p className="userFishErr">{err}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
