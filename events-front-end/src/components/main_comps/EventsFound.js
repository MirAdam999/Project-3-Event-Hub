
import { useNavigate } from 'react-router-dom';

const EventsFound = (props) => {
    const errorMessage = props.error;
    const events = props.events;
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    if (events) {
        return (
            <div className="events">
                <div className="events-display">
                    {events.map(event => (
                        <button className="open-event" onClick={() => handleNavigation(`/view_event/${event.event_id}`)}>
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
                                <p className="event-is_private">{event.is_private}</p>
                                <p className="event-is_canceled">{event.is_canceled}</p>
                            </div>
                        </button>
                    ))}
                </div>

            </div >
        )
    }
    else if (errorMessage) {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
    else {
        return (
            <div className="events-none">
                <p> No Events Matching Search Found</p>
            </div>
        );
    }
}

export default EventsFound