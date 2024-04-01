
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import DeleteReview from './DeleteReview';
import UpdateReview from './UpdateReview';
import '@fortawesome/fontawesome-free/css/all.css';

const ShowReviews = (props) => {
    const event = props.event
    const { usersId } = useToken();
    const [reviews, setReviews] = useState('')
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletePopUpOpen, setDeletePopUpOpen] = useState(false);
    const [updatePopUpOpen, setUpdatePopUpOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    function openDelete(review) {
        setDeletePopUpOpen(review);
    }

    function closeDelete() {
        setDeletePopUpOpen(false);
    }

    function openUpdate(review) {
        setUpdatePopUpOpen(review);
    }

    function closeUpdate() {
        setUpdatePopUpOpen(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetch(`http://127.0.0.1:5000/get_reviews/${event.event_id}`, {
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
                    setReviews(data.reviews);
                }
            } catch (error) {
                console.error('Error during fetch:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deletePopUpOpen, updatePopUpOpen, props.flagRefreshReviews]);


    if (loading) {
        return (
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else if (!reviews) {
        return (
            <div className="event-registrations">
                <p> No Reviews Yet </p>
            </div>
        );
    } else if (reviews) {
        return (
            <div className="event-reviews">
                {reviews.map(review => (
                    <div className='review' key={review.registeration_id}>
                        <p id='reviewer' onClick={() => handleNavigation(`/user/${review.user_id}`)}>By:  {review.user} </p>
                        <p id='raiting'>Raiting: {review.raiting}/5 </p>
                        <p id='brackets'><i class="fa-solid fa-quote-left"></i></p>
                        <p id='review-comment'>{review.comment}</p>
                        <p id='brackets-right'><i class="fa-solid fa-quote-right"></i></p>
                        <p id='review-datetime'>Reviewed At: {review.date} {review.time}</p>
                        {usersId === review.user_id &&
                            <div id='reviewer-actions'>
                                <button id='reviewer-actions-delete' onClick={() => openDelete(review)}> Delete Review </button>
                                <button id='reviewer-actions-update' onClick={() => openUpdate(review)}> Change Review </button>
                            </div>}
                    </div>))}


                {deletePopUpOpen &&
                    <DeleteReview review={deletePopUpOpen} onClose={closeDelete} />}

                {updatePopUpOpen &&
                    <UpdateReview review={updatePopUpOpen} onClose={closeUpdate} />}

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
    } else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default ShowReviews