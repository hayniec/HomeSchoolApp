async function testLoginCredentials() {
    const res = await fetch('https://homeschoolapp.netlify.app/api/auth/callback/credentials', {
        headers: {
            "content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({ email: "admin@admin.com", password: "admin123", redirect: false }),
        method: "POST"
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Text:", text);
}
testLoginCredentials();
