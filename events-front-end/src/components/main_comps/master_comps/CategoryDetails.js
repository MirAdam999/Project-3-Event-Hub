
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Window.css';

const CategoryDetails = (props) => {
    const { storedToken } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [events, setEvents] = useState([]);
    const category = props.category
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const category_id = category.category_id
                const result = await fetch(`http://127.0.0.1:5000/get_events_by_category/${category_id}`, {
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
                    setEvents(data.events_by_cat);
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
    } else if (events) {
        return (
            <div className="window-inner">
                <div className="events-by-cat">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <div className="events-by-cat-header">
                        <h1> All Events Under "{category.name}" , ID {category.category_id}</h1>
                        <p> Total: {category.count} events</p>
                        <p> Description: </p>
                        <p> {category.description} </p>
                    </div>
                    <div className="events-by-cat-display">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Organiser</th>
                                    <th>Privacy</th>
                                    <th>Status</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.event_id}>
                                        <td>{event.event_id}</td>
                                        <td>{event.title}</td>
                                        <td>{event.location}</td>
                                        <td>{event.date}</td>
                                        <td>{event.time}</td>
                                        <td><button onClick={() => handleNavigation(`/user/${event.organizer_id}`)}>{event.organizer_id}, ID:
                                            {event.organizer_name}</button></td>
                                        <td>{event.is_private}</td>
                                        <td>{event.is_canceled}</td>
                                        <td><button onClick={() => handleNavigation(`/view_event/${event.event_id}`)}> View Event </button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div >
            </div>
        )
    }
    else if (!events) {
        return (
            <div className="window-inner">
                <div className="events-by-cat">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <div className="events-by-cat-header">
                        <h1> All Events Under "{category.name}" , ID {category.category_id}</h1>
                        <p> Total: {category.count} events</p>
                        <p> Description: </p>
                        <p> {category.description} </p>
                    </div>
                    <div className="events-none">
                        <p> - No Events Found under the Category -  </p>
                    </div>
                </div >
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

export default CategoryDetails