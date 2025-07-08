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
  GlobalOutlined,
  MicrophoneOutlined,
  SendOutlined,
  AudioOutlined,
  FileTextOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import AppLayout from "../../components/Layout/AppLayout";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TravelModule = () => {
  const user = { a: 'username' };
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [travelResults, setTravelResults] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const breadcrumbItems = [
    { title: 'Home' },
    { title: 'Travel Module' },
    { title: 'Travel Planner' },
  ];

  const handleSearch = async () => {
    const hasTextInput = searchQuery.trim();
    const hasAudioInput = hasRecording && audioChunksRef.current.length > 0;
    const hasImage = fileList.length > 0;
    
    if (!hasTextInput && !hasAudioInput && !hasImage) {
      setError('Please enter a travel query, record an audio message, or upload an image');
      return;
    }
    
    setLoading(true);
    setError(null);
    setTravelResults([]);
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
      
      const response = await fetch('http://0.0.0.0:8000/query/travel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.result) {
        setTravelResults([{
          id: Date.now(),
          content: result.result,
          query: inputMode === 'text' ? searchQuery : '🎤 Voice query',
          timestamp: new Date()
        }]);
      } else {
        setError('No travel results found');
      }
      
      // Reset form
      setSearchQuery('');
      setFileList([]);
      setHasRecording(false);
      setIsRecording(false);
      audioChunksRef.current = [];
      
    } catch (err) {
      console.error('Travel search error:', err);
      setError(`Failed to search travel: ${err.message}`);
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
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ✈️ Travel Planner
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
            Plan your perfect trip. Search for destinations, get travel advice, or upload photos of places you want to visit.
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
                    🌍 Where would you like to travel?
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
                        placeholder="I want to plan a romantic trip to Paris for 5 days, or find me budget hotels in Tokyo..."
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
                            🎤 Recording... Describe your travel plans
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
                          '🎤 Click the microphone to record your travel request'
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
                     {loading ? 'Planning Trip...' : 'Plan My Trip!'}
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
                    Upload Destination Photo
                  </Title>
                  <Text style={{ 
                    color: 'var(--color-subtext)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    Upload a photo of a place you want to visit and get travel information
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

        {/* Travel Categories */}
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
              🌎 Travel Categories
            </Title>
            <Row gutter={[20, 20]}>
              {[
                { title: 'Beach', icon: '🏖️', color: '#ff9c6e', gradient: 'linear-gradient(135deg, #ff9c6e 0%, #ff6b6b 100%)' },
                { title: 'Mountain', icon: '🏔️', color: '#69c0ff', gradient: 'linear-gradient(135deg, #69c0ff 0%, #4096ff 100%)' },
                { title: 'City', icon: '🏙️', color: '#95de64', gradient: 'linear-gradient(135deg, #95de64 0%, #52c41a 100%)' },
                { title: 'Adventure', icon: '🎒', color: '#ffc069', gradient: 'linear-gradient(135deg, #ffc069 0%, #faad14 100%)' },
                { title: 'Cultural', icon: '🏛️', color: '#b37feb', gradient: 'linear-gradient(135deg, #b37feb 0%, #9254de 100%)' },
                { title: 'Relaxation', icon: '🧘', color: '#ff85c0', gradient: 'linear-gradient(135deg, #ff85c0 0%, #eb2f96 100%)' }
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
                    onClick={() => setSearchQuery(`Plan a ${category.title.toLowerCase()} trip with recommendations`)}
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
                ✈️ Planning your trip...
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

        {/* Travel Results */}
        {!loading && travelResults.length > 0 && (
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
                ✈️ Travel Plan Results
              </Title>
              {travelResults.map((result) => (
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

        {/* Empty Results State */}
        {!loading && !error && travelResults.length === 0 && hasSearched && (
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
                🔍 No Travel Plans Found
              </Title>
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}>
                <CompassOutlined style={{ 
                  fontSize: '64px', 
                  marginBottom: '24px', 
                  color: 'var(--color-accent)'
                }} />
                <div style={{ 
                  color: 'var(--color-subtext)',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  🤔 Try different destinations or be more specific about your travel needs
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

export default TravelModule;
