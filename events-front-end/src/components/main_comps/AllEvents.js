
import { useState, useEffect } from "react";
import { useToken } from '../Token';
import Spinner from "../Loading";

const AllEvents = () => {
    const { getToken } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const token = getToken();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch("http://127.0.0.1:5000/all_events", {
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
                    setEvents(data.all_events);
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
                    <p> All Events </p>
                </div>
                <div className="events-display">
                    {events.map(event => (
                        <button>
                            <div className="event-on-grid" key={event.event_id}>
                                <img src={event.image} />
                                <p className="event-event_id">{event.event_id}</p>
                                <p className="event-title">{event.title}</p>
                                <p className="event-location">{event.location}</p>
                                <p className="event-date">{event.date}</p>
                                <p className="event-time">{event.time}</p>
                                <p className="event-organizer_id">{event.organizer_id}</p>
                                <p className="event-organizer_name">{event.organizer_name}</p>
                                <p className="event-category">{event.category}</p>
                                <p className="event-is_canceled">{event.is_canceled}</p>
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
                <p> No Events Found </p>
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

export default AllEvents