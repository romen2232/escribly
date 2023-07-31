import React, { useContext } from 'react';
import { AuthContext } from '../hoc/auth/context';
import { Form } from '../components/Form';
import { PageContainer } from '../components/PageContainer';
import { Splash } from '../components/Splash';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
    const { login, loading } = useContext(AuthContext);

    const handleLogin = async (email: string, password: string) => {
        login({ email, password });
    };

    return (
        <PageContainer>
            <Splash>
                <h2 className="my-4 text-center text-2xl font-bold">Login</h2>

                <p>
                    Don&apos;t have an account? &nbsp;
                    <Link to="/register" className="text-tiviElectricViolet">
                        Sing up
                    </Link>
                </p>

                <Form onSubmit={handleLogin} type="login" />
                {loading && <p>Loading...</p>}
            </Splash>
        </PageContainer>
    );
};

export default Login;
