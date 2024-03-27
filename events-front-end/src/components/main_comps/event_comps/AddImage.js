
import { useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Window.css';

const AddImage = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [previewURL, setPreviewURL] = useState(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setFileError('');

        const allowedFormats = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedFormats.includes(`.${fileExtension}`)) {
            setFileError("Wrong file format. Allowed Formats: '.jpg', '.jpeg', '.png', '.gif'.");
            setPreviewURL(null);
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

    const handleClearFile = event => {
        event.preventDefault();
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
            formData.append("role", props.role);
            formData.append('image', selectedFile);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            const result = await fetch(`http://127.0.0.1:5000/add_image/${props.event_id}`, {
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

    return (
        <div className="window">
            <div className="window-inner">
                <div className="add-image-window">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <form onSubmit={handleSubmit}>
                        <label for="image">Upload Photo:</label>
                        <input type="file" id="image" accept=".jpg, .jpeg, .png, .gif" onChange={handleFileChange} /><br />
                        {fileError && <p className="error-message">{fileError}</p>}
                        {previewURL && <img src={previewURL} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />}
                        <button onClick={(e) => handleClearFile(e)}>Clear File</button>

                        <button type="submit">Upload Photo</button>
                    </form >
                    {loading && <Spinner />}
                    {isSuccess &&
                        <div className="sucsess-message">
                            <p>Photo Uploaded Sucsessfully!</p>
                        </div>
                    }
                    {errorMessage && <p>{errorMessage}</p>}
                </div>
            </div >
        </div>
    )
}

export default AddImage