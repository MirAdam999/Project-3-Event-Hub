
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../Token';
import Spinner from "../Loading";
import '../../style/main/SearchEvent.css'
import '../../style/main/Events.css'

const MyRegistrations = () => {
    const { storedToken, usersName } = useToken();
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
                const result = await fetch("http://127.0.0.1:5000/my_registrations", {
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
                    setEventsAndRegistrations(data.my_registrations);
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
                    <p> {usersName}'s Registrations </p>
                </div>
                <div className="events-loading">
                    <Spinner />
                </div>
            </div>
        );
    } else if (eventsAndRegistrations) {
        return (
            <div className="events">
                <div className="events-header">
                    <p> {usersName}'s Registrations </p>
                </div>
                <div className="events-display">
                    {eventsAndRegistrations.map(event => (
                        <button id='open-event-attended-registred' className="open-event" onClick={() => handleNavigation(`/view_event/${event.event_id}`)}>
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
                                            <p className="event-organiser">By: {event.organizer_name}</p>
                                        </div>
                                        <div className="event-on-grid-text-top-right">
                                            <p className="event-date">{event.date}</p>
                                            <p className="event-time">{event.time}</p>
                                        </div>
                                    </div>
                                    <div id='attended-event-bottom' className="event-on-grid-text-bottom">
                                        <p id='attended-event-location' className="event-location"> Location: {event.location}</p>
                                    </div>
                                    <div className="registration-data">
                                        <p id="registration_status">Registration Status: {event.registration_status}</p>
                                        <p className="registration_id">Registration ID: {event.registration_id}</p>
                                        <p className="registration_datetime">Registered At: {event.registration_datetime}</p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

            </div >
        )
    }
    else if (!eventsAndRegistrations) {
        return (
            <div className="events">
                <div className="events-none">
                    <p> No Registrations Yet for {usersName} </p>
                    <p className="call-to-search"> Find an Event that fits Your Interests:</p>
                    <button className="go-to-add-event" onClick={() => handleNavigation('/search_event')}> <i class="fa-solid fa-magnifying-glass"></i> Search Event </button>
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

export default MyRegistrations