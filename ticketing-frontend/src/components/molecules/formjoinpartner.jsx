'use client'
import React, { useState } from 'react';
import Button from '../atoms/button';
import axios from 'axios';

const Formjoinpartner = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',              
        email: '',
        number: '',
        socialMedia: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setCvFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!cvFile) {
            setError('CV wajib diunggah.');
            return;
        }

        try {
            setLoading(true);

            const payload = new FormData();
            payload.append('username', formData.username);            
            payload.append('email', formData.email);
            payload.append('number', formData.number);
            payload.append('socialmedia', formData.socialMedia);
            payload.append('cv', cvFile); // nama field 'cv' harus sama dengan multer di backend

            await axios.post('http://localhost:3001/api/users/organizers/register', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Pendaftaran berhasil dikirim! Tim kami akan menghubungi kamu.');
            setFormData({ username: '', email: '', number: '', socialMedia: '' });
            setCvFile(null);
            onClose();
        } catch (err) {
            console.error('Gagal mendaftar:', err);
            setError(err.response?.data?.message || 'Gagal mengirim pendaftaran. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center' onClick={onClose}>
            <div className='bg-[#031F40] rounded-2xl' onClick={(e) => e.stopPropagation()}>
                <h2 className='text-white text-center w-full text-[32px] font-extrabold font-poppins tracking-wide pt-6'>
                    Ticke<span className='text-[#F5C345]'>Ting</span>
                </h2>

                <form className='flex flex-col p-10 gap-2' onSubmit={handleSubmit}>                    
                    <label>Name of Organization</label>
                    <input type='text' className='bg-[#fafafa] rounded-lg text-[#031F40] font-medium p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400' name='username' value={formData.username} onChange={handleChange} required/>                    

                    <label>Email</label>
                    <input type='email' className='bg-[#fafafa] rounded-lg text-[#031F40] font-medium p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400' name='email' value={formData.email} onChange={handleChange} required/>

                    <label>Number</label>
                    <input type='number' className='bg-[#fafafa] rounded-lg text-[#031F40] font-medium p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400' name='number' value={formData.number} onChange={handleChange} required/>

                    <label>Social Media</label>
                    <input type='text' className='bg-[#fafafa] rounded-lg text-[#031F40] font-medium p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400' name='socialMedia' value={formData.socialMedia} onChange={handleChange}/>

                    <label>CV</label>
                    <input type='file' accept='.pdf,.doc,.docx' className='bg-[#fafafa] rounded-lg text-[#031F40] font-medium p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400' onChange={handleFileChange} required/>

                    {error && <p className='text-red-400 text-sm font-medium'>{error}</p>}

                    <Button text={loading ? 'Submitting...' : 'Submit'} className='bg-[#F5C345] mt-8' type='submit' disabled={loading}/>
                </form>
            </div>
        </div>
    );
};

export default Formjoinpartner;