import { Route, Routes } from 'react-router-dom';
import { LoginRoute } from './components/LoginRoute';
import { useConnection } from './hooks/useConnection';
import { socket } from './connection/Client';
import { Players } from './components/Players';
import { Game } from './components/Game';

export default function App()
{
    useConnection();

	socket.connect();

    return <div className='root'>
		<Routes>
			<Route path="/" element={<LoginRoute />} />
			<Route path="/game" element={<Game />} />
		</Routes>
	</div>;
};
