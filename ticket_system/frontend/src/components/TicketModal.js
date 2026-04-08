import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const TicketModal = ({ ticketId, isOpen, onClose }) => {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && ticketId) {
            fetchTicket();
        }
    }, [isOpen, ticketId]);

    const fetchTicket = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/tickets/${ticketId}/`);
            setTicket(data);
            setError('');
        } catch (err) {
            setError('Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            await axios.post(`/api/tickets/${ticketId}/attachments/`, formData);
            await fetchTicket();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachmentId) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Delete this attachment?')) return;
        try {
            await axios.delete(`/api/attachments/${attachmentId}/delete/`);
            setTicket(prev => ({
                ...prev,
                attachments: prev.attachments.filter(a => a.id !== attachmentId)
            }));
        } catch (err) {
            setError('Delete failed');
        }
    };

    const getFileUrl = (attachmentId) => `/api/attachments/${attachmentId}/`;

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Ticket Details">
            <button onClick={onClose}>Close</button>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {ticket && (
                <>
                    <h2>{ticket.title}</h2>
                    <p>{ticket.description}</p>
                    <p>Status: {ticket.status}</p>

                    <div>
                        <h4>Attachments</h4>
                        <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        {uploading && <p>Uploading...</p>}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                        {ticket.attachments?.length === 0 && <p>No attachments</p>}
                        {ticket.attachments?.map(att => (
                            <div key={att.id} style={{
                                border: '1px solid #ddd',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                textAlign: 'center',
                                width: '120px'
                            }}>
                                {att.mime_type.startsWith('image/') ? (
                                    <img
                                        src={getFileUrl(att.id)}
                                        alt={att.filename}
                                        style={{ maxWidth: '100px', maxHeight: '100px', cursor: 'pointer' }}
                                        onClick={() => window.open(getFileUrl(att.id), '_blank')}
                                    />
                                ) : (
                                    <div
                                        style={{ fontSize: '2rem', cursor: 'pointer' }}
                                        onClick={() => window.open(getFileUrl(att.id), '_blank')}
                                    >
                                        📄
                                    </div>
                                )}
                                <div style={{ fontSize: '0.8rem', margin: '5px 0' }}>
                                    {att.filename.length > 15 ? att.filename.substring(0,12) + '...' : att.filename}
                                </div>
                                <button onClick={() => handleDelete(att.id)}>Delete</button>
                                <a href={getFileUrl(att.id)} download={att.filename}>Download</a>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default TicketModal;