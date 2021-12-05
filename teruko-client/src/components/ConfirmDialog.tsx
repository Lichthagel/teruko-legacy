import React, { FunctionComponent } from "react";
import { default as CheckIcon } from "@mui/icons-material/Check";
import { default as CloseIcon } from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";

const ConfirmDialog: FunctionComponent<{ open: boolean; setOpen: (open: boolean) => void; text: string; onConfirm: () => void }> = ({ open, setOpen, text, onConfirm }) =>
    <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{text}</DialogTitle>
        <DialogActions>
            <Button color="error" startIcon={<CloseIcon />} onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="success" startIcon={<CheckIcon />} onClick={() => onConfirm()}>Confirm</Button>
        </DialogActions>
    </Dialog>;

export default ConfirmDialog;