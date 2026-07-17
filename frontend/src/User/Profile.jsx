import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', phone: '', address: '', image: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('❌ Not logged in. Please login first.');
      return;
    }

    axios.get(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const { name, phone, address, image } = res.data;
      console.log('Image from DB:', image);
      setProfile(prev => ({
        ...prev,
        name:    name    || '',
        phone:   phone   || '',
        address: address || ''
      }));
      // Fix: make sure image path always has correct format
      if (image) {
        const imageUrl = image.startsWith('http')
          ? image
          : `${API}${image.startsWith('/') ? image : '/' + image}`;
        setPreview(imageUrl);
      }
    })
    .catch(err => {
      const msg = err.response?.data?.message || err.message;
      setMessage(`❌ ${msg}`);
      if (err.response?.status === 400 || err.response?.status === 401) {
        localStorage.removeItem('token');
      }
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile(prev => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('❌ Not logged in. Please login first.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name',    profile.name);
    formData.append('phone',   profile.phone);
    formData.append('address', profile.address);
    if (profile.image instanceof File) {
      formData.append('image', profile.image);
    }

    try {
      const res = await axios.put(`${API}/api/auth/update-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(`✅ ${res.data.message}`);

      // Update preview with saved image from server
      if (res.data.user?.image) {
        const imageUrl = res.data.user.image.startsWith('http')
          ? res.data.user.image
          : `${API}${res.data.user.image.startsWith('/') ? res.data.user.image : '/' + res.data.user.image}`;
        setPreview(imageUrl);
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.reason || err.message;
      setMessage(`❌ ${msg}`);
      console.error('Update failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Edit Profile</h2>

      <div style={styles.avatarWrap}>
        {preview
          ? <img src={preview} alt="avatar" style={styles.avatar} />
          : <div style={styles.placeholder}>No Image</div>
        }
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Name"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Phone"
          value={profile.phone}
          onChange={e => setProfile({ ...profile, phone: e.target.value })}
        />
        <textarea
          style={{ ...styles.input, height: 80, resize: 'vertical' }}
          placeholder="Address"
          value={profile.address}
          onChange={e => setProfile({ ...profile, address: e.target.value })}
        />
        <input
          style={styles.input}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {message && (
          <p style={{ ...styles.msg, color: message.startsWith('✅') ? 'green' : 'red' }}>
            {message}
          </p>
        )}

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container:   { maxWidth: 460, margin: '40px auto', padding: 32, border: '1px solid #e0e0e0', borderRadius: 12, fontFamily: 'sans-serif' },
  heading:     { marginBottom: 24, fontSize: 22, fontWeight: 700 },
  avatarWrap:  { display: 'flex', justifyContent: 'center', marginBottom: 24 },
  avatar:      { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' },
  placeholder: { width: 100, height: 100, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 },
  form:        { display: 'flex', flexDirection: 'column', gap: 12 },
  input:       { padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14 },
  button:      { padding: 12, background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  msg:         { fontSize: 13, margin: 0 }
};

export default ProfilePage;