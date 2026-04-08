import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TicketModal from './TicketModal';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get('/api/tickets/');
            setTickets(data);
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (ticketId) => {
        setSelectedTicketId(ticketId);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedTicketId(null);
    };

    return (
        <div>
            <h2>Tickets</h2>
            <ul>
                {tickets.map(ticket => (
                    <li key={ticket.id} onClick={() => openModal(ticket.id)} style={{ cursor: 'pointer', margin: '10px 0' }}>
                        <strong>{ticket.title}</strong> - {ticket.status}
                    </li>
                ))}
            </ul>
            <TicketModal
                ticketId={selectedTicketId}
                isOpen={modalIsOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default TicketList;