import React, { createContext, useState, useContext } from 'react';

// Create a context
const TokenContext = createContext();

// Provider component
const TokenProvider = ({ children }) => {
    const [storedToken, setStoredToken] = useState(null);
    const [usersId, setUsersId] = useState('');
    const [usersName, setUsersName] = useState('');
    const [isMasterUser, setIsMaster] = useState(false);

    const setToken = (newToken) => {
        setStoredToken(newToken);
    };

    const setId = (newUserId) => {
        setUsersId(newUserId);
    };

    const setName = (newName) => {
        setUsersName(newName);
    };

    const setIsMasterPermission = (masterPermission) => {
        setIsMaster(masterPermission);
    };

    return (
        <TokenContext.Provider
            value={{
                storedToken,
                setToken,
                usersId,
                setId,
                usersName,
                setName,
                isMasterUser,
                setIsMasterPermission,
            }}
        >
            {children}
        </TokenContext.Provider>
    );
};

// Custom hooks to access the token context
const useToken = () => useContext(TokenContext);

export { TokenProvider, useToken };
