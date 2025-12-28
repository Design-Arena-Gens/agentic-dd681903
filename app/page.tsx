'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleManualPost = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/manual-post', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#1a1a1a',
          textAlign: 'center'
        }}>
          LinkedIn AI Auto Poster
        </h1>
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Automatically generates daily AI content with images using Google Gemini
        </p>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#1a1a1a'
          }}>
            How it works:
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#444',
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '10px' }}>✨ Generates engaging AI topic posts with Gemini</li>
            <li style={{ marginBottom: '10px' }}>🎨 Creates relevant images for each post</li>
            <li style={{ marginBottom: '10px' }}>📅 Posts automatically every day via Vercel Cron</li>
            <li style={{ marginBottom: '10px' }}>🚀 Test manually using the button below</li>
          </ul>
        </div>

        <button
          onClick={handleManualPost}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#ccc' : '#0077B5',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#006399';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#0077B5';
          }}
        >
          {loading ? 'Generating Post...' : 'Create Post Now'}
        </button>

        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            padding: '15px',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            background: '#e7f5e7',
            border: '1px solid #c3e6c3',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#2d662d',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              Post Created Successfully! ✅
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#444',
              marginBottom: '15px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              background: 'white',
              padding: '15px',
              borderRadius: '6px'
            }}>
              <strong>Content:</strong><br/>
              {result.postText}
            </div>
            {result.imagePrompt && (
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '10px',
                background: 'white',
                padding: '10px',
                borderRadius: '6px'
              }}>
                <strong>Image Prompt:</strong> {result.imagePrompt}
              </div>
            )}
            <div style={{
              fontSize: '12px',
              color: '#888'
            }}>
              Posted at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        <div style={{
          background: '#fff8e1',
          border: '1px solid #ffe082',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#856404'
        }}>
          <strong>⚙️ Setup Required:</strong>
          <p style={{ marginTop: '10px', marginBottom: '0', lineHeight: '1.6' }}>
            Configure environment variables in Vercel:
            <br/>• GEMINI_API_KEY
            <br/>• LINKEDIN_ACCESS_TOKEN
            <br/>• LINKEDIN_PERSON_URN
            <br/>• CRON_SECRET (optional)
          </p>
        </div>
      </div>
    </div>
  );
}
