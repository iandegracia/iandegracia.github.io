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
			//_cc: 'kaaka.roots@gmail.com',		// Change to actual CC recipient
			_honey: '',							// Anti-spam field
			_captcha: 'false'					// Disable CAPTCHA
		};

		$.ajax({
		//url: 'https://formsubmit.co/ajax/kaaka.roots@gmail.com',
		url: 'https://formsubmit.co/ajax/vinz.iandG@gmail.com',
		method: 'POST',
		data: formData,
		dataType: 'json',
		success: function(response) {
				//display to confirm data
				console.log(`Submitted:\nName: ${formData.name}
					\nEmail: ${formData.email}
					\nSubject: ${formData.subject}
					\nMessage: ${formData.message}`);

				$('#formMessage1').html('<span style="color:white;">Message sent successfully!</span>');
				$('#formMessage2').html('<span style="color:white;">Message sent successfully!</span>')
				$('#contactForm')[0].reset();
			},
			error: function(error) {
				$('#formMessage1').html('<span style="color:red;">Failed to send message. Please try again later.</span>');
				$('#formMessage2').html('<span style="color:red;">Failed to send message. Please try again later.</span>');
			}
		});		
    });

})(jQuery);