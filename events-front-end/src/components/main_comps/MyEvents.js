
import { useState, useEffect } from "react";
import { useToken } from '../Token';
import Spinner from "../Loading";

const MyEvents = () => {
    const { getToken, getName } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const users_name = getName();
    const token = getToken();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch("http://127.0.0.1:5000/my_events", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token: token
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
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else if (events.length > 0) {
        return (
            <div className="events">
                <div className="events-header">
                    <p> {users_name}'s Events </p>
                </div>
                <div className="events-display">
                    {events.map(event => (
                        <button>
                            <div className="event-on-grid" key={event.event_id}>
                                <img
                                    src={`data:image/png;base64,${event.image}`}
                                    alt={event.title}
                                    className="event-image"
                                />
                                <p className="event-title">{event.title}</p>
                                <p className="event-date">{event.date}</p>
                                <p className="event-time">{event.time}</p>
                                <p className="event-location">{event.location}</p>
                                <button className="event-action"> Update </button>
                            </div>
                        </button>
                    ))}
                </div>

            </div >
        )
    }
    else if (events.length = 0) {
        return (
            <div className="events-none">
                <p> No Events Yet Organized by {users_name}</p>
                <button className="green-button"> + Add Event </button>
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

export default MyEvents