(function($) {

	var	$window = $(window),
		$body = $('body'),
		$nav = $('#nav');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ null,      '736px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('#nav a, .scrolly').scrolly({
			speed: 1000,
			offset: function() { return $nav.height(); }
		});

	$('#contactForm').on('submit', function (e) {
		e.preventDefault();

		const formData = {
			name: $('#name').val(),
			email: $('#email').val(),
			subject: $('#subject').val(),
			message: $('#message').val(),
			_replyto: $('#email').val(),  		// This will be used as the reply-to
			_honey: '',							// Anti-spam field
			_captcha: 'false'					// Disable CAPTCHA
		};
		
		sendEmail(formData, function(resSendEmail) {
			if (resSendEmail.success) {
				console.log("Success:", resSendEmail.message);
				$('#formMessage1').html(`
					<style>
						@keyframes blink { 0% {opacity: 1;} 50% {opacity: 0;} 100% {opacity: 1;} }
					</style><span style="color:white; animation: blink 1s step-start 5;">Message sent successfully!</span>
				`);
				$('#formMessage2').html(`
					<style>
						@keyframes blink { 0% {opacity: 1;} 50% {opacity: 0;} 100% {opacity: 1;} }
					</style><span style="color:white; animation: blink 1s step-start 5;">Message sent successfully!</span>
				`);
				$('#contactForm')[0].reset();
			} else {
				console.log("Error:", resSendEmail.message);
				$('#formMessage1').html(`
					<style>
						@keyframes blink { 0% {opacity: 1;} 50% {opacity: 0;} 100% {opacity: 1;} }
					</style><span style="color:red; animation: blink 1s step-start 5;">Failed to send message. Please try again later.</span>
				`);
				$('#formMessage2').html(`
					<style>
						@keyframes blink { 0% {opacity: 1;} 50% {opacity: 0;} 100% {opacity: 1;} }
					</style><span style="color:red; animation: blink 1s step-start 5;">Failed to send message. Please try again later.</span>
				`);
			}
		});	
    });

})(jQuery);