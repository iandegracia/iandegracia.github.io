(function($) {

	var	$window = $(window),
		$body = $('body');

	// Fetch and insert header
	fetch('layout/header.html')
	.then(response => response.text())
	.then(data => {
		document.getElementById('header-placeholder').innerHTML = data;

		// After header is loaded, initialize dropdowns and nav
		$('#nav > ul').dropotron({
			mode: 'fade',
			noOpenerFade: true,
			speed: 300
		});

		//--Current Page--
		// Function to set current page based on URL
		function setCurrentPage() {
			const currentPath = window.location.pathname;
			const currentPage = currentPath.split('/').pop() || 'index.html';
			
			$('#nav > ul li').removeClass('current'); // Remove from all first
			
			// Find matching navigation item
			$('#nav > ul li a').each(function() {
				const href = $(this).attr('href');
				if (href === currentPage || href === currentPath || 
					(currentPage === '' && href === 'index.html')) {
					$(this).parent().addClass('current');
					return false; // Break the loop
				}
			});
		}

		// Set initial current page
		setCurrentPage();

		// Handle navigation clicks
		$('#nav > ul li a').on('click', function(e) {
			
			// Only handle if it's a same-page navigation
			const href = $(this).attr('href');
			if (href.startsWith('#')) {
				// For anchor links, don't change current state
				return;
			}
			
			$('#nav > ul li').removeClass('current'); // Remove from all
			$(this).parent().addClass('current');     // Add to clicked one
		});

		// Listen for browser back/forward navigation
		$(window).on('popstate', function() {
			setCurrentPage();
		});
		//--END Current Page--

		// Nav toggle
		$(
			'<div id="navToggle">' +
				'<a href="#navPanel" class="toggle"></a>' +
			'</div>'
		).appendTo($body);

		// Nav panel
		$(
			'<div id="navPanel">' +
				'<nav>' +
					$('#nav').navList() +
				'</nav>' +
			'</div>'
		)
		.appendTo($body)
		.panel({
			delay: 500,
			hideOnClick: true,
			hideOnSwipe: true,
			resetScroll: true,
			resetForms: true,
			side: 'left',
			target: $body,
			visibleClass: 'navPanel-visible'
		});
	});

	fetch('layout/footer.html')
	.then(response => response.text())
	.then(data => {
		document.getElementById('footer-placeholder').innerHTML = data;
	});

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

})(jQuery);