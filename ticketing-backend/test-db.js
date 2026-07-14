async function testFetch() {
    try {
        const res = await fetch('http://localhost:3001/api/events');
        console.log('Status:', res.status);
        const json = await res.json();
        console.log('JSON response sample (first event):', json.data ? json.data[0] : json);
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testFetch();
