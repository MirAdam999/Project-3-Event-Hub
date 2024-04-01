
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../Token';
import Spinner from "../Loading";
import '../../style/main/SearchEvent.css'
import '../../style/main/Events.css'

const MyEvents = () => {
    const { storedToken, usersName } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch("http://127.0.0.1:5000/my_events", {
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
                    const data = await result.json();
                    setEvents(data.my_events);
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
            <div className="events">
                <div className="events-header">
                    <p> {usersName}'s Events </p>
                </div>
                <div className="events-loading">
                    <Spinner />
                </div>
            </div>
        );
    } else if (events) {
        return (
            <div className="events">
                <div className="events-header">
                    <p> {usersName}'s Events </p>
                </div>
                <div className="events-display">
                    {events.map(event => (
                        <button className="open-event" onClick={() => handleNavigation(`/view_event/${event.event_id}`)}>
                            <div className="event-on-grid" key={event.event_id}>
                                <div className="event-image-container">
                                    <img
                                        src={`data:image/png;base64,${event.image}`}
                                        alt={event.title}
                                        className="event-image"
                                    />
                                    {event.is_canceled === "Canceled" && <div className="event-is_canceled">CANCELED</div>}
                                </div>
                                <div className="event-on-grid-text">
                                    <div className="event-on-grid-text-top">
                                        <div className="event-on-grid-text-top-left">
                                            <p className="event-title">{event.title}</p>
                                        </div>
                                        <div className="event-on-grid-text-top-right">
                                            <p className="event-date">{event.date}</p>
                                            <p className="event-time">{event.time}</p>
                                        </div>
                                    </div>
                                    <div className="event-on-grid-text-bottom">
                                        <p className="event-location"> Location: {event.location}</p>
                                        <p className="event-is_private">{event.is_private} Event</p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

            </div >
        )
    }
    else if (!events) {
        return (
            <div className="events">
                <div className="events-none">
                    <p> No Events Yet Organized by {usersName}</p>
                    <button className="go-to-add-event" onClick={() => handleNavigation('/add_event')}> + Add Event </button>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="events">
                <div className="events-err">
                    <p className="error-message">{errorMessage}</p>
                </div>
            </div>
        );
    }
}

export default MyEvents