
import { useState, useEffect } from 'react';
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import DeleteReview from './DeleteReview';
import UpdateReview from './UpdateReview';

const ShowReviews = (props) => {
    const event = props.event
    const { usersId } = useToken();
    const [reviews, setReviews] = useState('')
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletePopUpOpen, setDeletePopUpOpen] = useState(false);
    const [updatePopUpOpen, setUpdatePopUpOpen] = useState(false);

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
    }, [deletePopUpOpen]);


    if (reviews) {
        return (
            <div className="event-reviews">
                <table>
                    <th> User </th>
                    <th> Raiting </th>
                    <th> Feedback </th>
                    <th> Time </th>
                    <tbody>
                        {reviews.map(review => (
                            <tr key={review.registeration_id}>
                                <td><button onClick={() => handleNavigation(`/user/${review.user_id}`)}> {review.user} </button></td>
                                <td> {review.raiting} </td>
                                <td> {review.comment} </td>
                                <td> {review.date} {review.time}</td>
                                {usersId === review.user_id &&
                                    <td><button onClick={() => openDelete(review)}> Delete Review </button>
                                        <button onClick={() => openUpdate(review)}> Change Review </button></td>}
                            </tr>))}
                    </tbody>
                </table>

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
    } else if (!reviews) {
        return (
            <div className="event-registrations">
                <p> No Reviews Yet </p>
            </div>
        );
    } else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default ShowReviews