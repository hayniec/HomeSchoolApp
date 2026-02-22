async function testRegister() {
    const res = await fetch('https://homeschoolapp.netlify.app/api/register', {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "test", name: "test" }),
        method: "POST"
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Text:", text);
}
testRegister();
