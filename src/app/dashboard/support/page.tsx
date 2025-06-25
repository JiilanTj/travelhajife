'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getConversations, getMessages, sendMessage } from '@/services/chat';
import { Conversation, Message } from '@/types/chat';
import { FaInbox, FaSpinner, FaCircle, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function SupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Gagal memuat daftar percakapan');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setLoadingMessages(true);
      const response = await getMessages(roomId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Gagal memuat pesan');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await sendMessage(selectedConversation.id, {
        content: newMessage.trim(),
        type: 'TEXT'
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
    }
  };

  const formatLastActive = (lastReadAt: string | null) => {
    if (!lastReadAt) return 'Belum dibaca';
    return new Date(lastReadAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderConversationsList = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            onClick={() => setSelectedConversation(conversation)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium">
                      {conversation.otherUser.fullname.charAt(0)}
                    </span>
                  </div>
                  <FaCircle 
                    className="absolute bottom-0 right-0 text-green-500 w-3 h-3" 
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversation.otherUser.fullname}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversation.otherUser.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">
                  {formatLastActive(conversation.lastReadAt)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {conversation.otherUser.role}
                </div>
              </div>
            </div>
            {conversation.lastMessage && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                {conversation.lastMessage.type === 'TEXT'
                  ? conversation.lastMessage.content
                  : conversation.lastMessage.type === 'IMAGE'
                    ? '📷 Image'
                    : '📎 File'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatInterface = () => {
    if (!selectedConversation) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSelectedConversation(null)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium">
                  {selectedConversation.otherUser.fullname.charAt(0)}
                </span>
              </div>
              <FaCircle 
                className="absolute bottom-0 right-0 text-green-500 w-3 h-3" 
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-medium text-gray-900 text-sm">
                {selectedConversation.otherUser.fullname}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedConversation.otherUser.email}
              </p>
            </div>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {selectedConversation.otherUser.role}
          </div>
        </div>

        {/* Messages Area */}
        <div className="p-4 h-[calc(100%-8rem)] overflow-y-auto bg-gray-50">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.role === 'JAMAAH'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender.role === 'JAMAAH'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    {message.type === 'TEXT' && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {typeof message.content === 'string' ? message.content : ''}
                      </p>
                    )}
                    <span className="text-xs opacity-75 mt-1 block">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container px-4 mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dukungan Pelanggan</h1>
          <p className="text-gray-600">Hubungi kami jika Anda membutuhkan bantuan</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="flex justify-center mb-4">
              <FaInbox className="text-gray-300 text-6xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Percakapan</h3>
            <p className="text-gray-500">
              Silakan mulai percakapan dengan tim support kami.
            </p>
          </div>
        ) : (
          selectedConversation ? renderChatInterface() : renderConversationsList()
        )}
      </div>
    </DashboardLayout>
  );
} 