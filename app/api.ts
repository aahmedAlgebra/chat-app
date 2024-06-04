import { Message, ApiMessage } from './types';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

console.log('Backend URL:', backendUrl);

export const sendMessage = async (sender: string, recipient: string, message: string): Promise<any> => {
    console.log('Sending payload:', { sender, recipient, message }); // Add logging
    try {
        const response = await fetch(`${backendUrl}/send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sender, recipient, message }),
        });
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        const responseData = await response.json();
        console.log('Response from sendMessage:', responseData);
        return responseData;
    } catch (error) {
        console.error('sendMessage error:', error);
        throw error;
    }
};

export const receiveMessages = async (recipient: string): Promise<ApiMessage[]> => {
    console.log('Requesting messages for recipient:', recipient);
    try {
      const response = await fetch(`${backendUrl}/receive_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ recipient }),
        credentials: 'include'  // Ensure credentials are included if needed
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      console.log('Received messages:', data);
      return data as ApiMessage[];
    } catch (error) {
      console.error('receiveMessages error:', error);
      throw error;
    }
  };
