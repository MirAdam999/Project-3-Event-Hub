
import { useState } from "react";
import { useToken } from "./Token";
import { useURL } from "./URL";
import '../style/Pop-Up.css';

const LogOutPopUp = (props) => {
    const { storedURL } = useURL();
    const { setToken, setName, setIsMasterPermission } = useToken();
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogout = async (e) => {
        try {
            const result = await fetch(`${storedURL}/logout`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                }
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
                setToken(null);
                setName(null);
                setIsMasterPermission(false);
                props.onClose();
                if (e.target && e.target.form) {
                    e.target.form.reset();
                }
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    };


    return (
        <div className="popup">
            <div className="popup-inner">
                <div className="logout">
                    <p id='log-header'>Log Out?</p>
                    <div className="logout-buttons">
                        <button className="logout-button" onClick={handleLogout}> Log Out </button>
                        <button className="cancel-button" onClick={props.onClose}> Cancel </button>
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
                <div className="close"><button onClick={props.onClose}>X</button></div>
            </div>
        </div >
    )
}

export default LogOutPopUp