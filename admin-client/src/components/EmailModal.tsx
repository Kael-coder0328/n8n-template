/**
 * EmailModal component
 * Provides a UI for sending emails to users
 */

import React, { useState } from 'react';
import { sendEmail } from '@/lib/services/email';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ 
  isOpen, 
  onClose, 
  recipientEmail 
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSubject('');
      setBody('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!subject.trim() || !body.trim()) {
      setErrorMessage('Subject and message are required');
      return;
    }
    
    setIsSending(true);
    setErrorMessage('');
    
    try {
      // Send email
      await sendEmail({
        to: recipientEmail,
        subject,
        body,
      });
      
      setSuccessMessage('Email sent successfully');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Send Email</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              To:
            </label>
            <input
              type="email"
              value={recipientEmail}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter subject"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Message:
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={8}
              placeholder="Enter your message"
              required
            />
          </div>
          
          {errorMessage && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal; 