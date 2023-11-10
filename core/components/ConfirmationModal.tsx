import React from "react";
import Modal from './Modal';
import Card from './Card';
import IconButton from './IconButton';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const ConfirmationModal: React.FC<{
    modalOpen: boolean;
    onModalClose: () => void;
    waitingResponse: boolean;
    onConfirmClick: () => void;
    confirmationText: string;
}> = ({ modalOpen, onModalClose, waitingResponse, onConfirmClick, confirmationText }) => {
    return (
        <Modal open={modalOpen} onClose={onModalClose}>
            <Card className="flex w-full items-center justify-center flex-col space-y-8">
                {waitingResponse ?
                    `Waiting for transaction confirmation`
                    :
                    confirmationText
                }
                <div className="p-4 flex space-x-4">
                    {waitingResponse ?
                        <>
                            <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600" />
                        </>
                        :
                        <>
                            <IconButton IconComponent={FaTimes} name="Cancel" onClick={onModalClose}>
                                <span>Cancel</span>
                            </IconButton>
                            <IconButton
                                IconComponent={FaPaperPlane}
                                name="Send"
                                onClick={onConfirmClick}
                                primary
                                disabled={waitingResponse}
                            >
                                <span>Send</span>
                            </IconButton>
                        </>
                    }
                </div>
            </Card>
        </Modal>
    );

};

export default ConfirmationModal;