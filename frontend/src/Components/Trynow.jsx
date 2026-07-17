import React, { useState, useRef, useEffect } from 'react';
import { fetchJson } from '../api';

const API = 'http://localhost:5000';

function getImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  return `${API}${image.startsWith('/') ? image : '/' + image}`;
}

const TryNow = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [results, setResults] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const savedTryOnKeysRef = useRef(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchJson('/api/styles').catch(() => {});
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file);
    }
  };

  const handleAnalyze = async () => {
    const token = localStorage.getItem('token') || '';
    if (!imagePreview) {
      alert('Please upload a photo first');
      return;
    }

    if (!token) {
      alert('Please sign in to run the face-shape analysis and save it to history.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await fetchJson('/api/tryon/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: imagePreview })
      });

      const recommendations = data.recommendations || [];
      setResults(recommendations);
      setPrediction({
        faceShape: data.faceShape || recommendations[0]?.category || 'Unknown',
        confidence: data.confidence || recommendations[0]?.confidence || 0,
        description: data.description || '',
        tip: data.tip || ''
      });

      if (recommendations.length) {
        await saveTryOn(recommendations[0], {
          faceShape: data.faceShape || recommendations[0].category,
          confidence: data.confidence || recommendations[0].confidence,
          recommendations
        });
      }
    } catch (error) {
      alert(error.message || 'Face-shape analysis failed.');
      setResults([]);
      setPrediction(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveTryOn = async (result, prediction = {}) => {
    const token = localStorage.getItem('token') || '';
    if (!token) return;

    const saveKey = [
      imagePreview || '',
      result?.name || '',
      prediction.faceShape || result?.category || '',
      prediction.confidence || result?.confidence || ''
    ].join('|');

    if (savedTryOnKeysRef.current.has(saveKey)) {
      return;
    }

    await fetchJson('/api/tryons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        styleName: result.name,
        category: prediction.faceShape || result.category,
        faceShape: prediction.faceShape || result.category,
        accuracy: prediction.confidence || result.confidence,
        faceShapeConfidence: prediction.confidence || result.confidence,
        date: new Date().toISOString().slice(0, 10),
        image: imagePreview || '/api/placeholder/300/400',
        originalImage: imagePreview || '/api/placeholder/300/400',
        resultImage: result.image || '/api/placeholder/300/400',
        recommendations: prediction.recommendations || [result]
      })
    });
    savedTryOnKeysRef.current.add(saveKey);
    alert('Saved to try-on history.');
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults(null);
    setPrediction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hairStyles = [
    { name: 'Pompadour', icon: '👑' },
    { name: 'Fade', icon: '✂️' },
    { name: 'Crew Cut', icon: '💇' },
    { name: 'Long Layers', icon: '💁' },
    { name: 'Bob Cut', icon: '💆' },
    { name: 'Undercut', icon: '🎨' },
    { name: 'Buzz Cut', icon: '⚡' },
    { name: 'Curly Top', icon: '🌀' },
  ];

  return (
    <>
      <div className="try-now-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <span className="hero-badge">✨ AI-Powered Analysis</span>
              <h1 className="hero-title">
                Discover Your Perfect
                <span className="gradient-text"> Hairstyle</span>
              </h1>
              <p className="hero-description">
                Upload your photo and let our advanced AI analyze your face shape, 
                hair texture, and personal style to recommend the most flattering 
                hairstyles tailored just for you.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Accuracy Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Happy Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Hairstyles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="upload-section">
          <div className="upload-container">
            <div className="upload-grid">
              {/* Upload Area */}
              <div className="upload-area-wrapper">
                <div className="section-header">
                  <h2 className="section-title">Upload Your Photo</h2>
                  <p className="section-subtitle">
                    For best results, use a front-facing photo with good lighting
                  </p>
                </div>

                {!imagePreview ? (
                  <div
                    className={`upload-area ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-content">
                      <div className="upload-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <h3 className="upload-title">
                        Drag & drop your photo here
                      </h3>
                      <p className="upload-subtitle">
                        or click to browse files
                      </p>
                      <div className="upload-formats">
                        <span>JPG</span>
                        <span>PNG</span>
                        <span>WEBP</span>
                      </div>
                      <p className="upload-size-limit">Maximum file size: 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                  </div>
                ) : (
                  <div className="preview-section">
                    <div className="preview-image-container">
                      <img src={imagePreview} alt="Preview" className="preview-image" />
                      <button onClick={resetUpload} className="btn-remove">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <button 
                      onClick={handleAnalyze} 
                      className="btn-analyze"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="spinner"></div>
                          Analyzing your features...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                          Analyze & Get Recommendations
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="tips-section">
                <h3 className="tips-title">Tips for Best Results</h3>
                <div className="tips-list">
                  <div className="tip-item">
                    <div className="tip-icon">📸</div>
                    <div className="tip-content">
                      <h4>Clear Face View</h4>
                      <p>Use a front-facing photo where your full face is clearly visible</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">💡</div>
                    <div className="tip-content">
                      <h4>Good Lighting</h4>
                      <p>Natural light works best. Avoid harsh shadows on your face</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">👤</div>
                    <div className="tip-content">
                      <h4>Single Person</h4>
                      <p>Make sure you're the only person in the photo</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">🎯</div>
                    <div className="tip-content">
                      <h4>Neutral Expression</h4>
                      <p>A natural, relaxed expression gives the most accurate results</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {results && (
          <section className="results-section">
            <div className="results-container">
              <div className="section-header text-center">
                <h2 className="section-title">Your AI Recommendations</h2>
                <p className="section-subtitle">
                  Based on your face shape, features, and hair texture
                </p>
              </div>

              {prediction && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                  <div className="prediction-summary">
                    <div className="prediction-photo">
                      <img src={imagePreview} alt="Uploaded preview" />
                    </div>
                    <div className="prediction-pill">
                      <span className="prediction-label">Face shape</span>
                      <strong>{prediction.faceShape}</strong>
                    </div>
                    <div className="prediction-pill">
                      <span className="prediction-label">Confidence</span>
                      <strong>{prediction.confidence}%</strong>
                    </div>
                  </div>
                  {prediction.description && (
                    <div className="prediction-details" style={{ maxWidth: '600px', textAlign: 'center', background: '#f3f4f6', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ margin: '0 0 8px 0', color: '#374151', fontWeight: '500' }}>{prediction.description}</p>
                      {prediction.tip && <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}><strong>Tip:</strong> {prediction.tip}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="results-grid">
                {results.map((result) => (
                  <div key={result.id} className="result-card">
                    <div className="result-badge">{result.category}</div>
                    <div className="result-image-wrapper">
                      <img 
                        src={getImageUrl(result.image) || `${API}/api/placeholder/300/400`} 
                        alt={result.name} 
                        className="result-image" 
                        onError={(e) => { e.target.src = `${API}/api/placeholder/300/400`; }}
                      />
                      <div className="result-confidence">
                        <div className="confidence-circle">
                          <svg width="60" height="60" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="3"
                              strokeDasharray={`${result.confidence}, 100`}
                            />
                          </svg>
                          <span className="confidence-text">{result.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="result-info">
                      <h3 className="result-name">{result.name}</h3>
                      <p className="result-description">{result.reason || result.description}</p>
                      <button className="btn-try-look" onClick={() => saveTryOn(result)}>
                        Try This Look
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        {!results && (
          <section className="how-it-works-section">
            <div className="how-it-works-container">
              <div className="section-header text-center">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">
                  Get personalized hairstyle recommendations in 3 simple steps
                </p>
              </div>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">01</div>
                  <div className="step-icon">📸</div>
                  <h3 className="step-title">Upload Photo</h3>
                  <p className="step-description">
                    Take or upload a clear front-facing photo with good lighting
                  </p>
                </div>
                <div className="step-card">
                  <div className="step-number">02</div>
                  <div className="step-icon">🤖</div>
                  <h3 className="step-title">AI Analysis</h3>
                  <p className="step-description">
                    Our AI analyzes your face shape, features, and hair texture
                  </p>
                </div>
                <div className="step-card">
                  <div className="step-number">03</div>
                  <div className="step-icon">✨</div>
                  <h3 className="step-title">Get Results</h3>
                  <p className="step-description">
                    Receive personalized hairstyle recommendations instantly
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .try-now-page {
          min-height: 100vh;
          background: #fafbfc;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(to right, #fff, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Upload Section */
        .upload-section {
          padding: 80px 0;
        }

        .upload-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }

        .section-header {
          margin-bottom: 32px;
        }

        .section-header.text-center {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .section-subtitle {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
        }

        /* Upload Area */
        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 16px;
          padding: 60px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .upload-area:hover {
          border-color: #6366f1;
          background: #f9fafb;
        }

        .upload-area.dragging {
          border-color: #6366f1;
          background: #eef2ff;
          border-style: solid;
        }

        .upload-content {
          pointer-events: none;
        }

        .upload-icon {
          color: #6366f1;
          margin-bottom: 24px;
        }

        .upload-title {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .upload-subtitle {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 20px;
        }

        .upload-formats {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .upload-formats span {
          background: #f3f4f6;
          color: #4b5563;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .upload-size-limit {
          font-size: 12px;
          color: #9ca3af;
        }

        .file-input {
          display: none;
        }

        /* Preview Section */
        .preview-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .preview-image-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .preview-image {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .btn-remove {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-remove:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .btn-analyze {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .btn-analyze:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .btn-analyze:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Tips Section */
        .tips-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tips-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 24px;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tip-item {
          display: flex;
          gap: 16px;
        }

        .tip-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          background: #f3f4f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tip-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .tip-content p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        /* Results Section */
        .results-section {
          padding: 80px 0;
          background: white;
        }

        .results-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .prediction-summary {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 28px;
          align-items: center;
        }

        .prediction-photo {
          width: 92px;
          height: 92px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          flex: 0 0 auto;
        }

        .prediction-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .prediction-pill {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .prediction-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b7280;
          font-weight: 600;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .result-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .result-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
        }

        .result-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(99, 102, 241, 0.9);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .result-image-wrapper {
          position: relative;
          height: 300px;
          overflow: hidden;
        }

        .result-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .result-confidence {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .confidence-circle {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .confidence-circle svg {
          position: absolute;
          top: 0;
          left: 0;
        }

        .confidence-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 14px;
          font-weight: 700;
          color: #6366f1;
        }

        .result-info {
          padding: 20px;
        }

        .result-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .result-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .btn-try-look {
          width: 100%;
          padding: 10px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-try-look:hover {
          background: #6366f1;
          color: white;
        }

        /* How It Works Section */
        .how-it-works-section {
          padding: 80px 0;
          background: white;
        }

        .how-it-works-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .step-card {
          text-align: center;
          padding: 40px 32px;
          background: #f9fafb;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          background: #eef2ff;
          transform: translateY(-4px);
        }

        .step-number {
          font-size: 48px;
          font-weight: 800;
          color: #6366f1;
          opacity: 0.2;
          margin-bottom: 8px;
        }

        .step-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .step-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .step-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .upload-grid {
            grid-template-columns: 1fr;
          }

          .results-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-stats {
            gap: 32px;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .steps-grid {
            grid-template-columns: 1fr;
          }

          .upload-area {
            padding: 40px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }

          .stat-number {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default TryNow;
