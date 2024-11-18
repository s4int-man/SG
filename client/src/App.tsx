import { Route, Routes } from 'react-router-dom';
import { LoginRoute } from './components/LoginRoute';
import { useConnection } from './hooks/useConnection';

export default function App()
{
    useConnection();

    return <div className='root'>
		<Routes>
			<Route path="/" element={<LoginRoute />} />
			<Route path="/game" element={<div>Пизда</div>} />
		</Routes>
	</div>;
};
