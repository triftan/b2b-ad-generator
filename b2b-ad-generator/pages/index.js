import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    brand: '', description: '', icp: '', pain: '', goal: ''
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>B2B Ad Generator</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
        {['brand', 'description', 'icp', 'pain', 'goal'].map(field => (
          <input key={field} name={field} placeholder={field} onChange={handleChange} required />
        ))}
        <button type="submit">{loading ? 'Generating...' : 'Generate Ad'}</button>
      </form>
      {result && <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>{result}</div>}
    </div>
  );
}
