
import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useToken } from '../../Token';
import Register from './Register';
import CancelRegistration from './CancelRegister';
import ShowRegistrations from './ShowRegistrations';
import UpdateEvent from './UpdateEvent';
import CancelEvent from './CancelEvent';
import ShowReviews from './ShowReviews';
import AddReview from './AddReview';
import ShowImages from './ShowImages';
import AddImage from './AddImage';
import Spinner from "../../Loading";
import '@fortawesome/fontawesome-free/css/all.css';

const ViewEvent = (props) => {
    const { storedToken } = useToken();
    const [cancelEventIsOpen, setCancelEventIsOpen] = useState(false);
    const [updateEventIsOpen, setUpdateEventIsOpen] = useState(false);
    const [cancelRegistrationIsOpen, setCancelRegistrationIsOpen] = useState(false);
    const [reviewsIsOpen, setReviewsIsOpen] = useState(true);
    const [addImageIsOpen, setAddImageIsOpen] = useState(false);
    const [addReviewIsOpen, setAddReviewIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState('')
    const [user, setUser] = useState('None')
    const [errorMessage, setErrorMessage] = useState('');
    const [hasEventPassed, setHasEventPassed] = useState(false);
    const { event_id } = useParams();
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    function openImages() {
        setReviewsIsOpen(false);
    }

    function openReviews() {
        setReviewsIsOpen(true);
    }

    function openAddImage() {
        setAddImageIsOpen(true);
    }

    function closeAddImage() {
        setAddImageIsOpen(false);
    }

    function openAddReview() {
        setAddReviewIsOpen(true);
    }

    function closeAddReview() {
        setAddReviewIsOpen(false);
    }

    function openCancelEvent() {
        setCancelEventIsOpen(true);
    }

    function closeCancelEvent() {
        setCancelEventIsOpen(false);
    }

    function openUpdateEvent() {
        setUpdateEventIsOpen(true);
    }

    function closeUpdateEvent() {
        setUpdateEventIsOpen(false);
    }

    function openCancelRegistration() {
        setCancelRegistrationIsOpen(true);
    }

    function closeCancelRegistration() {
        setCancelRegistrationIsOpen(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetch(`http://127.0.0.1:5000/get_event_by_id/${event_id}`, {
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
                    setEvent(data.event);
                    setUser(data.user_status);
                    const eventDate = data.event.date;
                    const eventTime = data.event.time;
                    const [day, month, year] = eventDate.split("-");
                    const [hour, minute] = eventTime.split(":");
                    const eventDateTime = new Date(`${year}-${month}-${day}T${hour}:${minute}`);
                    const currentDateTime = new Date();
                    setHasEventPassed(eventDateTime < currentDateTime);

                }
            } catch (error) {
                console.error('Error during fetch:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [event_id, addImageIsOpen, cancelRegistrationIsOpen, cancelEventIsOpen, addReviewIsOpen]);

    return (
        <div className="view-event">
            <div className="event-details">
                <img
                    src={`data:image/png;base64,${event.image}`}
                    alt={event.title}
                    className="event-image"
                />
                <p className="event-title">{event.title}</p>
                <p className="event-event_id">{event.event_id}</p>
                <p className="event-location">{event.location}</p>
                <p className="event-date">{event.date}</p>
                <p className="event-time">{event.time}</p>
                <button onClick={() => handleNavigation(`/user/${event.organizer_id}`)}><p className="event-organizer_name">{event.organizer_name}</p></button>
                <p className="event-category">{event.category}</p>
                <p className="event-description">{event.description}</p>
                <p className="event-is_private">{event.is_private}</p>
                {event.is_canceled === 'Canceled' && <p className="event-is_canceled">The Event Is Canceled</p>}
            </div>

            {user === 'Organiser' && !hasEventPassed && event.is_canceled !== 'Canceled' &&
                <div className='event-organiser-functions'>
                    <button onClick={openUpdateEvent}> Update Event </button>
                    {updateEventIsOpen && <UpdateEvent onClose={closeUpdateEvent} event={event} />}
                    <button onClick={openCancelEvent}> Cancel Event </button>
                    {cancelEventIsOpen && <CancelEvent onClose={closeCancelEvent} event_id={event.event_id} event_title={event.title} />}
                    <h2> Registrations </h2>
                    <ShowRegistrations event={event} />
                </div>
            }
            {user === 'Organiser' && hasEventPassed && event.is_canceled !== 'Canceled' &&
                <div className='event-organiser-add-photo'>
                    <button onClick={openAddImage}> Upload Photo From The Event </button>
                    {addImageIsOpen && <AddImage onClose={closeAddImage} event_id={event.event_id} role={'Organiser'} />}
                </div>
            }
            {user === 'Attended' && hasEventPassed && event.is_canceled !== 'Canceled' &&
                <div className='event-add-review'>
                    <button onClick={openAddReview}> Write A Review </button>
                    {addReviewIsOpen && <AddReview onClose={closeAddReview} event_id={event.event_id} />}
                    <button onClick={openAddImage}> Upload Photo From The Event </button>
                    {addImageIsOpen && <AddImage onClose={closeAddImage} event_id={event.event_id} role={'Attendee'} />}
                </div>
            }

            {hasEventPassed && event.is_canceled !== 'Canceled' &&
                <div>
                    <button onClick={openReviews}> Reviews </button>
                    <button onClick={openImages}> Images </button>
                    {reviewsIsOpen && <ShowReviews event={event} />}
                    {!reviewsIsOpen && <ShowImages event={event} />}
                </div>}

            {user === 'Registered' && !hasEventPassed &&
                <div className='event-cancel-registration'>
                    <button onClick={openCancelRegistration}> Cancel Registration </button>
                    {cancelRegistrationIsOpen && <CancelRegistration onClose={closeCancelRegistration} event_id={event.event_id} event_title={event.title} />}
                </div>
            }

            {event.is_canceled !== 'Canceled' && user === 'None' && !hasEventPassed &&
                <div>
                    <Register event_id={event_id} onLogIn={props.onLogIn} />
                    {event.is_private === 'Private' &&
                        <div>
                            <p><i class="fa-solid fa-circle-exclamation"></i>
                                Important Notice: The Event is marked Private, your Registration will requre approval from the Organiser.</p></div>}
                </div>}

            {loading &&
                <div className="events-loading">
                    <Spinner />
                </div>
            }
            {errorMessage &&
                <div className="events-err">
                    <p className="error-message">{errorMessage}</p>
                </div>
            }
        </div >
    )
}

export default ViewEvent