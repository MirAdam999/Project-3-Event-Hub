
import { useState } from "react";
import { useToken } from '../../Token';
import { useURL } from "../../URL";
import Spinner from "../../Loading";
import '../../../style/Window.css';

const AddImage = (props) => {
    const { storedToken } = useToken();
    const { storedURL } = useURL();
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

            const result = await fetch(`${storedURL}/add_image/${props.event_id}`, {
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
            <div className="window-inner" id='window-inner-add-image'>
                <div className="add-image-window">

                    <div className="add-image-after-event">
                        <form onSubmit={handleSubmit}>
                            <label id='image-label' htmlFor="image">
                                <i class="fa-regular fa-image"></i> Select Image
                            </label><br />
                            <input type="file" id="image" accept=".jpg, .jpeg, .png, .gif" onChange={handleFileChange} /><br />
                            {fileError && <p className="error-message">{fileError}</p>}
                            {previewURL && <> <img id='img-preview' src={previewURL} alt="Preview" /> <br /></>}
                            {selectedFile && <> <button id='img-remove' onClick={handleClearFile}>X  Clear File</button><br /></>}

                            <button className='approve-button' type="submit">Upload Photo</button>
                        </form >
                        {loading && <Spinner />}
                        {isSuccess &&
                            <div className="sucsess-message">
                                <p>Photo Uploaded Sucsessfully!</p>
                            </div>
                        }
                        {errorMessage && <p>{errorMessage}</p>}
                    </div>

                    <div className="close"><button onClick={props.onClose}>X</button></div>
                </div>
            </div >
        </div>
    )
}

export default AddImage