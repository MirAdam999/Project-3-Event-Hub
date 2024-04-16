
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../Token';
import { useURL } from "../URL";
import Spinner from "../Loading"
import '../../style/main/AddEvent.css'
import '@fortawesome/fontawesome-free/css/all.css';

const AddEvent = () => {
    const { storedToken } = useToken();
    const { storedURL } = useURL();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const title = useRef();
    const description = useRef();
    const location = useRef();
    const date = useRef();
    const time = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [category, setCategory] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [previewURL, setPreviewURL] = useState(null);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${storedURL}/get_categories`);
                const result = await response.json();

                if ('categories' in result) {
                    setCategory(result.categories);
                } else {
                    console.error('Error: No categories key in the response');
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleCheckboxChange = () => {
        setIsPrivate(!isPrivate);
    };

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setFileError('');

        const allowedFormats = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedFormats.includes(`.${fileExtension}`)) {
            setFileError("Wrong file format. Allowed Formats: '.jpg', '.jpeg', '.png', '.gif'.");
            return;
        }

        const base64Image = await convertFileToBase64(file);
        setSelectedFile(base64Image);
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewURL(reader.result);
        };
        reader.readAsDataURL(file);
    }

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setFileError('');
        document.getElementById("image").value = null;
        setPreviewURL(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append("token", storedToken);
            formData.append("title", title.current.value);
            formData.append("description", description.current.value);
            formData.append("location", location.current.value);
            formData.append("date", date.current.value);
            formData.append("time", time.current.value);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            formData.append("category", selectedValue);
            formData.append("isPrivate", isPrivate);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            const result = await fetch(`${storedURL}/add_event`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formDataObject)
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
                setIsSuccess(true);
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
        }
    };

    if (Array.isArray(category)) {
        return (
            <div className="add-event">
                <p className="add-event-header"> Create An Event </p>
                <form onSubmit={handleSubmit} className="add-event-form">
                    <label htmlFor="title">Title:</label><br />
                    <input type="text" id="title" ref={title} maxLength='100' required /><br />
                    <label htmlFor="description">Description:</label><br />
                    <textarea type="text" id="description" ref={description} maxLength="1000" cols="100" rows="10" /><br />
                    <label htmlFor="location">Location:</label><br />
                    <input type="text" id="location" ref={location} maxLength='300' required /><br />
                    <div id='add-event-datetime'>
                        <label htmlFor="date">Date:</label>
                        <input type="date" id="date" ref={date} required />
                        <label htmlFor="time">Time:</label>
                        <input type="time" id="time" ref={time} required /><br />
                    </div>

                    <div className="add-image">
                        <label id='image-label' htmlFor="image">
                            <i class="fa-regular fa-image"></i> Upload Image
                        </label><br />
                        <input type="file" id="image" accept=".jpg, .jpeg, .png, .gif" onChange={handleFileChange} required />
                        {fileError && <p className="error-message">{fileError}</p>}
                        {previewURL && <> <img id='img-preview' src={previewURL} alt="Preview" /> <br /></>}
                        {selectedFile && <button id='img-remove' onClick={handleClearFile}>X  Clear File</button>}
                    </div>

                    <div className="select-privacy">
                        <span>Is This a Private Event?</span>
                        <label>
                            The Event Is Private
                            <input id='check-privacy'
                                type="checkbox"
                                checked={isPrivate}
                                onChange={handleCheckboxChange}
                            />
                        </label><br />
                    </div>
                    <span id="warning"><i class="fa-solid fa-circle-exclamation"></i>If the event is marked private, each registration for the event will require your approval.</span><br />

                    <div className="select-category">
                        <label htmlFor="category">Event Category:</label><br />
                        <select value={selectedValue} onChange={handleSelectChange}>
                            <option value="">-Select Event Category-</option>
                            {Array.isArray(category) && category.map((categoryItem) => (
                                <option key={categoryItem.category_id} value={categoryItem.category_id}>
                                    {categoryItem.category}: {categoryItem.description}
                                </option>
                            ))}
                        </select><br />
                    </div>

                    <div id='create-event'><button id='create-event-button' type="submit">Create Event!</button></div>
                </form>

                {loading && <Spinner />}
                {isSuccess &&
                    <div className="sucsess-message">
                        <p id="sucsess-message-top">Event Created Sucsessfully!</p>
                        <p id="sucsess-message-bottom"> You can now view, edit or delete the Event under 'My Events'.</p>
                        {isPrivate && <p id="sucsess-message-bottom">Approving or Declining Registrations can also be done through "My Events".</p>}
                        <button id="go-to-my-events" onClick={() => handleNavigation('/my_events')}> Go To My Events</button>
                    </div>}
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        )
    }

    else {
        return (
            <div className="add-event">
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        )
    }

};

export default AddEvent