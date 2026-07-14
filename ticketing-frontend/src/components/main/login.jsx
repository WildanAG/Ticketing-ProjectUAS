'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Logo from '../atoms/logo';
import Button from '../atoms/button';
import { login } from '@/components/services/authServices';

const roleRedirectMap = {
    admin: '/admin_page/a_dashboard',
    eo: '/eventOrganizer_page/eo_dashboard',
    user: '/'
};

const Login = () => {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await login(identifier, password);
            const role = res.data.role;

            await Swal.fire({
                icon: 'success',
                title: 'Login Berhasil',
                text: `Selamat datang kembali, ${res.data.username}!`,
                confirmButtonColor: '#031F40',
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false
            });

            router.push(roleRedirectMap[role] || '/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: err.message || 'Terjadi kesalahan, silakan coba lagi.',
                confirmButtonColor: '#031F40'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-screen w-full bg-[#031F40] overflow-hidden'>
            <div className='grid grid-cols-2 h-full select-none'>
                <div className='relative h-full flex items-center justify-center'>
                    <img
                        src="/images/mickthompson.png" alt="" className='w-full h-full object-contain'/>
                </div>

                <div className='w-full items-center justify-center px-32'>
                    <form onSubmit={handleSubmit}>
                        <Logo className='text-center mt-48'/>

                        <div className='w-full mt-10'>
                            <label htmlFor="username" className='text-white block mb-2'>Username or Email</label>
                            <input
                                id="username"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className='w-full px-4 py-3 rounded-lg bg-[#fafafa] text-[#031F40] focus:outline-none focus:ring-2 focus:ring-yellow-400'
                            />
                        </div>

                        <div className='w-full mt-5'>
                            <label htmlFor="password" className='text-white block mb-2'>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='w-full px-4 py-3 rounded-lg bg-[#fafafa] text-[#031F40] focus:outline-none focus:ring-2 focus:ring-yellow-400'
                            />
                        </div>

                        <Button
                            type='submit'
                            disabled={loading}
                            className='bg-[#F5C345] px-70 mt-14 hover:cursor-pointer disabled:opacity-60'
                            text={loading ? 'Loading...' : 'Login'}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;