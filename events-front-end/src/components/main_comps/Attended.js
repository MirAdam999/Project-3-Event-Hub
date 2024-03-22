
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../Token';
import Spinner from "../Loading";

const AttendedEvents = () => {
    const { storedToken } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [eventsAndRegistrations, setEventsAndRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch("http://127.0.0.1:5000/attended", {
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
                    setEventsAndRegistrations(data.attended);
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
    } else if (eventsAndRegistrations) {
        return (
            <div className="events">
                <div className="events-header">
                    <p> Attended Events </p>
                </div>
                <div className="events-display">
                    {eventsAndRegistrations.map(event => (
                        <button onClick={() => handleNavigation(`/view_event/${event.event_id}`)}>
                            <div className="event-on-grid" key={event.event_id}>
                                <img
                                    src={`data:image/png;base64,${event.image}`}
                                    alt={event.title}
                                    className="event-image"
                                />
                                <p className="event-event_id">{event.event_id}</p>
                                <p className="event-title">{event.title}</p>
                                <p className="event-location">{event.location}</p>
                                <p className="event-date">{event.date}</p>
                                <p className="event-time">{event.time}</p>
                                <p className="event-organizer_name">{event.organizer_name}</p>
                                <p className="event-category">{event.category}</p>
                                <p className="event-is_canceled">{event.is_canceled}</p>
                                <p className="registration_id">{event.registration_id}</p>
                                <p className="registration_datetime">{event.registration_datetime}</p>
                                <button> Leave Review + </button>
                            </div>
                        </button>
                    ))}
                </div>

            </div >
        )
    }
    else if (!eventsAndRegistrations) {
        return (
            <div className="events-none">
                <p> No Attended Events Found </p>
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

export default AttendedEvents