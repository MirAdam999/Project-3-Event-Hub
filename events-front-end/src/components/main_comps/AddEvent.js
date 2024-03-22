
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../Token';
import Spinner from "../Loading"

const AddEvent = () => {
    const { storedToken } = useToken();
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
                const response = await fetch('http://127.0.0.1:5000/get_categories');
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

            const result = await fetch("http://127.0.0.1:5000/add_event", {
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
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" ref={title} maxLength='100' required /><br />
                    <label htmlFor="description">Description:</label><br />
                    <textarea type="text" id="description" ref={description} maxLength="1000" /><br />
                    <label htmlFor="location">Location:</label>
                    <input type="text" id="location" ref={location} maxLength='300' required /><br />
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" ref={date} required /><br />
                    <label htmlFor="time">Time:</label>
                    <input type="time" id="time" ref={time} required /><br />
                    <label for="image">Upload Image:</label>
                    <input type="file" id="image" accept=".jpg, .jpeg, .png, .gif" onChange={handleFileChange} /><br />
                    {fileError && <p className="error-message">{fileError}</p>}
                    {previewURL && <img src={previewURL} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />}
                    <button onClick={handleClearFile}>Clear File</button>

                    <span>Is This a Private Event?</span><br />
                    <span>If the event is marked private, each registration for the event will require your approval.</span><br />
                    <label>
                        The Event Is Private
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={handleCheckboxChange}
                        />
                    </label><br />

                    <select value={selectedValue} onChange={handleSelectChange}>
                        <option value="">Select Event Category</option>
                        {Array.isArray(category) && category.map((categoryItem) => (
                            <option key={categoryItem.category_id} value={categoryItem.category_id}>
                                {categoryItem.category}: {categoryItem.description}
                            </option>
                        ))}
                    </select><br />

                    <button type="submit">Create Event!</button>
                </form>

                {loading && <Spinner />}
                {isSuccess &&
                    <div className="sucsess-message">
                        <p>Event Created Sucsessfully!</p>
                        <p> You can now view, edit or delete the Event under 'My Events'.</p>
                        {isPrivate && <p>Approving or Declining Registrations can also be done through "My Events".</p>}
                        <button onClick={() => handleNavigation('/my_events')}> Go To My Events</button>
                    </div>}
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        )
    }

    else {
        return (
            <div>
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        )
    }

};

export default AddEvent