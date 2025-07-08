import React, { useState, useRef } from 'react';
import { 
  Input, 
  Upload, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  message,
  Spin,
  Switch,
} from 'antd';
import { 
  SearchOutlined, 
  UploadOutlined, 
  CameraOutlined,
  ReadOutlined,
  MicrophoneOutlined,
  SendOutlined,
} from '@ant-design/icons';
import AppLayout from "../../components/Layout/AppLayout";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const NewsModule = () => {
  const user = { a: 'username' };
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [newsResults, setNewsResults] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const breadcrumbItems = [
    { title: 'Home' },
    { title: 'News Module' },
    { title: 'News Finder' },
  ];

  const handleSearch = async () => {
    const hasTextInput = searchQuery.trim();
    const hasAudioInput = hasRecording && audioChunksRef.current.length > 0;
    const hasImage = fileList.length > 0;
    
    if (!hasTextInput && !hasAudioInput && !hasImage) {
      setError('Please enter a news query, record an audio message, or upload an image');
      return;
    }
    
    setLoading(true);
    setError(null);
    setNewsResults([]);
    setHasSearched(true);
    
    try {
      const formData = new FormData();
      
      // Add text or audio input
      if (inputMode === 'text' && hasTextInput) {
        formData.append('text', searchQuery.trim());
      } else if (inputMode === 'audio' && hasAudioInput) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        formData.append('audio', audioBlob, 'recording.wav');
      }
      
      // Add image if uploaded
      if (hasImage && fileList[0]) {
        formData.append('image', fileList[0].originFileObj, fileList[0].name);
      }
      
      const response = await fetch('http://0.0.0.0:8000/query/news', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.result) {
        setNewsResults([{
          id: Date.now(),
          content: result.result,
          query: inputMode === 'text' ? searchQuery : '🎤 Voice query',
          timestamp: new Date()
        }]);
      } else {
        setError('No news results found');
      }
      
      // Reset form
      setSearchQuery('');
      setFileList([]);
      setHasRecording(false);
      setIsRecording(false);
      audioChunksRef.current = [];
      
    } catch (err) {
      console.error('News search error:', err);
      setError(`Failed to search news: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        setHasRecording(true);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setInputMode('audio');
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Error accessing microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const switchToTextMode = () => {
    setInputMode('text');
    setHasRecording(false);
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    onChange: handleFileChange,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      return isImage || Upload.LIST_IGNORE;
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <AppLayout breadcrumbItems={breadcrumbItems} user={user}>
      <div style={{ 
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        borderRadius: '12px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '24px'
          }}>
            <Title level={1} style={{ 
              fontSize: '3.5rem',
              fontWeight: '700',
              margin: 0,
              background: 'inherit',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📰 News Finder
            </Title>
          </div>
          <Paragraph style={{
            fontSize: '18px',
            color: 'var(--color-subtext)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Stay updated. Search for news by topic or upload an image of headlines or clippings.
          </Paragraph>
        </div>

        {/* Main Search Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          <Col xs={24} lg={14}>
            <Card 
              style={{
                borderRadius: '16px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              className="hover-card"
              bodyStyle={{ padding: '32px' }}
            >
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ 
                    color: 'var(--color-primary)', 
                    marginBottom: '20px',
                    fontSize: '24px',
                    fontWeight: '600'
                  }}>
                    🧐 What news are you looking for?
                  </Title>

                  {/* Input Mode Toggle */}
                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>💬 Text</span>
                    <Switch
                      checked={inputMode === 'audio'}
                      onChange={(checked) => {
                        if (checked) {
                          setInputMode('audio');
                        } else {
                          switchToTextMode();
                        }
                      }}
                      style={{ backgroundColor: inputMode === 'audio' ? 'var(--color-primary)' : undefined }}
                    />
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>🎤 Voice</span>
                  </div>

                  {/* Text Input */}
                  {inputMode === 'text' && (
                    <TextArea
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for topics like technology trends, sports highlights, political updates..."
                      rows={4}
                      disabled={loading}
                      style={{ 
                        fontSize: '16px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-accent)',
                        padding: '16px',
                        resize: 'none',
                        fontFamily: 'Inter, sans-serif',
                        marginBottom: '16px'
                      }}
                    />
                  )}

                  {/* Audio Input */}
                  {inputMode === 'audio' && (
                    <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg text-center">
                      <div className={`mb-3 ${isRecording ? 'text-red-500' : hasRecording ? 'text-green-500' : 'text-gray-500'}`}>
                        {isRecording ? (
                          <span className="animate-pulse">🎤 Recording... Speak about the news you're looking for</span>
                        ) : hasRecording ? (
                          '✅ Audio recorded and ready to send'
                        ) : (
                          '🎤 Click the microphone to record your news query'
                        )}
                      </div>
                      <Button
                        type={isRecording ? 'danger' : hasRecording ? 'primary' : 'default'}
                        icon={<MicrophoneOutlined />}
                        onClick={handleMicrophoneClick}
                        disabled={loading}
                        className={isRecording ? 'animate-pulse' : ''}
                      >
                        {isRecording ? 'Stop Recording' : hasRecording ? 'Record Again' : 'Start Recording'}
                      </Button>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ textAlign: 'center', color: 'red', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSearch}
                    loading={loading}
                    disabled={(!searchQuery.trim() && !hasRecording)}
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif',
                      borderRadius: '24px',
                      padding: '0 32px',
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      fontWeight: '600'
                    }}
                    className="search-button"
                  >
                    Search News!
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card 
              style={{
                borderRadius: '16px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              className="hover-card"
              bodyStyle={{ padding: '32px' }}
            >
              <Space direction="vertical" size={20} style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ 
                    color: 'var(--color-primary)',
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    <CameraOutlined style={{ 
                      color: 'var(--color-accent)', 
                      marginRight: '12px',
                      fontSize: '24px'
                    }} />
                    Upload News Clipping
                  </Title>
                  <Text style={{ 
                    color: 'var(--color-subtext)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    Upload image of headlines or clippings to get news summaries
                  </Text>
                </div>

                <Upload.Dragger {...uploadProps}
                  style={{ 
                    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
                    border: '2px dashed var(--color-accent)',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                  className="custom-upload"
                >
                  <p>
                    <UploadOutlined style={{ fontSize: '48px', color: 'var(--color-accent)' }} />
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-accent)' }}>
                    Click or drag file to this area
                  </p>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Support for JPG, PNG, GIF files
                  </p>
                </Upload.Dragger>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Quick Categories */}
        <Card style={{
          marginBottom: '48px',
          borderRadius: '16px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ padding: '32px' }}>
            <Title level={3} style={{ 
              textAlign: 'center',
              color: 'var(--color-primary)',
              marginBottom: '32px',
              fontSize: '28px',
              fontWeight: '600'
            }}>
              🗂️ News Categories
            </Title>
            <Row gutter={[20, 20]}>
              {[
                { title: 'World', icon: '🌍', gradient: 'linear-gradient(135deg, #69c0ff 0%, #4096ff 100%)' },
                { title: 'Technology', icon: '💻', gradient: 'linear-gradient(135deg, #95de64 0%, #52c41a 100%)' },
                { title: 'Sports', icon: '🏅', gradient: 'linear-gradient(135deg, #ffc069 0%, #faad14 100%)' },
                { title: 'Health', icon: '🩺', gradient: 'linear-gradient(135deg, #ff85c0 0%, #eb2f96 100%)' },
                { title: 'Business', icon: '💼', gradient: 'linear-gradient(135deg, #b37feb 0%, #9254de 100%)' },
                { title: 'Entertainment', icon: '🎬', gradient: 'linear-gradient(135deg, #ff9c6e 0%, #ff6b6b 100%)' }
              ].map((category, index) => (
                <Col xs={12} sm={8} md={6} lg={4} key={index}>
                  <Button
                    style={{ 
                      width: '100%',
                      height: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      border: 'none',
                      background: category.gradient,
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSearchQuery(`${category.title} news`)}
                  >
                    <span style={{ fontSize: '32px', marginBottom: '8px' }}>
                      {category.icon}
                    </span>
                    <span>{category.title}</span>
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        </Card>

        {/* Loading */}
        {loading && (
          <Card style={{
            textAlign: 'center',
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: '48px'
          }}>
            <Spin size="large" />
            <div style={{ marginTop: '24px' }}>
              <Text style={{ fontSize: '18px', color: 'var(--color-primary)', fontWeight: '500' }}>
                🔎 Searching latest news...
              </Text>
            </div>
          </Card>
        )}

        {/* Results */}
        {!loading && newsResults.length > 0 && (
          <Card style={{
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ padding: '32px' }}>
              <Title level={3} style={{ 
                marginBottom: '32px',
                textAlign: 'center',
                color: 'var(--color-primary)',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                📰 News Results
              </Title>
              {newsResults.map((result) => (
                <Card key={result.id} style={{ marginBottom: '20px', borderRadius: '12px' }}>
                  <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--color-subtext)' }}>
                    Query: {result.query} | {result.timestamp.toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {result.content}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && newsResults.length === 0 && !error && hasSearched && (
          <Card style={{
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ padding: '32px' }}>
              <Title level={3} style={{ 
                marginBottom: '32px',
                textAlign: 'center',
                color: 'var(--color-primary)',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                📰 News Results
              </Title>
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}>
                <ReadOutlined style={{ fontSize: '64px', color: 'var(--color-accent)', marginBottom: '24px' }} />
                <div style={{ color: 'var(--color-subtext)', fontSize: '16px', fontWeight: '500' }}>
                  📰 News results will appear here after search
                </div>
              </div>
            </div>
          </Card>
        )}

        <style jsx>{`
          .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
          }
          .search-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
          }
          .custom-upload:hover {
            border-color: var(--color-primary) !important;
            background: linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%) !important;
          }
        `}</style>
      </div>
    </AppLayout>
  );
};

export default NewsModule;