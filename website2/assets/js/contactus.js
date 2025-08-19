function sendEmail(formData, callback) {
    fetch('https://formsubmit.co/ajax/vinz.iandG@gmail.com', {
        method: 'POST',
        body: formData
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