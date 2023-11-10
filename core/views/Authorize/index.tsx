import React, { useEffect, useState } from 'react';
import { ActionTypes, useStore } from '../../utils/store';
import { SecureMessageTypes, useSecureStorage } from '../../utils/storage';
import browser from 'webextension-polyfill';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import IconButton from '../../components/IconButton';

const Authorize: React.FC = () => {
    const { state, dispatch } = useStore();
    const [request, setRequest] = useState<any>({});
    const storage = useSecureStorage();
    const [responseOriginTabID, setResponseOriginTabID] = useState();

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        browser.runtime.onMessage.addListener((
            message: { type: keyof typeof SecureMessageTypes; data: any },
            sender,
            sendResponse: (data: any) => void
        ) => {
            if (message.type === SecureMessageTypes.authorization) {
                setRequest(request);
                dispatch(ActionTypes.UPDATE_DATA, {
                    name: 'savedRequest',
                    data: request,
                });
                setResponseOriginTabID(message.data.request.originTabID)
            }
        });

        window.addEventListener('beforeunload', deny);
        return () => window.removeEventListener('beforeunload', deny);
    }, []);

    const deny = async () => {
        let response = await storage.authorizationDeny({ responseOriginTabID: responseOriginTabID });
        console.log("response", response)
    }

    const grant = async () => {
        let response = await storage.authorizationAllow({ responseOriginTabID: responseOriginTabID });
        console.log("response", response)
    };

    return (
        <div>
            <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
                Aprove <span className="blue">Requests</span>
            </h1>
            <div className="flex-col justify-center">
                <div className="flex">
                    <div className="hero-body py-5">
                        {request.favIconUrl &&
                            <img className='float-left' src={request.favIconUrl} width="48" />
                        }
                        <h1 className="title is-size-4 ml-58px">
                            ${request.originTitle} requested access to your wallet
                        </h1>
                    </div>
                    <div className="py-0">
                        <h3> This will grant {request.originTitle} the following privileges: </h3>
                        <ul className="pl-5 mt-5">
                            <li><b>Read</b> the list of <b>accounts</b> in this wallet per supported ledger.</li>
                            <li className="mt-4">
                                <b>Send you requests for transactions.</b> You will have the chance to review all
                                transactions and will need to sign each with your wallets password.
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mx-5 mb-3 flex">
                    <IconButton IconComponent={FaTimes} name="Cancel" onClick={deny}>
                        <span>Cancel</span>
                    </IconButton>
                    <IconButton
                        IconComponent={FaPaperPlane}
                        name="Send"
                        onClick={grant}
                        primary
                    >
                        <span>Send</span>
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default Authorize;
