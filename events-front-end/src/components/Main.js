
import React from 'react';
import { Outlet } from 'react-router-dom';

function Main() {

    return (
        <div className="main-comp">
            <Outlet />
        </div>
    )
}

export default Main