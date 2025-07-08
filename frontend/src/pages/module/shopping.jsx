import React, { useState, useRef, useEffect } from 'react';
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
  Divider,
  Spin,
  Alert,
  Switch,
} from 'antd';
import { 
  SearchOutlined, 
  UploadOutlined, 
  CameraOutlined,
  BookOutlined,
  MicrophoneOutlined,
  AudioOutlined,
  FileTextOutlined,
  SendOutlined,
  KeyboardOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import AppLayout from "../../components/Layout/AppLayout";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ShoppingModule = () => {
  const user = { a: 'username' };
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  const breadcrumbItems = [
    { title: 'Home' },
    { title: 'Shopping Module' },
    { title: 'Product Finder' },
  ];

  const handleSearch = async () => {
    const hasTextInput = searchQuery.trim();
    const hasAudioInput = hasRecording && audioChunksRef.current.length > 0;
    const hasImage = fileList.length > 0;
    
    if (!hasTextInput && !hasAudioInput && !hasImage) {
      setError('Please enter a shopping query, record an audio message, or upload an image');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
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
      if (hasImage) {
        formData.append('image', fileList[0].originFileObj);
      }

      const response = await fetch('http://0.0.0.0:8000/query/shopping', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Store the result for display
      setResults([{
        id: Date.now(),
        title: inputMode === 'text' ? `Products for: ${searchQuery}` : 'Products from voice query',
        description: data.result || 'No shopping results found',
        query: inputMode === 'text' ? searchQuery : '🎤 Voice query',
        timestamp: new Date(),
        hasImage: hasImage,
        isAudio: inputMode === 'audio'
      }]);
      
      // Clear inputs after successful search  
      setSearchQuery('');
      setHasRecording(false);
      audioChunksRef.current = [];
      setFileList([]);
      
      message.success('Shopping search completed!');
      
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message);
      message.error('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload, we'll handle it manually
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  // Audio recording functions
  // Mock audio recording functions (visual only)
  const startRecording = () => {
    setIsRecording(true);
    setInputMode('audio');
    setHasRecording(false);
    setRecordingDuration(0);
    setError(null);
    
    // Start timer for visual feedback
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    // Simulate recording start
    console.log('Mock recording started');
    message.info('🎤 Recording started - describe what you want to buy!');
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setIsRecording(false);
    
    // Only mark as having recording if we recorded for at least 1 second
    if (recordingDuration >= 1) {
      setHasRecording(true);
      message.success('✅ Voice recording captured successfully!');
    } else {
      setHasRecording(false);
      message.warning('Recording too short, please try again');
    }
    
    console.log('Mock recording stopped, duration:', recordingDuration, 'seconds');
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const switchToTextMode = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setInputMode('text');
    setHasRecording(false);
    setIsRecording(false);
    setRecordingDuration(0);
    setError(null);
  };

  // Format recording duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout breadcrumbItems={breadcrumbItems} user={user}>
      <div style={{ 
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        borderRadius: '12px'
      }}>
        {/* Header Section */}
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
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🛍️ Product Finder
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
             Find products, compare prices, and get shopping recommendations by describing what you need or uploading product images
          </Paragraph>
        </div>

        {/* Main Search Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          <Col xs={24} lg={14}>
            <Card 
              style={{
                height: '100%',
                borderRadius: '16px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
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
                    🛒 What products are you looking for?
                  </Title>
                  
                  {/* Input Mode Toggle */}
                  <div style={{ marginBottom: '20px' }}>
                    <Button.Group>
                      <Button 
                        type={inputMode === 'text' ? 'primary' : 'default'}
                        icon={<FileTextOutlined />}
                        onClick={switchToTextMode}
                        disabled={loading || isRecording}
                        style={{
                          borderRadius: '8px 0 0 8px',
                          height: '40px',
                          fontWeight: '500',
                          ...(inputMode === 'text' && {
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                            borderColor: 'var(--color-primary)'
                          })
                        }}
                      >
                        Text Input
                      </Button>
                      <Button 
                        type={inputMode === 'audio' ? 'primary' : 'default'}
                        icon={<AudioOutlined />}
                        onClick={() => setInputMode('audio')}
                        disabled={loading}
                        style={{
                          borderRadius: '0 8px 8px 0',
                          height: '40px',
                          fontWeight: '500',
                          ...(inputMode === 'audio' && {
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                            borderColor: 'var(--color-primary)'
                          })
                        }}
                      >
                        Voice Input
                      </Button>
                    </Button.Group>
                  </div>

                  {/* Text Input */}
                  {inputMode === 'text' && (
                    <div style={{ marginBottom: '20px' }}>
                      <TextArea
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What are the specs and price details of this laptop, or show me wireless headphones under $100..."
                        rows={4}
                        disabled={loading}
                        style={{ 
                          fontSize: '16px',
                          borderRadius: '12px',
                          border: '2px solid var(--color-border)',
                          padding: '16px',
                          resize: 'none',
                          fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--color-primary)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(138, 43, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--color-border)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      />
                    </div>
                  )}

                  {/* Audio Input */}
                  {inputMode === 'audio' && (
                    <div style={{
                      marginBottom: '20px',
                      padding: '24px',
                      border: '2px dashed var(--color-border)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, rgba(255, 200, 87, 0.05) 100%)',
                      transition: 'all 0.3s ease',
                      ...(isRecording && {
                        borderColor: '#ff4444',
                        background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(255, 100, 100, 0.05) 100%)'
                      }),
                      ...(hasRecording && !isRecording && {
                        borderColor: '#00d4ff',
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 180, 216, 0.05) 100%)'
                      })
                    }}>
                      <div style={{
                        marginBottom: '16px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: isRecording ? '#ff4444' : hasRecording ? '#00d4ff' : 'var(--color-subtext)'
                      }}>
                        {isRecording ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              background: '#ff4444',
                              borderRadius: '50%',
                              animation: 'pulse 1s infinite'
                            }}></div>
                            🎤 Recording... Describe the products you're looking for
                          </span>
                        ) : hasRecording ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              background: '#00d4ff',
                              borderRadius: '50%'
                            }}></div>
                            ✅ Voice message ready to send
                          </span>
                        ) : (
                          '🎤 Click the microphone to record your shopping query'
                        )}
                      </div>
                      
                      <Space size={16}>
                        <Button
                          type={isRecording ? 'danger' : hasRecording ? 'primary' : 'default'}
                          icon={<MicrophoneOutlined />}
                          onClick={handleMicrophoneClick}
                          disabled={loading}
                          size="large"
                          style={{
                            borderRadius: '20px',
                            height: '48px',
                            padding: '0 24px',
                            fontWeight: '600',
                            ...(isRecording && {
                              background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                              borderColor: '#ff4444',
                              animation: 'pulse 1.5s infinite'
                            }),
                            ...(hasRecording && !isRecording && {
                              background: 'linear-gradient(135deg, #00d4ff 0%, #0077b6 100%)',
                              borderColor: '#00d4ff'
                            })
                          }}
                        >
                          {isRecording ? 'Stop Recording' : hasRecording ? 'Record Again' : 'Start Recording'}
                        </Button>
                        
                        {hasRecording && !isRecording && (
                          <Button
                            onClick={switchToTextMode}
                            icon={<FileTextOutlined />}
                            style={{
                              borderRadius: '20px',
                              height: '48px',
                              padding: '0 24px'
                            }}
                          >
                            Switch to Text
                          </Button>
                        )}
                      </Space>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSearch}
                    loading={loading}
                    disabled={(inputMode === 'text' && !searchQuery.trim()) || (inputMode === 'audio' && !hasRecording) || fileList.length === 0 && !searchQuery.trim() && !hasRecording}
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif',
                      borderRadius: '24px',
                      padding: '0 32px',
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    className="search-button"
                    onMouseEnter={(e) => {
                      if (!loading && !((inputMode === 'text' && !searchQuery.trim()) || (inputMode === 'audio' && !hasRecording))) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                     {loading ? 'Finding Products...' : 'Find Products!'}
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card 
              style={{
                height: '100%',
                borderRadius: '16px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
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
                    Upload Product Image
                  </Title>
                  <Text style={{ 
                    color: 'var(--color-subtext)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    Upload a photo of a product to find similar items, prices, and specifications
                  </Text>
                </div>

                <Upload.Dragger 
                  {...uploadProps}
                  style={{ 
                    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
                    border: '2px dashed var(--color-accent)',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                  className="custom-upload"
                >
                  <p style={{ margin: '0 0 16px 0' }}>
                    <UploadOutlined style={{ 
                      fontSize: '48px', 
                      color: 'var(--color-accent)',
                      marginBottom: '8px'
                    }} />
                  </p>
                  <p style={{ 
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--color-accent)',
                    margin: '0 0 8px 0'
                  }}>
                    Click or drag file to this area
                  </p>
                  <p style={{ 
                    fontSize: '12px',
                    color: '#999',
                    margin: 0
                  }}>
                    Support for JPG, PNG, GIF files
                  </p>
                </Upload.Dragger>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
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
              🛍️ Shopping Categories
            </Title>
            <Row gutter={[20, 20]}>
              {[
                { title: 'Electronics', icon: '📱', color: '#ff9c6e', gradient: 'linear-gradient(135deg, #ff9c6e 0%, #ff6b6b 100%)' },
                { title: 'Clothing', icon: '👕', color: '#69c0ff', gradient: 'linear-gradient(135deg, #69c0ff 0%, #4096ff 100%)' },
                { title: 'Home', icon: '🏠', color: '#95de64', gradient: 'linear-gradient(135deg, #95de64 0%, #52c41a 100%)' },
                { title: 'Beauty', icon: '💄', color: '#ffc069', gradient: 'linear-gradient(135deg, #ffc069 0%, #faad14 100%)' },
                { title: 'Sports', icon: '⚽', color: '#b37feb', gradient: 'linear-gradient(135deg, #b37feb 0%, #9254de 100%)' },
                { title: 'Books', icon: '📚', color: '#ff85c0', gradient: 'linear-gradient(135deg, #ff85c0 0%, #eb2f96 100%)' }
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
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    className="category-button"
                    onClick={() => setSearchQuery(`Show me ${category.title.toLowerCase()} products and their prices`)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px) scale(1.05)';
                      e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                    }}
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

        {/* Loading State */}
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
            <Spin size="large" style={{ color: 'var(--color-accent)' }} />
            <div style={{ marginTop: '24px' }}>
              <Text style={{ 
                fontSize: '18px',
                color: 'var(--color-primary)',
                fontWeight: '500'
              }}>
                ✨ Searching for products...
              </Text>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card style={{
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ 
              padding: '32px',
              textAlign: 'center',
              color: '#ff4d4f'
            }}>
              <Title level={4} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                ❌ Search Error
              </Title>
              <Text style={{ fontSize: '16px' }}>
                {error}
              </Text>
            </div>
          </Card>
        )}

        {/* Shopping Results */}
        {!loading && results.length > 0 && (
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
                🛍️ Shopping Results
              </Title>
              {results.map((result) => (
                <Card key={result.id} style={{ marginBottom: '20px', borderRadius: '12px' }}>
                  <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--color-subtext)' }}>
                    Query: {result.query} | {result.timestamp.toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {result.description}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Empty Results State */}
        {!loading && !error && results.length === 0 && hasSearched && (
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
                🔍 No Products Found
              </Title>
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}>
                <BookOutlined style={{ 
                  fontSize: '64px', 
                  marginBottom: '24px', 
                  color: 'var(--color-accent)'
                }} />
                <div style={{ 
                  color: 'var(--color-subtext)',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  🤔 Try different keywords or upload a clearer product image
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Additional CSS for hover effects */}
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
          
          .category-button {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          @keyframes pulse {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1);
            }
            50% { 
              opacity: 0.7; 
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    </AppLayout>
  );
};

export default ShoppingModule;
