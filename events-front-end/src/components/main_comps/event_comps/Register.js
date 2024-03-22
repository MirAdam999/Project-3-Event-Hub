import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";

const Register = (props) => {
    const { storedToken } = useToken();
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleRegistration = async (e) => {
        if (storedToken) {
            e.preventDefault();
            setLoading(true)
            try {
                const result = await fetch(`http://127.0.0.1:5000/register/${props.event_id}`, {
                    method: 'POST',
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

                    } else {
                        throw new Error(`HTTP error! Status: ${result.status}`);
                    }

                } else {
                    setIsSuccess(true);
                }

            } catch (error) {
                console.error('Error during fetch:', error);

            } finally {
                setLoading(false);
            }
        } else {
            props.onLogIn()
        }
    }

    return (
        <div className="register-to-event">
            <button onClick={handleRegistration}> Register For The Event! </button>
            {loading &&
                <div className="events-loading">
                    <Spinner />
                </div>
            }
            {isSuccess &&
                <div className="sucsess-message">
                    <p>Registration Sucsessful!</p>
                    <p> You can now view the Events or cancel registration under 'My Registrations'.</p>
                    <button onClick={() => handleNavigation('/my_registrations')}> Go To My Registrations </button>
                </div>}
            {errorMessage &&
                <div className="events-err">
                    <p className="error-message">{errorMessage}</p>
                </div>
            }
        </div>
    )

}

export default Register