'use client'
import { useState } from 'react';
import Organizermenu from '@/components/molecules/organizermenu';
import MyEvents from '@/components/molecules/myevents';
import CreateEvent from '@/components/molecules/createevent';
import Button from '@/components/atoms/button';

const Events = () => {
    const [activeTab, setActiveTab] = useState('myEvents');

    return (
        <div>
            <Organizermenu />
            <div className='p-4 md:p-8'>
                <div className='grid grid-cols-2 gap-4 mb-6'>
                    <Button
                        text='My Events'
                        onClick={() => setActiveTab('myEvents')}
                        className={activeTab === 'myEvents' ? 'bg-[#031f40] text-white' : 'bg-[#fafafa] text-[#031f40]'}
                    />
                    <Button
                        text='+ Create Event'
                        onClick={() => setActiveTab('createEvent')}
                        className={activeTab === 'createEvent' ? 'bg-[#031f40] text-white' : 'bg-[#fafafa] text-[#031f40]'}
                    />
                </div>

                {activeTab === 'myEvents' && <MyEvents />}
                {activeTab === 'createEvent' && <CreateEvent />}
            </div>
        </div>
    );
};

export default Events;