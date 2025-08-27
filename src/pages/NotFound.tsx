import React from 'react';
import { Link } from 'react-router';

const NotFound: React.FC = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center'
    }}>
        <h1>404</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to="/" style={{ marginTop: '1rem', color: '#007bff', textDecoration: 'underline' }}>
            Go back home
        </Link>
    </div>
);

export default NotFound;