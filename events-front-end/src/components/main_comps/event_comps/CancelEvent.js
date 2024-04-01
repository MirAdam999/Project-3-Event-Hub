
import { useToken } from '../../Token';
import { useState } from 'react';
import Spinner from "../../Loading";
import '../../../style/Pop-Up.css';

const CancelEvent = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCancel = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/cancel_event/${props.event_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken

                })
            })
            if (!result.ok) {
                const data = await result.json();

                if (data.error) {
                    console.error('Error from backend:', data.error);
                    setErrorMessage(data.error);

                } else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    props.onClose();
                }, 5000);
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="popup">
            <div className="popup-inner">

                <div className="revoke-admin">
                    <p className='revoke-haeder'>Cancel Event {props.event_title}?</p>
                    <div className="revoke-bottons">
                        <button className="approve-button" onClick={handleCancel}> Cancel Event </button>
                        <button className="cancel-button" onClick={props.onClose}> Exit </button>
                    </div>
                    {loading && <div className="events-loading">
                        <Spinner />
                    </div>}
                    {isSuccess &&
                        <p className="sucsess-message"> Event Canceled </p>
                    }
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>

                <div className="close"><button onClick={props.onClose}>X</button></div>
            </div>
        </div >
    )
}

export default CancelEvent