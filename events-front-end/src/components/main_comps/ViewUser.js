
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Spinner from "../Loading";
import { useToken } from "../Token";
import { useURL } from "../URL";
import '../../style/main/UserPage.css'

const ViewUser = () => {
    const { storedURL } = useURL();
    const { isMasterUser } = useToken()
    const { user_id } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState([]);
    const [usersEvents, setUsersEvents] = useState([]);
    const [usersEventsCount, setUsersEventsCount] = useState('');
    const [usersAttendedCount, setUsersAttendedCount] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const result = await fetch(`${storedURL}/get_user_by_id/${user_id}`, {
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
                    setUsersEvents(data.users_events);
                    setUsersEventsCount(data.users_events_count.events_count);
                    setUsersAttendedCount(data.users_attended_count.attended_count);
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
            <div className="user-page">
                <div className="events-loading">
                    <Spinner />
                </div>
            </div>
        );
    } else if (user) {
        return (
            <div className="user-page">
                <div className="user-display">
                    <div className="user-top">
                        <p id='user-full-name'>{user.name}</p>
                        <p id='user-about-title'>About {user.name}:</p>
                        <p>{user.description}</p>
                    </div>
                    <div className="user-mid">
                        <p>User ID: {user.user_id}</p>
                        <p>Username: {user.username}</p>
                    </div>
                    <div className="user-bottom">
                        <p>Joined At: {user.created}</p>
                        <p>Status: {user.is_active}</p>
                    </div>
                    <div className="user-admin-display">
                        {user.is_master === 'Admin' && <p>{user.name} is an {user.is_master}</p>}
                        {isMasterUser && <p>Email: {user.email}</p>}
                    </div>
                </div>

                <div className="user-statistic">
                    <p> Organised {usersEventsCount} Events</p>
                    <p> Attended {usersAttendedCount} Events</p>
                </div>

                {usersEvents.length > 0 && <div className="users-events">
                    <p>Events Organised By {user.name}</p>
                    <table>
                        <th>Event ID</th>
                        <th> Title</th>
                        <th> Location </th>
                        <th> Date </th>
                        <th>Time</th>
                        <th>Category</th>
                        <th>Type</th>
                        {usersEvents.map(event => (
                            <tr onClick={() => handleNavigation(`/view_event/${event.event_id}`)} key={event.event_id}>
                                <td>{event.event_id}</td>
                                <td>{event.title}</td>
                                <td>{event.location}</td>
                                <td>{event.date}</td>
                                <td>{event.time}</td>
                                <td>{event.category}</td>
                                <td>{event.is_private}</td>
                            </tr>))}
                    </table>
                </div>}

            </div >
        )
    }
    else if (!user) {
        return (
            <div className="user-page">
                <div className="events-none">
                    <p> No User Found </p>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="user-page">
                <div className="events-err">
                    <p className="error-message">{errorMessage}</p>
                </div>
            </div>
        );
    }
}

export default ViewUser