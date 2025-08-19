(function($) {

	var	$window = $(window),
		$body = $('body');

  $(document).ready(async function () {
      launcher.click();
      const history = loadHistory ? loadHistory() : messages;
      const alreadyStarted = history.some(msg => msg.role === 'assistant');

      if (!alreadyStarted) {
        const initialPrompt = "Hi! How can I help you today?\nWelcome to \"Ian De Gracia's\" portfolio..";
        messages.push({ role: 'assistant', content: initialPrompt });
        const stopTyping = showTyping();

        try {
          const reply = await askAI(messages);
          stopTyping();
          appendBubble(initialPrompt, 'ai');
          messages.push({ role: 'assistant', content: reply });
          saveHistory();
        } catch (err) {
          stopTyping();
          appendBubble('⚠️ Error: ' + (err?.message || 'Failed to reach AI service.'), 'ai');
        }
      }
  });

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

  // ============================
  // GPT POPUP CHAT WIDGET
  // ============================

  // ==== CONFIG ====
  const USE_DIRECT_OPENAI = true; // set to true only for local testing; never commit with true
  const OPENAI_MODEL = 'gpt-4o-mini';
  const PROXY_URL = '/api/chat'; // your serverless function or worker URL
  const SYSTEM_PROMPT = promptContents(); // Use the function to get the system prompt
 
  const k31 = 'AIzaSyCh4da';
  const k42 = 'dAvF6WGdyb3FYJv6ep85';
  const k33 = 'D6fZmcEGs5uLK9s'; 

  // ==== WIDGET LOGIC ====
  const $ = sel => document.querySelector(sel);
  const logEl = $('#gpt-log');
  const panelEl = $('#gpt-panel');
  const launcher = $('#gpt-launcher');
  const form = $('#gpt-form');
  const input = $('#gpt-input');
  const clearBtn = $('#gpt-clear');
  const closeBtn = $('#gpt-close');

  const HISTORY_KEY = 'gptWidgetHistory:v1';
  let messages = loadHistory();
  if(messages.length){ renderAll(); }

  launcher.addEventListener('click', ()=>{
    panelEl.style.display = panelEl.style.display === 'block' ? 'none' : 'block';
    if(panelEl.style.display === 'block') input.focus();
  });
  closeBtn.addEventListener('click', ()=> panelEl.style.display = 'none');

  clearBtn.addEventListener('click', ()=>{
    if(confirm('Clear this conversation?')){
      messages = [];
      saveHistory();
      logEl.innerHTML = '<div class="gpt-empty">Conversation cleared.</div>';
    }
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;

    appendBubble(text, 'me');
    input.value = '';

    messages.push({role:'user', content:text});
    saveHistory();

    const stopTyping = showTyping();
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;

    try{
      // Check if the message have an email
      if (emailRegex.test(text)) {
        const emailMatch = text.match(emailRegex);
        const chatFormData = {
            name: 'Chat User',
            email: emailMatch[0],
            subject: 'Chat Message with Email',
            message: text,
            _replyto: emailMatch[0],
            _honey: '',
            _captcha: 'false'
        };
        sendEmail(chatFormData, function(resSendEmail){});
      }
      const reply = await askAI(messages);
      stopTyping();
      appendBubble(reply, 'ai');
      messages.push({role:'assistant', content:reply});
      saveHistory();
    }catch(err){
      stopTyping();
      appendBubble('⚠️ Error: '+ (err?.message || 'Failed to reach AI service.'), 'ai');
    }
  });

  function appendBubble(text, who){
    const row = document.createElement('div');
    row.className = 'gpt-row ' + (who==='me'?'me':'');
    const bubble = document.createElement('div');
    bubble.className = 'gpt-bubble ' + (who==='me'?'me':'ai');
    bubble.innerText = text;
    row.appendChild(bubble);
    logEl.querySelector('.gpt-empty')?.remove();
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function renderAll(){
    logEl.innerHTML = '';
    for(const m of messages){ appendBubble(m.content, m.role==='user'?'me':'ai'); }
  }

  function showTyping(){
    const row = document.createElement('div');
    row.className = 'gpt-row';
    const bubble = document.createElement('div');
    bubble.className = 'gpt-bubble ai';
    bubble.innerHTML = '<span class="gpt-typing" aria-live="polite"><span></span><span></span><span></span></span>';
    row.appendChild(bubble);
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
    return ()=> { row.remove(); };
  }

  function saveHistory(){
    try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(messages)); }catch{}
  }
  function loadHistory(){
    try{
      const raw = localStorage.getItem(HISTORY_KEY);
      if(!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }catch{ return []; }
  }
  // ============================
  // END HERE GPT POPUP CHAT WIDGET
  // ============================