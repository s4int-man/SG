import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MemoryRouter } from "react-router-dom";
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { RootReducer } from './store/RootReducer';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

export function setupStore()
{
	return configureStore({
		reducer: RootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
	});
}

const store = setupStore();

root.render(
    <Provider store={store}>
        <MemoryRouter>
            <App />
        </MemoryRouter>
    </Provider>
);
