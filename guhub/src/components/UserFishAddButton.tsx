import { useState } from 'react';
import UserFishModal from './UserFishModal';
import './UserFishModal.css';

// Small "+ fish" button shown on /view_deck. Opens the upload modal.
// The button gets the .userFishAddBtn class which is also targeted by
// view_deck's idle-fade CSS, so it disappears with the rest of the
// chrome after 5s of stillness.

export default function UserFishAddButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="userFishAddBtn"
        onClick={() => setOpen(true)}
        title="add a fish"
      >
        + fish
      </button>
      <UserFishModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
