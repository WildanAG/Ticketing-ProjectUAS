'use client';
import Organizermenu from '@/components/molecules/organizermenu';
import React from 'react';
import Searchbar from '@/components/atoms/searchbar';
import Filter from '@/components/atoms/filter';
import { useState, useEffect } from 'react';

const Orders = () => {
    const [search, setSearch] = useState('');
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

    const fetchOrders = async () => {

        try {

            const token = localStorage.getItem("token");

            const res = await axios.get(
                "http://localhost:3001/api/transactions/organizer",
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );

            setOrders(res.data.data);
            setFilteredOrders(res.data.data);

            } catch(err){

                console.log(err);

            } finally{

                setLoading(false);

            }

        }

        fetchOrders();

    },[]);

    useEffect(()=>{

        if(!search.trim()){
            setFilteredOrders(orders);
            return;
        }

        const keyword = search.toLowerCase();

        setFilteredOrders(
            orders.filter(item =>
                item.username.toLowerCase().includes(keyword) ||
                item.event.toLowerCase().includes(keyword) ||
                item.transaction_id.toString().includes(keyword)
            )
        );

    },[search,orders]);

    return (
        <div>
            <Organizermenu />
            <div className='p-4 md:p-8'>
                <div className='flex flex-row gap-2 md:gap-4 mb-4'>
                    <div className='flex-1'>
                        <Searchbar value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className='shrink-0 md:w-32'>
                        <Filter />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full bg-white">
                    <thead className="bg-[#031F40] text-white">
                        <tr>
                            <th className="p-4 text-left">Transaction ID</th>
                            <th className="p-4 text-left">Username</th>
                            <th className="p-4 text-left">Amount</th>
                            <th className="p-4 text-left">Event</th>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">Category</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredOrders.map(order=>(

                            <tr key={order.transaction_id} className="border-b">

                                <td className="p-4">{order.transaction_id}</td>

                                <td className="p-4">{order.username}</td>

                                <td className="p-4">
                                    Rp {order.amount.toLocaleString("id-ID")}
                                </td>

                                <td className="p-4">
                                    {order.event}
                                </td>

                                <td className="p-4">
                                    {new Date(order.date).toLocaleDateString("id-ID")}
                                </td>

                                <td className="p-4">

                                    <span className={`px-4 py-2 rounded text-white font-semibold
                                    ${order.category==="VIP"
                                        ?"bg-yellow-500"
                                        :"bg-green-500"
                                    }`}>

                                        {order.category}

                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
}

export default Orders;
