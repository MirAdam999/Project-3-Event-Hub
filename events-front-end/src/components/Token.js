
import { useState, useEffect } from 'react';

let token = null;
let name = null;
let isMaster = false;

const useToken = () => {
    const [storedToken, setStoredToken] = useState(token);
    const [usersName, setUsersName] = useState(name);
    const [isMasterUser, setIsMasterUser] = useState(isMaster);

    const setToken = (newToken) => {
        token = newToken;
        setStoredToken(newToken);
        return
    };

    const getToken = () => {
        return storedToken;
    };

    const setName = (newName) => {
        name = newName;
        setUsersName(newName);
        return
    };

    const getName = () => {
        return usersName;
    };

    const setIsMaster = (masterPremission) => {
        isMaster = masterPremission;
        setIsMasterUser(masterPremission);
        return
    };

    const getIsMaster = () => {
        return isMasterUser;
    };

    return { setToken, getToken, setName, getName, setIsMaster, getIsMaster };
};

export default useToken;

