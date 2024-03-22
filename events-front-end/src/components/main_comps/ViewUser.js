
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Spinner from "../Loading";
import { useToken } from "../Token";

const ViewUser = () => {
    const { isMasterUser } = useToken()
    const { user_id } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const result = await fetch(`http://127.0.0.1:5000/get_user_by_id/${user_id}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json"
                    }
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
                    const data = await result.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error during fetch:', error);

            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []);

    if (loading) {
        return (
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else if (user) {
        return (
            <div className="user-page">
                <div className="user-display">
                    <p>{user.user_id}</p>
                    <p>{user.username}</p>
                    <p>{user.name}</p>
                    <p>{user.description}</p>
                    <p>{user.created}</p>
                    <p>{user.is_active}</p>
                    {user.is_master === 'Admin' && <p>{user.is_master}</p>}
                    {isMasterUser && <p>{user.email}</p>}
                </div>
            </div >
        )
    }
    else if (!user) {
        return (
            <div className="events-none">
                <p> No User Found </p>
            </div>
        );
    }
    else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default ViewUser