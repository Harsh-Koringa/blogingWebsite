import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Import the auth slice reducer

const store = configureStore({
    reducer: {
        auth: authReducer, // Add auth reducer here
    }
});

export default store;