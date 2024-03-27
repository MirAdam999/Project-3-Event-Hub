
import Spinner from "../../Loading";
import '../../../style/Pop-Up.css';

const RevokeAdmin = (props) => {
    const user = props.user

    return (
        <div className="popup">
            <div className="popup-inner">
                <div className="close"><button onClick={props.onClose}>X</button></div>
                <div className="delete-category">
                    <p>Revoke Admin Permissions for {user.name}, ID {user.user_id}?</p>
                    <button className="red-button" onClick={() => props.revokeAdmin(user)}> Revoke Permissions </button>
                    <button className="cancel-button" onClick={props.onClose}> Cancel </button>
                </div>
            </div>
        </div >
    )
}

export default RevokeAdmin