
import { useState } from 'react';
import { useToken } from '../../Token';
import { useURL } from "../../URL";
import Spinner from "../../Loading";
import '../../../style/Pop-Up.css';

const DeleteImage = (props) => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const { storedToken } = useToken();
    const { storedURL } = useURL();

    const handleDelete = async (e) => {
        setLoading(true)
        try {
            const result = await fetch(`${storedURL}/delete_image/${props.image_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken
                })
            });

            if (!result.ok) {
                const data = await result.json();

                if (data.error) {
                    console.error('Error from backend:', data.error);
                    setErrorMessage(data.error);
                }
                else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }
            }
            else {
                setSucsess(true)
                setTimeout(() => {
                    props.onClose();
                    props.closeAll();
                }, 5000);
                if (e.target && e.target.form) {
                    e.target.form.reset();
                }
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="popup">
            <div className="popup-inner">

                <div className="revoke-admin">
                    <p className='revoke-haeder'>Delete The Image?</p>
                    <div className="revoke-bottons">
                        <button className="approve-button" onClick={handleDelete}> Delete </button>
                        <button className="cancel-button" onClick={props.onClose}> Cancel </button>
                    </div>
                    {loading && <div className="events-loading">
                        <Spinner />
                    </div>}
                    {sucsess &&
                        <p className="sucsess-message"> Image Deleted Sucsessfully </p>
                    }
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>

                <div className="close"><button onClick={props.onClose}>X</button></div>
            </div>
        </div >
    )
}

export default DeleteImage