import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    brand: '', description: '', icp: '', pain: '', goal: ''
  });
  const [results, setResults] = useState([]);
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
    setResults(data.results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>B2B Ad Generator (with Images)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
        {['brand', 'description', 'icp', 'pain', 'goal'].map(field => (
          <input key={field} name={field} placeholder={field} onChange={handleChange} required />
        ))}
        <button type="submit">{loading ? 'Generating...' : 'Generate Ads'}</button>
      </form>
      {results.length > 0 && <div style={{ marginTop: '2rem' }}>
        {results.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <strong>Framework:</strong> {item.framework}<br />
            <strong>Headline:</strong> {item.headline}<br />
            <strong>Ad Copy:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{item.body}</pre>
            <strong>Generated Image:</strong><br />
            <img src={item.imageUrl} alt="Generated Visual" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        ))}
      </div>}
    </div>
  );
}
