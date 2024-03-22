
import { useState } from 'react';
import { useToken } from '../../Token';
import DeleteImage from './DeleteImage';
import { useNavigate } from 'react-router-dom';

const ViewImagePopUp = (props) => {
    const { usersId } = useToken();
    const image = props.image
    const [deletePopUpOpen, setDeletePopUpOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    function openDelete() {
        setDeletePopUpOpen(true);
    }

    function closeDelete() {
        setDeletePopUpOpen(false);
    }

    return (
        <div className="window-inner">
            <div className="image-window">
                <div className="close"><button onClick={props.onClose}>X</button></div>
                <img
                    src={`data:image/png;base64,${image.image}`}
                    alt={image.image_id}
                    className="event-uploaded-image"
                />
                <p><button onClick={() => handleNavigation(`/user/${image.user_id}`)}>{image.user}</button></p>
                <p>{image.date}{image.time}</p>
                {usersId === image.user_id &&
                    <button onClick={openDelete}> Delete Image </button>}
            </div >
            {deletePopUpOpen &&
                <DeleteImage image_id={image.image_id} onClose={closeDelete} closeAll={props.onClose} />}
        </div>
    )
}

export default ViewImagePopUp