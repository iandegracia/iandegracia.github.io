function sendEmail(formData, callback) {
    const params = new URLSearchParams(formData);    
    fetch('https://formsubmit.co/ajax/vinz.iandG@gmail.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        callback({
            success: data.success === "true",
            message: "Email sent successfully."
        });
    })
    .catch(error => {
        console.error('Error:', error);
        callback({
            success: false,
            message: "Failed to send email."
        });
    });
}
window.sendEmail = sendEmail;