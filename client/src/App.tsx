import { Route, Routes } from 'react-router-dom';
import { LoginRoute } from './components/LoginRoute';
import { useConnection } from './hooks/useConnection';
import { socket } from './connection/Client';
import { Game } from './components/Game';
import { Question } from './components/Question';
import { Layout } from './components/Layout';
import { Loading } from './components/Loading';

export default function App()
{
    useConnection();

	socket.connect();

    return <div className='root'>
		<Routes>
			<Route path="/" element={<Loading />} />
			<Route path="/login" element={<LoginRoute />} />
			<Route path="/screens/" element={<Layout />}>
				<Route path="game" element={<Game />} />
				<Route path="question" element={<Question />} />
			</Route>
		</Routes>
	</div>;
};
