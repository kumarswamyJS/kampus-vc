import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messagingApi } from '../../services/apiClient';
import { getSocket } from '../../services/socketService';
import { Conversation, MessageItem } from '../../types';
import { MessageSquare, Send, ArrowLeft, Phone, Video, ShieldAlert } from 'lucide-react';
import { CallModal, CallData } from '../../components/calling/CallModal';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetProjectId = searchParams.get('project');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // WebRTC Audio/Video Active Call state
  const [activeCall, setActiveCall] = useState<CallData | null>(null);

  const currentUserId = user?._id || (user as any)?.id;

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingApi.getMyConversations();
      const list = data.conversations || [];
      setConversations(list);

      if (targetProjectId) {
        const matching = list.find((c: Conversation) => {
          const pid = typeof c.projectId === 'object' ? c.projectId._id : c.projectId;
          return pid === targetProjectId;
        });
        if (matching) {
          setSelectedConversation(matching);
        } else {
          const initiated = await messagingApi.getConversationByProject(targetProjectId);
          if (initiated.conversation) {
            setSelectedConversation(initiated.conversation);
          }
        }
      } else if (list.length > 0 && !selectedConversation) {
        setSelectedConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const data = await messagingApi.getMessages(convId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [targetProjectId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      const socket = getSocket();
      socket.emit('join_conversation', selectedConversation._id);
    }
  }, [selectedConversation]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (data: { message: MessageItem; conversationId: string }) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId
            ? { ...c, lastMessageText: data.message.text, lastMessageAt: data.message.createdAt }
            : c
        )
      );
    };

    const handleUserTyping = (data: { userId: string; conversationId: string }) => {
      if (selectedConversation && data.conversationId === selectedConversation._id && data.userId !== currentUserId) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (data: { userId: string; conversationId: string }) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setIsTyping(false);
      }
    };

    const handleIncomingCall = (data: {
      callId: string;
      conversationId: string;
      projectId: string;
      caller: { userId: string; displayName: string; avatarUrl?: string };
      callType: 'audio' | 'video';
    }) => {
      setActiveCall({
        callId: data.callId,
        conversationId: data.conversationId,
        projectId: data.projectId,
        caller: data.caller,
        callType: data.callType,
        isIncoming: true,
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('incoming_call', handleIncomingCall);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('incoming_call', handleIncomingCall);
    };
  }, [selectedConversation, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !textInput.trim() || sending) return;

    const content = textInput.trim();
    setTextInput('');
    const socket = getSocket();

    socket.emit('typing_stop', selectedConversation._id);

    // Emit real-time message via socket server
    socket.emit('send_message', { conversationId: selectedConversation._id, text: content }, (res: any) => {
      if (!res?.success) {
        // Fallback to REST API if socket send returns error
        messagingApi.sendMessage(selectedConversation._id, { text: content }).then(() => {
          fetchMessages(selectedConversation._id);
        });
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
    if (selectedConversation) {
      const socket = getSocket();
      socket.emit('typing_start', selectedConversation._id);
    }
  };

  const initiateCall = (callType: 'audio' | 'video') => {
    if (!selectedConversation) return;
    const socket = getSocket();

    socket.emit(
      'call_initiate',
      { conversationId: selectedConversation._id, callType },
      (res: { success: boolean; callId?: string; error?: string }) => {
        if (res.success && res.callId) {
          const calleeItem = selectedConversation.participants?.find((p) => (typeof p === 'object' ? p._id : p) !== currentUserId);
          const calleeId = typeof calleeItem === 'object' ? calleeItem._id : calleeItem || '';
          setActiveCall({
            callId: res.callId,
            conversationId: selectedConversation._id,
            projectId: typeof selectedConversation.projectId === 'object' ? selectedConversation.projectId._id : selectedConversation.projectId,
            caller: {
              userId: currentUserId || '',
              displayName: user?.displayName || 'User',
              avatarUrl: user?.avatarUrl,
            },
            callType,
            isIncoming: false,
            targetUserId: calleeId,
          });
        } else {
          alert(res.error || 'Failed to initiate call');
        }
      }
    );
  };

  const currentProjectObj = selectedConversation && typeof selectedConversation.projectId === 'object' ? selectedConversation.projectId : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* WebRTC Audio/Video Call Modal */}
      <CallModal activeCall={activeCall} onClose={() => setActiveCall(null)} currentUserId={currentUserId} />

      <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/projects')} className="text-slate-400 hover:text-white p-1 rounded-md">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" /> Project Real-Time Workspace
              </h1>
              <span className="text-xs text-slate-400">Socket.IO Messaging & WebRTC Peer Calling</span>
            </div>
          </div>

          {selectedConversation && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => initiateCall('audio')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-all"
                title="Start Audio Call"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => initiateCall('video')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-all"
                title="Start Video Call"
              >
                <Video size={18} />
              </button>
              {currentProjectObj && (
                <button
                  onClick={() => navigate(`/projects/${currentProjectObj._id}?tab=disputes`)}
                  className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <ShieldAlert size={14} /> Disputes
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Messenger Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Conversation Sidebar */}
          <div className="md:col-span-4 border-r border-slate-800/80 overflow-y-auto p-3 space-y-2 bg-slate-950/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              Conversations ({conversations.length})
            </span>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No active project conversations.</div>
            ) : (
              conversations.map((conv) => {
                const projectObj = typeof conv.projectId === 'object' ? conv.projectId : null;
                const isSelected = selectedConversation?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold line-clamp-1 text-slate-100">
                        {projectObj?.title || 'Project Chat'}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{conv.lastMessageText || 'No messages yet.'}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Chat Window */}
          <div className="md:col-span-8 flex flex-col justify-between bg-slate-950/20">
            {selectedConversation ? (
              <>
                {/* Chat Messages Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs">
                      No messages yet. Send a message to start collaboration.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderUserId === currentUserId;
                      return (
                        <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}

                  {isTyping && (
                    <div className="text-[11px] text-cyan-400 italic animate-pulse">
                      Participant is typing...
                    </div>
                  )}
                </div>

                {/* Composer */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={handleInputChange}
                    placeholder="Type project message..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !textInput.trim()}
                    className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="py-24 text-center text-slate-500 text-xs">Select a project conversation to view messages.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
