import React from "react";
import { FaCheck } from "react-icons/fa";
import Card from "./Card";
import IconButton from "./IconButton";
import Modal from "./Modal";
import CopiableText from './CopiableText';

const TransactionModal: React.FC<{
    modalOpen: boolean;
    onModalClose: () => void;
    transactionSuccess: boolean;
    transactionFailed: boolean;
    transactionId: string | null;
}> = ({ modalOpen, onModalClose, transactionSuccess, transactionFailed, transactionId }) => {

    return (
        <Modal open={modalOpen} onClose={onModalClose}>
            <Card className="flex w-full items-center justify-center flex-col space-y-8">
                {transactionSuccess ?
                    `Transaction Successful`
                    :
                    transactionFailed ? `Transaction Failed` : `Transaction Unknown`
                }
                <div className='pt-6'>
                    {transactionSuccess && transactionId ? <CopiableText text={transactionId} full={false} showCopiedText={true} /> : null}
                </div>
                <div className="pb-4 flex space-x-4">
                    <IconButton
                        IconComponent={FaCheck}
                        name="Ok"
                        onClick={() => onModalClose()}
                        primary
                    >
                    </IconButton>
                </div>
            </Card>
        </Modal>
    )
}

export default TransactionModal;