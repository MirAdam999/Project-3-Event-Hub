
import { useState, useEffect } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Window.css';

const UpdateEvent = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const event = props.event
    const formatDate = (dateString) => {
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };
    const formatedDate = formatDate(event.date)
    const [eventData, setEventData] = useState({
        event_id: event.event_id,
        title: event.title,
        location: event.location,
        date: formatedDate,
        time: event.time,
        description: event.description,
        image: event.image
    });
    const [isPrivate, setIsPrivate] = useState(event.is_private === 'Private' ? true : false);
    const [category, setCategory] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');

    const [selectedFile, setSelectedFile] = useState(event.image ? event.image : null);
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/get_categories');
                const result = await response.json();

                if ('categories' in result) {
                    setCategory(result.categories);
                    const matchingCategory = result.categories.find(category => category.category === event.category);
                    if (matchingCategory) {
                        setSelectedValue(matchingCategory.category_id);
                    } else {
                        console.error('Error: No matching category found for event.category:', event.category);
                    }
                } else {
                    console.error('Error: No categories key in the response');
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
    }

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleClearFile = event => {
        event.preventDefault();
        setSelectedFile(null);
        setFileError('');
        document.getElementById("image").value = null;
    };

    const handleInputChange = (e) => {
        setEventData({
            ...eventData,
            [e.target.id]: e.target.value,
        });
    };

    const handleCheckboxChange = () => {
        setIsPrivate(!isPrivate);
    };

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append("token", storedToken);
            formData.append("title", eventData.title);
            formData.append("description", eventData.description);
            formData.append("location", eventData.location);
            formData.append("date", eventData.date);
            formData.append("time", eventData.time);
            formData.append('image', selectedFile);
            formData.append("category", selectedValue);
            formData.append("isPrivate", isPrivate);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            const result = await fetch(`http://127.0.0.1:5000/update_event/${eventData.event_id}`, {
                method: 'PUT',
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

    return (
        <div className="window">
            <div className="window-inner">
                <div className="update-event">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <form onSubmit={handleSubmit}>

                        <label htmlFor="title">Title:</label>
                        <input type="text" id="title" value={eventData.title}
                            maxLength='100' required onChange={handleInputChange} /><br />

                        <label htmlFor="description">Description:</label><br />
                        <textarea type="text" id="description" value={eventData.description}
                            onChange={handleInputChange} maxLength="1000" /><br />

                        <label htmlFor="location">Location:</label>
                        <input type="text" id="location" value={eventData.location}
                            onChange={handleInputChange} maxLength='300' required /><br />

                        <label htmlFor="date">Date:</label>
                        <input type="date" id="date" value={eventData.date}
                            onChange={handleInputChange} required /><br />

                        <label htmlFor="time">Time:</label>
                        <input type="time" id="time" value={eventData.time} onChange={handleInputChange}
                            required /><br />


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
                            {Array.isArray(category) && category.map((categoryItem) => (
                                <option key={categoryItem.category_id} value={categoryItem.category_id}>
                                    {categoryItem.category}: {categoryItem.description}
                                </option>
                            ))}
                        </select><br />

                        {selectedFile && <>
                            <img
                                src={`data:image/png;base64,${selectedFile}`}
                                alt='image'
                                className="event-uploaded-image"
                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                            />
                            <button onClick={(e) => handleClearFile(e)}>Clear File</button></>}

                        <label for="image">Upload Photo:</label>
                        <input type="file" id="image" accept=".jpg, .jpeg, .png, .gif" onChange={handleFileChange} /><br />
                        {fileError && <p className="error-message">{fileError}</p>}

                        <button type="submit">Update Event!</button>
                    </form>

                    {loading && <Spinner />}
                    {isSuccess &&
                        <div className="sucsess-message">
                            <p>Event Updated Sucsessfully!</p>
                        </div>}
                    {errorMessage && <p>{errorMessage}</p>}
                </div>
            </div>
        </div>
    )
}

export default UpdateEvent