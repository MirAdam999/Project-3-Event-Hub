
import { useState, useEffect } from 'react';
import Spinner from "../../Loading";
import ViewImagePopUp from './ViewImage';
import '../../../style/main/ViewEvent.css'

const ShowImages = (props) => {
    const event = props.event
    const [images, setImages] = useState('')
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [imageWIndowIsOpen, setImageWindowOpen] = useState(false);

    function openImage(image) {
        setImageWindowOpen(image);
    }

    function closeImage() {
        setImageWindowOpen(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetch(`http://127.0.0.1:5000/get_images/${event.event_id}`, {
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
                    setImages(data.images);
                }
            } catch (error) {
                console.error('Error during fetch:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [imageWIndowIsOpen, props.flagRefreshImages]);


    if (loading) {
        return (
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else if (!images) {
        return (
            <div className="event-registrations">
                <p> No Images Yet </p>
            </div>
        );
    } else if (images) {
        return (
            <div className="event-images">
                {images.map(image => (
                    <div className="images-on-grid" key={image.image_id}>
                        <img
                            src={`data:image/png;base64,${image.image}`}
                            alt={image.image_id}
                            className="event-uploaded-image"
                            onClick={() => openImage(image)}
                        />
                    </div>
                ))}

                {imageWIndowIsOpen && <div className="window">
                    <ViewImagePopUp onClose={closeImage} image={imageWIndowIsOpen} />
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
    } else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default ShowImages